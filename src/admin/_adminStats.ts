/**
 * Pure aggregation helpers behind the admin dashboard's key figures and charts.
 * Kept free of DOM and Supabase so the numbers can be unit-tested directly.
 */

import { yearOf, monthOf } from "@/utils/date";

export interface LabelCount {
  label: string;
  count: number;
}

export interface TournamentStatRow {
  dato: string | null;
  erfullfort: boolean | null;
  stevne_fase: string | null;
}

export interface TournamentSummary {
  total: number;
  completed: number;
  ongoing: number;
  upcoming: number;
}

const monthFmt = new Intl.DateTimeFormat("nb-NO", { month: "short" });

/**
 * Tournaments per calendar year, oldest first, for the `years` years ending at
 * `toYear`. Years without tournaments are kept as zero-bars so the x-axis stays
 * evenly spaced.
 */
export function countTournamentsPerYear(
  rows: { dato: string | null }[],
  toYear: number,
  years = 8,
): LabelCount[] {
  const buckets = new Map<number, number>();
  for (let y = toYear - years + 1; y <= toYear; y++) buckets.set(y, 0);

  for (const row of rows) {
    const year = yearOf(row.dato);
    if (year === null) continue;
    const current = buckets.get(year);
    if (current !== undefined) buckets.set(year, current + 1);
  }

  return [...buckets.entries()].map(([year, count]) => ({ label: String(year), count }));
}

/**
 * Rows per month for one year, January first, keyed off whichever date column
 * the caller points at. All 12 months are always present — a flat tail reads as
 * "no activity yet", not as missing data.
 */
export function countPerMonth<T>(
  rows: T[],
  year: number,
  dateOf: (row: T) => string | null | undefined,
): LabelCount[] {
  const counts: number[] = Array.from({ length: 12 }, () => 0);

  for (const row of rows) {
    const dato = dateOf(row);
    if (yearOf(dato) !== year) continue;
    const month = monthOf(dato);
    if (month === null) continue;
    counts[month - 1] = (counts[month - 1] ?? 0) + 1;
  }

  return counts.map((count, i) => ({
    label: monthFmt.format(new Date(Date.UTC(year, i, 1))).replace(".", ""),
    count,
  }));
}

/** Registrations per month, by `opprettet_at`. */
export function countRegistrationsPerMonth(
  rows: { opprettet_at: string | null }[],
  year: number,
): LabelCount[] {
  return countPerMonth(rows, year, (row) => row.opprettet_at);
}

/**
 * The `top` biggest clubs by member count, descending. Throwers without a club
 * are grouped under `noClubLabel` and always sort with the rest (a large
 * "no club" bucket is itself worth seeing).
 */
export function countThrowersPerClub(
  throwers: { klubb?: { navn: string | null } | null }[],
  top = 10,
  noClubLabel = "Utan klubb",
): LabelCount[] {
  const buckets = new Map<string, number>();

  for (const thrower of throwers) {
    const name = thrower.klubb?.navn?.trim() || noClubLabel;
    buckets.set(name, (buckets.get(name) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "nb"))
    .slice(0, top);
}

/**
 * Participants per year, oldest first, padded with zero-years so the chart keeps
 * the same x-axis as the tournament chart even when a year has no results.
 */
export function participantsPerYearSeries(
  rows: { ar: number; deltakarar: number }[],
  toYear: number,
  years = 8,
): LabelCount[] {
  const byYear = new Map(rows.map((r) => [r.ar, r.deltakarar]));
  const out: LabelCount[] = [];
  for (let y = toYear - years + 1; y <= toYear; y++) {
    out.push({ label: String(y), count: byYear.get(y) ?? 0 });
  }
  return out;
}

/**
 * Status split for a set of tournaments. "Ongoing" is driven by `stevne_fase`
 * (the same signal the live cards use); anything dated in the future that isn't
 * finished or running counts as upcoming.
 */
export function summarizeTournaments(rows: TournamentStatRow[], today: string): TournamentSummary {
  let completed = 0;
  let ongoing = 0;
  let upcoming = 0;

  for (const row of rows) {
    if (row.erfullfort) {
      completed++;
    } else if (row.stevne_fase === "innledende" || row.stevne_fase === "avsluttende") {
      ongoing++;
    } else if ((row.dato ?? "") >= today) {
      upcoming++;
    }
  }

  return { total: rows.length, completed, ongoing, upcoming };
}
