import { isAdmin, isClubAdmin } from '@/services/authService'
import { getTournamentHeader } from '@/services/stevneService'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { logError } from '@/utils/logError'
import { escHtml } from '@/utils/escHtml'
import { setPageTitle } from '@/utils/pageTitle'
import { render as renderInfo }         from './stevne/stevne-info'
import { render as renderParticipants } from './stevne/stevne-deltakere'
import { render as renderPreliminary }  from './stevne/stevne-innledende'
import { render as renderFinal }        from './stevne/stevne-avsluttende'
import { render as renderSettings }     from './stevne/stevne-innstillinger'
import { render as renderResults }      from './stevne/stevne-resultat'
import { render as renderStats }        from './stevne/stevne-stats'
import type { Params } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type TabRender = (
  container: HTMLElement,
  opts: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
) => Promise<void>

// ── Tab configuration ─────────────────────────────────────────────────────────

const TABS = [
  { key: 'info',          label: 'Info',          adminOnly: false, completedOnly: false },
  { key: 'deltakere',     label: 'Deltakere',     adminOnly: true,  completedOnly: false },
  { key: 'innledende',    label: 'Innl.',          adminOnly: false, completedOnly: false },
  { key: 'avsluttende',   label: 'Avsl.',          adminOnly: false, completedOnly: false },
  { key: 'resultat',      label: 'Sluttresultat', adminOnly: false, completedOnly: true  },
  { key: 'innstillinger', label: 'Innstillingar', adminOnly: true,  completedOnly: false },
  { key: 'stats',         label: 'Stats',         adminOnly: false, completedOnly: false },
] as const

type TabKey = (typeof TABS)[number]['key']

const ADMIN_TABS     = new Set<string>(TABS.filter(f => f.adminOnly).map(f => f.key))
const COMPLETED_TABS = new Set<string>(TABS.filter(f => f.completedOnly).map(f => f.key))

const TAB_RENDER: Record<TabKey, TabRender> = {
  info:          renderInfo,
  deltakere:     renderParticipants as TabRender,
  innledende:    renderPreliminary,
  avsluttende:   renderFinal,
  innstillinger: renderSettings as TabRender,
  resultat:      renderResults as TabRender,
  stats:         renderStats as TabRender,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderNav(tournamentId: number, active: string, isAdminUser: boolean, hasFinal: boolean, isCompleted: boolean): string {
  const items = TABS
    .filter(f => isAdminUser || !f.adminOnly)
    .filter(f => f.key !== 'avsluttende' || hasFinal)
    .filter(f => !f.completedOnly || isCompleted)
    .map(({ key, label }) => `
      <li class="nav-item">
        <a class="nav-link${active === key ? ' active' : ''}"
           href="#/stevne/${tournamentId}/${key}">${label}</a>
      </li>`)
    .join('')
  return `<ul class="nav nav-underline tournament-nav mb-0 px-3">${items}</ul>`
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
    const { data: tournament, error } = await getTournamentHeader(id)

    if (error || !tournament) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    setPageTitle(tournament.navn)

    const userIsAdmin = (await isAdmin()) || (await isClubAdmin())
    const hasFinal = tournament.avsluttendekastemetodeid != null
    const isCompleted = tournament.erfullfort === true
    const activeTab = ((!userIsAdmin && ADMIN_TABS.has(tab)) || (!isCompleted && COMPLETED_TABS.has(tab)))
      ? 'info'
      : tab as TabKey

    container.innerHTML = `
      <div class="org-shell pb-3 pt-1">
        ${renderNav(id, activeTab, userIsAdmin, hasFinal, isCompleted)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0">${escHtml(tournament.navn)}</h5>
          <div id="org-banner-buttons"></div>
        </div>
        <div id="org-subpage" class="px-3"></div>
      </div>`

    const bannerSlot = container.querySelector<HTMLElement>('#org-banner-buttons')
    const subpage    = container.querySelector<HTMLElement>('#org-subpage')!
    const renderFn   = TAB_RENDER[activeTab] ?? renderInfo

    await renderFn(subpage, { id, isAdmin: userIsAdmin }, bannerSlot)
  } catch (err) {
    logError('stevne.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste stevnet.'))
  }
}
