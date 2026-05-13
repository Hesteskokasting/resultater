import { supabase } from '../supabase.js'
import { lagFormRadHtml, visLagreFeil, visSuksess } from '../utils/adminForms.js'
import { erAdmin, erKlubbadmin } from '../utils/auth.js'
import { escHtml } from '../utils/escHtml.js'
import { buildDropdownOptions } from '../utils/buildDropdownOptions.js'
import { formNum } from '../utils/formNum.js'

export async function render(container, { id } = {}) {
  container.innerHTML = '<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>'

  const [
    { data: klubbar },
    { data: klassar },
    { data: kjonn },
  ] = await Promise.all([
    supabase.from('klubb').select('id, navn').eq('eraktiv', true).order('navn'),
    supabase.from('klasse').select('id, navn').order('navn'),
    supabase.from('kjonn').select('id, navn').order('id'),
  ])

  let kaster = null
  if (id) {
    const { data } = await supabase.from('kaster').select('*').eq('id', id).single()
    kaster = data

    if (!(await erAdmin()) && !(await erKlubbadmin(kaster?.klubbid))) {
      container.innerHTML = '<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til denne utøvaren.</p>'
      return
    }
  }

  const tittel = id ? `Rediger utøvar: ${kaster ? `${kaster.fornavn} ${kaster.etternavn}` : ''}` : 'Ny utøvar'
  const v = kaster ?? {}

  container.innerHTML = `
    <div class="container py-4" style="max-width:560px">
      <h2 class="mb-4">${tittel}</h2>
      <form id="kaster-skjema">
        ${lagFormRadHtml('Fornamn*', `<input type="text" class="form-control" name="fornavn" value="${escHtml(v.fornavn)}" required>`)}
        ${lagFormRadHtml('Etternamn*', `<input type="text" class="form-control" name="etternavn" value="${escHtml(v.etternavn)}" required>`)}
        ${lagFormRadHtml('Kjønn*', `<select class="form-select" name="kjonnid">${buildDropdownOptions(kjonn, v.kjonnid)}</select>`)}
        ${lagFormRadHtml('Klubb', `<select class="form-select" name="klubbid"><option value="">— vel —</option>${(klubbar ?? []).map(k => `<option value="${k.id}"${k.id === v.klubbid ? ' selected' : ''}>${k.navn}</option>`).join('')}</select>`)}
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

  container.querySelector('#kaster-skjema').addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = {
      fornavn:       fd.get('fornavn').trim(),
      etternavn:     fd.get('etternavn').trim(),
      kjonnid:       formNum(fd.get('kjonnid')),
      klubbid:       formNum(fd.get('klubbid')),
      klasseid:      formNum(fd.get('klasseid')),
      epost:         fd.get('epost').trim() || null,
      telefon:       fd.get('telefon').trim() || null,
      medlemsnummer: fd.get('medlemsnummer') ? Number(fd.get('medlemsnummer')) : null,
      eraktiv:       fd.get('eraktiv') === 'on',
    }

    const { data: lagra, error } = id
      ? await supabase.from('kaster').update(payload).eq('id', id).select('id').single()
      : await supabase.from('kaster').insert(payload).select('id').single()

    if (error) { visLagreFeil(container, error.message); return }
    visSuksess(container, 'Utøvaren er lagra.')
    if (!id) setTimeout(() => { location.hash = `#/kaster/${lagra.id}/admin` }, 1500)
  })

  container.querySelector('#slett-knapp')?.addEventListener('click', async () => {
    if (!confirm(`Slett utøvaren «${kaster?.fornavn} ${kaster?.etternavn}»? Dette kan ikkje angrast.`)) return
    const { error } = await supabase.from('kaster').delete().eq('id', id)
    if (error) { visLagreFeil(container, error.message); return }
    location.hash = '#/kastere'
  })
}


