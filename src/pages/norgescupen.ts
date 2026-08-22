import { throwerName } from "@/utils/kaster";
import { hasSeparateClasses } from "@/utils/klasse";
import {
  formaterPoeng,
  buildSingleList,
  buildTeamList,
  normalizeCupFilter,
  FIRST_MULTI_CUP_YEAR,
} from "@/utils/norgescup";
import { loadCupYear, clearCupYearCache } from "@/services/norgescupService";
import { formatDate, yearOptions } from "@/utils/shared";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createInfoTooltip } from "@/components/InfoTooltip";
import {
  bindRankingDetails,
  detailTableHtml,
  rankingListHtml,
} from "@/components/resultat/RankingList";
import type { Tables } from "@/types";
import type { CupYear } from "@/services/norgescupService";
import type { SingleListRow, TeamListRow, CupFilter } from "@/utils/norgescup";
import { escHtml } from "@/utils/escHtml";

const FIRST_YEAR = 2007;

interface Filter extends CupFilter {
  classNum: number;
}

const filter: Filter = {
  year: new Date().getFullYear(),
  cupType: "NC",
  classNum: 1,
  view: "singel",
};

let season: CupYear = { rules: null, tournaments: [], results: [] };

// ── HTML builders ─────────────────────────────────────────────────────────────

function descriptionText(rules: Tables<"antallTellendeNc">, cupType: string): string {
  if (cupType === "SNC") return `Dei ${rules.max_snc} beste SNC-stevna er teljande`;
  if (cupType === "DNC") return `Dei ${rules.max_dnc} beste DNC-stevna er teljande`;
  return `Dei ${rules.maxtotal} beste stevna, herav maks ${rules.max_nc_total} NC-stevner og ${rules.max_snc_total} SNC-stevner er teljande`;
}

const TEAM_INFO_HTML = `
  <p class="info-tip__tittel">NC Lag</p>
  <p>Kun klasse 1. Dei 4 beste poengsummene frå kvar klubb er teljande.</p>`;

/** What the singles list is made of — follows the cup type and the year's rules. */
function singleInfoHtml(
  rules: Tables<"antallTellendeNc"> | null,
  cupType: string,
  year: number,
): string {
  return `
    <p class="info-tip__tittel">${escHtml(cupType)} Singel ${year}</p>
    <p>${escHtml(rules ? descriptionText(rules, cupType) : `Ingen telleregel funnet for ${year}`)}</p>`;
}

function viewTabsHtml(selectedView: string): string {
  return `
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${selectedView === "singel" ? " active" : ""}" data-view="singel">Singel</button>
      <button class="nc-class-tab${selectedView === "lag" ? " active" : ""}" data-view="lag">Lag</button>
    </div>`;
}

function classTabsHtml(selectedClass: number, year: number): string {
  const tabs = hasSeparateClasses(year)
    ? `<div class="nc-class-tabs">
        <button class="nc-class-tab${selectedClass === 1 ? " active" : ""}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${selectedClass === 2 ? " active" : ""}" data-class="2">Klasse 2</button>
      </div>`
    : "";
  return `
    <div class="nc-class-tabs-wrapper">
      ${tabs}
      <span class="click-hint">Klikk ein kastar for å vise detaljar</span>
    </div>`;
}

function singleListHtml(list: SingleListRow[]): string {
  return rankingListHtml<SingleListRow>(list, {
    idPrefix: "nc-singel",
    placement: (item) => String(item.plassering),
    name: (item) => item.navn,
    club: (item) => item.klubb,
    mainLabel: "POENG",
    main: (item) => formaterPoeng(item.totalPoeng),
    detail: (item) =>
      detailTableHtml(
        [
          { label: "Dato", value: (r) => formatDate(r._stevne?.dato) },
          { label: "Type", value: (r) => r._stevne?.typeNavn ?? "–" },
          { label: "Stevne", value: (r) => r._stevne?.navn ?? "–" },
          { label: "Pl.", cellClass: "res-tal", value: (r) => String(r.plassering ?? "–") },
          { label: "Poeng", cellClass: "res-tal", value: (r) => formaterPoeng(r.nc_poeng) },
        ],
        item.detaljRader,
      ),
  });
}

function teamListHtml(teamList: TeamListRow[]): string {
  return rankingListHtml<TeamListRow>(teamList, {
    idPrefix: "nc-lag",
    placement: (item) => String(item.plassering),
    nameLabel: "KLUBB",
    name: (item) => item.klubb?.navn ?? "–",
    meta: (item) => `${item.bidragsytere.length} kastarar`,
    mainLabel: "POENG",
    main: (item) => formaterPoeng(item.lagTotal),
    detail: (item) =>
      detailTableHtml(
        [
          { label: "Kastar", value: (b) => throwerName(b.kaster) },
          { label: "Poeng", cellClass: "res-tal", value: (b) => formaterPoeng(b.sum) },
        ],
        item.bidragsytere,
      ),
  });
}

