import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { buildThrowerSlug, throwerName } from "@/utils/kaster";
import { countBy, summarizeThrowers } from "@/utils/adminEntityStats";
import { getThrowerAdminList } from "@/services/kasterService";
import type { ThrowerAdminListRow } from "@/services/kasterService";
import { drawBarChart, drawShareBar } from "../_adminCharts";
import { openThrowerEditor } from "../_adminEdit";
import {
  createAdminList,
  createChartCard,
  createChartGrid,
  createLabelledSelect,
  createSectionTitle,
  createStatGrid,
  createStatGridSkeleton,
  createToolbar,
  fillShareLegend,
} from "../_adminUi";
import type { AdminBadge, AdminListItem, StatTile } from "../_adminUi";

/** Rendered in chunks: the full list runs to well over a thousand rows. */
const PAGE_SIZE = 40;

const filter = { searchText: "", scope: "aktive", club: "alle", shown: PAGE_SIZE };

function buildItem(thrower: ThrowerAdminListRow, onChanged: () => void): AdminListItem {
  const badges: AdminBadge[] = [];
  if (!thrower.eraktiv) badges.push({ text: "Inaktiv", tone: "muted" });
  if (thrower.klasse?.navn) badges.push({ text: thrower.klasse.navn, tone: "muted" });

  const contact = [thrower.epost, thrower.telefon].filter(Boolean).join(" · ");

  return {
    title: throwerName(thrower),
    meta: [
      thrower.klubb?.navn ?? "Utan klubb",
      thrower.kjonn?.navn,
      thrower.medlemsnummer != null ? `Medlemsnr. ${thrower.medlemsnummer}` : "Utan medlemsnr.",
      contact || "Ingen kontaktinfo",
    ],
    badges,
    stripe: thrower.eraktiv ? undefined : "muted",
    actions: [
      { label: "Profil", href: `#/kastere/${buildThrowerSlug(thrower)}` },
      {
        label: "Rediger",
        variant: "outline-primary",
        onClick: () => {
          openThrowerEditor(thrower.id, onChanged);
        },
      },
    ],
  };
}

function tiles(summary: ReturnType<typeof summarizeThrowers>): StatTile[] {
  return [
    { label: "Utøvarar totalt", value: summary.total, sub: `${summary.active} aktive` },
    {
      label: "Inaktive",
      value: summary.inactive,
      sub: summary.total
        ? `${Math.round((summary.inactive / summary.total) * 100)} % av alle`
        : "—",
    },
    { label: "Klubbar representert", value: summary.clubCount, sub: "Med minst éin utøvar" },
    {
      label: "Utan klubb",
      value: summary.withoutClub,
      sub: summary.withoutClub ? "Bør knytast til ein klubb" : "Alle har klubb",
      tone: summary.withoutClub ? "warn" : undefined,
    },
    { label: "Med kontaktinfo", value: summary.withContact, sub: "E-post eller telefon" },
    { label: "Med medlemsnr.", value: summary.withMemberNumber, sub: "Registrert i NHF" },
  ];
}

