import { formRowHtml, showSaveError, showSuccess, errMsg } from '@/utils/adminForms'
import { confirmDialog } from '@/components/ConfirmDialog'
import { erAdmin, erKlubbadmin } from '@/services/authService'
import { escHtml } from '@/utils/escHtml'
import { buildDropdownOptions } from '@/utils/buildDropdownOptions'
import { formNum } from '@/utils/formNum'
import { logError } from '@/utils/logError'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import {
  getThrowerForAdmin,
  getClasses,
  getGenders,
  createThrower,
  updateThrower,
  deleteThrower,
  type ThrowerAdminRow,
} from '@/services/kasterService'
import { getClubs } from '@/services/klubbService'
import type { Params } from '@/types'

export async function render(
  container: HTMLElement,
  params: Params = {},
): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined
  container.replaceChildren(createLoadingState())

  let clubs: { id: number; navn: string; logourl: string | null }[] = []
  let classes: { id: number; navn: string }[] = []
  let genders: { id: number; navn: string }[] = []

  try {
    const results = await Promise.all([
      getClubs(),
      getClasses(),
      getGenders(),
    ])
    clubs = results[0].data
    classes = results[1].data
    genders = results[2].data
  } catch (err) {
    logError('kasteradmin.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste skjema.'))
    return
  }

  let thrower: ThrowerAdminRow | null = null
  if (id) {
    const { data, error } = await getThrowerForAdmin(id)
    if (error || !data) { container.replaceChildren(createErrorBanner('Utøvar ikkje funne.')); return }
    thrower = data

    if (!(await erAdmin()) && !(await erKlubbadmin(thrower.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner('Ingen tilgang til denne utøvaren.'))
      return
    }
  }

  const title = id
    ? `Rediger utøvar: ${thrower ? `${escHtml(thrower.fornavn)} ${escHtml(thrower.etternavn)}` : ''}`
    : 'Ny utøvar'
  const v = thrower ?? ({} as Partial<ThrowerAdminRow>)

  container.innerHTML = `
    <div class="container py-4 admin-form-md">
      <h2 class="mb-4">${title}</h2>
      <form id="thrower-form">
        ${formRowHtml('Fornavn*', `<input type="text" class="form-control" name="fornavn" value="${escHtml(v.fornavn)}" required>`)}
        ${formRowHtml('Etternavn*', `<input type="text" class="form-control" name="etternavn" value="${escHtml(v.etternavn)}" required>`)}
        ${formRowHtml('Kjønn*', `<select class="form-select" name="kjonnid">${buildDropdownOptions(genders, v.kjonnid)}</select>`)}
        ${formRowHtml('Klubb', `<select class="form-select" name="klubbid"><option value="">— vel —</option>${clubs.map(k => `<option value="${k.id}"${k.id === v.klubbid ? ' selected' : ''}>${escHtml(k.navn)}</option>`).join('')}</select>`)}
        ${formRowHtml('Klasse', `<select class="form-select" name="klasseid">${buildDropdownOptions(classes, v.klasseid)}</select>`)}
        ${formRowHtml('E-post', `<input type="email" class="form-control" name="epost" value="${escHtml(v.epost)}">`)}
        ${formRowHtml('Telefon', `<input type="tel" class="form-control" name="telefon" value="${escHtml(v.telefon)}">`)}
        ${formRowHtml('Medlemsnummer', `<input type="number" class="form-control" name="medlemsnummer" value="${v.medlemsnummer ?? ''}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${v.eraktiv !== false ? ' checked' : ''}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${id ? `<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>` : ''}
        </div>
      </form>
    </div>`

  container.querySelector<HTMLFormElement>('#thrower-form')!.addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const payload = {
      fornavn:       (fd.get('fornavn') as string).trim(),
      etternavn:     (fd.get('etternavn') as string).trim(),
      kjonnid:       formNum(fd.get('kjonnid'))!,
      klubbid:       formNum(fd.get('klubbid')),
      klasseid:      formNum(fd.get('klasseid')),
      epost:         (fd.get('epost') as string).trim() || null,
      telefon:       (fd.get('telefon') as string).trim() || null,
      medlemsnummer: fd.get('medlemsnummer') ? Number(fd.get('medlemsnummer')) : null,
      eraktiv:       fd.get('eraktiv') === 'on',
    }

    const { data: saved, error } = id
      ? await updateThrower(id, payload)
      : await createThrower(payload)

    if (error) { showSaveError(container, errMsg(error)); return }
    showSuccess(container, 'Utøvaren er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/kaster/${saved!.id}/admin` }, 1500)
  })

  container.querySelector<HTMLButtonElement>('#delete-button')?.addEventListener('click', async () => {
    if (!await confirmDialog({ title: 'Slett utøvar', message: `Slett «${thrower?.fornavn} ${thrower?.etternavn}»? Dette kan ikkje angrast.`, danger: true })) return
    const { error } = await deleteThrower(id!)
    if (error) { showSaveError(container, errMsg(error)); return }
    location.hash = '#/kastere'
  })
}
