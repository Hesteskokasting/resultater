import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { formatDayOfMonth, formatWeekdayShort } from "@/utils/shared";
import { getScheduleTournaments } from "@/services/stevneService";
import type { ScheduleTournamentRow } from "@/services/stevneService";
import { createAdminList, createLabelledSelect, createToolbar } from "../_adminUi";
import type { AdminBadge, AdminListItem } from "../_adminUi";

const FIRST_YEAR = 1983;

const filter = { searchText: "", year: new Date().getFullYear() };

function statusBadge(row: ScheduleTournamentRow): AdminBadge {
  if (row.erfullfort) return { text: "Fullført", tone: "ok" };
  if (row.stevne_fase === "innledende") return { text: "Innleiande", tone: "live" };
  if (row.stevne_fase === "avsluttende") return { text: "Avsluttande", tone: "live" };
  return { text: "Ikkje starta", tone: "muted" };
}

function buildItem(row: ScheduleTournamentRow): AdminListItem {
  const phaseTab = row.stevne_fase === "avsluttende" ? "avsluttende" : "innledende";
  const openTab = row.erfullfort ? "resultat" : row.stevne_fase ? phaseTab : "info";
  const badges = [statusBadge(row)];
  if (row.ernm) badges.push({ text: "NM", tone: "warn" });

  return {
    lead: { top: formatWeekdayShort(row.dato), bottom: formatDayOfMonth(row.dato) },
    title: row.navn,
    meta: [row.klubb?.navn, row.sted, row.stevnetype?.navn, row.kategori?.navn],
    badges,
    stripe: row.stevne_fase && !row.erfullfort ? "live" : undefined,
    actions: [
      { label: "Opne", href: `#/stevne/${row.id}/${openTab}` },
      { label: "Deltakarar", href: `#/stevne/${row.id}/deltakere` },
      { label: "Rediger", href: `#/stevne/${row.id}/rediger`, variant: "outline-primary" },
    ],
  };
}

export async function render(el: HTMLElement): Promise<void> {
  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const newButton = createEl("a", "+ Nytt stevne", "btn btn-sm btn-success admin-toolbar__end");
  newButton.href = "#/stevne/ny";

  const years: { value: string; text: string }[] = [];
  for (let y = new Date().getFullYear() + 1; y >= FIRST_YEAR; y--) {
    years.push({ value: String(y), text: String(y) });
  }
  const yearSelect = createLabelledSelect("Vel år", years, String(filter.year));

  const search = createSearchInput({
    placeholder: "Søk på namn, klubb eller stad",
    state: filter,
    onInput: () => update(),
  });

  let rows: ScheduleTournamentRow[] = [];

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = query
      ? rows.filter((row) =>
          [row.navn, row.sted, row.klubb?.navn, row.stevnetype?.navn]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
        )
      : rows;

    countEl.textContent = `${matches.length} av ${rows.length} stevne i ${filter.year}`;
    listSlot.replaceChildren(
      matches.length
        ? createAdminList(matches.map(buildItem))
        : createEmptyState("Ingen stevne å vise."),
    );
  }

  async function load(): Promise<void> {
    listSlot.replaceChildren(createLoadingState("Laster stevne…"));
    const { data, error } = await getScheduleTournaments(filter.year);
    if (error) {
      listSlot.replaceChildren(createErrorBanner("Kunne ikkje laste stevne."));
      return;
    }
    rows = data;
    update();
  }

  yearSelect.addEventListener("change", () => {
    filter.year = Number(yearSelect.value);
    void load();
  });

  el.replaceChildren(createToolbar([search, yearSelect, countEl, newButton]), listSlot);
  await load();
}
