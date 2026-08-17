import { createErrorBanner } from "@/components/states";
import {
  getLatestResults,
  getLiveTournaments,
  getTournamentsByIds,
  getUpcomingTournaments,
} from "@/services/stevneService";
import type { ListedTournamentRow } from "@/services/stevneService";
import { logError } from "@/utils/logError";
import { mergeSncUmbrellas, collectSncParentIds } from "@/utils/sncUmbrella";
import { getUser } from "@/services/authService";
import { linkedThrowerId } from "@/utils/kaster";
import { getRegistrationsForThrower, emptyThrowerRegistrations } from "@/services/stevneService";
import type { ThrowerRegistrations } from "@/services/stevneService";
import { bindRegistrationSlots } from "@/components/PameldingKnapp";
import {
  createTournamentCard,
  registrationCtaLink,
  sncUmbrellaActionLink,
} from "@/components/StevneCard";
import type { AuthUser } from "@/types";

// ── HTML builders ─────────────────────────────────────────────────────────────

// Same card builder as terminliste and min side — status comes from the stevne's
// own fields, so the live-prikk dot appears here exactly as it does there.
function liveCard(s: ListedTournamentRow): HTMLElement {
  const tab = s.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  return createTournamentCard(s, {
    href: `#/stevne/${s.id}/${s.er_snc_hovudstevne ? "info" : tab}`,
  });
}

function resultCard(s: ListedTournamentRow): HTMLElement {
  return createTournamentCard(s, { href: `#/stevne/${s.id}/resultat` });
}

function upcomingCard(
  s: ListedTournamentRow,
  showSlot: boolean,
  registrations: ThrowerRegistrations,
  auth: AuthUser | null,
): HTMLElement {
  // getUpcomingTournaments already constrains erfullfort and stevne_fase, so showSlot is the only gate left.
  const canRegister = showSlot;
  return createTournamentCard(s, {
    href: `#/stevne/${s.id}/info`,
    // SNC: the thrower must pick a local stevne first, so the button navigates.
    registrationSlotId: canRegister && !s.er_snc_hovudstevne ? s.id : undefined,
    // Without a link there is no button to show, so the slot explains what is
    // missing instead of leaving the card looking like registration doesn't exist.
    actionLink: canRegister
      ? s.er_snc_hovudstevne
        ? sncUmbrellaActionLink(s.id, registrations.sncParentIds.has(s.id))
        : undefined
      : registrationCtaLink(s.id, auth),
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

    const ongoing = r5.filter((s) => !s.erfullfort);
    const sncParentIds = collectSncParentIds(ongoing);
    const throwerId = auth?.profil?.kasterid ?? null;
    const showSlot = linkedThrowerId(auth) !== null;

    // Both depend only on data already in hand, so they run together rather than
    // adding a second serial round-trip before the upcoming list can paint.
    const [{ data: sncParents }, registrations] = await Promise.all([
      getTournamentsByIds(sncParentIds),
      throwerId !== null
        ? getRegistrationsForThrower(throwerId)
        : Promise.resolve(emptyThrowerRegistrations()),
    ]);
    if (!isCurrent()) return;
    const live = mergeSncUmbrellas(ongoing, sncParents);

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
      .replaceWith(cardList(r2.map((s) => upcomingCard(s, showSlot, registrations, auth))));

    // Same gate as the slots themselves — binding must not outlive what upcomingCard rendered.
    if (showSlot && throwerId !== null && auth) {
      // The page has already painted; a binding failure must not replace it with an error.
      try {
        bindRegistrationSlots(upcomingSection, throwerId, registrations.byTournament);
      } catch (err) {
        logError("home.bindRegistrationSlots", err);
      }
    }
  } catch (err) {
    logError("home.render", err);
    if (isCurrent()) container.replaceChildren(createErrorBanner("Kunne ikkje laste framsida."));
  }
}
