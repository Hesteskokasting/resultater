import { Capacitor } from "@capacitor/core";
import type { AuthUser } from "@/types";
import { getUser } from "@/services/authService";
import {
  getScheduleTournaments,
  getFilterOptions,
  getRegistrationsForThrower,
} from "@/services/stevneService";
import type { ScheduleTournamentRow } from "@/services/stevneService";
import {
  formatDateLong,
  formatDateWeekday,
  formatWeekdayShort,
  formatDayOfMonth,
  yearOptions,
  downloadExcel,
} from "@/utils/shared";
import { buildDropdownOptions } from "@/utils/buildDropdownOptions";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { createStevneCard, type StevneCardTypeBadge } from "@/components/StevneCard";
import { createExcelButton } from "@/components/ExcelButton";
import { createFilterButton } from "@/components/FilterButton";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { registerRefetch } from "@/utils/refetchRegistry";
import { bindRegistrationSlots } from "@/components/PameldingKnapp";
import { createSearchInput } from "@/components/SearchInput";
import {
  sortSchedule,
  groupSchedule,
  findNearestUpcomingId,
  type ScheduleSort,
  type ScheduleSortColumn,
  type MonthGroup,
  type ScheduleGroups,
} from "@/utils/terminlisteLogikk";

const NM_LABEL = "Noregsmeisterskap";

type TournamentRow = ScheduleTournamentRow;

// ── Sorting & grouping state ──────────────────────────────────────────────────
//
// Kommande and Ferdige are separate tables (desktop) / sections (mobile), each with
// its own sort state and its own default direction — Kommande newest-first by
// default is wrong, so each keeps its own dato default rather than sharing one.

const sortKommande: ScheduleSort = { column: "dato", direction: "asc" };
const sortFerdige: ScheduleSort = { column: "dato", direction: "desc" };
let ferdigeExpanded = false;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function canRegisterRow(s: TournamentRow, auth: AuthUser | null): boolean {
  const isUpcoming = new Date(s.dato + "T12:00:00") > new Date();
  const notStarted = s.stevne_fase === null || s.stevne_fase === "ikke_startet";
  const hasAccess = auth?.profil?.kobling_status === "godkjent";
  return hasAccess === true && isUpcoming && notStarted && !s.erfullfort;
}

/** SNC: the thrower must pick a local stevne first, so the button navigates. */
function sncRegistrationLink(s: TournamentRow): { href: string; label: string } | undefined {
  if (!s.er_snc_hovudstevne || !canRegisterRow(s, _auth)) return undefined;
  return { href: `#/stevne/${s.id}/info`, label: "Meld på" };
}

/** Without results there is no resultat tab to open. */
function rowHref(s: TournamentRow): string {
  return `#/stevne/${s.id}/${s.erfullfort ? "resultat" : "info"}`;
}

function trailingActionHtml(s: TournamentRow): string {
  const sncLink = sncRegistrationLink(s);
  if (sncLink) {
    return `<a class="btn btn-sm btn-primary" href="${escHtml(sncLink.href)}">${escHtml(sncLink.label)}</a>`;
  }
  return canRegisterRow(s, _auth) && !s.er_snc_hovudstevne
    ? `<span data-registration-slot="${s.id}"></span>`
    : "";
}

function countRows(groups: MonthGroup<TournamentRow>[]): number {
  return groups.reduce((n, g) => n + g.rows.length, 0);
}

// ── Filter state ──────────────────────────────────────────────────────────────

const filter = {
  year: new Date().getFullYear(),
  searchText: "",
  tournamentTypeId: "",
  throwingMethodId: "",
  clubId: "",
  categoryId: "",
};

let allData: TournamentRow[] = [];
let _auth: AuthUser | null = null;
let _registeredMap: Map<number, number> = new Map();
// "NM" is one of the stevnetype options, but ernm is the authoritative NM flag
let _nmTypeId: number | undefined;
// Local stevner are hidden from the schedule — they are parts of one event, and
// the choice between them belongs on the umbrella's page.
let _sncLocalCounts: Map<number, number> = new Map();

