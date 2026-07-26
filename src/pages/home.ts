import { formaterPoeng, buildSingleList } from '@/utils/norgescup'
import { getRules, getTournamentsAndResults } from '@/services/norgescupService'
import { formatDateLong } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { escHtml } from '@/utils/escHtml'
import { livePillHtml } from '@/components/LivePill'
import { getLatestResults, getLiveTournaments, getUpcomingTournaments } from '@/services/stevneService'
import type { LatestResultRow, LiveTournamentRow, UpcomingTournamentRow } from '@/services/stevneService'
import { logError } from '@/utils/logError'
import type { SingleListRow } from '@/utils/norgescup'
import { getUser } from '@/services/authService'
import { getRegistrationsForThrower } from '@/services/stevneService'
import { bindRegistrationSlots } from '@/components/PameldingKnapp'
import { createStevneCard } from '@/components/StevneCard'

// ── HTML builders ─────────────────────────────────────────────────────────────

function ncTop20Html(list: SingleListRow[]): string {
  if (list.length === 0) return '<p class="empty-state">Ingen data.</p>'
  const rows = list.slice(0, 20).map(k => `
    <tr>
      <td class="nc-td-pl">${k.plassering}</td>
      <td>${escHtml(k.navn)}</td>
      <td>${escHtml(k.klubb)}</td>
      <td class="nc-td-points">${formaterPoeng(k.totalPoeng)}</td>
    </tr>`).join('')
  return `
    <table class="app-table">
      <thead class="app-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Name</th>
          <th>Klubb</th>
          <th class="nc-td-points">Poeng</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function liveCardHtml(s: LiveTournamentRow): string {
  const tab = s.stevne_fase === 'avsluttende' ? 'avsluttende' : 'innledende'
  return `
    <a class="live-card" href="#/stevne/${s.id}/${tab}">
      ${livePillHtml()}
      <span>${escHtml(s.navn)}</span>
    </a>`
}

function resultCard(s: LatestResultRow): HTMLElement {
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/resultat`,
    date: formatDateLong(s.dato),
    status: 'done',
  })
}

function upcomingCard(s: UpcomingTournamentRow, showSlot: boolean): HTMLElement {
  const notStarted = s.stevne_fase === null || s.stevne_fase === 'ikke_startet'
  const canRegister = showSlot && notStarted && !s.erfullfort
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/info`,
    date: formatDateLong(s.dato),
    status: 'upcoming',
    registrationSlotId: canRegister ? s.id : undefined,
  })
}

function cardList(cards: HTMLElement[]): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'stevne-kort-liste'
  cards.forEach(c => wrap.appendChild(c))
  return wrap
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  const year = new Date().getFullYear()

  // Render skeleton immediately: headings paint as LCP candidates, placeholders reserve layout space
  container.innerHTML = `
    <div class="homepage">
      <div id="live-section"></div>
      <div class="homepage-grid">
        <section class="homepage-nc">
          <h2 class="homepage-section-title">Norgescupen Topp 20</h2>
          <div class="skeleton-block skeleton-block--nc" id="nc-content"></div>
          <a class="homepage-more-link" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="homepage-results">
          <h2 class="homepage-section-title">Siste resultat</h2>
          <div class="skeleton-block skeleton-block--list" id="results-content"></div>
          <a class="homepage-more-link" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="homepage-upcoming">
          <h2 class="homepage-section-title">Kommande konkurransar</h2>
          <div class="skeleton-block skeleton-block--list" id="upcoming-content"></div>
          <a class="homepage-more-link" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`
  const root = container.querySelector<HTMLElement>('.homepage')!

  // A route change (e.g. a deep-linked push notification) can replace container's
  // content while the fetches below are still in flight — abandon this render rather
  // than writing into a page that isn't ours anymore.
  const isCurrent = (): boolean => container.contains(root)

  try {
    const [
      { data: r1, error: e1 },
      { data: r2, error: e2 },
      { data: r3, error: e3 },
      { stevner: s4, resultater: r4, error: e4 },
      { data: r5, error: _e5 },
      auth,
    ] = await Promise.all([
      getLatestResults(),
      getUpcomingTournaments(),
      getRules(year),
      getTournamentsAndResults(year),
      getLiveTournaments(),
      getUser(),
    ])

    if (!isCurrent()) return

    if (e1 || e2 || e3 || e4) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
      return
    }

    const live = r5.filter(s => !s.erfullfort)
    const ncList = r3 ? buildSingleList(r4, s4, r3, 'NC', 1, year < 2026) : []
    const throwerId = auth?.profil?.kasterid ?? null
    const showSlot = throwerId !== null && auth?.profil?.kobling_status === 'godkjent'

    // Update sections in-place to avoid layout shift
    if (live.length) {
      const liveSection = container.querySelector<HTMLElement>('#live-section')!
      liveSection.innerHTML = `<div class="live-banner">${live.map(liveCardHtml).join('')}</div>`
    }

    container.querySelector<HTMLElement>('#nc-content')!.outerHTML = ncTop20Html(ncList)

    container.querySelector<HTMLElement>('#results-content')!
      .replaceWith(cardList(r1.map(resultCard)))

    const upcomingSection = container.querySelector<HTMLElement>('.homepage-upcoming')!
    container.querySelector<HTMLElement>('#upcoming-content')!
      .replaceWith(cardList(r2.map(s => upcomingCard(s, showSlot))))

    if (throwerId !== null && auth?.user.id) {
      const registeredMap = await getRegistrationsForThrower(throwerId)
      if (!isCurrent()) return
      bindRegistrationSlots(upcomingSection, throwerId, auth.user.id, registeredMap)
    }

  } catch (err) {
    logError('home.render', err)
    if (isCurrent()) container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
  }
}
