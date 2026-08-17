import type { Chart, ChartConfiguration } from "chart.js";
import type { LabelCount } from "@/utils/adminStats";

/**
 * Chart.js wrappers for the admin dashboard.
 *
 * Chart.js takes plain colour strings, so the palette can't live in CSS alone —
 * every draw reads the `--chart-*` custom properties off the page and passes the
 * resolved values in. That keeps one source of truth for the colours and makes
 * a theme switch a matter of redrawing, not of a second hard-coded palette.
 *
 * Marks follow the shared chart rules: single-hue fills for one-series charts,
 * bars capped at 24px with a rounded data-end, 2px lines, hairline grid, and no
 * built-in legend (legends are rendered as HTML next to the canvas, so the
 * labels stay readable regardless of the fill's contrast).
 */

type ChartModule = typeof import("chart.js");

let chartLib: ChartModule | null = null;
const liveCharts = new Set<Chart>();

async function loadChartLib(): Promise<ChartModule> {
  if (!chartLib) {
    const mod = await import("chart.js");
    mod.Chart.register(...mod.registerables);
    chartLib = mod;
  }
  return chartLib;
}

/**
 * Tear down every chart this module created. Called before the admin page
 * re-renders: the canvases are thrown away with the old DOM, and an undestroyed
 * Chart keeps its resize observer (and the detached canvas) alive.
 */
export function destroyAdminCharts(): void {
  for (const chart of liveCharts) chart.destroy();
  liveCharts.clear();
}

export interface ChartTheme {
  surface: string;
  ink: string;
  muted: string;
  grid: string;
  series: string[];
}

function readTheme(el: Element): ChartTheme {
  const styles = getComputedStyle(el);
  const read = (name: string, fallback: string): string =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    surface: read("--chart-surface", "#ffffff"),
    ink: read("--chart-ink", "#52514e"),
    muted: read("--chart-muted", "#898781"),
    grid: read("--chart-grid", "#e1e0d9"),
    series: [
      read("--chart-s1", "#2a78d6"),
      read("--chart-s2", "#eb6834"),
      read("--chart-s3", "#1baf7a"),
    ],
  };
}

function create(canvas: HTMLCanvasElement, config: ChartConfiguration): void {
  if (!chartLib) return;
  chartLib.Chart.getChart(canvas)?.destroy();
  const chart = new chartLib.Chart(canvas, config);
  liveCharts.add(chart);
}

function baseScales(theme: ChartTheme, horizontal: boolean): ChartConfiguration["options"] {
  const valueAxis = {
    beginAtZero: true,
    border: { display: false },
    grid: { color: theme.grid, drawTicks: false },
    ticks: { color: theme.muted, precision: 0, padding: 8 },
  };
  const categoryAxis = {
    border: { color: theme.grid },
    grid: { display: false },
    ticks: { color: theme.ink, padding: 6, autoSkip: false },
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
    plugins: { legend: { display: false } },
  };
}

const BAR_MARK = {
  borderRadius: 4,
  borderSkipped: "start" as const,
  maxBarThickness: 24,
};

/** One-series magnitude chart. `horizontal` puts long category names on the y-axis. */
export async function drawBarChart(
  canvas: HTMLCanvasElement,
  data: LabelCount[],
  { horizontal = false, label }: { horizontal?: boolean; label: string },
): Promise<void> {
  await loadChartLib();
  const theme = readTheme(canvas);

  create(canvas, {
    type: "bar",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        { label, data: data.map((d) => d.count), backgroundColor: theme.series[0], ...BAR_MARK },
      ],
    },
    options: {
      ...baseScales(theme, horizontal),
      indexAxis: horizontal ? "y" : "x",
    },
  });
}

/** One-series trend over time. */
export async function drawLineChart(
  canvas: HTMLCanvasElement,
  data: LabelCount[],
  { label }: { label: string },
): Promise<void> {
  await loadChartLib();
  const theme = readTheme(canvas);

  create(canvas, {
    type: "line",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label,
          data: data.map((d) => d.count),
          borderColor: theme.series[0],
          backgroundColor: theme.series[0],
          borderWidth: 2,
          borderCapStyle: "round",
          borderJoinStyle: "round",
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
          // 2px ring in the surface colour so overlapping points stay separable.
          pointBorderColor: theme.surface,
          pointBorderWidth: 2,
        },
      ],
    },
    options: baseScales(theme, false),
  });
}