function countSncLocals(data: TournamentRow[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const s of data) {
    if (s.snc_hovudstevne_id != null) {
      counts.set(s.snc_hovudstevne_id, (counts.get(s.snc_hovudstevne_id) ?? 0) + 1);
    }
  }
  return counts;
}

function sncLocalCountLabel(s: TournamentRow): string | null {
  if (!s.er_snc_hovudstevne) return null;
  const count = _sncLocalCounts.get(s.id) ?? 0;
  return count === 1 ? "1 lokalt stevne" : `${count} lokale stevne`;
}

// ── Client-side filtering ─────────────────────────────────────────────────────

function filterData(data: TournamentRow[]): TournamentRow[] {
  return data.filter((s) => {
    if (s.snc_hovudstevne_id != null) return false;

    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      const matched = [
        s.navn,
        s.sted,
        s.klubb?.navn,
        s.stevnetype?.navn,
        s.kategori?.navn,
        s.innledende?.navn,
        s.avsluttende?.navn,
      ].some((field) => field?.toLowerCase().includes(search));
      if (!matched) return false;
    }

    if (filter.tournamentTypeId) {
      const isNmOption = _nmTypeId != null && filter.tournamentTypeId === String(_nmTypeId);
      if (isNmOption ? !s.ernm : String(s.stevnetype?.id) !== filter.tournamentTypeId) return false;
    }

    if (filter.throwingMethodId) {
      const id = filter.throwingMethodId;
      const matched = String(s.innledende?.id) === id || String(s.avsluttende?.id) === id;
      if (!matched) return false;
    }

    if (filter.clubId && String(s.klubb?.id) !== filter.clubId) return false;
    if (filter.categoryId && String(s.kategori?.id) !== filter.categoryId) return false;

    return true;
  });
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function exportToExcel(filtered: TournamentRow[]): Promise<void> {
  const rows = filtered.map((s) => ({
    Dato: s.dato ? new Date(s.dato).toLocaleDateString("nb-NO") : "",
    Navn: s.navn ?? "",
    Sted: s.sted ?? "",
    Arrangør: s.klubb?.navn ?? "",
    Stevnetype: s.stevnetype?.navn ?? "",
    "Kastemetode (innledende)": s.innledende?.navn ?? "",
    "Kastemetode (avsluttende)": s.avsluttende?.navn ?? "",
    Kategori: s.kategori?.navn ?? "",
    NM: s.ernm ? "Ja" : "Nei",
  }));
  await downloadExcel(rows, `terminliste-${filter.year}.xlsx`, "Terminliste");
}

// ── Table (desktop) ───────────────────────────────────────────────────────────

const tableColumns = [
  { id: "dato", label: "Dato" },
  { id: "navn", label: "Stevne" },
  { id: "type", label: "Type / kategori" },
  { id: "metode", label: "Metode" },
  { id: "sted", label: "Sted" },
  { id: "organizer", label: "Arrangør" },
];
const TABLE_COLUMN_COUNT = tableColumns.length + 1; // + trailing action column

function sortIconHtml(sort: ScheduleSort, column: string): string {
  if (sort.column !== column) return '<span class="tl-sort-icon">↕</span>';
  return sort.direction === "asc"
    ? '<span class="tl-sort-icon active">↑</span>'
    : '<span class="tl-sort-icon active">↓</span>';
}

// The single nearest not-yet-started upcoming row gets "I DAG" (dated today) or
// "NESTE" (later); nothing else is marked. Never set for the Ferdige section.
function nearestLabelFor(
  s: TournamentRow,
  nearestId: number | undefined,
  today: string,
): string | undefined {
  if (nearestId === undefined || s.id !== nearestId) return undefined;
  return s.dato === today ? "I DAG" : "NESTE";
}

// Type and kategori render as one pill, type first and heavier — shared visual
// treatment between the desktop cell (here) and the mobile badge (StevneCard).
function typeBadgeCellHtml(s: TournamentRow): string {
  if (!s.stevnetype?.navn) return "";
  const kategori = s.kategori?.navn ? ` ${escHtml(s.kategori.navn)}` : "";
  return `<span class="tl-type-badge"><b>${escHtml(s.stevnetype.navn)}</b>${kategori}</span>`;
}

