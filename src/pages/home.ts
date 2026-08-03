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
import { getRegistrationsForThrower } from "@/services/stevneService";
import { bindRegistrationSlots } from "@/components/PameldingKnapp";
import { createStevneCard } from "@/components/StevneCard";

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

function upcomingCard(s: UpcomingTournamentRow, showSlot: boolean): HTMLElement {
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
        ? { href: `#/stevne/${s.id}/info`, label: "Meld på" }
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
    const { data: sncParents } = await getTournamentsByIds(sncParentIds);
    if (!isCurrent()) return;
    const live = [...ongoing.filter((s) => s.snc_hovudstevne_id == null), ...sncParents];

    const throwerId = auth?.profil?.kasterid ?? null;
    const showSlot = throwerId !== null && auth?.profil?.kobling_status === "godkjent";

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
      .replaceWith(cardList(r2.map((s) => upcomingCard(s, showSlot))));

    if (throwerId !== null && auth?.user.id) {
      const registeredMap = await getRegistrationsForThrower(throwerId);
      if (!isCurrent()) return;
      bindRegistrationSlots(upcomingSection, throwerId, auth.user.id, registeredMap);
    }
  } catch (err) {
    logError("home.render", err);
    if (isCurrent()) container.replaceChildren(createErrorBanner("Kunne ikkje laste framsida."));
  }
}
