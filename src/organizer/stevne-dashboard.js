import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'
import { genererInnledendeKamper } from './kampgenerering-db.js'
import { formaterDatoNumeric, formaterTid } from '../utils/shared.js'

const faseLabel = {
  ikke_startet: '<span class="badge bg-secondary">Ikkje starta</span>',
  innledende:   '<span class="badge bg-primary">Innledande fase</span>',
  avsluttende:  '<span class="badge bg-success">Avsluttande fase</span>',
}

export async function render(container, { id } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'

  const [{ data: stevne }, { count: antallSpelarar }] = await Promise.all([
    supabase.from('stevne')
      .select(`
        id, navn, dato, sted, stevne_fase, antall_runder_innl,
        kastemetodeInnl:innledendekastemetodeid(id, navn),
        kastemetodeAvsl:avsluttendekastemetodeid(id, navn)
      `)
      .eq('id', stevneid)
      .single(),
    supabase.from('pamelding')
      .select('id', { count: 'exact', head: true })
      .eq('stevneid', stevneid),
  ])

  if (!stevne) {
    container.innerHTML = '<p style="text-align:center;margin-top:40px;color:red;">Stevne ikkje funne.</p>'
    return
  }

  const fase = stevne.stevne_fase ?? null
  const ikkjeStarta = fase === null || fase === 'ikke_startet'
  const badge = faseLabel[fase ?? 'ikke_startet'] ?? `<span class="badge bg-secondary">${fase}</span>`
  const metodeNavn = stevne.kastemetodeInnl?.navn ?? '—'
  const erCascade = metodeNavn.toLowerCase().includes('gloppen')

  container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderOrgNav(stevneid, 'info')}
      <h4 class="mb-3">${stevne.navn} ${badge}</h4>
      <div class="card mb-3" style="max-width:480px">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${stevne.sted ?? '—'}</td></tr>
              <tr><th>Dato</th><td>${stevne.dato ? formaterDatoNumeric(stevne.dato) : '—'}</td></tr>
              <tr><th>Tid</th><td>${stevne.dato ? formaterTid(stevne.dato) : '—'}</td></tr>
              <tr><th>Kastemetode innledande</th><td>${metodeNavn}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${stevne.kastemetodeAvsl?.navn ?? '—'}</td></tr>
              <tr><th>Antal rundar innledande</th><td>${stevne.antall_runder_innl ?? '—'}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${antallSpelarar ?? 0}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      ${ikkjeStarta ? `<button id="start-stevne-btn" class="btn btn-success">Start stevne</button>` : ''}
    </div>
  `

  if (!ikkjeStarta) return

  container.querySelector('#start-stevne-btn').addEventListener('click', async () => {
    if ((antallSpelarar ?? 0) < 2) {
      alert('Stevnet må ha minst 2 spelarar for å startast.')
      return
    }
    if (erCascade && !stevne.antall_runder_innl) {
      alert('Du må setje antal rundar for innledande fase (Gloppen-metoden krev dette).\nGå til Innstillingar for å endre.')
      return
    }

    try {
      await genererInnledendeKamper(stevneid, metodeNavn, stevne.antall_runder_innl ?? 1)
    } catch (e) {
      alert('Feil ved kampgenerering: ' + e.message)
      return
    }

    const { error: faseErr } = await supabase
      .from('stevne')
      .update({ stevne_fase: 'innledende' })
      .eq('id', stevneid)
    if (faseErr) { alert('Feil ved oppdatering av fase: ' + faseErr.message); return }

    location.hash = `#/stevne/${stevneid}/organizer/innledende`
  })
}
