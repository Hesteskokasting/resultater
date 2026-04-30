import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'
import { genererInnledendeKamper } from './kampgenerering-db.js'

export async function render(container, { id } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'

  const [{ data: stevne }, { count: antallSpelarar }] = await Promise.all([
    supabase.from('stevne')
      .select(`
        id, navn, dato, sted, stevne_fase, antall_runder_innl,
        kastemetode:innledendekastemetodeid(id, navn)
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
  const metodeNavn = stevne.kastemetode?.navn ?? '—'
  const erCascade = metodeNavn.toLowerCase().includes('gloppen')

  const faseBadge = ikkjeStarta
    ? '<span class="badge bg-secondary">Ikkje starta</span>'
    : fase === 'innledende'
    ? '<span class="badge bg-primary">Innledande fase</span>'
    : '<span class="badge bg-success">Avsluttande fase</span>'

  container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderOrgNav(stevneid, 'innstillinger')}
      <h4 class="mb-3">${stevne.navn} — Innstillingar ${faseBadge}</h4>
      <div class="card mb-3" style="max-width:480px">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${stevne.sted ?? '—'}</td></tr>
              <tr><th>Dato</th><td>${stevne.dato ?? '—'}</td></tr>
              <tr><th>Kastemetode (innl.)</th><td>${metodeNavn}</td></tr>
              <tr><th>Antal rundar (innl.)</th><td>${stevne.antall_runder_innl ?? '—'}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${antallSpelarar ?? 0}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      ${ikkjeStarta ? `
        <button id="start-stevne-btn" class="btn btn-success">
          Start stevne
        </button>
      ` : ''}
    </div>
  `

  if (!ikkjeStarta) return

  container.querySelector('#start-stevne-btn').addEventListener('click', async () => {
    if ((antallSpelarar ?? 0) < 2) {
      alert('Stevnet må ha minst 2 spelarar for å startast.')
      return
    }
    if (erCascade && !stevne.antall_runder_innl) {
      alert('Du må setje antal rundar for innledande fase (Gloppen-metoden krev dette).')
      return
    }

    const { error: faseErr } = await supabase
      .from('stevne')
      .update({ stevne_fase: 'innledende' })
      .eq('id', stevneid)
    if (faseErr) { alert('Feil ved oppdatering av fase: ' + faseErr.message); return }

    // Idempotent: berre generer om ingen kampar finst
    const { count: eksisterandeKampar } = await supabase
      .from('kamp')
      .select('id', { count: 'exact', head: true })
      .eq('stevneid', stevneid)
      .eq('fase', 'innledende')

    if (!eksisterandeKampar) {
      try {
        await genererInnledendeKamper(stevneid, metodeNavn, stevne.antall_runder_innl ?? 1)
      } catch (e) {
        alert('Feil ved kampgenerering: ' + e.message)
        return
      }
    }

    location.hash = `#/stevne/${stevneid}/organizer/innledende`
  })
}
