import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createEl } from "@/utils/createEl";
import { logError } from "@/utils/logError";
import {
  countRegistrationsPerMonth,
  countThrowersPerClub,
  countTournamentsPerYear,
  countUsersByRole,
  summarizeTournaments,
} from "@/utils/adminStats";
import type { LabelCount, TournamentStatRow } from "@/utils/adminStats";
import { getAllUsers } from "@/services/adminService";
import {
  getAdminEntityCounts,
  getRegistrationStatRows,
  getTournamentStatRows,
} from "@/services/adminStatsService";
import { getActiveThrowerList } from "@/services/kasterService";
import { drawBarChart, drawLineChart, drawShareBar, seriesColor } from "../_adminCharts";
import {
  createQuickActions,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
} from "../_adminUi";
import type { StatTile } from "../_adminUi";

const YEARS_BACK = 8;

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  klubbadmin: "Klubbadmin",
  bruker: "Brukar",
};

interface ChartCard {
  card: HTMLElement;
  canvas: HTMLCanvasElement;
  legend: HTMLElement;
  /** Replaces the canvas with a message when there is nothing to plot. */
  showEmpty: (message: string) => void;
}

function createChartCard(title: string, subtitle?: string): ChartCard {
  const card = createEl("section", null, "admin-chart");
  card.appendChild(createEl("h4", title, "admin-chart__title"));
  if (subtitle) card.appendChild(createEl("p", subtitle, "admin-chart__subtitle"));

  const wrap = createEl("div", null, "admin-chart__canvas");
  const canvas = createEl("canvas", null);
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", title);
  wrap.appendChild(canvas);
  card.appendChild(wrap);

  const legend = createEl("div", null, "admin-legend");
  card.appendChild(legend);

  return {
    card,
    canvas,
    legend,
    showEmpty: (message: string) => {
      wrap.replaceChildren(createEmptyState(message));
      legend.replaceChildren();
    },
  };
}

/**
 * Legend doubling as the value table: swatch, label, count and share. The share
 * bar's fills sit below 3:1 against the light surface, so these labels — not the
 * colours — are what carry the numbers.
 */
function fillShareLegend(legend: HTMLElement, data: LabelCount[], host: Element): void {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  legend.replaceChildren();

  data.forEach((entry, i) => {
    const item = createEl("div", null, "admin-legend__item");
    const swatch = createEl("span", null, "admin-legend__swatch");
    swatch.style.background = seriesColor(host, i + 1);
    item.appendChild(swatch);
    item.appendChild(
      createEl("span", ROLE_LABEL[entry.label] ?? entry.label, "admin-legend__label"),
    );
    item.appendChild(createEl("span", String(entry.count), "admin-legend__value"));
    const share = total ? Math.round((entry.count / total) * 100) : 0;
    item.appendChild(createEl("span", `${share} %`, "admin-legend__share"));
    legend.appendChild(item);
  });
}

function statTiles(
  counts: Awaited<ReturnType<typeof getAdminEntityCounts>>,
  tournaments: TournamentStatRow[],
  year: number,
  registrations: number,
): StatTile[] {
  const today = new Date().toISOString().slice(0, 10);
  const thisYear = tournaments.filter((t) => (t.dato ?? "").startsWith(String(year)));
  const summary = summarizeTournaments(thisYear, today);

  return [
    {
      label: `Stevne i ${year}`,
      value: summary.total,
      sub: `${summary.completed} fullført · ${summary.upcoming} kommande`,
      href: "#/admin/stevne",
    },
    {
      label: "Pågåande stevne",
      value: summary.ongoing,
      sub: summary.ongoing ? "Live no" : "Ingen live no",
      href: "#/admin/stevne",
      tone: summary.ongoing ? "live" : undefined,
    },
    {
      label: "Aktive utøvarar",
      value: counts.activeThrowers,
      sub: `${counts.totalThrowers} totalt`,
      href: "#/admin/utovarar",
    },
    {
      label: "Klubbar",
      value: counts.activeClubs,
      sub: `${counts.totalClubs} totalt`,
      href: "#/admin/klubbar",
    },
    {
      label: "Brukarkontoar",
      value: counts.totalUsers,
      sub: "Roller og koblingar",
      href: "#/admin/brukarar",
    },
    {
      label: "Ventande forespørslar",
      value: counts.pendingLinks,
      sub: counts.pendingLinks ? "Treng handsaming" : "Alt handsama",
      href: "#/admin/forespurnader",
      tone: counts.pendingLinks ? "warn" : undefined,
    },
    {
      label: `Påmeldingar i ${year}`,
      value: registrations,
      sub: "Alle stevne",
    },
  ];
}

