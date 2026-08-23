import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createTable } from "@/components/Table";
import { createSearchInput } from "@/components/SearchInput";
import { selectHtml } from "@/utils/dropdown";
import { logError } from "@/utils/logError";
import { registerRefetch } from "@/utils/data/refetchRegistry";
import { getAllRecords, clearRecordsCache } from "@/services/rekorderService";
import {
  RECORD_METHODS,
  findRecordMethod,
  recordThrower,
  filterAndRankRecords,
} from "@/utils/rekorderLogic";
import type { RankedRecord, RecordsFilter } from "@/utils/rekorderLogic";

// ── State ─────────────────────────────────────────────────────────────────────

const filter: RecordsFilter = { method: "kongelag", gender: "alle", searchText: "" };

// ── HTML builders ─────────────────────────────────────────────────────────────

function createRecordTable(list: RankedRecord[]): HTMLElement {
  if (!list.length) return createEmptyState("Ingen rekorder funnet.");

  const wrapper = document.createElement("div");
  wrapper.className = "record-table-wrapper";
  wrapper.appendChild(
    createTable<RankedRecord>({
      rows: list,
      columns: [
        {
          label: "Pl.",
          thClass: "record-th-placement",
          render: (item) => String(item.plassering),
        },
        {
          label: "Navn",
          render: (item) => {
            const kaster = recordThrower(item);
            const a = document.createElement("a");
            a.href = `#/kastere/${buildThrowerSlug(kaster)}`;
            a.className = "app-link";
            a.textContent = throwerName(kaster);
            return a;
          },
        },
        {
          label: "Klubb",
          render: (item) => item.klubb_navn ?? "–",
        },
        {
          label: "Poeng",
          thClass: "record-th-points",
          render: (item) => {
            if (!item.stevne_id) return String(item.poeng ?? "–");
            const span = document.createElement("span");
            span.className = "record-points-cell";
            span.title = item.stevne_navn ?? "";
            span.dataset.tournamentId = String(item.stevne_id);
            span.textContent = String(item.poeng ?? "–");
            return span;
          },
        },
        {
          label: "År",
          thClass: "record-th-year",
          render: (item) => String(item.ar ?? "–"),
        },
      ],
    }),
  );
  return wrapper;
}

function pageSkeletonHtml(): string {
  const methods = RECORD_METHODS.map((m) => ({ value: m.value, label: m.label }));
  const genders = [
    { value: "alle", label: "Alle" },
    { value: "herrer", label: "Herrer" },
    { value: "damer", label: "Damer" },
  ];

  return `
    <div class="content-page">
      <h1 class="record-title">Rekorder</h1>
      <p id="record-max-text" class="record-max-text"></p>
      <div class="filter-row">
        ${selectHtml("record-method", methods, filter.method)}
        ${selectHtml("record-gender", genders, filter.gender)}
        <span id="record-search-slot"></span>
      </div>
      <div id="record-table-container"></div>
    </div>`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  registerRefetch(() => render(container));
  filter.method = RECORD_METHODS[0]!.value;
  filter.gender = "alle";
  filter.searchText = "";
  clearRecordsCache();

  container.replaceChildren(createLoadingState("Laster rekorder…"));

  try {
    const { data, error } = await getAllRecords();
    if (error) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste rekorder."));
      return;
    }

    container.innerHTML = pageSkeletonHtml();

    const tableContainer = container.querySelector<HTMLElement>("#record-table-container")!;

    function updateMaxText(): void {
      container.querySelector<HTMLElement>("#record-max-text")!.textContent =
        `(Maks poengsum: ${findRecordMethod(filter.method).maxPoints})`;
    }

    function updateTable(): void {
      tableContainer.replaceChildren(createRecordTable(filterAndRankRecords(data, filter)));
    }

    updateMaxText();
    updateTable();

    container
      .querySelector<HTMLSelectElement>("#record-method")!
      .addEventListener("change", (e) => {
        filter.method = (e.target as HTMLSelectElement).value;
        updateMaxText();
        updateTable();
      });

    container
      .querySelector<HTMLSelectElement>("#record-gender")!
      .addEventListener("change", (e) => {
        filter.gender = (e.target as HTMLSelectElement).value as RecordsFilter["gender"];
        updateTable();
      });

    createSearchInput({
      slot: container.querySelector("#record-search-slot")!,
      placeholder: "Søk på etternavn/klubb",
      state: filter,
      onInput: updateTable,
    });

    // Delegated on the table container, not on `container` — a refetch replaces
    // this element, so the listener goes with it instead of stacking up.
    tableContainer.addEventListener("click", (e) => {
      const cell = (e.target as Element).closest<HTMLElement>(".record-points-cell");
      if (cell?.dataset.tournamentId) {
        location.hash = `#/stevne/${cell.dataset.tournamentId}/resultat`;
      }
    });
  } catch (err) {
    logError("rekorder.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste rekorder."));
  }
}
