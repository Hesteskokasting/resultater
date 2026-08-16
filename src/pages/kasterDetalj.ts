import type { Chart } from "chart.js";
import { throwerName } from "@/utils/kaster";
import { prependAdminLinkBar } from "@/components/AdminLinkBar";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { formatDate, formatPercent } from "@/utils/shared";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { setPageTitle } from "@/utils/pageTitle";
import { getThrowerDetail } from "@/services/kasterService";
import type { ThrowerDetailRow, ResultDetailRow } from "@/services/kasterService";
import {
  FIRST_RING_YEAR,
  calcStatistics,
  getPreviousClubs,
  buildChartData,
  sortResults,
  nextResultSort,
  resultFilterOptions,
  filterResults,
} from "@/utils/kasterDetaljLogikk";
import type { MethodName, ResultSort, ResultSortColumn } from "@/utils/kasterDetaljLogikk";

const filterDetail = {
  active: "resultater",
  year: "alle",
  tournamentType: "alle",
  resultSort: { column: "dato", direction: "desc" } as ResultSort,
  chartMetric: "plassering",
  chartMethod: "kongelag" as MethodName,
  chartFrom: null as string | null,
  chartTo: null as string | null,
};

let chartRegistered = false;
let activeChart: Chart | null = null;

/**
 * Chart.js keeps a live handle on the canvas, so the page owning the route has to
 * tear the old chart down before that canvas is replaced or navigated away from.
 */
