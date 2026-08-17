import { Capacitor } from "@capacitor/core";
import { formatDate, yearOptions, downloadExcel, formatPercent } from "@/utils/shared";
import { createExcelButton } from "@/components/ExcelButton";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createInfoTooltip } from "@/components/InfoTooltip";
import { bindRankingDetails, detailTableHtml, rankingListHtml } from "@/components/RankingList";
import { createSearchInput } from "@/components/SearchInput";
import { logError } from "@/utils/logError";
import { loadRankingYear, clearRankingYearCache } from "@/services/norgesrankingService";
import type { RankingYear } from "@/services/norgesrankingService";
import {
  MIN_STEVNER,
  buildEventsMap,
  buildRankingList,
  filterRanking,
} from "@/utils/norgesrankingLogikk";
import type { RingInfo, RankingItem } from "@/utils/norgesrankingLogikk";

const FIRST_YEAR = 2018;

// ── State ─────────────────────────────────────────────────────────────────────

const filter = {
  year: new Date().getFullYear(),
  searchText: "",
};

// Built once per loaded season: the search only narrows this list, it never
// changes how the ranking itself is computed.
let ranking: RankingItem[] = [];

/** Loads a season and rebuilds the ranking. False when the fetch failed. */
async function loadSeason(year: number): Promise<boolean> {
  const season: RankingYear | null = await loadRankingYear(year);
  if (!season) return false;
  ranking = buildRankingList(season.results, buildEventsMap(season.tournaments));
  return true;
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function exportExcel(): Promise<void> {
  const rows = ranking.map((k) => ({
    Plass: k.erGyldig ? k.plassering : "–",
    Kaster: k.navn,
    Klubb: k.klubb,
    "Snitt %": k.snittProsent,
    "Antal stevner": k.antallStevner,
  }));
  await downloadExcel(rows, `norgesranking-${filter.year}.xlsx`, "Norgesranking");
}

// ── HTML builders ─────────────────────────────────────────────────────────────

const INFO_HTML = `
  <p class="info-tip__tittel">Norgesranking</p>
  <p>
    Ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
    <strong>Dei ${MIN_STEVNER} beste prosentane er teljande.</strong>
  </p>
  <p>For å få eit gyldig årsresultat må kastaren ha vore gjennom minst ${MIN_STEVNER} rankingrundar.</p>
  <p class="info-tip__dempa">
    Resultat utan plassering er ikkje gyldige enno (mindre enn ${MIN_STEVNER} rundar).
  </p>`;

function detailHtml(item: RankingItem): string {
  return detailTableHtml<RingInfo>(
    [
      { label: "Dato", value: (r) => formatDate(r._stevne?.dato) },
      { label: "Type", value: (r) => r._stevne?.typeNamn ?? "–" },
      { label: "Stevne", value: (r) => r._stevne?.navn ?? "–" },
      { label: "Metode", value: (r) => r.metodeNamn },
      { label: "Ring", cellClass: "res-tal", value: (r) => String(r.antallRing) },
      { label: "%Ring", cellClass: "res-tal", value: (r) => formatPercent(r.prosent) },
    ],
    item.detaljRader,
  );
}

/** Null when the search matched nothing — the caller shows an empty state instead. */
function listHtml(list: RankingItem[]): string | null {
  if (list.length === 0) return null;

  return rankingListHtml<RankingItem>(list, {
    idPrefix: "nr",
    placement: (item) => (item.erGyldig ? String(item.plassering ?? "–") : "–"),
    name: (item) => item.navn,
    club: (item) => item.klubb,
    meta: (item) => `${item.antallStevner} ${item.antallStevner === 1 ? "stevne" : "stevner"}`,
    columns: [
      {
        label: "STEVNER",
        cellClass: "res-tal res-tal--dempa",
        value: (item) => String(item.antallStevner),
      },
    ],
    mainLabel: "%SNITT",
    main: (item) => formatPercent(item.snittProsent),
    detail: detailHtml,
    rowClass: (item) => (item.erGyldig ? undefined : "rank-rad--ugyldig"),
  });
}

function pageSkeletonHtml(year: number, isNative: boolean): string {
  return `
    <div class="content-page res-side">
      <h1 class="nc-main-title">
        <span id="nr-title-text">Norgesranking ${year}</span><span id="nr-info-slot"></span>
      </h1>
      <div class="nc-filter-rad nc-filter-rad--smal">
        <select id="nr-year" class="app-select">${yearOptions(year, FIRST_YEAR)}</select>
        <span id="nr-search-slot"></span>
        ${isNative ? "" : '<span id="nr-excel-slot"></span>'}
      </div>
      <div class="click-hint-row">
        <span class="click-hint">Klikk ein kastar for å vise detaljar</span>
      </div>
      <div id="nr-table-container"></div>
    </div>`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filter.year = new Date().getFullYear();
  filter.searchText = "";
  clearRankingYearCache();

  container.replaceChildren(createLoadingState("Laster Norgesranking…"));

  try {
    if (!(await loadSeason(filter.year))) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste data for Norgesranking."));
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    container.innerHTML = pageSkeletonHtml(filter.year, isNative);

    function updateTable(): void {
      const tableEl = container.querySelector<HTMLElement>("#nr-table-container")!;
      const html = listHtml(filterRanking(ranking, filter.searchText));
      if (html === null) {
        tableEl.replaceChildren(createEmptyState("Ingen resultater funnet."));
        return;
      }
      const inner = document.createElement("div");
      inner.id = "nr-table-inner";
      inner.innerHTML = html;
      tableEl.replaceChildren(inner);
      bindRankingDetails(inner);
    }

    updateTable();

    createSearchInput({
      slot: container.querySelector("#nr-search-slot")!,
      placeholder: "Søk på navn/klubb...",
      state: filter,
      onInput: updateTable,
    });

    createInfoTooltip({
      slot: container.querySelector("#nr-info-slot")!,
      label: "Om Norgesranking",
      html: INFO_HTML,
    });

    const yearSelect = container.querySelector<HTMLSelectElement>("#nr-year")!;

    yearSelect.addEventListener("change", async () => {
      filter.year = Number(yearSelect.value);
      container.querySelector("#nr-title-text")!.textContent = `Norgesranking ${filter.year}`;
      container
        .querySelector("#nr-table-container")!
        .replaceChildren(createLoadingState("Laster..."));
      try {
        if (!(await loadSeason(filter.year))) {
          container
            .querySelector("#nr-table-container")!
            .replaceChildren(createErrorBanner("Feil ved henting av data."));
          return;
        }
        updateTable();
      } catch (err) {
        logError("norgesranking.yearChange", err);
        container
          .querySelector("#nr-table-container")!
          .replaceChildren(createErrorBanner("Feil ved henting av data."));
      }
    });

    if (!isNative) {
      createExcelButton({ slot: container.querySelector("#nr-excel-slot")!, onClick: exportExcel });
    }
  } catch (err) {
    logError("norgesranking.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste Norgesranking."));
  }
}
