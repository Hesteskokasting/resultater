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
 */
export function groupSchedule<T extends GroupableScheduleRow>(
  rows: T[],
  todayIso: string,
): ScheduleGroups<T> {
  const upcomingRows: T[] = [];
  const pastRows: T[] = [];
  for (const row of rows) {
    if (row.dato >= todayIso && isNotStarted(row.stevne_fase)) upcomingRows.push(row);
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
