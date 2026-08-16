// ── Filtering ─────────────────────────────────────────────────────────────────

export interface ScheduleFilter {
  searchText: string;
  tournamentTypeId: string;
  throwingMethodId: string;
  clubId: string;
  categoryId: string;
}

interface FilterableScheduleRow {
  navn: string | null;
  sted: string | null;
  ernm: boolean;
  snc_hovudstevne_id: number | null;
  klubb: { id: number; navn: string | null } | null;
  stevnetype: { id: number; navn: string | null } | null;
  kategori: { id: number; navn: string | null } | null;
  innledende: { id: number; navn: string | null } | null;
  avsluttende: { id: number; navn: string | null } | null;
}

/**
 * Client-side filtering of the schedule. Local SNC stevner never appear: they
 * are parts of one event, and the choice between them belongs on the umbrella's
 * page. `nmTypeId` is the id of the "NM" stevnetype option — picking it filters
 * on the authoritative `ernm` flag rather than on the type itself.
 */
export function filterSchedule<T extends FilterableScheduleRow>(
  rows: T[],
  filter: ScheduleFilter,
  nmTypeId: number | undefined,
): T[] {
  const search = filter.searchText.toLowerCase();
  return rows.filter((s) => {
    if (s.snc_hovudstevne_id != null) return false;

    if (search) {
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
      const isNmOption = nmTypeId != null && filter.tournamentTypeId === String(nmTypeId);
      if (isNmOption ? !s.ernm : String(s.stevnetype?.id) !== filter.tournamentTypeId) return false;
    }

    if (filter.throwingMethodId) {
      const id = filter.throwingMethodId;
      if (String(s.innledende?.id) !== id && String(s.avsluttende?.id) !== id) return false;
    }

    if (filter.clubId && String(s.klubb?.id) !== filter.clubId) return false;
    if (filter.categoryId && String(s.kategori?.id) !== filter.categoryId) return false;

    return true;
  });
}

interface RegisterableScheduleRow {
  dato: string;
  stevne_fase: string | null;
  erfullfort: boolean;
}

/**
 * Whether the Meld på action belongs on a row: the stevne is still ahead, has
 * not started, and is not closed. `isLinked` is the caller's own gate — only an
 * approved thrower link can register at all.
 */
export function canRegisterForTournament(
  s: RegisterableScheduleRow,
  isLinked: boolean,
  todayIso: string,
): boolean {
  const notStarted = s.stevne_fase === null || s.stevne_fase === "ikke_startet";
  return isLinked && s.dato >= todayIso && notStarted && !s.erfullfort;
}

/** How many local stevner each SNC umbrella has, keyed by umbrella id. */
export function countSncLocals(rows: { snc_hovudstevne_id: number | null }[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const s of rows) {
    if (s.snc_hovudstevne_id != null) {
      counts.set(s.snc_hovudstevne_id, (counts.get(s.snc_hovudstevne_id) ?? 0) + 1);
    }
  }
  return counts;
}

// ── Sorting ───────────────────────────────────────────────────────────────────

export type ScheduleSortColumn = "navn" | "dato" | "sted" | "metode" | "organizer" | "type";

export interface ScheduleSort {
  column: ScheduleSortColumn;
  direction: "asc" | "desc";
}

interface SortableScheduleRow {
  navn: string | null;
  dato: string;
  sted: string | null;
  innledende: { navn: string | null } | null;
  avsluttende: { navn: string | null } | null;
  klubb: { navn: string | null } | null;
  stevnetype: { navn: string | null } | null;
  kategori: { navn: string | null } | null;
}

function sortValue(s: SortableScheduleRow, column: ScheduleSortColumn): string {
  switch (column) {
    case "navn":
      return s.navn ?? "";
    case "dato":
      return s.dato;
    case "sted":
      return s.sted ?? "";
    case "metode":
      return [s.innledende?.navn, s.avsluttende?.navn]
        .filter((v): v is string => Boolean(v))
        .join(" ");
    case "organizer":
      return s.klubb?.navn ?? "";
    // Type and kategori render as one merged column/badge, so they sort as one field too.
    case "type":
      return [s.stevnetype?.navn, s.kategori?.navn]
        .filter((v): v is string => Boolean(v))
        .join(" ");
  }
}

export function sortSchedule<T extends SortableScheduleRow>(rows: T[], sort: ScheduleSort): T[] {
  return [...rows].sort((a, b) => {
    const cmp = sortValue(a, sort.column).localeCompare(sortValue(b, sort.column), "nb");
    return sort.direction === "asc" ? cmp : -cmp;
  });
}

// ── Month grouping ────────────────────────────────────────────────────────────

export interface MonthGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

export interface ScheduleGroups<T> {
  upcoming: MonthGroup<T>[];
  past: MonthGroup<T>[];
}

interface GroupableScheduleRow {
  dato: string;
  stevne_fase: string | null;
  erfullfort: boolean;
}

const monthLabelFmt = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric" });

function monthKey(dato: string): string {
  return dato.slice(0, 7);
}

function monthLabel(dato: string): string {
  return monthLabelFmt.format(new Date(dato + "T12:00:00")).toUpperCase();
}

function isNotStarted(stevneFase: string | null): boolean {
  return stevneFase === null || stevneFase === "ikke_startet";
}

function buildMonthGroups<T extends GroupableScheduleRow>(
  rows: T[],
  monthOrder: "asc" | "desc",
): MonthGroup<T>[] {
  const byKey = new Map<string, T[]>();
  for (const row of rows) {
    const key = monthKey(row.dato);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(row);
    else byKey.set(key, [row]);
  }
  const keys = [...byKey.keys()].sort((a, b) =>
    monthOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((key) => {
    const rows = byKey.get(key)!;
    return { key, label: monthLabel(rows[0]!.dato), rows };
  });
}

/**
 * A stevne dated today only counts as upcoming while it hasn't started yet
 * (`stevne_fase` null/'ikke_startet') — live or finished today's events fall
 * into the past bucket alongside everything actually before `todayIso`.
 *
 * `erfullfort` overrides the phase entirely: an arrangør can close a stevne
 * without it ever leaving 'ikke_startet' (cancelled, or results imported from
 * elsewhere), and a closed stevne is never upcoming no matter its date.
 */
export function groupSchedule<T extends GroupableScheduleRow>(
  rows: T[],
  todayIso: string,
): ScheduleGroups<T> {
  const upcomingRows: T[] = [];
  const pastRows: T[] = [];
  for (const row of rows) {
    if (row.dato >= todayIso && isNotStarted(row.stevne_fase) && !row.erfullfort)
      upcomingRows.push(row);
    else pastRows.push(row);
  }
  return {
    upcoming: buildMonthGroups(upcomingRows, "asc"),
    past: buildMonthGroups(pastRows, "desc"),
  };
}

interface NearestScheduleRow {
  id: number;
  dato: string;
}

/**
 * The single nearest not-yet-started upcoming row, regardless of the current
 * column sort or which month group it falls in — always the earliest `dato`.
 */
export function findNearestUpcomingId<T extends NearestScheduleRow>(
  groups: MonthGroup<T>[],
): number | undefined {
  let nearest: T | undefined;
  for (const group of groups) {
    for (const row of group.rows) {
      if (!nearest || row.dato < nearest.dato) nearest = row;
    }
  }
  return nearest?.id;
}
