import { throwerName, buildThrowerSlug as buildSlug } from "@/utils/kaster";
import { prependAdminLinkBar } from "@/components/AdminLinkBar";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { createSearchInput } from "@/components/SearchInput";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { getActiveThrowerList, getAllThrowerList } from "@/services/kasterService";
import type { ThrowerListRow } from "@/services/kasterService";
import { renderDetail, destroyChart } from "./kasterDetalj";
import type { PageRenderFn } from "@/types";

const PAGE_SIZE = 24;
const PLACEHOLDER_AVATAR = "https://placehold.co/200x200/444/888?text=?";

const filterList = { showAll: false, searchText: "", page: 1 };

// ── HTML builders ─────────────────────────────────────────────────────────────

function throwerCardHtml(k: ThrowerListRow): string {
  const name = throwerName(k);
  return `
    <a href="#/kastere/${buildSlug(k)}" class="thrower-card">
      <img src="${escHtml(k.avatarurl || PLACEHOLDER_AVATAR)}" alt="${escHtml(name)}" loading="lazy">
      <div class="thrower-name">${escHtml(name)}</div>
      <div class="thrower-club">${escHtml(k.klubb?.navn ?? "–")}</div>
    </a>`;
}

function listSkeletonHtml(): string {
  return `
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="thrower-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="thrower-active-only"${filterList.showAll ? "" : " checked"}>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="thrower-page-info" class="my-2"></div>
      <div id="thrower-pagination-top"></div>
      <div id="thrower-grid" class="thrower-grid"></div>
      <div id="thrower-pagination-bottom"></div>
    </div>`;
}

function paginationHtml(page: number, totalPages: number): string {
  if (totalPages <= 1) return "";
  const button = (text: string, p: number, disabled: boolean) =>
    `<button class="btn btn-sm ${p === page ? "btn-primary" : "btn-outline-secondary"} pag-button"
      data-page="${p}" ${disabled ? "disabled" : ""}>${text}</button>`;
  return `
    <div class="thrower-pagination">
      ${button("«", 1, page === 1)}
      ${button("‹", page - 1, page === 1)}
      <span class="pag-info">side ${page} av ${totalPages}</span>
      ${button("›", page + 1, page === totalPages)}
      ${button("»", totalPages, page === totalPages)}
    </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderList(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Laster utøvarar..."));

  try {
    const init = filterList.showAll ? await getAllThrowerList() : await getActiveThrowerList();
    if (init.error) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste utøvarar."));
      return;
    }

    let throwerData = init.data;
    container.innerHTML = listSkeletonHtml();

    const grid = container.querySelector<HTMLElement>("#thrower-grid")!;
    const pageInfoEl = container.querySelector<HTMLElement>("#thrower-page-info")!;
    const pagTop = container.querySelector<HTMLElement>("#thrower-pagination-top")!;
    const pagBottom = container.querySelector<HTMLElement>("#thrower-pagination-bottom")!;
    const activeCheck = container.querySelector<HTMLInputElement>("#thrower-active-only")!;

    function filterAndRender(): void {
      const search = filterList.searchText.trim().toLowerCase();
      let filtered = throwerData;
      if (search)
        filtered = filtered.filter(
          (k) =>
            throwerName(k).toLowerCase().includes(search) ||
            (k.klubb?.navn ?? "").toLowerCase().includes(search),
        );

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (filterList.page > totalPages) filterList.page = 1;

      const start = (filterList.page - 1) * PAGE_SIZE;
      const pageSlice = filtered.slice(start, start + PAGE_SIZE);

      pageInfoEl.innerHTML = `side ${filterList.page} av ${totalPages}`;
      const pagHtml = paginationHtml(filterList.page, totalPages);
      pagTop.innerHTML = pagHtml;
      pagBottom.innerHTML = pagHtml;
      grid.innerHTML = pageSlice.map((k) => throwerCardHtml(k)).join("");
    }

    createSearchInput({
      slot: container.querySelector("#thrower-search-slot")!,
      placeholder: "Søk på navn/klubb",
      state: filterList,
      onInput: () => {
        filterList.page = 1;
        filterAndRender();
      },
    });

    filterAndRender();

    activeCheck.addEventListener("change", async () => {
      filterList.showAll = !activeCheck.checked;
      filterList.page = 1;
      const { data, error } = filterList.showAll
        ? await getAllThrowerList()
        : await getActiveThrowerList();
      if (!error) throwerData = data;
      filterAndRender();
    });

    container.addEventListener("click", (e) => {
      const button = (e.target as Element).closest<HTMLButtonElement>(".pag-button");
      if (!button || button.disabled) return;
      filterList.page = Number(button.dataset.page);
      filterAndRender();
      container.querySelector(".content-page")?.scrollIntoView({ behavior: "smooth" });
    });

    prependAdminLinkBar(container, {
      href: "#/kaster/ny",
      label: "+ Ny utøvar",
      variant: "success",
      canShow: (auth) => auth.profil?.role === "admin" || auth.profil?.role === "klubbadmin",
    });
  } catch (err) {
    logError("kastere.renderList", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste utøvarar."));
  }
}

// ── Main function ─────────────────────────────────────────────────────────────

export const render: PageRenderFn = async (container, params) => {
  // Leaving the page, or moving between two throwers, must tear the old chart
  // down first — Chart.js keeps a live handle on the canvas that is about to go.
  destroyChart();
  if (params.id) {
    await renderDetail(container, Number(params.id));
  } else {
    await renderList(container);
  }
};