export function destroyChart(): void {
  if (activeChart) {
    activeChart.destroy();
    activeChart = null;
  }
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function detailSkeletonHtml(thrower: ThrowerDetailRow, results: ResultDetailRow[]): string {
  const name = escHtml(throwerName(thrower));
  const nr = thrower.medlemsnummer ? ` ${thrower.medlemsnummer}` : "";
  const { years, types } = resultFilterOptions(results);

  const methodHidden = filterDetail.chartMetric !== "prosent" ? " d-none" : "";

  return `
    <div class="content-page">
      <h1 class="thrower-detail-title">${name}${escHtml(nr)}</h1>
      <p class="thrower-detail-club">${escHtml(thrower.klubb?.navn ?? "–")}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${filterDetail.active === "resultater" ? " active" : ""}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${filterDetail.active === "statistikk" ? " active" : ""}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${filterDetail.active === "graf" ? " active" : ""}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${filterDetail.active === "resultater" ? "" : " kd-hidden"}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-year" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${years.map((a) => `<option value="${a}"${filterDetail.year == String(a) ? " selected" : ""}>${a}</option>`).join("")}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${types.map(([id, n]) => `<option value="${id}">${escHtml(n)}</option>`).join("")}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${filterDetail.active === "statistikk" ? "" : " kd-hidden"}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${filterDetail.active === "graf" ? "" : " kd-hidden"}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-chart-metric" class="tl-select">
            <option value="plassering"${filterDetail.chartMetric === "plassering" ? " selected" : ""}>Plassering</option>
            <option value="prosent"${filterDetail.chartMetric === "prosent" ? " selected" : ""}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="tl-select${methodHidden}">
            <option value="kongelag"${filterDetail.chartMethod === "kongelag" ? " selected" : ""}>Kongelag</option>
            <option value="minimatch"${filterDetail.chartMethod === "minimatch" ? " selected" : ""}>Minimatch</option>
            <option value="halvmatch"${filterDetail.chartMethod === "halvmatch" ? " selected" : ""}>Halvmatch</option>
            <option value="heilmatch"${filterDetail.chartMethod === "heilmatch" ? " selected" : ""}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="tl-select">
            <option value="">Frå år</option>
            ${years.map((a) => `<option value="${a}"${filterDetail.chartFrom == String(a) ? " selected" : ""}>${a}</option>`).join("")}
          </select>
          <select id="kd-chart-to" class="tl-select">
            <option value="">Til år</option>
            ${years.map((a) => `<option value="${a}"${filterDetail.chartTo == String(a) ? " selected" : ""}>${a}</option>`).join("")}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`;
}

function roundChipHtml(label: string, points: number | null, rings: number | null): string {
  if (points == null) return "";
  const value = rings != null ? `${points} (${rings})` : `${points}`;
  return `<span class="kd-round-chip">${label} ${value}</span>`;
}

function sortIconHtml(active: boolean, direction: "asc" | "desc"): string {
  const glyph = !active ? "↕" : direction === "asc" ? "↑" : "↓";
  return `<span class="kd-sort-icon${active ? " kd-sort-icon--active" : ""}" aria-hidden="true">${glyph}</span>`;
}

function sortButtonHtml(column: ResultSortColumn, label: string, sort: ResultSort): string {
  const active = sort.column === column;
  const dirWord = sort.direction === "asc" ? "stigande" : "synkande";
  const aria = active
    ? `Sortert etter ${label}, ${dirWord}. Vel for å snu.`
    : `Sorter etter ${label}`;
  return (
    `<button type="button" class="kd-sort-btn${active ? " kd-sort-btn--active" : ""}" ` +
    `data-sort="${column}" aria-pressed="${active}" aria-label="${aria}">${label}${sortIconHtml(active, sort.direction)}</button>`
  );
}

function resultsListHtml(
  results: ResultDetailRow[],
  yearFilter: string,
  typeFilter: string,
  sort: ResultSort,
): string {
  const filtered = filterResults(results, yearFilter, typeFilter);

  const count = filtered.length;
  const infoHtml = `
    <div class="thrower-result-info">
      <span>Antal: <strong>${count}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${FIRST_RING_YEAR})</span>
    </div>`;

  if (!count) return infoHtml + '<p class="empty-state">Ingen resultat funnet.</p>';

  const headHtml = `
    <div class="kd-res-head">
      <div class="kd-res-head__date">Sortér: ${sortButtonHtml("dato", "Dato", sort)}</div>
      <span class="kd-res-head__label kd-res-head__label--name">Stevne</span>
      <span class="kd-res-head__label kd-res-head__label--type">Type</span>
      <span class="kd-res-head__label kd-res-head__label--klubb">Klubb</span>
      <span class="kd-res-head__label kd-res-head__label--chips">Rundar</span>
      <div class="kd-res-head__pl">${sortButtonHtml("plassering", "Pl.", sort)}</div>
    </div>`;

  const rows = sortResults(filtered, sort)
    .map((r) => {
      const s = r.stevne;
      const name = s?.id
        ? `<a href="#/stevne/${s.id}/resultat" class="kd-res-row__name">${escHtml(s.navn ?? "")}</a>`
        : `<span class="kd-res-row__name">${escHtml(s?.navn ?? "–")}</span>`;
      const chips =
        roundChipHtml("X-kast", r.poeng_xkast, r.antall_ring_xkast) +
        roundChipHtml("Kongelag", r.poeng_kongelag, r.antall_ring_kongelag);
      const placement =
        r.plassering != null
          ? `<span class="kd-res-row__pl">${r.plassering}</span>`
          : `<span class="kd-res-row__pl kd-res-row__pl--empty">–</span>`;
      return `
      <div class="kd-res-row">
        ${name}
        <div class="kd-res-row__meta">
          <span class="kd-res-row__date">${formatDate(s?.dato)}</span>
          <span class="kd-res-row__type">${escHtml(s?.stevnetype?.navn ?? "–")}</span>
          <span class="kd-res-row__klubb">${escHtml(r.klubb?.navn ?? "–")}</span>
        </div>
        <div class="kd-res-row__chips">${chips}</div>
        ${placement}
      </div>`;
    })
    .join("");

  return infoHtml + headHtml + `<div class="kd-res-list">${rows}</div>`;
}

function statisticsHtml(results: ResultDetailRow[], thrower: ThrowerDetailRow): string {
  const stats = calcStatistics(results);
  const previousClubs = getPreviousClubs(results, thrower.klubb?.id ?? null);

  const statsRows = stats
    .map(
      ({ label, rekord, snittPoeng, snittProsent }) => `
    <tr>
      <td>${label}</td>
      <td class="text-center">${rekord ?? "–"}</td>
      <td class="text-center">${snittPoeng ?? "–"}</td>
      <td class="text-center">${snittProsent != null ? formatPercent(snittProsent) : "–"}</td>
    </tr>`,
    )
    .join("");

  const previousClubsHtml = previousClubs.length
    ? `<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${previousClubs.map((n) => `<li>${escHtml(n)}</li>`).join("")}</ul>
      </div>`
    : "";

  return `
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${FIRST_RING_YEAR})</th>
            </tr>
          </thead>
          <tbody>${statsRows}</tbody>
        </table>
      </div>
      ${previousClubsHtml}
    </div>`;
}

// ── Chart rendering ───────────────────────────────────────────────────────────

async function drawChart(canvas: HTMLCanvasElement, results: ResultDetailRow[]): Promise<void> {
  destroyChart();

  const { labels, stevneNamn, verdiar } = buildChartData(
    results,
    filterDetail.chartMetric,
    filterDetail.chartMethod,
    filterDetail.chartFrom ? Number(filterDetail.chartFrom) : null,
    filterDetail.chartTo ? Number(filterDetail.chartTo) : null,
  );

  if (!verdiar.length) {
    const wrapper = canvas.parentElement;
    if (wrapper) {
      const el = createEmptyState("Ingen data for valt filter.");
      el.classList.add("pt-3");
      wrapper.replaceChildren(el);
    }
    return;
  }

  const { Chart, registerables } = await import("chart.js");
  if (!chartRegistered) {
    Chart.register(...registerables);
    chartRegistered = true;
  }

  const isPlacement = filterDetail.chartMetric === "plassering";
  const yLabel = isPlacement ? "Plassering" : "% Ring";

  // Chart.js config uses JS color values — CSS variables cannot be used directly here
  activeChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: yLabel,
          data: verdiar,
          borderColor: "#4e8fc7",
          backgroundColor: "rgba(78,143,199,0.15)",
          pointBackgroundColor: "#4e8fc7",
          pointRadius: 4,
          tension: 0.1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { maxTicksLimit: 14, maxRotation: 45, color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.08)" },
        },
        y: {
          reverse: isPlacement,
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.08)" },
          title: { display: true, text: yLabel, color: "#ccc" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              return idx != null ? (stevneNamn[idx] ?? labels[idx] ?? "") : "";
            },
            label: (items) => `${yLabel}: ${String(items.raw)}`,
          },
        },
      },
    },
  });
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function renderDetail(container: HTMLElement, id: number): Promise<void> {
  filterDetail.active = "resultater";
  filterDetail.year = "alle";
  filterDetail.tournamentType = "alle";
  filterDetail.resultSort = { column: "dato", direction: "desc" };
  filterDetail.chartMetric = "plassering";
  filterDetail.chartMethod = "kongelag";
  filterDetail.chartFrom = null;
  filterDetail.chartTo = null;

  container.replaceChildren(createLoadingState("Laster utøvar..."));

  try {
    const { kaster: throwerNullable, resultater: results, error } = await getThrowerDetail(id);
    if (error || !throwerNullable) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste utøvar."));
      return;
    }
    // Re-assign to const so TypeScript narrows the type into closures below
    const thrower = throwerNullable;

    setPageTitle(throwerName(thrower));

    container.innerHTML = detailSkeletonHtml(thrower, results);

    const yearSelect = container.querySelector<HTMLSelectElement>("#kd-year")!;
    const typeSelect = container.querySelector<HTMLSelectElement>("#kd-type")!;
    const methodEl = container.querySelector<HTMLSelectElement>("#kd-chart-method")!;

    const resultsEl = container.querySelector<HTMLElement>("#kd-result-table")!;

    function updateResults(): void {
      resultsEl.innerHTML = resultsListHtml(
        results,
        filterDetail.year,
        filterDetail.tournamentType,
        filterDetail.resultSort,
      );
    }

    // Delegated on the stable container so it survives each innerHTML re-render.
    resultsEl.addEventListener("click", (e) => {
      const btn = (e.target as Element).closest<HTMLElement>("[data-sort]");
      if (!btn) return;
      filterDetail.resultSort = nextResultSort(
        filterDetail.resultSort,
        btn.dataset.sort as ResultSortColumn,
      );
      updateResults();
    });

    function updateStatistics(): void {
      container.querySelector<HTMLElement>("#kd-statistics-content")!.innerHTML = statisticsHtml(
        results,
        thrower,
      );
    }

    function updateChart(): void {
      const canvas = container.querySelector<HTMLCanvasElement>("#kd-chart-canvas");
      if (!canvas) return;
      void drawChart(canvas, results);
    }

    function switchTab(tab: string): void {
      filterDetail.active = tab;
      container.querySelectorAll(".thrower-tab-button").forEach((k) => {
        k.classList.toggle("active", (k as HTMLElement).dataset.tab === tab);
      });
      container.querySelectorAll(".kd-tab").forEach((el) => {
        el.classList.toggle("kd-hidden", el.id !== `kd-tab-${tab}`);
      });
      if (tab === "statistikk") updateStatistics();
      if (tab === "graf") updateChart();
    }

    updateResults();

    yearSelect.addEventListener("change", () => {
      filterDetail.year = yearSelect.value;
      updateResults();
    });

    typeSelect.addEventListener("change", () => {
      filterDetail.tournamentType = typeSelect.value;
      updateResults();
    });

    container.querySelectorAll<HTMLElement>(".thrower-tab-button").forEach((k) => {
      k.addEventListener("click", () => switchTab(k.dataset.tab ?? ""));
    });

    const metricEl = container.querySelector<HTMLSelectElement>("#kd-chart-metric")!;
    metricEl.addEventListener("change", () => {
      filterDetail.chartMetric = metricEl.value;
      methodEl.classList.toggle("d-none", metricEl.value !== "prosent");
      updateChart();
    });

    methodEl.addEventListener("change", () => {
      filterDetail.chartMethod = methodEl.value as MethodName;
      updateChart();
    });

    const fromEl = container.querySelector<HTMLSelectElement>("#kd-chart-from")!;
    const toEl = container.querySelector<HTMLSelectElement>("#kd-chart-to")!;

    fromEl.addEventListener("change", () => {
      filterDetail.chartFrom = fromEl.value || null;
      updateChart();
    });

    toEl.addEventListener("change", () => {
      filterDetail.chartTo = toEl.value || null;
      updateChart();
    });

    prependAdminLinkBar(container, {
      href: `#/kaster/${id}/admin`,
      label: "Rediger utøvar",
      variant: "warning",
      canShow: (auth) =>
        auth.profil?.role === "admin" ||
        (auth.profil?.role === "klubbadmin" && auth.clubs.includes(thrower.klubbid ?? -1)),
    });
  } catch (err) {
    logError("kastere.renderDetail", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste utøvar."));
  }
}
