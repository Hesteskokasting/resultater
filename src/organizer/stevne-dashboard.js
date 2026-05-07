import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'
import { render as renderInfo }          from './stevne-info.js'
import { render as renderSpillarar }     from './stevne-deltakere.js'
import { render as renderInnledende }    from './stevne-innledende.js'
import { render as renderAvsluttende }   from './stevne-avsluttende.js'
import { render as renderInnstillingar } from './stevne-innstillinger.js'

const faseLabel = {
  ikke_startet: '<span class="badge bg-secondary">Ikkje starta</span>',
  innledende:   '<span class="badge bg-primary">Innledande fase</span>',
  avsluttende:  '<span class="badge bg-success">Avsluttande fase</span>',
}

const TAB_RENDER = {
  info:          renderInfo,
  spillere:      renderSpillarar,
  innledende:    renderInnledende,
  avsluttende:   renderAvsluttende,
  innstillinger: renderInnstillingar,
}

export async function render(container, { id, tab = 'info' } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p class="laster">Laster…</p>'

  const { data: stevne } = await supabase
    .from('stevne').select('id, navn, stevne_fase').eq('id', stevneid).single()

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const badge = faseLabel[stevne.stevne_fase ?? 'ikke_startet'] ?? ''

  container.innerHTML = `
    <div class="org-shell py-3 px-3">
      ${renderOrgNav(stevneid, tab)}
      <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
        <h5 class="mb-0 flex-grow-1">${stevne.navn} ${badge}</h5>
        <div id="org-banner-knappar"></div>
      </div>
      <div id="org-subside"></div>
    </div>`

  const bannerSlot = container.querySelector('#org-banner-knappar')
  const subside = container.querySelector('#org-subside')
  const renderFn = TAB_RENDER[tab] ?? renderInfo
  await renderFn(subside, { id: String(stevneid) }, bannerSlot)
}
