import type { RealtimeChannel } from '@supabase/supabase-js'
import { erAdmin, erKlubbadmin } from '@/services/authService'
import { hentStevneHeader, subscribeToStevneFase } from '@/services/stevneService'
import { avmeldKanal } from '@/utils/realtime'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { logError } from '@/utils/logError'
import { escHtml } from '@/utils/escHtml'
import { render as renderInfo }          from './stevne/stevne-info'
import { render as renderDeltakere }     from './stevne/stevne-deltakere'
import { render as renderInnledende }    from './stevne/stevne-innledende'
import { render as renderAvsluttende }   from './stevne/stevne-avsluttende'
import { render as renderInnstillingar } from './stevne/stevne-innstillinger'
import { render as renderResultat }      from './stevne/stevne-resultat'

// ── Typar ─────────────────────────────────────────────────────────────────────

type TabRender = (
  container: HTMLElement,
  opts: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
) => Promise<void>

// ── Tab-konfigurasjon ─────────────────────────────────────────────────────────

const FANER = [
  { nøkkel: 'info',          label: 'Info',          adminOnly: false },
  { nøkkel: 'deltakere',     label: 'Deltakere',     adminOnly: true  },
  { nøkkel: 'innledende',    label: 'Innledande',    adminOnly: false },
  { nøkkel: 'avsluttende',   label: 'Avsluttande',   adminOnly: false },
  { nøkkel: 'resultat',      label: 'Sluttresultat', adminOnly: false },
  { nøkkel: 'innstillinger', label: 'Innstillingar', adminOnly: true  },
] as const

type TabNøkkel = (typeof FANER)[number]['nøkkel']

const ADMIN_FANER = new Set<string>(FANER.filter(f => f.adminOnly).map(f => f.nøkkel))

const TAB_RENDER: Record<TabNøkkel, TabRender> = {
  info:          renderInfo,
  deltakere:     renderDeltakere as TabRender,
  innledende:    renderInnledende,
  avsluttende:   renderAvsluttende,
  innstillinger: renderInnstillingar as TabRender,
  resultat:      renderResultat as TabRender,
}

const FASE_LABEL: Record<string, string> = {
  ikke_startet: '<span class="badge bg-secondary">Ikkje starta</span>',
  innledende:   '<span class="badge bg-primary">Innledande fase</span>',
  avsluttende:  '<span class="badge bg-success">Avsluttande fase</span>',
}

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function renderNav(stevneid: number, aktiv: string, isAdmin: boolean, harAvsluttande: boolean): string {
  const items = FANER
    .filter(f => isAdmin || !f.adminOnly)
    .filter(f => f.nøkkel !== 'avsluttende' || harAvsluttande)
    .map(({ nøkkel, label }) => `
      <li class="nav-item">
        <a class="nav-link${aktiv === nøkkel ? ' active' : ''}"
           href="#/stevne/${stevneid}/${nøkkel}">${label}</a>
      </li>`)
    .join('')
  return `<ul class="nav nav-tabs mb-3">${items}</ul>`
}

// ── Render ────────────────────────────────────────────────────────────────────

let kanal: RealtimeChannel | null = null

export async function render(
  container: HTMLElement,
  { id, tab = 'info' }: { id: number; tab?: string },
): Promise<void> {
  if (kanal) { await avmeldKanal(kanal); kanal = null }
  container.replaceChildren(createLoadingState())

  try {
    const { data: stevne, error } = await hentStevneHeader(id)

    if (error || !stevne) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    const isAdmin = (await erAdmin()) || (await erKlubbadmin())
    const harAvsluttande = stevne.avsluttendekastemetodeid != null
    const aktiv = (!isAdmin && ADMIN_FANER.has(tab)) ? 'info' : tab as TabNøkkel
    const badge = FASE_LABEL[stevne.stevne_fase ?? 'ikke_startet'] ?? ''

    container.innerHTML = `
      <div class="org-shell py-3 px-3">
        ${renderNav(id, aktiv, isAdmin, harAvsluttande)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${escHtml(stevne.navn)} <span id="fase-badge">${badge}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`

    const bannerSlot = container.querySelector<HTMLElement>('#org-banner-knappar')
    const subside    = container.querySelector<HTMLElement>('#org-subside')!
    const renderFn   = TAB_RENDER[aktiv] ?? renderInfo

    await renderFn(subside, { id, isAdmin }, bannerSlot)

    kanal = subscribeToStevneFase(id, fase => {
      const el = container.querySelector('#fase-badge')
      if (el) el.innerHTML = FASE_LABEL[fase ?? 'ikke_startet'] ?? ''
    })
  } catch (err) {
    logError('stevne.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste stevnet.'))
  }
}
