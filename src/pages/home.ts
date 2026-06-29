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
import { bindPameldingSlots } from '@/components/PameldingKnapp'

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function ncTopp20Html(liste: SingleListRow[]): string {
  if (liste.length === 0) return '<p class="empty-state">Ingen data.</p>'
  const rader = liste.slice(0, 20).map(k => `
    <tr>
      <td class="nc-td-pl">${k.plassering}</td>
      <td>${escHtml(k.navn)}</td>
      <td>${escHtml(k.klubb)}</td>
      <td class="nc-td-poeng">${formaterPoeng(k.totalPoeng)}</td>
    </tr>`).join('')
  return `
    <table class="app-tabell">
      <thead class="app-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Namn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${rader}</tbody>
    </table>`
}

function liveKortHtml(s: LiveTournamentRow): string {
  const tab = s.stevne_fase === 'avsluttende' ? 'avsluttende' : 'innledende'
  return `
    <a class="live-kort" href="#/stevne/${s.id}/${tab}">
      ${livePillHtml()}
      <span>${escHtml(s.navn)}</span>
    </a>`
}

function resultatKortHtml(s: LatestResultRow): string {
  return `
    <div class="stevne-kort">
      <p class="stevne-dato">${formatDateLong(s.dato)}</p>
      <p class="stevne-navn">${escHtml(s.navn)}</p>
      <a class="stevne-lenke" href="#/stevne/${s.id}/resultat">Vis resultat</a>
    </div>`
}

function kommendeKortHtml(s: UpcomingTournamentRow, showSlot: boolean): string {
  const ikkjeStarta = s.stevne_fase === null || s.stevne_fase === 'ikke_startet'
  const canRegister = showSlot && ikkjeStarta && !s.erfullfort
  const innbydelse = s.innbydelseurl
    ? `<a class="stevne-lenke" href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse &#128196;</a>`
    : canRegister
      ? `<span data-pm-slot="${s.id}"></span>`
      : `<span class="stevne-lenke-inaktiv">Innbydelse er ikkje klar</span>`
  return `
    <div class="stevne-kort">
      <p class="stevne-dato">${formatDateLong(s.dato)}</p>
      <a class="stevne-navn" href="#/stevne/${s.id}/info">${escHtml(s.navn)}</a>
      ${innbydelse}
    </div>`
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  const ar = new Date().getFullYear()

  // Render skeleton immediately: headings paint as LCP candidates, placeholders reserve layout space
  container.innerHTML = `
    <div class="heimeside">
      <div id="live-seksjon"></div>
      <div class="heimeside-grid">
        <section class="heimeside-nc">
          <h2 class="heimeside-seksjon-tittel">Norgescupen Klasse 1 - Topp 20</h2>
          <div class="skeleton-blokk skeleton-blokk--nc" id="nc-innhald"></div>
          <a class="heimeside-meir-lenke" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="heimeside-resultater">
          <h2 class="heimeside-seksjon-tittel">Siste resultat</h2>
          <div class="skeleton-blokk skeleton-blokk--liste" id="resultater-innhald"></div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="heimeside-kommende">
          <h2 class="heimeside-seksjon-tittel">Kommande konkurransar</h2>
          <div class="skeleton-blokk skeleton-blokk--liste" id="kommende-innhald"></div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`

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
      getRules(ar),
      getTournamentsAndResults(ar),
      getLiveTournaments(),
      getUser(),
    ])

    if (e1 || e2 || e3 || e4) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
      return
    }

    const live = r5.filter(s => !s.erfullfort)
    const ncListe = r3 ? buildSingleList(r4, s4, r3, 'NC', 1) : []
    const kasterid = auth?.profil?.kasterid ?? null
    const showSlot = kasterid !== null && auth?.profil?.kobling_status === 'godkjent'

    // Update sections in-place to avoid layout shift
    if (live.length) {
      const liveSeksjon = container.querySelector<HTMLElement>('#live-seksjon')!
      liveSeksjon.innerHTML = `<div class="live-banner">${live.map(liveKortHtml).join('')}</div>`
    }

    container.querySelector<HTMLElement>('#nc-innhald')!.outerHTML = ncTopp20Html(ncListe)

    container.querySelector<HTMLElement>('#resultater-innhald')!.outerHTML =
      `<div class="stevne-liste">${r1.map(resultatKortHtml).join('')}</div>`

    const kommendeSection = container.querySelector<HTMLElement>('.heimeside-kommende')!
    container.querySelector<HTMLElement>('#kommende-innhald')!.outerHTML =
      `<div class="stevne-liste">${r2.map(s => kommendeKortHtml(s, showSlot)).join('')}</div>`

    if (kasterid !== null && auth?.user.id) {
      const pameldteMap = await getRegistrationsForThrower(kasterid)
      bindPameldingSlots(kommendeSection, kasterid, auth.user.id, pameldteMap)
    }

  } catch (err) {
    logError('home.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
  }
}
