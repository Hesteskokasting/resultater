import { supabase } from '../supabase'
import { lagFormRadHtml, visLagreFeil, visSuksess } from '../utils/adminForms.js'
import { erAdmin, erKlubbadmin } from '../utils/auth'
import { escHtml } from '../utils/escHtml'
import { buildDropdownOptions } from '../utils/buildDropdownOptions'
import { formNum } from '../utils/formNum'
import type { Database } from '../types/database.types'

type StevneRow = Database['public']['Tables']['stevne']['Row']

export async function render(
  container: HTMLElement,
  { id }: { id?: number } = {},
): Promise<void> {
  container.innerHTML = '<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>'

  const [
    { data: klubbar },
    { data: stevnetypar },
    { data: kastemetodar },
    { data: kategoriar },
  ] = await Promise.all([
    supabase.from('klubb').select('id, navn').eq('eraktiv', true).order('navn'),
    supabase.from('stevnetype').select('id, navn').order('navn'),
    supabase.from('kastemetode').select('id, navn').order('navn'),
    supabase.from('kategori').select('id, navn').order('navn'),
  ])

  let stevne: StevneRow | null = null
  if (id) {
    const { data } = await supabase
      .from('stevne')
      .select('id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, innbydelseurl, resultaturl')
      .eq('id', id)
      .single()
    stevne = data as StevneRow | null

    if (!(await erAdmin()) && !(await erKlubbadmin(stevne?.klubbid ?? undefined))) {
      container.innerHTML = '<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til dette stevnet.</p>'
      return
    }
  }

  const tittel = id ? `Rediger stevne: ${stevne?.navn ?? ''}` : 'Nytt stevne'
  const v = stevne ?? ({} as Partial<StevneRow>)
  const datoVerdi = v.dato ?? ''
  const tidVerdi  = v.tid ? v.tid.slice(0, 5) : ''

  const klubbOpt   = buildDropdownOptions(klubbar, v.klubbid)
  const typeOpt    = buildDropdownOptions(stevnetypar, v.stevnetypeid)
  const metodeOpt  = buildDropdownOptions(kastemetodar, v.innledendekastemetodeid)
  const metodeOpt2 = buildDropdownOptions(kastemetodar, v.avsluttendekastemetodeid)
  const katOpt     = buildDropdownOptions(kategoriar, v.kategoriid)

  container.innerHTML = `
    <div class="container py-4" style="max-width:640px">
      <h2 class="mb-4">${tittel}</h2>
      <form id="stevne-skjema">
        ${lagFormRadHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(v.navn)}" required>`)}
        ${lagFormRadHtml('Stad', `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
        ${lagFormRadHtml('Dato', `<input type="date" class="form-control" name="dato" value="${datoVerdi}">`)}
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
      ? await supabase.from('stevne').update(payload).eq('id', id).select('id').single()
      : await supabase.from('stevne').insert(payload).select('id').single()

    if (error) { visLagreFeil(container, error.message); return }
    visSuksess(container, 'Stevnet er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/stevne/${lagra!.id}/admin` }, 1500)
  })

  container.querySelector<HTMLButtonElement>('#slett-knapp')?.addEventListener('click', async () => {
    if (!confirm(`Slett stevnet «${stevne?.navn}»? Dette kan ikkje angrast.`)) return
    const { error } = await supabase.from('stevne').delete().eq('id', id!)
    if (error) { visLagreFeil(container, error.message); return }
    location.hash = '#/terminliste'
  })
}
