import { isAdmin, isClubAdmin } from "@/services/authService";
import { getTournamentHeader } from "@/services/stevneService";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { logError } from "@/utils/logError";
import { escHtml } from "@/utils/escHtml";
import { setPageTitle } from "@/utils/pageTitle";
import { render as renderInfo } from "./stevne/stevne-info";
import { render as renderParticipants } from "./stevne/stevne-deltakere";
import { render as renderPreliminary } from "./stevne/stevne-innledende";
import { render as renderFinal } from "./stevne/stevne-avsluttende";
import { render as renderSettings } from "./stevne/stevne-innstillinger";
import { render as renderResults } from "./stevne/stevne-resultat";
import { render as renderStats } from "./stevne/stevne-stats";
import { render as renderSncInfo } from "./stevne/snc-info";
import { render as renderSncResults } from "./stevne/snc-resultat";
import type { Params } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type TabRender = (
  container: HTMLElement,
  opts: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
) => Promise<void>;

// ── Tab configuration ─────────────────────────────────────────────────────────

const TABS = [
  { key: "info", label: "Info", adminOnly: false, completedOnly: false },
  { key: "deltakere", label: "Deltakere", adminOnly: true, completedOnly: false },
  { key: "innledende", label: "Innl.", adminOnly: false, completedOnly: false },
  { key: "avsluttende", label: "Avsl.", adminOnly: false, completedOnly: false },
  { key: "resultat", label: "Resultat", adminOnly: false, completedOnly: true },
  { key: "innstillinger", label: "Innstillingar", adminOnly: true, completedOnly: false },
  { key: "stats", label: "Stats", adminOnly: false, completedOnly: false },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// An SNC umbrella has no participants, matches or match stats of its own — those
// live on the local stevner.
const SNC_PARENT_HIDDEN_TABS = new Set<TabKey>(["deltakere", "innledende", "avsluttende", "stats"]);

const TAB_RENDER: Record<TabKey, TabRender> = {
  info: renderInfo,
  deltakere: renderParticipants as TabRender,
  innledende: renderPreliminary,
  avsluttende: renderFinal,
  innstillinger: renderSettings as TabRender,
  resultat: renderResults as TabRender,
  stats: renderStats as TabRender,
};

// Same tabs, SNC content: Info lists the local stevner, Resultat merges them.
// Anything not listed keeps the ordinary tab (Innstillingar handles SNC itself).
const SNC_PARENT_RENDER: Partial<Record<TabKey, TabRender>> = {
  info: renderSncInfo as TabRender,
  resultat: renderSncResults as TabRender,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function visibleTabs(
  isAdminUser: boolean,
  hasFinal: boolean,
  isCompleted: boolean,
  isSncParent: boolean,
): readonly { key: TabKey; label: string }[] {
  return TABS.filter((f) => isAdminUser || !f.adminOnly)
    .filter((f) => f.key !== "avsluttende" || hasFinal)
    .filter((f) => !f.completedOnly || isCompleted)
    .filter((f) => !isSncParent || !SNC_PARENT_HIDDEN_TABS.has(f.key));
}

function renderNav(
  tournamentId: number,
  active: string,
  tabs: readonly { key: string; label: string }[],
): string {
  const items = tabs
    .map(
      ({ key, label }) => `
      <li class="nav-item">
        <a class="nav-link${active === key ? " active" : ""}"
           href="#/stevne/${tournamentId}/${key}">${label}</a>
      </li>`,
    )
    .join("");
  return `<ul class="nav nav-underline tournament-nav mb-0 px-3">${items}</ul>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement, params: Params): Promise<void> {
  const id = Number(params.id);
  const tab = String(params.tab ?? "info");
  container.replaceChildren(createLoadingState());

  try {
    const { data: tournament, error } = await getTournamentHeader(id);

    if (error || !tournament) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }

    setPageTitle(tournament.navn);

    const userIsAdmin = (await isAdmin()) || (await isClubAdmin());
    const hasFinal = tournament.avsluttendekastemetodeid != null;
    const isCompleted = tournament.erfullfort === true;
    const isSncParent = tournament.er_snc_hovudstevne === true;

    const tabs = visibleTabs(userIsAdmin, hasFinal, isCompleted, isSncParent);
    const activeTab: TabKey = tabs.some((f) => f.key === tab) ? (tab as TabKey) : "info";

    // The info tab leads with its own hero, which carries the name and the
    // primary action — a second header above it would only repeat them.
    const ownsHeader = activeTab === "info";

    container.innerHTML = `
      <div class="stevne-shell pb-3 pt-1">
        ${renderNav(id, activeTab, tabs)}
        ${
          ownsHeader
            ? ""
            : `<div class="stevne-fase-header d-flex align-items-center justify-content-between gap-2">
          <div class="stevne-fase-header__title">
            <h5 class="mb-0">${escHtml(tournament.navn)}</h5>
            <span class="stevne-fase-header__meta"></span>
          </div>
          <div id="stevne-banner-buttons"></div>
        </div>`
        }
        <div id="stevne-subpage" class="px-3${ownsHeader ? " pt-3" : ""}"></div>
      </div>`;

    const bannerSlot = container.querySelector<HTMLElement>("#stevne-banner-buttons");
    const subpage = container.querySelector<HTMLElement>("#stevne-subpage")!;
    const renderFn =
      (isSncParent ? SNC_PARENT_RENDER[activeTab] : undefined) ??
      TAB_RENDER[activeTab] ??
      renderInfo;

    await renderFn(subpage, { id, isAdmin: userIsAdmin }, bannerSlot);
  } catch (err) {
    logError("stevne.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste stevnet."));
  }
}
