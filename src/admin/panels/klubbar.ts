import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { buildClubSlug } from "@/utils/kaster";
import { countByClubId, summarizeClubs } from "@/admin/_adminEntityStats";
import type { LabelCount } from "@/admin/_adminStats";
import { getAllClubsForAdmin } from "@/services/klubbService";
import type { ClubAdminRow } from "@/services/klubbService";
import { getThrowerAdminList } from "@/services/kasterService";
import { getScheduleTournaments } from "@/services/stevneService";
import { drawBarChart } from "../_adminCharts";
import { openClubEditor } from "../_adminEdit";
import {
  createAdminList,
  createChartCard,
  createChartGrid,
  createLabelledSelect,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
  createToolbar,
} from "../_adminUi";
import type { AdminBadge, AdminListItem, StatTile } from "../_adminUi";

const filter = { searchText: "", scope: "alle" };

interface ClubStats {
  active: number;
  inactive: number;
  tournaments: number;
}

function memberLabel(count: number): string {
  return count === 1 ? "1 aktiv utøvar" : `${count} aktive utøvarar`;
}

function buildItem(club: ClubAdminRow, stats: ClubStats, onChanged: () => void): AdminListItem {
  const badges: AdminBadge[] = [];
  if (!club.eraktiv) badges.push({ text: "Inaktiv", tone: "muted" });
  if (stats.tournaments > 0) badges.push({ text: `${stats.tournaments} stevne i år`, tone: "ok" });

  return {
    title: club.navn,
    meta: [
      club.kortnavn || null,
      memberLabel(stats.active),
      stats.inactive ? `${stats.inactive} inaktive` : null,
      club.logourl ? "Har logo" : "Manglar logo",
    ],
    badges,
    stripe: club.eraktiv ? undefined : "muted",
    actions: [
      { label: "Vis", href: `#/klubber/${buildClubSlug(club)}` },
      {
        label: "Rediger",
        variant: "outline-primary",
        onClick: () => {
          openClubEditor(club.id, onChanged);
        },
      },
    ],
  };
}

function tiles(summary: ReturnType<typeof summarizeClubs>, year: number): StatTile[] {
  return [
    { label: "Klubbar totalt", value: summary.total, sub: `${summary.active} aktive` },
    { label: "Inaktive", value: summary.inactive, sub: "Skjult i utval og lister" },
    {
      label: "Utan utøvarar",
      value: summary.withoutMembers,
      sub: summary.withoutMembers ? "Ingen aktive medlemmer" : "Alle har medlemmer",
      tone: summary.withoutMembers ? "warn" : undefined,
    },
    { label: "Snitt utøvarar", value: summary.avgMembers, sub: "Per klubb" },
    { label: `Arrangørar i ${year}`, value: summary.hosting, sub: "Klubbar med stevne" },
    {
      label: "Største klubb",
      value: summary.largest?.count ?? 0,
      sub: summary.largest?.label ?? "Ingen medlemmer registrert",
    },
  ];
}

