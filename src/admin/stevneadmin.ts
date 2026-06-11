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
  hentStevneForAdmin,
  hentStevnetypar,
  hentInnleiendeKastemetodar,
  hentAvsluttendeKastemetodar,
  hentKategoriar,
  opprettStevne,
  oppdaterStevne,
  slettStevne,
  type StevneAdminRow,
} from '@/services/stevneService'
import { hentKlubbar } from '@/services/klubbService'

export async function render(
  container: HTMLElement,
  params: Record<string, string | number | undefined> = {},
): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined
  container.replaceChildren(createLoadingState())

  let klubbar:            { id: number; navn: string; logourl: string | null }[] = []
  let stevnetypar:        { id: number; navn: string }[] = []
  let innleiendeMetodar:  { id: number; navn: string }[] = []
  let avsluttendeMetodar: { id: number; navn: string }[] = []
  let kategoriar:         { id: number; navn: string }[] = []

  try {
    const results = await Promise.all([
      hentKlubbar(),
      hentStevnetypar(),
      hentInnleiendeKastemetodar(),
      hentAvsluttendeKastemetodar(),
      hentKategoriar(),
    ])
    klubbar            = results[0].data
    stevnetypar        = results[1].data
    innleiendeMetodar  = results[2].data
    avsluttendeMetodar = results[3].data
    kategoriar         = results[4].data
  } catch (err) {
    logError('stevneadmin.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste skjema.'))
    return
  }

  let stevne: StevneAdminRow | null = null
  if (id) {
    const { data, error } = await hentStevneForAdmin(id)
    if (error || !data) { container.replaceChildren(createErrorBanner('Stevne ikkje funne.')); return }
    stevne = data

    if (!(await erAdmin()) && !(await erKlubbadmin(stevne.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner('Ingen tilgang til dette stevnet.'))
      return
    }
  }

  const tittel = id ? `Rediger stevne: ${escHtml(stevne?.navn ?? '')}` : 'Nytt stevne'
  const v      = stevne ?? ({} as Partial<StevneAdminRow>)
  const datoVerdi       = v.dato ?? ''
  const tidVerdi        = v.tid ? v.tid.slice(0, 5) : (id ? '' : '11:00')
  const defaultKategori = v.kategoriid ?? kategoriar.find(k => k.navn === 'Singel')?.id

  const klubbOpt   = buildDropdownOptions(klubbar,            v.klubbid)
  const typeOpt    = buildDropdownOptions(stevnetypar,        v.stevnetypeid)
  const metodeOpt  = buildDropdownOptions(innleiendeMetodar,  v.innledendekastemetodeid)
  const metodeOpt2 = buildDropdownOptions(avsluttendeMetodar, v.avsluttendekastemetodeid)
  const katOpt     = buildDropdownOptions(kategoriar,         defaultKategori)

  container.innerHTML = `
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${tittel}</h2>
      <form id="stevne-skjema">
        ${lagFormRadHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(v.navn)}" required>`)}
        ${lagFormRadHtml('Stad', `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
        ${lagFormRadHtml('Dato', `<input type="date" class="form-control" name="dato" value="${datoVerdi}" required>`)}
        ${lagFormRadHtml('Tid', `<input type="time" class="form-control" name="tid" value="${tidVerdi}">`)}
        ${lagFormRadHtml('Arrangørklubb', `<select class="form-select" name="klubbid">${klubbOpt}</select>`)}
        ${lagFormRadHtml('Stevnetype', `<select class="form-select" name="stevnetypeid">${typeOpt}</select>`)}
        ${lagFormRadHtml('Innleiande kastemetode', `<select class="form-select" name="innledendekastemetodeid">${metodeOpt}</select>`)}
        ${lagFormRadHtml('Avsluttande kastemetode', `<select class="form-select" name="avsluttendekastemetodeid">${metodeOpt2}</select>`)}
        ${lagFormRadHtml('Kategori', `<select class="form-select" name="kategoriid">${katOpt}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${v.ernm ? ' checked' : ''}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${v.ernorgesranking ? ' checked' : ''}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${v.erfullfort ? ' checked' : ''}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${v.erekskludertfrarekorder ? ' checked' : ''}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${lagFormRadHtml('Innbydelses-URL', `<input type="url" class="form-control" name="innbydelseurl" value="${escHtml(v.innbydelseurl)}">`)}
        ${lagFormRadHtml('Resultat-URL', `<input type="url" class="form-control" name="resultaturl" value="${escHtml(v.resultaturl)}">`)}
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

    const { data: lagra, error } = id
      ? await oppdaterStevne(id, payload)
      : await opprettStevne(payload)

    if (error) { visLagreFeil(container, errMsg(error)); return }
    visSuksess(container, 'Stevnet er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/stevne/${lagra!.id}/rediger` }, 1500)
  })

  container.querySelector<HTMLButtonElement>('#slett-knapp')?.addEventListener('click', async () => {
    if (!await confirmDialog({ title: 'Slett stevne', message: `Slett «${stevne?.navn}»? Dette kan ikkje angrast.`, danger: true })) return
    const { error } = await slettStevne(id!)
    if (error) { visLagreFeil(container, errMsg(error)); return }
    location.hash = '#/terminliste'
  })
}