function pageSkeletonHtml(year: number, cupType: string): string {
  return `
    <div class="content-page res-side">
      <h1 class="page-title">
        <span id="nc-title-text">Norgescupen ${year}</span><span id="nc-info-slot"></span>
      </h1>
      <div class="filter-row filter-row--smal">
        <select id="nc-year" class="app-select">${yearOptions(year, FIRST_YEAR)}</select>
        <select id="nc-cuptype" class="app-select${year < FIRST_MULTI_CUP_YEAR ? " d-none" : ""}">
          <option value="NC"${cupType === "NC" ? " selected" : ""}>NC</option>
          <option value="SNC"${cupType === "SNC" ? " selected" : ""}>SNC</option>
          <option value="DNC"${cupType === "DNC" ? " selected" : ""}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filter.year = new Date().getFullYear();
  filter.cupType = "NC";
  filter.classNum = 1;
  filter.view = "singel";
  clearCupYearCache();

  container.replaceChildren(createLoadingState("Laster Norgescupen..."));

  const loaded = await loadCupYear(filter.year);
  if (!loaded) {
    container.replaceChildren(createErrorBanner("Kunne ikkje laste data for Norgescupen."));
    return;
  }
  season = loaded;

  container.innerHTML = pageSkeletonHtml(filter.year, filter.cupType);

  const info = createInfoTooltip({
    slot: container.querySelector("#nc-info-slot")!,
    label: "Om denne lista",
    html: "",
  });

  function updateView(): void {
    const { year, cupType, classNum, view } = filter;
    const { rules } = season;
    const content = container.querySelector<HTMLElement>("#nc-content")!;

    container.querySelector("#nc-title-text")!.textContent = `Norgescupen ${year}`;
    container.querySelector("#nc-cuptype")!.classList.toggle("d-none", year < FIRST_MULTI_CUP_YEAR);

    container.querySelector("#nc-view-tabs-container")!.innerHTML =
      cupType === "NC" ? viewTabsHtml(view) : "";

    if (view === "lag" && cupType === "NC") {
      info.setHtml(TEAM_INFO_HTML);
      content.innerHTML = `
        <section>
          <div class="click-hint click-hint-row">Klikk ein klubb for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;

      const teamContainer = content.querySelector<HTMLElement>("#nc-team-table-container")!;
      const teamList = rules ? buildTeamList(season.results, season.tournaments, rules, year) : [];
      if (!teamList.length) {
        teamContainer.replaceChildren(
          createEmptyState(rules ? "Ingen lag funnet." : "Ingen data."),
        );
      } else {
        teamContainer.innerHTML = teamListHtml(teamList);
        bindRankingDetails(teamContainer);
      }
    } else {
      info.setHtml(singleInfoHtml(rules, cupType, year));
      content.innerHTML = `
        <section id="nc-single-section">
          <div id="nc-class-tabs-container">${classTabsHtml(classNum, year)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;

      const singleContainer = content.querySelector<HTMLElement>("#nc-single-table-container")!;
      const singleList = rules
        ? buildSingleList(season.results, season.tournaments, rules, cupType, classNum, year)
        : [];
      if (!singleList.length) {
        singleContainer.replaceChildren(
          createEmptyState(rules ? "Ingen resultater funnet." : "Ingen data."),
        );
      } else {
        singleContainer.innerHTML = singleListHtml(singleList);
        bindRankingDetails(singleContainer);
      }

      content.querySelector("#nc-single-section")!.addEventListener("click", (e) => {
        const tab = (e.target as Element).closest<HTMLElement>("[data-class]");
        if (!tab) return;
        filter.classNum = Number(tab.dataset.class);
        updateView();
      });
    }
  }

  updateView();

  container.querySelector<HTMLSelectElement>("#nc-year")!.addEventListener("change", async (e) => {
    filter.year = Number((e.target as HTMLSelectElement).value);
    filter.classNum = 1;
    normalizeCupFilter(filter);
    container.querySelector<HTMLSelectElement>("#nc-cuptype")!.value = filter.cupType;
    container.querySelector<HTMLElement>("#nc-content")!.replaceChildren(createLoadingState());
    const loaded = await loadCupYear(filter.year);
    if (!loaded) {
      container
        .querySelector<HTMLElement>("#nc-content")!
        .replaceChildren(createErrorBanner("Feil ved henting av data."));
      return;
    }
    season = loaded;
    updateView();
  });

  container.querySelector<HTMLSelectElement>("#nc-cuptype")!.addEventListener("change", (e) => {
    filter.cupType = (e.target as HTMLSelectElement).value;
    filter.classNum = 1;
    normalizeCupFilter(filter);
    updateView();
  });

  container.querySelector("#nc-view-tabs-container")!.addEventListener("click", (e) => {
    const tab = (e.target as Element).closest<HTMLElement>("[data-view]");
    if (!tab) return;
    filter.view = tab.dataset.view as "singel" | "lag";
    updateView();
  });
}
