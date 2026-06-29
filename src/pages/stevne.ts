import { erAdmin, erKlubbadmin } from '@/services/authService'
import { getTournamentHeader } from '@/services/stevneService'
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
import { render as renderStats }         from './stevne/stevne-stats'
import type { Params } from '@/types'

// ── Typar ─────────────────────────────────────────────────────────────────────

type TabRender = (
  container: HTMLElement,
  opts: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
) => Promise<void>

// ── Tab-konfigurasjon ─────────────────────────────────────────────────────────

const FANER = [
  { key: 'info',          label: 'Info',          adminOnly: false, completedOnly: false },
  { key: 'deltakere',     label: 'Deltakere',     adminOnly: true,  completedOnly: false },
  { key: 'innledende',    label: 'Innl.',          adminOnly: false, completedOnly: false },
  { key: 'avsluttende',   label: 'Avsl.',          adminOnly: false, completedOnly: false },
  { key: 'resultat',      label: 'Sluttresultat', adminOnly: false, completedOnly: true  },
  { key: 'innstillinger', label: 'Innstillingar', adminOnly: true,  completedOnly: false },
  { key: 'stats',         label: 'Stats',         adminOnly: false, completedOnly: false },
] as const

type TabKey = (typeof FANER)[number]['key']

const ADMIN_FANER     = new Set<string>(FANER.filter(f => f.adminOnly).map(f => f.key))
const COMPLETED_FANER = new Set<string>(FANER.filter(f => f.completedOnly).map(f => f.key))

const TAB_RENDER: Record<TabKey, TabRender> = {
  info:          renderInfo,
  deltakere:     renderDeltakere as TabRender,
  innledende:    renderInnledende,
  avsluttende:   renderAvsluttende,
  innstillinger: renderInnstillingar as TabRender,
  resultat:      renderResultat as TabRender,
  stats:         renderStats as TabRender,
}

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function renderNav(stevneid: number, aktiv: string, isAdmin: boolean, harAvsluttande: boolean, isCompleted: boolean): string {
  const items = FANER
    .filter(f => isAdmin || !f.adminOnly)
    .filter(f => f.key !== 'avsluttende' || harAvsluttande)
    .filter(f => !f.completedOnly || isCompleted)
    .map(({ key, label }) => `
      <li class="nav-item">
        <a class="nav-link${aktiv === key ? ' active' : ''}"
           href="#/stevne/${stevneid}/${key}">${label}</a>
      </li>`)
    .join('')
  return `<ul class="nav nav-underline stevne-nav mb-0 px-3">${items}</ul>`
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  params: Params,
): Promise<void> {
  const id = Number(params.id)
  const tab = String(params.tab ?? 'info')
  container.replaceChildren(createLoadingState())

  try {
    const { data: stevne, error } = await getTournamentHeader(id)

    if (error || !stevne) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    const isAdmin = (await erAdmin()) || (await erKlubbadmin())
    const harAvsluttande = stevne.avsluttendekastemetodeid != null
    const isCompleted = stevne.erfullfort === true
    const aktiv = ((!isAdmin && ADMIN_FANER.has(tab)) || (!isCompleted && COMPLETED_FANER.has(tab)))
      ? 'info'
      : tab as TabKey

    container.innerHTML = `
      <div class="org-shell pb-3 pt-1">
        ${renderNav(id, aktiv, isAdmin, harAvsluttande, isCompleted)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0">${escHtml(stevne.navn)}</h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside" class="px-3"></div>
      </div>`

    const bannerSlot = container.querySelector<HTMLElement>('#org-banner-knappar')
    const subside    = container.querySelector<HTMLElement>('#org-subside')!
    const renderFn   = TAB_RENDER[aktiv] ?? renderInfo

    await renderFn(subside, { id, isAdmin }, bannerSlot)
  } catch (err) {
    logError('stevne.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste stevnet.'))
  }
}
