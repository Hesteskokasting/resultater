import { lagFormRadHtml, visLagreFeil, visSuksess, errMsg } from '@/utils/adminForms'
import { confirmDialog } from '@/components/ConfirmDialog'
import { erAdmin, erKlubbadmin } from '@/services/authService'
import { escHtml } from '@/utils/escHtml'
import { buildDropdownOptions } from '@/utils/buildDropdownOptions'
import { formNum } from '@/utils/formNum'
import { logError } from '@/utils/logError'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import {
  hentKasterForAdmin,
  hentKlassar,
  hentKjonn,
  opprettKaster,
  oppdaterKaster,
  slettKaster,
  type KasterAdminRow,
} from '@/services/kasterService'
import { hentKlubbar } from '@/services/klubbService'

export async function render(
  container: HTMLElement,
  { id }: { id?: number } = {},
): Promise<void> {
  container.replaceChildren(createLoadingState())

  let klubbar: { id: number; navn: string; logourl: string | null }[] = []
  let klassar: { id: number; navn: string }[] = []
  let kjonn:   { id: number; navn: string }[] = []

  try {
    const results = await Promise.all([
      hentKlubbar(),
      hentKlassar(),
      hentKjonn(),
    ])
    klubbar = results[0].data
    klassar = results[1].data
    kjonn   = results[2].data
  } catch (err) {
    logError('kasteradmin.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste skjema.'))
    return
  }

  let kaster: KasterAdminRow | null = null
  if (id) {
    const { data, error } = await hentKasterForAdmin(id)
    if (error || !data) { container.replaceChildren(createErrorBanner('Utøvar ikkje funne.')); return }
    kaster = data

    if (!(await erAdmin()) && !(await erKlubbadmin(kaster.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner('Ingen tilgang til denne utøvaren.'))
      return
    }
  }

  const tittel = id
    ? `Rediger utøvar: ${kaster ? `${escHtml(kaster.fornavn)} ${escHtml(kaster.etternavn)}` : ''}`
    : 'Ny utøvar'
  const v = kaster ?? ({} as Partial<KasterAdminRow>)

  container.innerHTML = `
    <div class="container py-4 admin-skjema-md">
      <h2 class="mb-4">${tittel}</h2>
      <form id="kaster-skjema">
        ${lagFormRadHtml('Fornavn*', `<input type="text" class="form-control" name="fornavn" value="${escHtml(v.fornavn)}" required>`)}
        ${lagFormRadHtml('Etternavn*', `<input type="text" class="form-control" name="etternavn" value="${escHtml(v.etternavn)}" required>`)}
        ${lagFormRadHtml('Kjønn*', `<select class="form-select" name="kjonnid">${buildDropdownOptions(kjonn, v.kjonnid)}</select>`)}
        ${lagFormRadHtml('Klubb', `<select class="form-select" name="klubbid"><option value="">— vel —</option>${klubbar.map(k => `<option value="${k.id}"${k.id === v.klubbid ? ' selected' : ''}>${escHtml(k.navn)}</option>`).join('')}</select>`)}
        ${lagFormRadHtml('Klasse', `<select class="form-select" name="klasseid">${buildDropdownOptions(klassar, v.klasseid)}</select>`)}
        ${lagFormRadHtml('E-post', `<input type="email" class="form-control" name="epost" value="${escHtml(v.epost)}">`)}
        ${lagFormRadHtml('Telefon', `<input type="tel" class="form-control" name="telefon" value="${escHtml(v.telefon)}">`)}
        ${lagFormRadHtml('Medlemsnummer', `<input type="number" class="form-control" name="medlemsnummer" value="${v.medlemsnummer ?? ''}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${v.eraktiv !== false ? ' checked' : ''}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${id ? `<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>` : ''}
        </div>
      </form>
    </div>`

  container.querySelector<HTMLFormElement>('#kaster-skjema')!.addEventListener('submit', async e => {
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

    const { data: lagra, error } = id
      ? await oppdaterKaster(id, payload)
      : await opprettKaster(payload)

    if (error) { visLagreFeil(container, errMsg(error)); return }
    visSuksess(container, 'Utøvaren er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/kaster/${lagra!.id}/admin` }, 1500)
  })

  container.querySelector<HTMLButtonElement>('#slett-knapp')?.addEventListener('click', async () => {
    if (!await confirmDialog({ title: 'Slett utøvar', message: `Slett «${kaster?.fornavn} ${kaster?.etternavn}»? Dette kan ikkje angrast.`, danger: true })) return
    const { error } = await slettKaster(id!)
    if (error) { visLagreFeil(container, errMsg(error)); return }
    location.hash = '#/kastere'
  })
}
