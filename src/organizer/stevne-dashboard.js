import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'

const faseLabel = {
  ikke_startet: '<span class="badge bg-secondary">Ikkje starta</span>',
  innledende:   '<span class="badge bg-primary">Innledande fase</span>',
  avsluttende:  '<span class="badge bg-success">Avsluttande fase</span>',
}

export async function render(container, { id } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'

  const { data: stevne } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, dato, sted')
    .eq('id', stevneid)
    .single()

  if (!stevne) {
    container.innerHTML = '<p style="text-align:center;margin-top:40px;color:red;">Stevne ikkje funne.</p>'
    return
  }

  const fase = stevne.stevne_fase ?? 'ikke_startet'
  const badge = faseLabel[fase] ?? `<span class="badge bg-secondary">${fase}</span>`

  container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderOrgNav(stevneid, null)}
      <h4 class="mb-1">${stevne.navn} ${badge}</h4>
      <p class="text-muted mb-3">${[stevne.sted, stevne.dato].filter(Boolean).join(' · ')}</p>
      <div class="d-flex gap-2">
        <a href="#/stevne/${stevneid}/organizer/spillere" class="btn btn-outline-primary btn-sm">Spelarar →</a>
        <a href="#/stevne/${stevneid}/organizer/innstillinger" class="btn btn-outline-secondary btn-sm">Innstillingar →</a>
        ${fase !== 'ikke_startet' && fase !== null
          ? `<a href="#/stevne/${stevneid}/organizer/innledende" class="btn btn-outline-success btn-sm">Innledande →</a>`
          : ''}
      </div>
    </div>
  `
}
