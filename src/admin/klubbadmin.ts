import { supabase } from '../supabase'
import { lagFormRadHtml, visLagreFeil, visSuksess } from '../utils/adminForms.js'
import { erAdmin, erKlubbadmin } from '../utils/auth'
import { escHtml } from '../utils/escHtml'

export async function render(
  container: HTMLElement,
  { id }: { id?: number } = {},
): Promise<void> {
  if (!id) {
    container.innerHTML = '<p class="feil" style="text-align:center;margin-top:40px;">Manglande ID.</p>'
    return
  }

  container.innerHTML = '<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>'

  const { data: klubb } = await supabase
    .from('klubb')
    .select('id, navn, kortnavn, logourl, eraktiv')
    .eq('id', id)
    .single()

  if (!klubb) {
    container.innerHTML = '<p class="feil" style="text-align:center;margin-top:40px;">Klubb ikkje funne.</p>'
    return
  }

  if (!(await erAdmin()) && !(await erKlubbadmin(id))) {
    container.innerHTML = '<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til denne klubben.</p>'
    return
  }

  container.innerHTML = `
    <div class="container py-4" style="max-width:520px">
      <h2 class="mb-4">Rediger klubb: ${klubb.navn}</h2>
      <form id="klubb-skjema">
        ${lagFormRadHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(klubb.navn)}" required>`)}
        ${lagFormRadHtml('Kortnamn', `<input type="text" class="form-control" name="kortnavn" value="${escHtml(klubb.kortnavn)}">`)}
        ${lagFormRadHtml('Logo-URL', `<input type="url" class="form-control" name="logourl" value="${escHtml(klubb.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${klubb.eraktiv ? ' checked' : ''}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`

  container.querySelector<HTMLFormElement>('#klubb-skjema')!.addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const { error } = await supabase
      .from('klubb')
      .update({
        navn:     (fd.get('navn') as string).trim(),
        kortnavn: (fd.get('kortnavn') as string).trim(),
        logourl:  (fd.get('logourl') as string).trim() || null,
        eraktiv:  fd.get('eraktiv') === 'on',
      })
      .eq('id', id)

    if (error) { visLagreFeil(container, error.message); return }
    visSuksess(container, 'Klubben er lagra.')
  })
}