// The whole row navigates (see the delegated click/keydown handlers in render());
// the trailing cell only ever hosts the Meld på action, never a link/chevron.
function tableRowHtml(s: TournamentRow, nearestLabel: string | undefined): string {
  const date = new Date(s.dato + "T12:00:00").toLocaleDateString("nb-NO");
  const nearestPill = nearestLabel
    ? `<span class="tl-nearest-merke">${escHtml(nearestLabel)}</span> `
    : "";
  const medal = s.ernm
    ? `<span class="tl-nm-medalje" role="img" aria-label="${NM_LABEL}" title="${NM_LABEL}">🥇</span> `
    : "";
  const trailing = trailingActionHtml(s);
  const localCount = sncLocalCountLabel(s);
  return `<tr class="tl-tr" tabindex="0" data-href="${rowHref(s)}" aria-label="Gå til ${escHtml(s.navn ?? "")}, ${date}">
    <td>${date}</td>
    <td>${nearestPill}${medal}${escHtml(s.navn ?? "")}</td>
    <td>${typeBadgeCellHtml(s)}</td>
    <td>${escHtml([s.innledende?.navn, s.avsluttende?.navn].filter((v): v is string => Boolean(v)).join(" \\ "))}</td>
    <td>${localCount ? escHtml(localCount) : escHtml(s.sted ?? "")}</td>
    <td>${escHtml(s.klubb?.navn ?? "")}</td>
    <td class="tl-td-trailing">${trailing}</td>
  </tr>`;
}

function monthRowHtml(
  group: MonthGroup<TournamentRow>,
  sort: ScheduleSort,
  nearestId: number | undefined,
  today: string,
): string {
  const header = `<tr class="tl-month-row"><td colspan="${TABLE_COLUMN_COUNT}">${escHtml(group.label)} <span class="tl-month-count">${group.rows.length} stevner</span></td></tr>`;
  return (
    header +
    sortSchedule(group.rows, sort)
      .map((s) => tableRowHtml(s, nearestLabelFor(s, nearestId, today)))
      .join("")
  );
}

function sectionTableHtml(
  tableId: string,
  label: string,
  groups: MonthGroup<TournamentRow>[],
  sort: ScheduleSort,
  hidden: boolean,
  nearestId: number | undefined,
  today: string,
): string {
  const thead = `<thead><tr>
    ${tableColumns.map((k) => `<th class="tl-th" data-column="${k.id}">${k.label}${sortIconHtml(sort, k.id)}</th>`).join("")}
    <th class="tl-th tl-th-trailing" aria-hidden="true"></th>
  </tr></thead>`;
  const tbody = `<tbody>${groups.map((g) => monthRowHtml(g, sort, nearestId, today)).join("")}</tbody>`;
  return `<table class="tl-table" id="${tableId}" aria-label="${escHtml(label)}"${hidden ? " hidden" : ""}>${thead}${tbody}</table>`;
}

function sectionHeadHtml(
  title: string,
  count: number,
  toggle?: { controlsId: string; expanded: boolean },
): string {
  const toggleHtml = toggle
    ? `<button type="button" class="tl-toggle-text-btn" id="tl-ferdige-toggle" aria-expanded="${toggle.expanded}" aria-controls="${toggle.controlsId}">
         ${toggle.expanded ? "Skjul" : "Vis"} <span class="tl-toggle-icon" aria-hidden="true">${toggle.expanded ? "▲" : "▼"}</span>
       </button>`
    : "";
  return `<div class="tl-section-head">
    <span class="tl-section-title">${escHtml(title)}</span>
    <span class="tl-section-count-pill">${count}</span>
    ${toggleHtml}
  </div>`;
}

function tableHtml(
  groups: ScheduleGroups<TournamentRow>,
  expanded: boolean,
  today: string,
): string {
  const upcomingCount = countRows(groups.upcoming);
  const pastCount = countRows(groups.past);
  if (upcomingCount === 0 && pastCount === 0)
    return '<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>';

  const nearestId = findNearestUpcomingId(groups.upcoming);

  let html = "";
  if (upcomingCount > 0) {
    html += sectionHeadHtml("Kommande", upcomingCount);
    html += sectionTableHtml(
      "tl-table-kommande",
      "Kommande",
      groups.upcoming,
      sortKommande,
      false,
      nearestId,
      today,
    );
  }
  if (pastCount > 0) {
    html += sectionHeadHtml("Ferdige", pastCount, { controlsId: "tl-table-ferdige", expanded });
    html += sectionTableHtml(
      "tl-table-ferdige",
      "Ferdige",
      groups.past,
      sortFerdige,
      !expanded,
      undefined,
      today,
    );
  }
  return html;
}