export async function render(el: HTMLElement): Promise<void> {
  const year = new Date().getFullYear();

  const statsSlot = createEl("div", null);
  statsSlot.appendChild(createStatGridSkeleton(6));

  const memberChart = createChartCard("Aktive utøvarar per klubb", "Dei ti største klubbane");
  const hostChart = createChartCard("Stevne arrangert", `Klubbar med stevne i ${year}`);
  const chartGrid = createChartGrid([memberChart, hostChart]);

  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const newButton = createEl("button", "+ Ny klubb", "btn btn-sm btn-success admin-toolbar__end");
  newButton.type = "button";
  newButton.addEventListener("click", () => {
    openClubEditor(undefined, refresh);
  });

  const scopeSelect = createLabelledSelect(
    "Vis klubbar",
    [
      { value: "alle", text: "Alle klubbar" },
      { value: "aktive", text: "Berre aktive" },
      { value: "inaktive", text: "Berre inaktive" },
      { value: "tomme", text: "Utan utøvarar" },
    ],
    filter.scope,
  );

  const search = createSearchInput({
    placeholder: "Søk på klubbnamn",
    state: filter,
    onInput: () => update(),
  });

  let clubs: ClubAdminRow[] = [];
  let stats = new Map<number, ClubStats>();

  function statsFor(id: number): ClubStats {
    return stats.get(id) ?? { active: 0, inactive: 0, tournaments: 0 };
  }

  function inScope(club: ClubAdminRow): boolean {
    if (filter.scope === "aktive") return Boolean(club.eraktiv);
    if (filter.scope === "inaktive") return !club.eraktiv;
    if (filter.scope === "tomme") return statsFor(club.id).active === 0;
    return true;
  }

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = clubs.filter((club) => {
      if (!inScope(club)) return false;
      if (!query) return true;
      return [club.navn, club.kortnavn]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    countEl.textContent = `${matches.length} av ${clubs.length} klubbar`;
    listSlot.replaceChildren(
      matches.length
        ? createAdminList(matches.map((club) => buildItem(club, statsFor(club.id), refresh)))
        : createEmptyState("Ingen klubbar å vise."),
    );
  }

  /** The ten biggest clubs by one of their counters, largest first. */
  function topClubsBy(pick: (stats: ClubStats) => number): LabelCount[] {
    return clubs
      .map((club) => ({ label: club.navn, count: pick(statsFor(club.id)) }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "nb"))
      .slice(0, 10);
  }

  async function drawCharts(): Promise<void> {
    const byMembers = topClubsBy((s) => s.active);
    if (byMembers.length) {
      await drawBarChart(memberChart.canvas, byMembers, { horizontal: true, label: "Utøvarar" });
    } else {
      memberChart.showEmpty("Ingen aktive utøvarar.");
    }

    const byTournaments = topClubsBy((s) => s.tournaments);
    if (byTournaments.length) {
      await drawBarChart(hostChart.canvas, byTournaments, { horizontal: true, label: "Stevne" });
    } else {
      hostChart.showEmpty(`Ingen stevne registrert i ${year}.`);
    }
  }

  async function load(): Promise<void> {
    listSlot.replaceChildren(createLoadingState("Laster klubbar…"));

    const [clubRes, throwerRes, tournamentRes] = await Promise.all([
      getAllClubsForAdmin(),
      getThrowerAdminList(),
      getScheduleTournaments(year),
    ]);

    if (clubRes.error) {
      statsSlot.replaceChildren();
      listSlot.replaceChildren(createErrorBanner("Kunne ikkje laste klubbar."));
      return;
    }

    clubs = clubRes.data;

    const activeMembers = countByClubId(
      throwerRes.data.filter((t) => t.eraktiv),
      (t) => t.klubb?.id,
    );
    const inactiveMembers = countByClubId(
      throwerRes.data.filter((t) => !t.eraktiv),
      (t) => t.klubb?.id,
    );
    const hosted = countByClubId(tournamentRes.data, (t) => t.klubb?.id);

    stats = new Map(
      clubs.map((club) => [
        club.id,
        {
          active: activeMembers.get(club.id) ?? 0,
          inactive: inactiveMembers.get(club.id) ?? 0,
          tournaments: hosted.get(club.id) ?? 0,
        },
      ]),
    );

    statsSlot.replaceChildren(
      createStatGrid(tiles(summarizeClubs(clubs, activeMembers, hosted), year), true),
    );
    update();
    await drawCharts();
  }

  function refresh(): void {
    void load();
  }

  scopeSelect.addEventListener("change", () => {
    filter.scope = scopeSelect.value;
    update();
  });

  el.replaceChildren(
    createSectionTitle("Nøkkeltal"),
    statsSlot,
    createSectionTitle("Statistikk"),
    chartGrid,
    createSectionTitle("Klubbar"),
    createToolbar([search, scopeSelect, countEl, newButton]),
    listSlot,
  );

  await load();
}
