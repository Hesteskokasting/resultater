import { createErrorBanner } from "@/components/ErrorBanner";
import { createStevneCard } from "@/components/StevneCard";
import { createEl } from "@/utils/createEl";
import { logError } from "@/utils/logError";
import { registerRefetch } from "@/utils/refetchRegistry";
import { formatDateLong } from "@/utils/shared";
import { getPendingLinkCount } from "@/services/adminService";
import { getUser } from "@/services/authService";
import { getLiveTournaments } from "@/services/stevneService";
import type { LiveTournamentRow } from "@/services/stevneService";
import { destroyAdminCharts } from "./_adminCharts";
import { render as renderOverview } from "./panels/oversikt";
import { render as renderTournaments } from "./panels/stevne";
import { render as renderThrowers } from "./panels/utovarar";
import { render as renderClubs } from "./panels/klubbar";
import { render as renderUsers } from "./panels/brukarar";
import { render as renderRequests } from "./panels/forespurnader";
import { render as renderClubAccess } from "./panels/klubbtilgang";
import type { Params } from "@/types";

type PanelRender = (el: HTMLElement) => Promise<void>;

const TABS = [
  { key: "oversikt", label: "Oversikt", render: renderOverview },
  { key: "stevne", label: "Stevne", render: renderTournaments },
  { key: "utovarar", label: "Utøvarar", render: renderThrowers },
  { key: "klubbar", label: "Klubbar", render: renderClubs },
  { key: "brukarar", label: "Brukarar", render: renderUsers },
  { key: "forespurnader", label: "Forespørslar", render: renderRequests },
  { key: "tilgang", label: "Klubbadmin-tilgang", render: renderClubAccess },
] as const satisfies readonly { key: string; label: string; render: PanelRender }[];

type TabKey = (typeof TABS)[number]["key"];

const TAB_KEYS = new Set<string>(TABS.map((t) => t.key));

// Same card as home.ts/terminliste — the live-prikk dot is the only "ongoing"
// indicator, consistent everywhere it appears.
function liveCard(s: LiveTournamentRow): HTMLElement {
  const tab = s.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  return createStevneCard({
    title: s.navn,
    href: `#/stevne/${s.id}/${tab}`,
    date: formatDateLong(s.dato),
    status: "live",
  });
}

function buildNav(active: TabKey): HTMLElement {
  const nav = createEl("ul", null, "nav nav-underline admin-nav");
  for (const tab of TABS) {
    const item = createEl("li", null, "nav-item");
    const link = createEl("a", tab.label, `nav-link${tab.key === active ? " active" : ""}`);
    link.href = `#/admin/${tab.key}`;
    if (tab.key === active) link.setAttribute("aria-current", "page");
    if (tab.key === "forespurnader") link.dataset.badgeSlot = "pending";
    item.appendChild(link);
    nav.appendChild(item);
  }
  return nav;
}

export async function render(container: HTMLElement, params: Params = {}): Promise<void> {
  // Charts from the previous render hold on to their (now detached) canvases and
  // resize observers until they are explicitly destroyed.
  destroyAdminCharts();
  registerRefetch(() => render(container, params));

  const requested = String(params.tab ?? "oversikt");
  const activeTab: TabKey = TAB_KEYS.has(requested) ? (requested as TabKey) : "oversikt";
  const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const page = createEl("div", null, "content-page admin-side");
  const liveSection = createEl("div", null);
  liveSection.id = "live-section";

  const head = createEl("header", null, "admin-head");
  head.appendChild(createEl("h2", "Dashboard - Admin", "admin-head__title"));
  const subtitle = createEl("span", null, "admin-head__sub");
  head.appendChild(subtitle);

  const nav = buildNav(activeTab);
  const content = createEl("div", null, "admin-panel");

  page.append(liveSection, head, nav, content);
  container.replaceChildren(page);

  void getUser().then((auth) => {
    if (auth?.user.email) subtitle.textContent = auth.user.email;
  });

  const panel = tab.render(content).catch((err: unknown) => {
    logError(`admin.panel.${activeTab}`, err);
    content.replaceChildren(createErrorBanner("Kunne ikkje laste denne fanen."));
  });

  const [{ data: live }, pending] = await Promise.all([
    getLiveTournaments(),
    getPendingLinkCount(),
    panel,
  ]);

  const ongoing = live.filter((s) => !s.erfullfort);
  if (ongoing.length) {
    const list = createEl("div", null, "stevne-kort-liste");
    ongoing.forEach((s) => list.appendChild(liveCard(s)));
    liveSection.replaceChildren(list);
  }

  if (pending > 0) {
    const link = nav.querySelector<HTMLElement>('[data-badge-slot="pending"]');
    link?.appendChild(createEl("span", String(pending), "admin-nav__badge"));
  }
}
