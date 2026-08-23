import { countPerMonth } from "./_adminStats";
import type { LabelCount } from "./_adminStats";

/**
 * Aggregations behind the per-entity admin dashboards (Stevne, Utøvarar,
 * Klubbar). Same rules as `adminStats`: no DOM, no Supabase, so the figures the
 * admin acts on are unit-testable.
 */

/**
 * Generic "count rows by a key" used for every distribution chart. Rows whose
 * key is null/blank fall into `fallback`. Sorted by size, then name, then cut to
 * `top` — the tail is reported separately by `omittedCount` so a truncated chart
 * can say so instead of silently hiding rows.
 */
export function countBy<T>(
  rows: T[],
  keyOf: (row: T) => string | null | undefined,
  { top = Infinity, fallback = "Ukjend" }: { top?: number; fallback?: string } = {},
): { entries: LabelCount[]; omittedCount: number } {
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row)?.trim() || fallback;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const all = [...buckets.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "nb"));

  return { entries: all.slice(0, top), omittedCount: Math.max(0, all.length - top) };
}

// ── Stevne ───────────────────────────────────────────────────────────────────

export interface TournamentRowLike {
  id: number;
  dato: string | null;
  erfullfort: boolean | null;
  stevne_fase: string | null;
  ernm: boolean | null;
}

export interface TournamentDashboard {
  total: number;
  completed: number;
  ongoing: number;
  upcoming: number;
  notStarted: number;
  nm: number;
  registrations: number;
  /** Mean registrations per tournament that has any, rounded to one decimal. */
  avgRegistrations: number;
  /** The next tournament that hasn't started yet, if any. */
  next: TournamentRowLike | null;
}

export function isOngoing(row: {
  erfullfort: boolean | null;
  stevne_fase: string | null;
}): boolean {
  return !row.erfullfort && (row.stevne_fase === "innledende" || row.stevne_fase === "avsluttende");
}

export function summarizeTournamentYear(
  rows: TournamentRowLike[],
  registrations: Map<number, number>,
  today: string,
): TournamentDashboard {
  let completed = 0;
  let ongoing = 0;
  let upcoming = 0;
  let notStarted = 0;
  let nm = 0;
  let registrationTotal = 0;
  let withRegistrations = 0;
  let next: TournamentRowLike | null = null;

  for (const row of rows) {
    if (row.ernm) nm++;

    const count = registrations.get(row.id) ?? 0;
    registrationTotal += count;
    if (count > 0) withRegistrations++;

    if (row.erfullfort) {
      completed++;
    } else if (isOngoing(row)) {
      ongoing++;
    } else {
      notStarted++;
      if ((row.dato ?? "") >= today) {
        upcoming++;
        if (next === null || (row.dato ?? "") < (next.dato ?? "")) next = row;
      }
    }
  }

  return {
    total: rows.length,
    completed,
    ongoing,
    upcoming,
    notStarted,
    nm,
    registrations: registrationTotal,
    avgRegistrations: withRegistrations
      ? Math.round((registrationTotal / withRegistrations) * 10) / 10
      : 0,
    next,
  };
}

/** Tournaments per month for one year, by `dato` — all 12 months always present. */
export function countTournamentsPerMonth(
  rows: { dato: string | null }[],
  year: number,
): LabelCount[] {
  return countPerMonth(rows, year, (row) => row.dato);
}

/** Fullført / pågåande / ikkje starta, in that order — the share bar's three slots. */
export function tournamentStatusShare(rows: TournamentRowLike[]): LabelCount[] {
  const summary = { Fullført: 0, Pågåande: 0, "Ikkje starta": 0 };
  for (const row of rows) {
    if (row.erfullfort) summary["Fullført"]++;
    else if (isOngoing(row)) summary["Pågåande"]++;
    else summary["Ikkje starta"]++;
  }
  return Object.entries(summary).map(([label, count]) => ({ label, count }));
}

// ── Utøvarar ─────────────────────────────────────────────────────────────────

export interface ThrowerRowLike {
  eraktiv: boolean | null;
  medlemsnummer: number | null;
  klubb?: { navn: string | null } | null;
  klasse?: { navn: string | null } | null;
  kjonn?: { navn: string | null } | null;
}

export interface ThrowerDashboard {
  total: number;
  active: number;
  inactive: number;
  withClub: number;
  withoutClub: number;
  withMemberNumber: number;
  clubCount: number;
}

export function summarizeThrowers(rows: ThrowerRowLike[]): ThrowerDashboard {
  const clubs = new Set<string>();
  let active = 0;
  let withClub = 0;
  let withMemberNumber = 0;

  for (const row of rows) {
    if (row.eraktiv) active++;
    const club = row.klubb?.navn?.trim();
    if (club) {
      withClub++;
      clubs.add(club);
    }
    if (row.medlemsnummer != null) withMemberNumber++;
  }

  return {
    total: rows.length,
    active,
    inactive: rows.length - active,
    withClub,
    withoutClub: rows.length - withClub,
    withMemberNumber,
    clubCount: clubs.size,
  };
}

// ── Klubbar ──────────────────────────────────────────────────────────────────

export interface ClubRowLike {
  id: number;
  navn: string;
  eraktiv: boolean | null;
}

export interface ClubDashboard {
  total: number;
  active: number;
  inactive: number;
  withMembers: number;
  withoutMembers: number;
  hosting: number;
  avgMembers: number;
  largest: LabelCount | null;
}

/**
 * Club-level figures. `members` and `tournaments` are club-id keyed so the same
 * maps can feed both the tiles and the per-row detail.
 */
export function summarizeClubs(
  clubs: ClubRowLike[],
  members: Map<number, number>,
  tournaments: Map<number, number>,
): ClubDashboard {
  let active = 0;
  let withMembers = 0;
  let hosting = 0;
  let memberTotal = 0;
  let largest: LabelCount | null = null;

  for (const club of clubs) {
    if (club.eraktiv) active++;
    const count = members.get(club.id) ?? 0;
    memberTotal += count;
    if (count > 0) withMembers++;
    if ((tournaments.get(club.id) ?? 0) > 0) hosting++;
    if (largest === null || count > largest.count) largest = { label: club.navn, count };
  }

  return {
    total: clubs.length,
    active,
    inactive: clubs.length - active,
    withMembers,
    withoutMembers: clubs.length - withMembers,
    hosting,
    avgMembers: clubs.length ? Math.round((memberTotal / clubs.length) * 10) / 10 : 0,
    largest: largest && largest.count > 0 ? largest : null,
  };
}

/** Club-id → number of rows, for any list of rows carrying a club id. */
export function countByClubId<T>(
  rows: T[],
  clubIdOf: (row: T) => number | null | undefined,
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const row of rows) {
    const id = clubIdOf(row);
    if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}
