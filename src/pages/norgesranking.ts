import { Capacitor } from "@capacitor/core";
import { formatDate, yearOptions, downloadExcel, formatPercent } from "@/utils/shared";
import { createExcelButton } from "@/components/ExcelButton";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { bindRankingDetails, detailTableHtml, rankingListHtml } from "@/components/RankingList";
import { createSearchInput } from "@/components/SearchInput";
import { logError } from "@/utils/logError";
import { getTournamentsAndResults } from "@/services/norgesrankingService";
import type { RankingTournamentRow, RankingResultRow } from "@/services/norgesrankingService";
import { MIN_STEVNER, buildEventsMap, buildRankingList } from "@/utils/norgesrankingLogikk";
import type { RingInfo, RankingItem } from "@/utils/norgesrankingLogikk";

const FIRST_YEAR = 2018;

// ── State ─────────────────────────────────────────────────────────────────────

interface Cache {
  year: number | null;
  tournaments: RankingTournamentRow[];
  results: RankingResultRow[];
}

const filter = {
  year: new Date().getFullYear(),
  searchText: "",
  infoVisible: false,
};

let cache: Cache = { year: null, tournaments: [], results: [] };

// ── Data buffer ───────────────────────────────────────────────────────────────

async function fetchAndBufferData(year: number): Promise<boolean> {
  if (cache.year === year) return true;

  try {
    const { stevner, resultater, error } = await getTournamentsAndResults(year);
    if (error) return false;

    cache.year = year;
    cache.tournaments = stevner;
    cache.results = resultater;
    return true;
  } catch (err) {
    logError("fetchAndBufferData", err);
    return false;
  }
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function exportExcel(): Promise<void> {
  const tournamentsMap = buildEventsMap(cache.tournaments);
  const list = buildRankingList(cache.results, tournamentsMap);
  const rows = list.map((k) => ({
    Plass: k.erGyldig ? k.plassering : "–",
    Kaster: k.navn,
    Klubb: k.klubb,
    "Snitt %": k.snittProsent,
    "Antal stevner": k.antallStevner,
  }));
  await downloadExcel(rows, `norgesranking-${filter.year}.xlsx`, "Norgesranking");
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function infoHtml(visible: boolean): string {
  return `
    <div id="nr-info-section"${visible ? "" : ' class="d-none"'}>
      <p class="nc-info-text">
        Norgesranking er ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
        <strong>Dei ${MIN_STEVNER} beste prosentane er teljande.</strong>
      </p>
      <p class="nc-info-text">
        For å få eit gyldig årsresultat skal kasteren minst ha vore gjennom ${MIN_STEVNER} rankingrunder.
      </p>
      <p class="nc-info-text nc-info-text--warning">
        Resultater merket med rødt er ikkje gyldig (mindre enn ${MIN_STEVNER} runder).
      </p>
    </div>`;
}

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

function listHtml(list: RankingItem[], searchText: string): string | null {
  const search = searchText.trim().toLowerCase();
  const filtered = search
    ? list.filter(
        (k) => k.navn.toLowerCase().includes(search) || k.klubb.toLowerCase().includes(search),
      )
    : list;

  if (filtered.length === 0) return null;

  return rankingListHtml<RankingItem>(filtered, {
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
      <h1 class="nc-main-title">Norgesranking ${year}</h1>
      <div class="nc-info-button-row">
        <button id="nr-info-button" class="btn btn-sm btn-outline-secondary">Vis info</button>
      </div>
      ${infoHtml(false)}
      <div class="nc-filter-rad">
        <select id="nr-year" class="tl-select">${yearOptions(year, FIRST_YEAR)}</select>
        <span id="nr-search-slot"></span>
        ${isNative ? "" : '<span id="nr-excel-slot"></span>'}
      </div>
      <div class="nc-click-hint-row">
        <span class="nc-click-hint">Klikk ein kastar for å vise detaljar</span>
      </div>
      <div id="nr-table-container"></div>
    </div>`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filter.year = new Date().getFullYear();
  filter.searchText = "";
  filter.infoVisible = false;
  cache = { year: null, tournaments: [], results: [] };

  container.replaceChildren(createLoadingState("Laster Norgesranking…"));

  try {
    const ok = await fetchAndBufferData(filter.year);
    if (!ok) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste data for Norgesranking."));
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    container.innerHTML = pageSkeletonHtml(filter.year, isNative);

    function updateTable(): void {
      const tournamentsMap = buildEventsMap(cache.tournaments);
      const list = buildRankingList(cache.results, tournamentsMap);
      const tableEl = container.querySelector<HTMLElement>("#nr-table-container")!;
      const html = listHtml(list, filter.searchText);
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

    const yearSelect = container.querySelector<HTMLSelectElement>("#nr-year")!;
    const infoButton = container.querySelector<HTMLButtonElement>("#nr-info-button")!;

    yearSelect.addEventListener("change", async () => {
      filter.year = Number(yearSelect.value);
      container.querySelector(".nc-main-title")!.textContent = `Norgesranking ${filter.year}`;
      container
        .querySelector("#nr-table-container")!
        .replaceChildren(createLoadingState("Laster..."));
      try {
        const ok = await fetchAndBufferData(filter.year);
        if (!ok) {
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

    infoButton.addEventListener("click", () => {
      filter.infoVisible = !filter.infoVisible;
      container.querySelector("#nr-info-section")!.classList.toggle("d-none", !filter.infoVisible);
      infoButton.textContent = filter.infoVisible ? "Skjul info" : "Vis info";
    });
  } catch (err) {
    logError("norgesranking.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste Norgesranking."));
  }
}
