import { supabase } from '../supabase.js'
import { nullstillStevne } from '../utils/organizer-test-utils.js'

export async function render(container, { id } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p class="laster">Laster…</p>'

  const [{ data: stevne }, { data: metodar }] = await Promise.all([
    supabase.from('stevne')
      .select('id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid')
      .eq('id', stevneid)
      .single(),
    supabase.from('kastemetode')
      .select('id, navn, er_innledende, er_avsluttende')
      .eq('eraktiv', true)
      .order('navn'),
  ])

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const innlMetodar = (metodar ?? []).filter(m => m.er_innledende)
  const avslMetodar = (metodar ?? []).filter(m => m.er_avsluttende)

  function options(liste, vald) {
    return liste.map(m =>
      `<option value="${m.id}"${m.id === vald ? ' selected' : ''}>${m.navn}</option>`
    ).join('')
  }

  container.innerHTML = `
    <div>
      <h4 class="mb-3">Innstillingar</h4>
      <form id="innstillingar-form" class="org-max-480">
        <div class="mb-3">
          <label class="form-label fw-semibold">Kastemetode innledande</label>
          <select id="innl-metode" class="form-select">
            <option value="">— Ikkje vald —</option>
            ${options(innlMetodar, stevne.innledendekastemetodeid)}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Kastemetode avsluttande</label>
          <select id="avsl-metode" class="form-select">
            <option value="">— Ikkje vald —</option>
            ${options(avslMetodar, stevne.avsluttendekastemetodeid)}
          </select>
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold">Antal rundar innledande</label>
          <input id="antall-rundar" type="number" min="1" class="form-control"
            value="${stevne.antall_runder_innl ?? ''}" placeholder="t.d. 6">
        </div>
        <button type="submit" class="btn btn-primary">Lagre</button>
        <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
        <hr class="my-4">
        <div class="border border-danger rounded p-3">
          <h6 class="text-danger mb-2">Farleg sone</h6>
          <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
          <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
        </div>
      </form>
    </div>
  `

  container.querySelector('#innstillingar-form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const innlId   = container.querySelector('#innl-metode').value || null
    const avslId   = container.querySelector('#avsl-metode').value || null
    const rundar   = container.querySelector('#antall-rundar').value
    const antall   = rundar ? Number(rundar) : null

    const { error } = await supabase
      .from('stevne')
      .update({
        innledendekastemetodeid:  innlId  ? Number(innlId)  : null,
        avsluttendekastemetodeid: avslId  ? Number(avslId)  : null,
        antall_runder_innl:       antall,
      })
      .eq('id', stevneid)

    if (error) {
      alert('Feil ved lagring: ' + error.message)
      return
    }

    const status = container.querySelector('#lagre-status')
    status.classList.remove('d-none')
    setTimeout(() => { status.classList.add('d-none') }, 2000)
  })

  container.querySelector('#nullstill-btn').addEventListener('click', async (e) => {
    if (!confirm('Er du sikker? Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden.')) return
    e.currentTarget.disabled = true
    await nullstillStevne(stevneid)
    await render(container, { id })
  })
}
