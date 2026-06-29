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
  getTournamentForAdmin,
  getTournamentTypes,
  getInitialThrowingMethods,
  getFinalThrowingMethods,
  getCategories,
  createTournament,
  updateTournament,
  deleteTournament,
  type TournamentAdminRow,
} from '@/services/stevneService'
import { getClubs } from '@/services/klubbService'
import type { Params } from '@/types'

export async function render(
  container: HTMLElement,
  params: Params = {},
): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined
  container.replaceChildren(createLoadingState())

  let clubs:               { id: number; navn: string; logourl: string | null }[] = []
  let tournamentTypes:     { id: number; navn: string }[] = []
  let initialMethods:      { id: number; navn: string }[] = []
  let finalMethods:        { id: number; navn: string }[] = []
  let categories:          { id: number; navn: string }[] = []

  try {
    const results = await Promise.all([
      getClubs(),
      getTournamentTypes(),
      getInitialThrowingMethods(),
      getFinalThrowingMethods(),
      getCategories(),
    ])
    clubs            = results[0].data
    tournamentTypes  = results[1].data
    initialMethods   = results[2].data
    finalMethods     = results[3].data
    categories       = results[4].data
  } catch (err) {
    logError('stevneadmin.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste skjema.'))
    return
  }

  let stevne: TournamentAdminRow | null = null
  if (id) {
    const { data, error } = await getTournamentForAdmin(id)
    if (error || !data) { container.replaceChildren(createErrorBanner('Stevne ikkje funne.')); return }
    stevne = data

    if (!(await erAdmin()) && !(await erKlubbadmin(stevne.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner('Ingen tilgang til dette stevnet.'))
      return
    }
  }

  const title = id ? `Rediger stevne: ${escHtml(stevne?.navn ?? '')}` : 'Nytt stevne'
  const v     = stevne ?? ({} as Partial<TournamentAdminRow>)
  const dateValue       = v.dato ?? ''
  const timeValue       = v.tid ? v.tid.slice(0, 5) : (id ? '' : '11:00')
  const defaultCategory = v.kategoriid ?? categories.find(k => k.navn === 'Singel')?.id

  const clubOpt        = buildDropdownOptions(clubs,          v.klubbid)
  const typeOpt        = buildDropdownOptions(tournamentTypes, v.stevnetypeid)
  const initialOpt     = buildDropdownOptions(initialMethods,  v.innledendekastemetodeid)
  const finalOpt       = buildDropdownOptions(finalMethods,    v.avsluttendekastemetodeid)
  const categoryOpt    = buildDropdownOptions(categories,      defaultCategory)

  container.innerHTML = `
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${title}</h2>
      <form id="stevne-skjema">
        ${formRowHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(v.navn)}" required>`)}
        ${formRowHtml('Stad', `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
        ${formRowHtml('Dato', `<input type="date" class="form-control" name="dato" value="${dateValue}" required>`)}
        ${formRowHtml('Tid', `<input type="time" class="form-control" name="tid" value="${timeValue}">`)}
        ${formRowHtml('Arrangørklubb', `<select class="form-select" name="klubbid">${clubOpt}</select>`)}
        ${formRowHtml('Stevnetype', `<select class="form-select" name="stevnetypeid">${typeOpt}</select>`)}
        ${formRowHtml('Innleiande kastemetode', `<select class="form-select" name="innledendekastemetodeid">${initialOpt}</select>`)}
        ${formRowHtml('Avsluttande kastemetode', `<select class="form-select" name="avsluttendekastemetodeid">${finalOpt}</select>`)}
        ${formRowHtml('Kategori', `<select class="form-select" name="kategoriid">${categoryOpt}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${v.ernm ? ' checked' : ''}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${v.ernorgesranking ? ' checked' : ''}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${v.erfullfort ? ' checked' : ''}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${v.erekskludertfrarekorder ? ' checked' : ''}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${formRowHtml('Innbydelses-URL', `<input type="url" class="form-control" name="innbydelseurl" value="${escHtml(v.innbydelseurl)}">`)}
        ${formRowHtml('Resultat-URL', `<input type="url" class="form-control" name="resultaturl" value="${escHtml(v.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${id ? `<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>` : ''}
        </div>
      </form>
    </div>`

  container.querySelector<HTMLFormElement>('#stevne-skjema')!.addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const payload = {
      navn:                     (fd.get('navn') as string).trim(),
      sted:                     (fd.get('sted') as string).trim() || null,
      dato:                     (fd.get('dato') as string) || null,
      tid:                      (fd.get('tid') as string) || null,
      klubbid:                  formNum(fd.get('klubbid')),
      stevnetypeid:             formNum(fd.get('stevnetypeid')),
      innledendekastemetodeid:  formNum(fd.get('innledendekastemetodeid')),
      avsluttendekastemetodeid: formNum(fd.get('avsluttendekastemetodeid')),
      kategoriid:               formNum(fd.get('kategoriid')),
      ernm:                     fd.get('ernm') === 'on',
      ernorgesranking:          fd.get('ernorgesranking') === 'on',
      erfullfort:               fd.get('erfullfort') === 'on',
      erekskludertfrarekorder:  fd.get('erekskludertfrarekorder') === 'on',
      innbydelseurl:            (fd.get('innbydelseurl') as string).trim() || null,
      resultaturl:              (fd.get('resultaturl') as string).trim() || null,
    }

    const { data: saved, error } = id
      ? await updateTournament(id, payload)
      : await createTournament(payload)

    if (error) { showSaveError(container, errMsg(error)); return }
    showSuccess(container, 'Stevnet er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/stevne/${saved!.id}/rediger` }, 1500)
  })

  container.querySelector<HTMLButtonElement>('#slett-knapp')?.addEventListener('click', async () => {
    if (!await confirmDialog({ title: 'Slett stevne', message: `Slett «${stevne?.navn}»? Dette kan ikkje angrast.`, danger: true })) return
    const { error } = await deleteTournament(id!)
    if (error) { showSaveError(container, errMsg(error)); return }
    location.hash = '#/terminliste'
  })
}
