import { getUser } from "@/services/authService";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createLogoutButton } from "@/components/LogoutButton";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { registerRefetch } from "@/utils/refetchRegistry";
import { render as renderMatches } from "./minside/minside-kampar";
import { render as renderRegistrations } from "./minside/minside-pameldingar";
import { render as renderSettings } from "./minside/minside-innstillingar";
import { render as renderAccount } from "./minside/minside-konto";
import type { MinSideContext } from "./minside/_linkState";
import type { Params, LinkStatus } from "@/types";

type TabRender = (container: HTMLElement, ctx: MinSideContext) => Promise<void>;

const TABS = [
  { key: "kampar", label: "Kampar" },
  { key: "pameldingar", label: "Påmeldingar" },
  { key: "innstillingar", label: "Innstillingar" },
  { key: "konto", label: "Konto" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_KEYS = new Set<string>(TABS.map((f) => f.key));

const TAB_RENDER: Record<TabKey, TabRender> = {
  kampar: renderMatches,
  pameldingar: renderRegistrations,
  innstillingar: renderSettings,
  konto: renderAccount,
};

function renderNav(active: string): string {
  const items = TABS.map(
    ({ key, label }) => `
      <li class="nav-item">
        <a class="nav-link${active === key ? " active" : ""}"
           href="#/minside/${key}">${label}</a>
      </li>`,
  ).join("");
  return `<ul class="nav nav-underline mypage-nav mb-3">${items}</ul>`;
}

export async function render(container: HTMLElement, params: Params): Promise<void> {
  registerRefetch(() => render(container, params));
  const tab = String(params.tab ?? "kampar");
  container.replaceChildren(createLoadingState("Laster min side…"));

  try {
    const auth = await getUser();
    if (!auth) {
      location.hash = "#/logginn";
      return;
    }

    const { profil, user } = auth;
    const status: LinkStatus = profil?.kobling_status ?? "ingen";

    // Notifications moved into innstillingar — keep old deep links working.
    const requested = tab === "varslingar" ? "innstillingar" : tab;
    const activeTab = TAB_KEYS.has(requested) ? (requested as TabKey) : "kampar";

    container.innerHTML = `
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${escHtml(user.email ?? "")}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${renderNav(activeTab)}
        <div id="minside-subpage"></div>
      </div>`;

    container.querySelector<HTMLElement>('[data-slot="logout"]')!.appendChild(createLogoutButton());

    const subpage = container.querySelector<HTMLElement>("#minside-subpage")!;
    await TAB_RENDER[activeTab](subpage, { user, profil, status });
  } catch (err) {
    logError("minside.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste min side."));
  }
}