export async function render(el: HTMLElement): Promise<void> {
  const statsSlot = createEl("div", null);
  statsSlot.appendChild(createStatGridSkeleton(6));

  const clubChart = createChartCard("Utøvarar per klubb", "Dei ti største klubbane");
  const classChart = createChartCard("Fordeling per klasse", "Alle utøvarar");
  const genderChart = createChartCard("Kjønnsfordeling", "Del av alle utøvarar");
  const chartGrid = createChartGrid([clubChart, classChart, genderChart]);

  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);
  const moreSlot = createEl("div", null, "admin-more");

  const newButton = createEl("button", "+ Ny utøvar", "btn btn-sm btn-success admin-toolbar__end");
  newButton.type = "button";
  newButton.addEventListener("click", () => {
    openThrowerEditor(undefined, refresh);
  });

  const scopeSelect = createLabelledSelect(
    "Vis utøvarar",
    [
      { value: "aktive", text: "Berre aktive" },
      { value: "inaktive", text: "Berre inaktive" },
      { value: "alle", text: "Alle utøvarar" },
    ],
    filter.scope,
  );
  const clubSelect = createLabelledSelect(
    "Filtrer på klubb",
    [{ value: "alle", text: "Alle klubbar" }],
    filter.club,
  );

  const search = createSearchInput({
    placeholder: "Søk på namn, klubb, e-post eller medlemsnr.",
    state: filter,
    onInput: () => {
      filter.shown = PAGE_SIZE;
      update();
    },
  });

  let rows: ThrowerAdminListRow[] = [];

  function inScope(row: ThrowerAdminListRow): boolean {
    if (filter.scope === "aktive") return Boolean(row.eraktiv);
    if (filter.scope === "inaktive") return !row.eraktiv;
    return true;
  }

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = rows.filter((row) => {
      if (!inScope(row)) return false;
      if (filter.club !== "alle" && String(row.klubb?.id ?? "") !== filter.club) return false;
      if (!query) return true;
      return [
        throwerName(row),
        row.klubb?.navn,
        row.epost,
        row.medlemsnummer != null ? String(row.medlemsnummer) : null,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    const visible = matches.slice(0, filter.shown);
    countEl.textContent = `${matches.length} av ${rows.length} utøvarar`;
    listSlot.replaceChildren(
      visible.length
        ? createAdminList(visible.map((row) => buildItem(row, refresh)))
        : createEmptyState("Ingen utøvarar å vise."),
    );

    moreSlot.replaceChildren();
    if (matches.length > visible.length) {
      const button = createEl(
        "button",
        `Vis fleire (${matches.length - visible.length} igjen)`,
        "btn btn-sm btn-outline-secondary",
      );
      button.type = "button";
      button.addEventListener("click", () => {
        filter.shown += PAGE_SIZE;
        update();
      });
      moreSlot.appendChild(button);
    }
  }

  function fillClubOptions(): void {
    const clubs = new Map<string, string>();
    for (const row of rows) {
      if (row.klubb?.id != null && row.klubb.navn) clubs.set(String(row.klubb.id), row.klubb.navn);
    }
    const sorted = [...clubs.entries()].sort((a, b) => a[1].localeCompare(b[1], "nb"));

    clubSelect.replaceChildren();
    const all = createEl("option", "Alle klubbar");
    all.value = "alle";
    clubSelect.appendChild(all);
    for (const [id, navn] of sorted) {
      const option = createEl("option", navn);
      option.value = id;
      clubSelect.appendChild(option);
    }
    clubSelect.value = clubs.has(filter.club) ? filter.club : "alle";
    filter.club = clubSelect.value;
  }

  async function drawCharts(): Promise<void> {
    const active = rows.filter((r) => r.eraktiv);

    const perClub = countBy(active, (row) => row.klubb?.navn, { top: 10, fallback: "Utan klubb" });
    if (perClub.entries.length) {
      await drawBarChart(clubChart.canvas, perClub.entries, {
        horizontal: true,
        label: "Utøvarar",
      });
    } else {
      clubChart.showEmpty("Ingen aktive utøvarar.");
    }

    const perClass = countBy(active, (row) => row.klasse?.navn, {
      top: 10,
      fallback: "Utan klasse",
    });
    if (perClass.entries.length) {
      await drawBarChart(classChart.canvas, perClass.entries, {
        horizontal: true,
        label: "Utøvarar",
      });
    } else {
      classChart.showEmpty("Ingen klassar registrert.");
    }

    // Three slots max on a share bar; genders are two plus an unknown bucket.
    const perGender = countBy(active, (row) => row.kjonn?.navn, { top: 3, fallback: "Ukjend" });
    if (perGender.entries.length) {
      await drawShareBar(genderChart.canvas, perGender.entries);
      fillShareLegend(genderChart.legend, perGender.entries, genderChart.card);
    } else {
      genderChart.showEmpty("Ingen aktive utøvarar.");
    }
  }

  async function load(): Promise<void> {
    listSlot.replaceChildren(createLoadingState("Laster utøvarar…"));
    const { data, error } = await getThrowerAdminList();
    if (error) {
      statsSlot.replaceChildren();
      listSlot.replaceChildren(createErrorBanner("Kunne ikkje laste utøvarar."));
      return;
    }
    rows = data;

    statsSlot.replaceChildren(createStatGrid(tiles(summarizeThrowers(rows)), true));
    fillClubOptions();
    update();
    await drawCharts();
  }

  function refresh(): void {
    void load();
  }

  scopeSelect.addEventListener("change", () => {
    filter.scope = scopeSelect.value;
    filter.shown = PAGE_SIZE;
    update();
  });
  clubSelect.addEventListener("change", () => {
    filter.club = clubSelect.value;
    filter.shown = PAGE_SIZE;
    update();
  });

  el.replaceChildren(
    createSectionTitle("Nøkkeltal"),
    statsSlot,
    createSectionTitle("Statistikk"),
    chartGrid,
    createSectionTitle("Utøvarar"),
    createToolbar([search, scopeSelect, clubSelect, countEl, newButton]),
    listSlot,
    moreSlot,
  );

  await load();
}
