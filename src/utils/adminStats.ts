/**
 * Pure aggregation helpers behind the admin dashboard's key figures and charts.
 * Kept free of DOM and Supabase so the numbers can be unit-tested directly.
 */

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

/** "2026-08-02" → 2026. Null/garbage dates yield null so callers can skip them. */
export function yearOf(dato: string | null | undefined): number | null {
  if (!dato) return null;
  const year = Number(dato.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

/** 1-based month (1–12) from an ISO date, or null when unparseable. */
export function monthOf(dato: string | null | undefined): number | null {
  if (!dato || dato.length < 7) return null;
  const month = Number(dato.slice(5, 7));
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

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
 * Registrations per month for one year, January first. All 12 months are always
 * present — a flat tail reads as "no activity yet", not as missing data.
 */
export function countRegistrationsPerMonth(
  rows: { opprettet_at: string | null }[],
  year: number,
): LabelCount[] {
  const counts: number[] = Array.from({ length: 12 }, () => 0);

  for (const row of rows) {
    if (yearOf(row.opprettet_at) !== year) continue;
    const month = monthOf(row.opprettet_at);
    if (month === null) continue;
    counts[month - 1] = (counts[month - 1] ?? 0) + 1;
  }

  return counts.map((count, i) => ({
    label: monthFmt.format(new Date(Date.UTC(year, i, 1))).replace(".", ""),
    count,
  }));
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

/** Users per role, in the app's own role hierarchy (admin → klubbadmin → bruker). */
export function countUsersByRole(
  users: { rolle: string | null }[],
  order: readonly string[] = ["admin", "klubbadmin", "bruker"],
): LabelCount[] {
  const buckets = new Map<string, number>();
  for (const role of order) buckets.set(role, 0);

  for (const user of users) {
    const role = user.rolle ?? "bruker";
    buckets.set(role, (buckets.get(role) ?? 0) + 1);
  }

  // Insertion order: the known roles first (kept even at zero, so the split reads
  // the same every render), then any role value the DB has that this list doesn't.
  return [...buckets.entries()].map(([label, count]) => ({ label, count }));
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
