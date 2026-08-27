import { buildClubSlug } from "@/utils/kaster";
import { prependAdminLinkBar } from "@/components/AdminLinkBar";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { createSearchInput } from "@/components/SearchInput";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { getClubs, getAllClubsForAdmin } from "@/services/klubbService";
import { getActiveThrowerList } from "@/services/kasterService";
import { throwerNamesByClub, filterClubs } from "@/pages/klubbLogic";
import { renderDetail, PLACEHOLDER_LOGO } from "./klubbDetalj";
import type { PageRenderFn } from "@/types";
import type { ClubListRow } from "@/services/klubbService";

const filterList = { showAll: false, searchText: "" };

// ── HTML builders ─────────────────────────────────────────────────────────────

function clubCardHtml(k: ClubListRow): string {
  return `
    <a href="#/klubber/${buildClubSlug(k)}" class="thrower-card">
      <img src="${escHtml(k.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(k.navn)}" loading="lazy">
      <div class="thrower-name">${escHtml(k.navn)}</div>
    </a>`;
}

function listSkeletonHtml(): string {
  return `
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="club-active-only"${filterList.showAll ? "" : " checked"}>
            Vis berre aktive klubbar
          </label>
        </div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`;
}

/** Active-only is the default; the checkbox off pulls the inactive clubs in too. */
function loadClubs(): Promise<{ data: ClubListRow[]; error: unknown }> {
  return filterList.showAll ? getAllClubsForAdmin() : getClubs();
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderList(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Laster klubbar..."));

  try {
    const [{ data: clubs, error }, { data: allThrowers }] = await Promise.all([
      loadClubs(),
      getActiveThrowerList(),
    ]);

    if (error) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste klubbar."));
      return;
    }

    const namesByClub = throwerNamesByClub(allThrowers);

    container.innerHTML = listSkeletonHtml();

    let allClubs = clubs;
    const grid = container.querySelector<HTMLElement>("#club-grid")!;
    const activeCheck = container.querySelector<HTMLInputElement>("#club-active-only")!;

    function filterAndRender(): void {
      const filtered = filterClubs(allClubs, namesByClub, filterList.searchText);
      grid.innerHTML = filtered.length
        ? filtered.map((k) => clubCardHtml(k)).join("")
        : '<p class="empty-state">Ingen klubbar funnet.</p>';
    }

    createSearchInput({
      slot: container.querySelector("#club-search-slot")!,
      placeholder: "Søk på klubbnavn eller utøvar",
      state: filterList,
      onInput: filterAndRender,
    });

    filterAndRender();

    activeCheck.addEventListener("change", async () => {
      filterList.showAll = !activeCheck.checked;
      const { data, error: loadError } = await loadClubs();
      if (!loadError) allClubs = data;
      filterAndRender();
    });

    prependAdminLinkBar(container, {
      href: "#/klubber/ny",
      label: "+ Ny klubb",
      variant: "success",
      canShow: (auth) => auth.profil?.role === "admin",
    });
  } catch (err) {
    logError("klubber.renderList", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste klubbar."));
  }
}

// ── Main function ─────────────────────────────────────────────────────────────

export const render: PageRenderFn = async (container, params) => {
  if (params.id) {
    await renderDetail(container, Number(params.id));
  } else {
    await renderList(container);
  }
};
