import { formatDateLong } from "@/utils/shared";
import { createErrorBanner } from "@/components/ErrorBanner";
import {
  getLatestResults,
  getLiveTournaments,
  getTournamentsByIds,
  getUpcomingTournaments,
} from "@/services/stevneService";
import type {
  LatestResultRow,
  LiveTournamentRow,
  UpcomingTournamentRow,
} from "@/services/stevneService";
import { logError } from "@/utils/logError";
import { getUser } from "@/services/authService";
import { getRegistrationsForThrower, emptyThrowerRegistrations } from "@/services/stevneService";
import type { ThrowerRegistrations } from "@/services/stevneService";
import { bindRegistrationSlots } from "@/components/PameldingKnapp";
import { createStevneCard } from "@/components/StevneCard";
import { sncUmbrellaActionLink } from "@/utils/sncRegistration";

// ── HTML builders ─────────────────────────────────────────────────────────────

// Same card component as terminliste — the live-prikk dot on `status: 'live'` is
// the only "ongoing" indicator, consistent across both pages.
function liveCard(s: LiveTournamentRow): HTMLElement {
  const tab = s.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/${s.er_snc_hovudstevne ? "info" : tab}`,
    date: formatDateLong(s.dato),
    status: "live",
  });
}

function resultCard(s: LatestResultRow): HTMLElement {
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/resultat`,
    date: formatDateLong(s.dato),
    status: "done",
  });
}

function upcomingCard(
  s: UpcomingTournamentRow,
  showSlot: boolean,
  registrations: ThrowerRegistrations,
): HTMLElement {
  const notStarted = s.stevne_fase === null || s.stevne_fase === "ikke_startet";
  const canRegister = showSlot && notStarted && !s.erfullfort;
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/info`,
    date: formatDateLong(s.dato),
    status: "upcoming",
    // SNC: the thrower must pick a local stevne first, so the button navigates.
    registrationSlotId: canRegister && !s.er_snc_hovudstevne ? s.id : undefined,
    actionLink:
      canRegister && s.er_snc_hovudstevne
        ? sncUmbrellaActionLink(s.id, registrations.sncParentIds.has(s.id))
        : undefined,
  });
}

function cardList(cards: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "stevne-kort-liste";
  cards.forEach((c) => wrap.appendChild(c));
  return wrap;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  // Render skeleton immediately: headings paint as LCP candidates, placeholders reserve layout space
  container.innerHTML = `
    <div class="homepage">
      <div id="live-section"></div>
      <div class="homepage-grid">
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
    </div>`;
  const root = container.querySelector<HTMLElement>(".homepage")!;

  // A route change (e.g. a deep-linked push notification) can replace container's
  // content while the fetches below are still in flight — abandon this render rather
  // than writing into a page that isn't ours anymore.
  const isCurrent = (): boolean => container.contains(root);

  try {
    const [{ data: r1, error: e1 }, { data: r2, error: e2 }, { data: r5, error: _e5 }, auth] =
      await Promise.all([
        getLatestResults(),
        getUpcomingTournaments(),
        getLiveTournaments(),
        getUser(),
      ]);

    if (!isCurrent()) return;

    if (e1 || e2) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste framsida."));
      return;
    }

    // Show a running SNC round once, as the umbrella, not once per local stevne.
    const ongoing = r5.filter((s) => !s.erfullfort);
    const sncParentIds = [
      ...new Set(
        ongoing
          .map((s) => s.snc_hovudstevne_id)
          .filter((parentId): parentId is number => parentId != null),
      ),
    ];
    const throwerId = auth?.profil?.kasterid ?? null;
    const showSlot = throwerId !== null && auth?.profil?.kobling_status === "godkjent";

    // Both depend only on data already in hand, so they run together rather than
    // adding a second serial round-trip before the upcoming list can paint.
    const [{ data: sncParents }, registrations] = await Promise.all([
      getTournamentsByIds(sncParentIds),
      throwerId !== null
        ? getRegistrationsForThrower(throwerId)
        : Promise.resolve(emptyThrowerRegistrations()),
    ]);
    if (!isCurrent()) return;
    // Re-sorted: concatenating the umbrellas onto the plain stevner would
    // otherwise drop the date order the query established.
    const live = [
      ...ongoing.filter((s) => s.snc_hovudstevne_id == null),
      // A finished umbrella must not reappear as live just because a local is still running.
      ...sncParents.filter((s) => !s.erfullfort),
    ].sort((a, b) => (a.dato ?? "").localeCompare(b.dato ?? ""));

    // Update sections in-place to avoid layout shift
    if (live.length) {
      const liveSection = container.querySelector<HTMLElement>("#live-section")!;
      liveSection.replaceChildren(cardList(live.map(liveCard)));
    }

    container
      .querySelector<HTMLElement>("#results-content")!
      .replaceWith(cardList(r1.map(resultCard)));

    const upcomingSection = container.querySelector<HTMLElement>(".homepage-upcoming")!;
    container
      .querySelector<HTMLElement>("#upcoming-content")!
      .replaceWith(cardList(r2.map((s) => upcomingCard(s, showSlot, registrations))));

    // Same gate as the slots themselves — binding must not outlive what upcomingCard rendered.
    if (showSlot && throwerId !== null && auth) {
      bindRegistrationSlots(upcomingSection, throwerId, auth.user.id, registrations.byTournament);
    }
  } catch (err) {
    logError("home.render", err);
    if (isCurrent()) container.replaceChildren(createErrorBanner("Kunne ikkje laste framsida."));
  }
}
