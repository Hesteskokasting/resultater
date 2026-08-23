import { buildThrowerSlug, throwerName } from "@/utils/kaster";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createTable } from "@/components/Table";
import { escHtml } from "@/utils/escHtml";
import { selectHtml } from "@/utils/dropdown";
import { logError } from "@/utils/logError";
import { getNMData } from "@/services/nmvinnereService";
import {
  NM_CATEGORIES,
  findCategory,
  defaultGender,
  genderOptions,
  subtitleText,
  buildWinnersList,
  latestYear,
} from "@/pages/nmvinnereLogic";
import type { NmThrower, WinnersEntry } from "@/pages/nmvinnereLogic";
import type { NMCategoryConfig, NMGender } from "@/services/nmvinnereService";

// ── State ─────────────────────────────────────────────────────────────────────

const filter: { categoryId: number; gender: NMGender } = { categoryId: 1, gender: "open" };

// ── HTML builders ─────────────────────────────────────────────────────────────

function createNMTable(list: WinnersEntry[]): HTMLElement {
  if (!list.length) return createEmptyState("Ingen vinnere funnet.");

  // ponytail: the same `<a class="app-link">` to a thrower is built in klubbDetalj
  // too, and the stevne pages build an HTML-string variant. Pull it into a
  // createThrowerLink() component once a third DOM caller wants it.
  function throwerLink(k: NmThrower): HTMLAnchorElement {
    const a = document.createElement("a");
    a.href = `#/kastere/${buildThrowerSlug(k)}`;
    a.className = "app-link";
    a.textContent = throwerName(k);
    return a;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "nm-table-wrapper";
  wrapper.appendChild(
    createTable<WinnersEntry>({
      rows: list,
      columns: [
        {
          label: "År",
          thClass: "nm-td-ar",
          cellClass: "nm-td-ar",
          render: ({ year, tournamentId }) => {
            if (!tournamentId) return String(year ?? "–");
            const a = document.createElement("a");
            a.href = `#/stevne/${tournamentId}/resultat`;
            a.className = "app-link";
            a.textContent = String(year ?? "–");
            return a;
          },
        },
        {
          label: "Navn",
          render: ({ throwers }) => {
            if (!throwers.length) return "–";
            const frag = document.createDocumentFragment();
            throwers.forEach((k, i) => {
              if (i > 0) frag.appendChild(document.createTextNode(" og "));
              frag.appendChild(throwerLink(k));
            });
            return frag;
          },
        },
        {
          label: "Klubb",
          render: ({ klubb }) => klubb?.navn ?? "–",
        },
      ],
    }),
  );
  return wrapper;
}

function pageSkeletonHtml(category: NMCategoryConfig, maxYear: number): string {
  const title = `Norgesmestere ${category.fromYear} - ${maxYear}`;
  const categories = NM_CATEGORIES.map((k) => ({ value: String(k.id), label: k.name }));
  const genders = genderOptions(category.genderFilter);

  return `
    <div class="content-page">
      <div class="filter-row">
        ${selectHtml("nm-category", categories, String(filter.categoryId))}
        ${genders.length ? selectHtml("nm-gender", genders, filter.gender) : ""}
      </div>
      <h1 class="nm-title">${escHtml(title)}</h1>
      <h2 id="nm-subtitle" class="nm-subtitle">${escHtml(subtitleText(category.name, filter.gender))}</h2>
      <p class="nm-note">${category.note ? escHtml(category.note) : ""}</p>
      <div id="nm-table-container"></div>
    </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderCategory(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Laster NM-vinnere…"));

  const category = findCategory(filter.categoryId);

  try {
    const { data, error } = await getNMData(category, filter.gender);
    if (error) {
      logError("nmvinnere.renderCategory", error);
      container.replaceChildren(createErrorBanner("Kunne ikkje laste NM-vinnere."));
      return;
    }

    container.innerHTML = pageSkeletonHtml(category, latestYear(data, new Date().getFullYear()));
    container
      .querySelector<HTMLElement>("#nm-table-container")!
      .replaceChildren(createNMTable(buildWinnersList(data)));

    const categoryEl = container.querySelector<HTMLSelectElement>("#nm-category")!;
    categoryEl.addEventListener("change", async () => {
      filter.categoryId = Number(categoryEl.value);
      filter.gender = defaultGender(findCategory(filter.categoryId).genderFilter);
      await renderCategory(container);
    });

    const genderEl = container.querySelector<HTMLSelectElement>("#nm-gender");
    genderEl?.addEventListener("change", async () => {
      filter.gender = genderEl.value as NMGender;
      await renderCategory(container);
    });
  } catch (err) {
    logError("nmvinnere.renderCategory", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste NM-vinnere."));
  }
}

export async function render(container: HTMLElement): Promise<void> {
  filter.categoryId = NM_CATEGORIES[0]!.id;
  filter.gender = defaultGender(NM_CATEGORIES[0]!.genderFilter);
  await renderCategory(container);
}
