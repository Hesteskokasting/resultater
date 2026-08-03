import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { formatDate, formatDayOfMonth, formatTime, formatWeekdayShort } from "@/utils/shared";
import {
  countBy,
  countTournamentsPerMonth,
  isOngoing,
  summarizeTournamentYear,
  tournamentStatusShare,
} from "@/utils/adminEntityStats";
import { getScheduleTournaments } from "@/services/stevneService";
import type { ScheduleTournamentRow } from "@/services/stevneService";
import { getRegistrationCountsForTournaments } from "@/services/adminStatsService";
import { drawBarChart, drawShareBar } from "../_adminCharts";
import { openTournamentEditor } from "../_adminEdit";
import {
  createChartCard,
  createChartGrid,
  createLabelledSelect,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
  createToolbar,
  fillShareLegend,
} from "../_adminUi";
import { createAdminList } from "../_adminUi";
import type { AdminBadge, AdminListItem, StatTile } from "../_adminUi";

const FIRST_YEAR = 1983;

const filter = { searchText: "", year: new Date().getFullYear(), status: "alle" };

function statusBadge(row: ScheduleTournamentRow): AdminBadge {
  if (row.erfullfort) return { text: "Fullført", tone: "ok" };
  if (row.stevne_fase === "innledende") return { text: "Innleiande", tone: "live" };
  if (row.stevne_fase === "avsluttende") return { text: "Avsluttande", tone: "live" };
  return { text: "Ikkje starta", tone: "muted" };
}

function matchesStatus(row: ScheduleTournamentRow, status: string): boolean {
  if (status === "alle") return true;
  if (status === "fullfort") return Boolean(row.erfullfort);
  if (status === "pagaar") return isOngoing(row);
  return !row.erfullfort && !isOngoing(row);
}

function buildItem(
  row: ScheduleTournamentRow,
  registrations: number,
  onChanged: () => void,
): AdminListItem {
  const phaseTab = row.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  const isSncParent = row.er_snc_hovudstevne === true;
  const openTab = isSncParent
    ? "info"
    : row.erfullfort
      ? "resultat"
      : row.stevne_fase
        ? phaseTab
        : "info";

  const badges = [statusBadge(row)];
  if (isSncParent) badges.push({ text: "SNC-samlestevne", tone: "warn" });
  if (row.snc_hovudstevne_id != null) badges.push({ text: "Lokalt SNC-stevne", tone: "muted" });
  if (row.ernm) badges.push({ text: "NM", tone: "warn" });
  if (row.resultaturl) badges.push({ text: "PDF", tone: "muted" });

  const methods = [row.innledende?.navn, row.avsluttende?.navn].filter(Boolean).join(" → ");

  return {
    lead: { top: formatWeekdayShort(row.dato), bottom: formatDayOfMonth(row.dato) },
    title: row.navn,
    meta: [
      row.klubb?.navn,
      row.sted,
      formatTime(row.tid) || null,
      [row.stevnetype?.navn, row.kategori?.navn].filter(Boolean).join(" · ") || null,
      methods || null,
      `${registrations} påmelde`,
    ],
    badges,
    stripe: row.erfullfort ? "ok" : isOngoing(row) ? "live" : undefined,
    actions: [
      { label: "Opne", href: `#/stevne/${row.id}/${openTab}` },
      // An SNC umbrella has no participants of its own.
      ...(isSncParent ? [] : [{ label: "Deltakarar", href: `#/stevne/${row.id}/deltakere` }]),
      {
        label: "Rediger",
        variant: "outline-primary",
        onClick: () => {
          openTournamentEditor(row.id, onChanged);
        },
      },
    ],
  };
}

function tiles(summary: ReturnType<typeof summarizeTournamentYear>, year: number): StatTile[] {
  return [
    { label: `Stevne i ${year}`, value: summary.total, sub: `${summary.nm} av dei er NM` },
    {
      label: "Fullført",
      value: summary.completed,
      sub: summary.total
        ? `${Math.round((summary.completed / summary.total) * 100)} % av året`
        : "—",
    },
    {
      label: "Pågåande",
      value: summary.ongoing,
      sub: summary.ongoing ? "Live no" : "Ingen live no",
      tone: summary.ongoing ? "live" : undefined,
    },
    {
      label: "Kommande",
      value: summary.upcoming,
      sub: summary.next ? `Neste: ${formatDate(summary.next.dato)}` : "Ingen att i år",
    },
    { label: "Påmeldingar", value: summary.registrations, sub: "Samla for året" },
    {
      label: "Snitt påmelde",
      value: summary.avgRegistrations,
      sub: "Per stevne med påmeldingar",
    },
  ];
}

