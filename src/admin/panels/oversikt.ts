import { createErrorBanner } from "@/components/states";
import { todayIso } from "@/utils/date";
import { createEl } from "@/utils/createEl";
import { logError } from "@/utils/logError";
import {
  countRegistrationsPerMonth,
  countThrowersPerClub,
  countTournamentsPerYear,
  countUsersByRole,
  summarizeTournaments,
} from "@/admin/_adminStats";
import type { TournamentStatRow } from "@/admin/_adminStats";
import { getAllUsers } from "@/services/adminService";
import {
  getAdminEntityCounts,
  getRegistrationStatRows,
  getTournamentStatRows,
} from "@/services/adminStatsService";
import { getActiveThrowerList } from "@/services/kasterService";
import { drawBarChart, drawLineChart } from "../_adminCharts";
import { openClubEditor, openThrowerEditor, openTournamentEditor } from "../_adminEdit";
import {
  createChartCard,
  createChartGrid,
  createQuickActions,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
  renderShareCard,
} from "../_adminUi";
import type { StatTile } from "../_adminUi";

const YEARS_BACK = 8;

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  klubbadmin: "Klubbadmin",
  bruker: "Brukar",
};

function statTiles(
  counts: Awaited<ReturnType<typeof getAdminEntityCounts>>,
  tournaments: TournamentStatRow[],
  year: number,
  registrations: number,
): StatTile[] {
  const today = todayIso();
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

  // The create actions open the overlay so the dashboard stays put underneath.
  const refresh = (): void => {
    void render(el);
  };
  const actions = createQuickActions([
    {
      label: "Nytt stevne",
      icon: "＋",
      variant: "primary",
      onClick: () => {
        openTournamentEditor(undefined, refresh);
      },
    },
    {
      label: "Ny utøvar",
      icon: "＋",
      variant: "primary",
      onClick: () => {
        openThrowerEditor(undefined, refresh);
      },
    },
    {
      label: "Ny klubb",
      icon: "＋",
      variant: "primary",
      onClick: () => {
        openClubEditor(undefined, refresh);
      },
    },
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

  const chartGrid = createChartGrid([tournamentChart, registrationChart, clubChart, roleChart]);

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
        renderShareCard(roleChart, perRole, (label) => ROLE_LABEL[label] ?? label);
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