export async function render(el: HTMLElement): Promise<void> {
  const year = new Date().getFullYear();

  const actions = createQuickActions([
    { label: "Nytt stevne", href: "#/stevne/ny", icon: "＋", variant: "primary" },
    { label: "Ny utøvar", href: "#/kaster/ny", icon: "＋", variant: "primary" },
    { label: "Ny klubb", href: "#/klubber/ny", icon: "＋", variant: "primary" },
    { label: "Terminliste", href: "#/terminliste", icon: "📅" },
    { label: "Norgesranking", href: "#/norgesranking", icon: "📊" },
    { label: "Rekorder", href: "#/rekorder", icon: "🏆" },
  ]);

  const statsSlot = createEl("div", null);
  statsSlot.appendChild(createStatGridSkeleton(7));

  const tournamentChart = createChartCard(
    "Stevne per år",
    `Dei siste ${YEARS_BACK} åra, etter dato`,
  );
  const registrationChart = createChartCard("Påmeldingar per månad", String(year));
  const clubChart = createChartCard("Aktive utøvarar per klubb", "Dei ti største klubbane");
  const roleChart = createChartCard("Brukarar per rolle", "Del av alle kontoar");

  const chartGrid = createEl("div", null, "admin-charts");
  [tournamentChart, registrationChart, clubChart, roleChart].forEach((c) =>
    chartGrid.appendChild(c.card),
  );

  el.replaceChildren(
    createSectionTitle("Snarvegar"),
    actions,
    createSectionTitle("Nøkkeltal"),
    statsSlot,
    createSectionTitle("Statistikk"),
    chartGrid,
  );

  try {
    const [counts, tournaments, registrations, throwers, users] = await Promise.all([
      getAdminEntityCounts(),
      getTournamentStatRows(year - YEARS_BACK + 1),
      getRegistrationStatRows(year),
      getActiveThrowerList(),
      getAllUsers(),
    ]);

    statsSlot.replaceChildren(
      createStatGrid(statTiles(counts, tournaments.data, year, registrations.data.length)),
    );

    const perYear = countTournamentsPerYear(tournaments.data, year, YEARS_BACK);
    const perMonth = countRegistrationsPerMonth(registrations.data, year);
    const perClub = countThrowersPerClub(throwers.data);
    const perRole = countUsersByRole(users.data);

    // Redrawn on every theme flip: Chart.js bakes the resolved colours into the
    // canvas, so a CSS variable change alone would leave the old palette on screen.
    async function drawAll(): Promise<void> {
      if (perYear.some((d) => d.count > 0)) {
        await drawBarChart(tournamentChart.canvas, perYear, { label: "Stevne" });
      } else {
        tournamentChart.showEmpty("Ingen stevne registrert.");
      }

      if (perMonth.some((d) => d.count > 0)) {
        await drawLineChart(registrationChart.canvas, perMonth, { label: "Påmeldingar" });
      } else {
        registrationChart.showEmpty("Ingen påmeldingar i år.");
      }

      if (perClub.length) {
        await drawBarChart(clubChart.canvas, perClub, { horizontal: true, label: "Utøvarar" });
      } else {
        clubChart.showEmpty("Ingen aktive utøvarar.");
      }

      if (perRole.some((d) => d.count > 0)) {
        await drawShareBar(roleChart.canvas, perRole);
        fillShareLegend(roleChart.legend, perRole, roleChart.card);
      } else {
        roleChart.showEmpty("Ingen brukarar.");
      }
    }

    await drawAll();

    const observer = new MutationObserver(() => {
      if (!el.isConnected) {
        observer.disconnect();
        return;
      }
      void drawAll();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (err) {
    logError("admin.oversikt", err);
    statsSlot.replaceChildren(createErrorBanner("Kunne ikkje laste nøkkeltal."));
  }
}