export async function render(el: HTMLElement): Promise<void> {
  const statsSlot = createEl("div", null);
  statsSlot.appendChild(createStatGridSkeleton(6));

  const monthChart = createChartCard("Stevne per månad", "Valt år");
  const statusChart = createChartCard("Status", "Del av stevna i året");
  const clubChart = createChartCard("Arrangørklubbar", "Flest stevne i året");
  const chartGrid = createChartGrid([monthChart, statusChart, clubChart]);

  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const newButton = createEl(
    "button",
    "+ Nytt stevne",
    "btn btn-sm btn-success admin-toolbar__end",
  );
  newButton.type = "button";
  newButton.addEventListener("click", () => {
    openTournamentEditor(undefined, refresh);
  });

  const years: { value: string; text: string }[] = [];
  for (let y = new Date().getFullYear() + 1; y >= FIRST_YEAR; y--) {
    years.push({ value: String(y), text: String(y) });
  }
  const yearSelect = createLabelledSelect("Vel år", years, String(filter.year));
  const statusSelect = createLabelledSelect(
    "Filtrer på status",
    [
      { value: "alle", text: "Alle statusar" },
      { value: "ikkje", text: "Ikkje starta" },
      { value: "pagaar", text: "Pågåande" },
      { value: "fullfort", text: "Fullført" },
    ],
    filter.status,
  );

  const search = createSearchInput({
    placeholder: "Søk på namn, klubb eller stad",
    state: filter,
    onInput: () => update(),
  });

  let rows: ScheduleTournamentRow[] = [];
  let registrations = new Map<number, number>();

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = rows.filter((row) => {
      if (!matchesStatus(row, filter.status)) return false;
      if (!query) return true;
      return [row.navn, row.sted, row.klubb?.navn, row.stevnetype?.navn]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    countEl.textContent = `${matches.length} av ${rows.length} stevne i ${filter.year}`;
    listSlot.replaceChildren(
      matches.length
        ? createAdminList(
            matches.map((row) => buildItem(row, registrations.get(row.id) ?? 0, refresh)),
          )
        : createEmptyState("Ingen stevne å vise."),
    );
  }

  async function drawCharts(): Promise<void> {
    const perMonth = countTournamentsPerMonth(rows, filter.year);
    if (perMonth.some((d) => d.count > 0)) {
      await drawBarChart(monthChart.canvas, perMonth, { label: "Stevne" });
    } else {
      monthChart.showEmpty("Ingen stevne dette året.");
    }

    const share = tournamentStatusShare(rows);
    if (share.some((d) => d.count > 0)) {
      await drawShareBar(statusChart.canvas, share);
      fillShareLegend(statusChart.legend, share, statusChart.card);
    } else {
      statusChart.showEmpty("Ingen stevne dette året.");
    }

    const perClub = countBy(rows, (row) => row.klubb?.navn, { top: 8, fallback: "Utan klubb" });
    if (perClub.entries.length) {
      await drawBarChart(clubChart.canvas, perClub.entries, {
        horizontal: true,
        label: "Stevne",
      });
    } else {
      clubChart.showEmpty("Ingen arrangørar registrert.");
    }
  }

  async function load(): Promise<void> {
    listSlot.replaceChildren(createLoadingState("Laster stevne…"));
    const { data, error } = await getScheduleTournaments(filter.year);
    if (error) {
      statsSlot.replaceChildren();
      listSlot.replaceChildren(createErrorBanner("Kunne ikkje laste stevne."));
      return;
    }
    rows = data;
    registrations = await getRegistrationCountsForTournaments(rows.map((r) => r.id));

    const summary = summarizeTournamentYear(
      rows.map((r) => ({
        id: r.id,
        dato: r.dato,
        erfullfort: r.erfullfort,
        stevne_fase: r.stevne_fase,
        ernm: r.ernm,
      })),
      registrations,
      new Date().toISOString().slice(0, 10),
    );

    statsSlot.replaceChildren(createStatGrid(tiles(summary, filter.year), true));
    update();
    await drawCharts();
  }

  function refresh(): void {
    void load();
  }

  yearSelect.addEventListener("change", () => {
    filter.year = Number(yearSelect.value);
    void load();
  });
  statusSelect.addEventListener("change", () => {
    filter.status = statusSelect.value;
    update();
  });

  el.replaceChildren(
    createSectionTitle("Nøkkeltal for året"),
    statsSlot,
    createSectionTitle("Statistikk"),
    chartGrid,
    createSectionTitle("Stevne"),
    createToolbar([search, yearSelect, statusSelect, countEl, newButton]),
    listSlot,
  );

  await load();
}
