import { createErrorBanner } from "@/components/states";
import { createTournamentCard } from "@/components/stevne/StevneCard";
import { createLogoutButton } from "@/components/LogoutButton";
import { createEl } from "@/utils/createEl";
import { logError } from "@/utils/logError";
import { registerRefetch } from "@/utils/data/refetchRegistry";
import { getPendingLinkCount } from "@/services/adminService";
import { getUser } from "@/services/authService";
import { getLiveTournaments } from "@/services/stevneService";
import type { ListedTournamentRow } from "@/services/stevneService";
import { destroyAdminCharts } from "./_adminCharts";
import { render as renderOverview } from "./panels/oversikt";
import { render as renderTournaments } from "./panels/stevne";
import { render as renderThrowers } from "./panels/utovarar";
import { render as renderClubs } from "./panels/klubbar";
import { render as renderUsers } from "./panels/brukarar";
import { render as renderRequests } from "./panels/forespurnader";
import { render as renderClubAccess } from "./panels/klubbtilgang";
import { isRole, ROLE_LABEL } from "@/utils/roles";
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
type Tab = (typeof TABS)[number];

// A klubbadmin gets the stevne tab only; RLS already scopes what they can write.
// The rest of their dashboard is #35.
const CLUB_ADMIN_TABS = new Set<TabKey>(["stevne"]);

function tabsFor(role: string | undefined): Tab[] {
  return role === "admin" ? [...TABS] : TABS.filter((t) => CLUB_ADMIN_TABS.has(t.key));
}

// Same card as home.ts/terminliste — the live-prikk dot is the only "ongoing"
// indicator, consistent everywhere it appears.
function liveCard(s: ListedTournamentRow): HTMLElement {
  const tab = s.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  return createTournamentCard(s, { href: `#/stevne/${s.id}/${tab}` });
}

function buildNav(tabs: Tab[], active: TabKey): HTMLElement {
  const nav = createEl("ul", null, "nav nav-underline admin-nav");
  for (const tab of tabs) {
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

  const auth = await getUser();
  const role = auth?.profil?.role;
  const isAdmin = role === "admin";
  const tabs = tabsFor(role);
  const requested = String(params.tab ?? "");
  // An unknown tab, or one this role does not get, falls back to the first.
  const tab = tabs.find((t) => t.key === requested) ?? tabs[0]!;
  const activeTab = tab.key;

  const page = createEl("div", null, "content-page admin-side");
  const liveSection = createEl("div", null);
  liveSection.id = "live-section";

  const head = createEl("header", null, "admin-head");
  head.appendChild(
    createEl("h2", `Dashboard - ${isRole(role) ? ROLE_LABEL[role] : "Admin"}`, "admin-head__title"),
  );
  const subtitle = createEl("span", auth?.user.email ?? null, "admin-head__sub");
  // Min side is closed to organizers except for the account settings.
  const account = createEl("a", "Konto", "btn btn-sm btn-outline-secondary");
  account.href = "#/minside/konto";
  const meta = createEl("div", null, "admin-head__meta");
  meta.append(subtitle, account, createLogoutButton());
  head.appendChild(meta);

  const nav = buildNav(tabs, activeTab);
  const content = createEl("div", null, "admin-panel");

  page.append(liveSection, head, nav, content);
  container.replaceChildren(page);

  const panel = tab.render(content).catch((err: unknown) => {
    logError(`admin.panel.${activeTab}`, err);
    content.replaceChildren(createErrorBanner("Kunne ikkje laste denne fanen."));
  });

  // Link requests are the admin's queue; a klubbadmin has no tab to badge.
  const [{ data: live }, pending] = await Promise.all([
    getLiveTournaments(),
    isAdmin ? getPendingLinkCount() : Promise.resolve(0),
    panel,
  ]);

  const ongoing = live.filter((s) => !s.erfullfort);
  if (ongoing.length) {
    const list = createEl("div", null, "stevne-card-list");
    ongoing.forEach((s) => list.appendChild(liveCard(s)));
    liveSection.replaceChildren(list);
  }

  if (pending > 0) {
    const link = nav.querySelector<HTMLElement>('[data-badge-slot="pending"]');
    link?.appendChild(createEl("span", String(pending), "admin-nav__badge"));
  }
}