function buildView(
  groups: ScheduleGroups<TournamentRow>,
  expanded: boolean,
  today: string,
): string | HTMLElement {
  return window.innerWidth > 600
    ? tableHtml(groups, expanded, today)
    : buildList(groups, expanded, today);
}

// ── Card (mobile) ─────────────────────────────────────────────────────────────

function cardNode(s: TournamentRow, nearestLabel: string | undefined): HTMLElement {
  const isLive =
    (s.stevne_fase === "innledende" || s.stevne_fase === "avsluttende") && !s.erfullfort;
  const isUpcoming = new Date(s.dato + "T12:00:00") > new Date();

  const localCount = sncLocalCountLabel(s);
  const stedArrangor = [localCount ?? s.sted, s.klubb?.navn]
    .filter((v): v is string => Boolean(v))
    .join(" · ");
  const meta = stedArrangor ? [stedArrangor] : [];

  const typeBadge: StevneCardTypeBadge | undefined = s.stevnetype?.navn
    ? { type: s.stevnetype.navn, kategori: s.kategori?.navn ?? undefined }
    : undefined;

  return createStevneCard({
    title: s.navn ?? "",
    href: rowHref(s),
    date: formatDateWeekday(s.dato),
    dateIso: s.dato,
    dateFull: formatDateLong(s.dato),
    dateWeekday: formatWeekdayShort(s.dato),
    dateDay: formatDayOfMonth(s.dato),
    status: isLive ? "live" : isUpcoming ? "upcoming" : "done",
    meta,
    typeBadge,
    isNm: s.ernm,
    nearestLabel,
    registrationSlotId: canRegisterRow(s, _auth) && !s.er_snc_hovudstevne ? s.id : undefined,
    actionLink: sncRegistrationLink(s),
  });
}

function sectionHeadNode(
  title: string,
  count: number,
  toggle?: { controlsId: string; expanded: boolean },
): HTMLElement {
  const head = document.createElement("div");
  head.className = "tl-section-head";
  head.innerHTML = `<span class="tl-section-title">${escHtml(title)}</span><span class="tl-section-count-pill">${count}</span>`;
  if (toggle) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tl-toggle-text-btn";
    btn.id = "tl-ferdige-toggle";
    btn.setAttribute("aria-expanded", String(toggle.expanded));
    btn.setAttribute("aria-controls", toggle.controlsId);
    btn.innerHTML = `${toggle.expanded ? "Skjul" : "Vis"} <span class="tl-toggle-icon" aria-hidden="true">${toggle.expanded ? "▲" : "▼"}</span>`;
    head.appendChild(btn);
  }
  return head;
}

function monthHeaderNode(label: string, count: number): HTMLElement {
  const el = document.createElement("p");
  el.className = "tl-month-header";
  el.innerHTML = `${escHtml(label)} <span class="tl-month-count">${count} stevner</span>`;
  return el;
}

// Its own flex+gap (not just a plain wrapper div) so cards inside get the same
// spacing as .stevne-kort-liste's direct children — this container nests one
// level deeper (needed so the whole Ferdige group can be hidden/shown as a unit).
function monthGroupsNode(
  groups: MonthGroup<TournamentRow>[],
  sort: ScheduleSort,
  nearestId: number | undefined,
  today: string,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "tl-month-groups";
  groups.forEach((group) => {
    wrap.appendChild(monthHeaderNode(group.label, group.rows.length));
    sortSchedule(group.rows, sort).forEach((s) =>
      wrap.appendChild(cardNode(s, nearestLabelFor(s, nearestId, today))),
    );
  });
  return wrap;
}

