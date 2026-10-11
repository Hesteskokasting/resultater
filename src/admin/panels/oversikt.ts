import { createErrorBanner } from "@/components/states";
import { todayIso } from "@/utils/date";
import { createEl } from "@/utils/createEl";
import { logError } from "@/utils/logError";
import {
  countThrowersPerClub,
  countTournamentsPerYear,
  participantsPerYearSeries,
  summarizeTournaments,
} from "@/admin/_adminStats";
import type { TournamentStatRow } from "@/admin/_adminStats";
import type { ParticipantYearRow } from "@/services/adminStatsService";
import {
  getAdminEntityCounts,
  getParticipantsPerYear,
  getTournamentStatRows,
} from "@/services/adminStatsService";
import { getActiveThrowerList } from "@/services/kasterService";
import { getUser } from "@/services/authService";
import { drawBarChart } from "../_adminCharts";
import { openClubEditor, openThrowerEditor, openTournamentEditor } from "../_adminEdit";
import {
  createChartCard,
  createChartGrid,
  createQuickActions,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
} from "../_adminUi";
import type { StatTile } from "../_adminUi";

const YEARS_BACK = 8;

function statTiles(
  counts: Awaited<ReturnType<typeof getAdminEntityCounts>>,
  tournaments: TournamentStatRow[],
  year: number,
  participants: ParticipantYearRow | undefined,
  isAdmin: boolean,
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
      label: "Klubbar",
      value: counts.activeClubs,
      sub: `${counts.totalClubs} totalt`,
      href: isAdmin ? "#/admin/klubbar" : undefined,
    },
    {
      label: `Unike deltakarar i ${year}`,
      value: participants?.deltakarar ?? 0,
      sub: "Utøvarar med resultat",
    },
    {
      label: `Deltakingar i ${year}`,
      value: participants?.deltakingar ?? 0,
      sub: "Alle stevne",
    },
    // RLS shows a klubbadmin only a few profiles, so the count would be wrong.
    ...(isAdmin
      ? [
          {
            label: "Brukarkontoar",
            value: counts.totalUsers,
            sub: "Roller og koblingar",
            href: "#/admin/brukarar",
          },
        ]
      : []),
  ];
}

export async function render(el: HTMLElement): Promise<void> {
  const year = new Date().getFullYear();
  const isAdmin = (await getUser())?.profil?.role === "admin";

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
    // Creating a club is admin-only in RLS.
    ...(isAdmin
      ? [
          {
            label: "Ny klubb",
            icon: "＋",
            variant: "primary" as const,
            onClick: () => {
              openClubEditor(undefined, refresh);
            },
          },
        ]
      : []),
    { label: "Terminliste", href: "#/terminliste", icon: "📅" },
    { label: "Norgesranking", href: "#/norgesranking", icon: "📊" },
    { label: "Rekorder", href: "#/rekorder", icon: "🏆" },
  ]);

  const statsSlot = createEl("div", null);
  statsSlot.appendChild(createStatGridSkeleton(5));

  const tournamentChart = createChartCard(
    "Stevne per år",
    `Dei siste ${YEARS_BACK} åra, etter dato`,
  );
  const clubChart = createChartCard("Aktive utøvarar per klubb", "Dei ti største klubbane");
  const participantChart = createChartCard(
    "Deltakarar per år",
    `Unike utøvarar med resultat, dei siste ${YEARS_BACK} åra`,
  );

  const chartGrid = createChartGrid([tournamentChart, clubChart, participantChart]);

  el.replaceChildren(
    createSectionTitle("Snarvegar"),
    actions,
    createSectionTitle("Nøkkeltal"),
    statsSlot,
    createSectionTitle("Statistikk"),
    chartGrid,
  );

  try {
    const [counts, tournaments, throwers, participants] = await Promise.all([
      getAdminEntityCounts(),
      getTournamentStatRows(year - YEARS_BACK + 1),
      getActiveThrowerList(),
      getParticipantsPerYear(year - YEARS_BACK + 1),
    ]);

    statsSlot.replaceChildren(
      createStatGrid(
        statTiles(
          counts,
          tournaments.data,
          year,
          participants.data.find((r) => r.ar === year),
          isAdmin,
        ),
      ),
    );

    const perYear = countTournamentsPerYear(tournaments.data, year, YEARS_BACK);
    const perClub = countThrowersPerClub(throwers.data);
    const perParticipantYear = participantsPerYearSeries(participants.data, year, YEARS_BACK);

    // Redrawn on every theme flip: Chart.js bakes the resolved colours into the
    // canvas, so a CSS variable change alone would leave the old palette on screen.
    async function drawAll(): Promise<void> {
      if (perYear.some((d) => d.count > 0)) {
        await drawBarChart(tournamentChart.canvas, perYear, { label: "Stevne" });
      } else {
        tournamentChart.showEmpty("Ingen stevne registrert.");
      }

      if (perClub.length) {
        await drawBarChart(clubChart.canvas, perClub, { horizontal: true, label: "Utøvarar" });
      } else {
        clubChart.showEmpty("Ingen aktive utøvarar.");
      }

      if (perParticipantYear.some((d) => d.count > 0)) {
        await drawBarChart(participantChart.canvas, perParticipantYear, { label: "Deltakarar" });
      } else {
        participantChart.showEmpty("Ingen deltakarar registrert.");
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
