import { supabase } from '../supabase.js'
import { erAdmin, erKlubbadmin } from '../utils/auth.js'
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

let kanal = null

const TAB_RENDER = {
  info:          renderInfo,
  spillere:      renderSpillarar,
  innledende:    renderInnledende,
  avsluttende:   renderAvsluttende,
  innstillinger: renderInnstillingar,
}

export async function render(container, { id, tab = 'info', basePath = 'organizer' } = {}) {
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  const stevneid = Number(id)
  container.innerHTML = '<p class="laster">Laster…</p>'

  const { data: stevne } = await supabase
    .from('stevne').select('id, navn, stevne_fase').eq('id', stevneid).single()

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const isAdmin = basePath === 'organizer' || (await erAdmin()) || (await erKlubbadmin())
  const aktiv = !isAdmin && tab === 'innstillinger' ? 'info' : tab
  const badge = faseLabel[stevne.stevne_fase ?? 'ikke_startet'] ?? ''

  container.innerHTML = `
    <div class="org-shell py-3 px-3">
      ${renderOrgNav(stevneid, aktiv, isAdmin, basePath)}
      <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
        <h5 class="mb-0 flex-grow-1">${stevne.navn} <span id="fase-badge">${badge}</span></h5>
        ${isAdmin ? '<div id="org-banner-knappar"></div>' : ''}
      </div>
      <div id="org-subside"></div>
    </div>`

  const bannerSlot = isAdmin ? container.querySelector('#org-banner-knappar') : null
  const subside = container.querySelector('#org-subside')
  const renderFn = TAB_RENDER[aktiv] ?? renderInfo
  await renderFn(subside, { id: String(stevneid) }, bannerSlot)

  kanal = supabase
    .channel(`stevne-fase-${stevneid}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'stevne', filter: `id=eq.${stevneid}` },
      (payload) => {
        const el = container.querySelector('#fase-badge')
        if (el) el.innerHTML = faseLabel[payload.new?.stevne_fase ?? 'ikke_startet'] ?? ''
      })
    .subscribe()
}