function buildList(
  groups: ScheduleGroups<TournamentRow>,
  expanded: boolean,
  today: string,
): HTMLElement {
  const upcomingCount = countRows(groups.upcoming);
  const pastCount = countRows(groups.past);
  if (upcomingCount === 0 && pastCount === 0) {
    return createEmptyState("Ingen stevner funnet med valgte filtre.");
  }

  const nearestId = findNearestUpcomingId(groups.upcoming);

  const wrap = document.createElement("div");
  wrap.className = "stevne-kort-liste";

  if (upcomingCount > 0) {
    wrap.appendChild(sectionHeadNode("Kommande", upcomingCount));
    wrap.appendChild(monthGroupsNode(groups.upcoming, sortKommande, nearestId, today));
  }
  if (pastCount > 0) {
    wrap.appendChild(
      sectionHeadNode("Ferdige", pastCount, { controlsId: "tl-cards-ferdige", expanded }),
    );
    const ferdigeGroup = monthGroupsNode(groups.past, sortFerdige, undefined, today);
    ferdigeGroup.id = "tl-cards-ferdige";
    ferdigeGroup.hidden = !expanded;
    wrap.appendChild(ferdigeGroup);
  }

  return wrap;
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  registerRefetch(() => render(container));
  container.replaceChildren(createLoadingState("Laster terminliste…"));

  try {
    const [{ data, error }, { data: filterOptions }, auth] = await Promise.all([
      getScheduleTournaments(filter.year),
      getFilterOptions(),
      getUser(),
    ]);
    _nmTypeId = filterOptions.stevnetyper.find((t) => t.navn === "NM")?.id;
    _auth = auth;
    _registeredMap =
      auth?.profil?.kasterid != null
        ? await getRegistrationsForThrower(auth.profil.kasterid)
        : new Map();

    if (error) {
      logError("terminliste.render", error);
      container.replaceChildren(createErrorBanner("Kunne ikkje laste terminliste."));
      return;
    }

    allData = data ?? [];
    _sncLocalCounts = countSncLocals(allData);

    const isNative = Capacitor.isNativePlatform();
    const excelSlotHtml = isNative ? "" : '<span id="tl-excel-slot"></span>';
    const excelSlotMobileHtml = isNative ? "" : '<span id="tl-excel-slot-mobil"></span>';

    // Same select set renders twice: desktop filter row ('') and mobile bottom sheet ('-mobil')
    function filterSelects(
      suffix: "" | "-mobil",
    ): Record<"year" | "tournamentType" | "throwingMethod" | "organizer" | "category", string> {
      return {
        year: `<select class="tl-select" id="tl-year${suffix}">${yearOptions(filter.year, 1983, new Date().getFullYear() + 1)}</select>`,
        tournamentType: `<select class="tl-select" id="tl-tournamenttype${suffix}">${buildDropdownOptions(filterOptions.stevnetyper, filter.tournamentTypeId, "Alle typer")}</select>`,
        throwingMethod: `<select class="tl-select" id="tl-throwingmethod${suffix}">${buildDropdownOptions(filterOptions.kastemetoder, filter.throwingMethodId, "Alle metoder")}</select>`,
        organizer: `<select class="tl-select" id="tl-organizer${suffix}">${buildDropdownOptions(filterOptions.klubber, filter.clubId, "Alle arrangører")}</select>`,
        category: `<select class="tl-select" id="tl-category${suffix}">${buildDropdownOptions(filterOptions.kategorier, filter.categoryId, "Alle kategorier")}</select>`,
      };
    }
    const desktopSel = filterSelects("");
    const mobileSel = filterSelects("-mobil");

    container.innerHTML = `
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${filter.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${desktopSel.year}
          <span id="tl-text-slot"></span>
          ${desktopSel.tournamentType}
          ${desktopSel.throwingMethod}
          ${desktopSel.organizer}
          ${desktopSel.category}
          ${excelSlotHtml}
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <span id="tl-text-mobile-slot"></span>
          <span id="tl-filter-slot"></span>
          ${excelSlotMobileHtml}
        </div>

        <p class="tl-count"></p>

        <div class="tl-list-container"></div>
      </div>

      <!-- Bottom sheet for mobile filters -->
      <div class="tl-sheet-backdrop" id="tl-backdrop"></div>
      <div class="tl-sheet" id="tl-sheet">
        <div class="tl-sheet-content">
          <h2 class="tl-sheet-title">Filtre</h2>
          <label class="tl-label">År
            ${mobileSel.year}
          </label>
          <label class="tl-label">Stevnetype
            ${mobileSel.tournamentType}
          </label>
          <label class="tl-label">Kastemetode
            ${mobileSel.throwingMethod}
          </label>
          <label class="tl-label">Arrangør
            ${mobileSel.organizer}
          </label>
          <label class="tl-label">Kategori
            ${mobileSel.category}
          </label>
          <div class="tl-sheet-buttons">
            <button class="tl-reset-button" id="tl-reset">Tilbakestill</button>
            <button class="tl-apply-button" id="tl-apply">Bruk filter</button>
          </div>
        </div>
      </div>
    `;

    function updateList(): TournamentRow[] {
      const filtered = filterData(allData);
      const listEl = container.querySelector<HTMLElement>(".tl-list-container");
      if (!listEl) return filtered;
      const today = todayIso();
      const groups = groupSchedule(filtered, today);
      const view = buildView(groups, ferdigeExpanded, today);
      if (typeof view === "string") listEl.innerHTML = view;
      else listEl.replaceChildren(view);
      const countEl = container.querySelector(".tl-count");
      if (countEl) countEl.textContent = `${filtered.length} stevner`;
      const throwerId = _auth?.profil?.kasterid;
      const userId = _auth?.user.id;
      if (throwerId != null && userId)
        bindRegistrationSlots(listEl, throwerId, userId, _registeredMap);
      return filtered;
    }

    updateList();

    if (auth?.profil && (auth.profil.role === "admin" || auth.profil.role === "klubbadmin")) {
      const bar = document.createElement("div");
      bar.className = "mb-3 px-2 d-flex gap-2";
      bar.innerHTML = '<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>';
      container.querySelector(".terminliste")?.prepend(bar);
    }

    // ── Event listeners ──

    const textInput = createSearchInput({
      slot: container.querySelector("#tl-text-slot")!,
      state: filter,
      onInput: () => updateList(),
    });
    const textMobileInput = createSearchInput({
      slot: container.querySelector("#tl-text-mobile-slot")!,
      state: filter,
      onInput: () => updateList(),
    });

    const listContainer = container.querySelector<HTMLElement>(".tl-list-container")!;
    const yearSelect = container.querySelector<HTMLSelectElement>("#tl-year")!;
    const tournamentTypeSelect = container.querySelector<HTMLSelectElement>("#tl-tournamenttype")!;
    const throwingMethodSelect = container.querySelector<HTMLSelectElement>("#tl-throwingmethod")!;
    const organizerSelect = container.querySelector<HTMLSelectElement>("#tl-organizer")!;
    const categorySelect = container.querySelector<HTMLSelectElement>("#tl-category")!;
    const sheet = container.querySelector<HTMLElement>("#tl-sheet")!;
    const backdrop = container.querySelector<HTMLElement>("#tl-backdrop")!;
    const resetBtn = container.querySelector<HTMLButtonElement>("#tl-reset")!;
    const applyBtn = container.querySelector<HTMLButtonElement>("#tl-apply")!;
    const yearMobileSelect = container.querySelector<HTMLSelectElement>("#tl-year-mobil")!;
    const tournamentTypeMobSelect = container.querySelector<HTMLSelectElement>(
      "#tl-tournamenttype-mobil",
    )!;
    const throwingMethodMobSelect = container.querySelector<HTMLSelectElement>(
      "#tl-throwingmethod-mobil",
    )!;
    const organizerMobSelect = container.querySelector<HTMLSelectElement>("#tl-organizer-mobil")!;
    const categoryMobSelect = container.querySelector<HTMLSelectElement>("#tl-category-mobil")!;

    listContainer.addEventListener("click", (e) => {
      const target = e.target as Element;

      const th = target.closest<HTMLElement>("[data-column]");
      if (th) {
        const column = th.dataset.column as ScheduleSortColumn;
        const sort = th.closest("table")?.id === "tl-table-ferdige" ? sortFerdige : sortKommande;
        if (sort.column === column) {
          sort.direction = sort.direction === "asc" ? "desc" : "asc";
        } else {
          sort.column = column;
          sort.direction = "asc";
        }
        updateList();
        return;
      }

      const toggle = target.closest<HTMLElement>("#tl-ferdige-toggle");
      if (toggle) {
        ferdigeExpanded = !ferdigeExpanded;
        updateList();
        return;
      }

      // Whole row navigates, except clicks on the trailing Meld på action.
      if (target.closest(".tl-td-trailing")) return;
      const row = target.closest<HTMLElement>("tr.tl-tr[data-href]");
      if (row) window.location.hash = row.dataset.href!;
    });

    listContainer.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target as Element;
      if (target.closest(".tl-td-trailing")) return;
      const row = target.closest<HTMLElement>("tr.tl-tr[data-href]");
      if (!row) return;
      e.preventDefault();
      window.location.hash = row.dataset.href!;
    });

    let resizeTimer: number | null = null;
    function handleResize(): void {
      if (!container.querySelector(".tl-list-container")) {
        window.removeEventListener("resize", handleResize);
        return;
      }
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateList, 200);
    }
    window.addEventListener("resize", handleResize);

    async function reloadYear(logContext: string): Promise<boolean> {
      ferdigeExpanded = false;
      container.querySelector(".tl-title")!.textContent = `Terminliste ${filter.year}`;
      container
        .querySelector(".tl-list-container")!
        .replaceChildren(createLoadingState("Laster..."));
      const { data: newData, error: newError } = await getScheduleTournaments(filter.year);
      if (newError) {
        logError(logContext, newError);
        container
          .querySelector<HTMLElement>(".tl-list-container")!
          .replaceChildren(createErrorBanner("Feil ved henting."));
        return false;
      }
      allData = newData ?? [];
      _sncLocalCounts = countSncLocals(allData);
      return true;
    }

    yearSelect.addEventListener("change", async () => {
      filter.year = Number(yearSelect.value);
      if (await reloadYear("terminliste.yearChange")) updateList();
    });

    tournamentTypeSelect.addEventListener("change", () => {
      filter.tournamentTypeId = tournamentTypeSelect.value;
      updateList();
    });
    throwingMethodSelect.addEventListener("change", () => {
      filter.throwingMethodId = throwingMethodSelect.value;
      updateList();
    });
    organizerSelect.addEventListener("change", () => {
      filter.clubId = organizerSelect.value;
      updateList();
    });
    categorySelect.addEventListener("change", () => {
      filter.categoryId = categorySelect.value;
      updateList();
    });

    if (!isNative) {
      const excelHandler = () => exportToExcel(filterData(allData));
      createExcelButton({
        slot: container.querySelector("#tl-excel-slot")!,
        onClick: excelHandler,
      });
      createExcelButton({
        slot: container.querySelector("#tl-excel-slot-mobil")!,
        onClick: excelHandler,
      });
    }

    function openSheet() {
      sheet.classList.add("active");
      backdrop.classList.add("active");
    }
    function closeSheet() {
      sheet.classList.remove("active");
      backdrop.classList.remove("active");
    }

    createFilterButton({ slot: container.querySelector("#tl-filter-slot")!, onClick: openSheet });
    backdrop.addEventListener("click", closeSheet);

    resetBtn.addEventListener("click", () => {
      filter.searchText = "";
      filter.tournamentTypeId = "";
      filter.throwingMethodId = "";
      filter.clubId = "";
      filter.categoryId = "";
      tournamentTypeMobSelect.value = "";
      throwingMethodMobSelect.value = "";
      organizerMobSelect.value = "";
      categoryMobSelect.value = "";
      textMobileInput.value = "";
      textInput.value = "";
      updateList();
    });

    applyBtn.addEventListener("click", async () => {
      const newYear = Number(yearMobileSelect.value);
      const yearChanged = newYear !== filter.year;
      filter.year = newYear;
      filter.tournamentTypeId = tournamentTypeMobSelect.value;
      filter.throwingMethodId = throwingMethodMobSelect.value;
      filter.clubId = organizerMobSelect.value;
      filter.categoryId = categoryMobSelect.value;
      closeSheet();

      if (yearChanged && !(await reloadYear("terminliste.applyFilter"))) return;
      updateList();
    });
  } catch (err) {
    logError("terminliste.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste terminliste."));
  }
}
