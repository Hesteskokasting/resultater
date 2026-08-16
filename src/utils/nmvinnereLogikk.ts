import { yearOf } from "@/utils/shared";
import type { NMCategoryConfig, NMGender, NMResultRow } from "@/services/nmvinnereService";

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * The NM categories, in page order. `fromYear` and `openFromYear` are historical
 * facts about the championship, not display settings — the service builds its
 * date filters from them, so they live next to the rest of the domain logic.
 */
export const NM_CATEGORIES: NMCategoryConfig[] = [
  {
    id: 1,
    name: "Singel",
    genderFilter: "historical",
    fromYear: 1985,
    openFromYear: 2013,
    note: "(åpen klasse fra 2013)",
  },
  {
    id: 2,
    name: "Par",
    genderFilter: "historical",
    fromYear: 1987,
    openFromYear: 2009,
    note: "(åpen klasse fra 2009)",
  },
  {
    id: 3,
    name: "Mix",
    genderFilter: false,
    fromYear: 1986,
    note: "(NM Mix 2011 ble ikke arrangert)",
  },
  { id: 4, name: "Lag", genderFilter: false, fromYear: 2016 },
  {
    id: 7,
    name: "X-kast",
    genderFilter: "historical",
    fromYear: 2009,
    openFromYear: 2013,
    note: "(åpen klasse fra 2013)",
  },
  { id: 9, name: "Hesteskogolf", genderFilter: "always", fromYear: 2006 },
  { id: 10, name: "Kongelag", genderFilter: false, fromYear: 2023 },
];

export function findCategory(id: number): NMCategoryConfig {
  return NM_CATEGORIES.find((k) => k.id === id) ?? NM_CATEGORIES[0]!;
}

// ── Gender selection ──────────────────────────────────────────────────────────

/**
 * Hesteskogolf has always been split by gender, so "all" is its neutral choice;
 * every other category defaults to the open class it eventually became.
 */
export function defaultGender(genderFilter: NMCategoryConfig["genderFilter"]): NMGender {
  return genderFilter === "always" ? "all" : "open";
}

/** The gender choices a category offers, or none when it never had any. */
export function genderOptions(
  genderFilter: NMCategoryConfig["genderFilter"],
): { value: NMGender; label: string }[] {
  if (genderFilter === false) return [];
  const first: { value: NMGender; label: string } =
    genderFilter === "always"
      ? { value: "all", label: "Alle" }
      : { value: "open", label: "Åpen klasse" };
  return [first, { value: "men", label: "Herrer" }, { value: "women", label: "Damer" }];
}

export function subtitleText(categoryName: string, gender: NMGender): string {
  if (gender === "men") return `${categoryName} Herrer`;
  if (gender === "women") return `${categoryName} Damer`;
  return categoryName;
}

// ── Grouping ──────────────────────────────────────────────────────────────────

export type NmThrower = NonNullable<NMResultRow["kaster"]>;

export interface WinnersEntry {
  year: number | null;
  tournamentId: number | undefined;
  throwers: NmThrower[];
  klubb: NMResultRow["klubb"];
}

/**
 * One row per championship title. The service returns one `resultat` row per
 * winning thrower, so Par and Lag arrive as several rows sharing the same stevne
 * and class — those collapse into a single entry with every thrower listed.
 * Newest year first.
 */
export function buildWinnersList(rows: NMResultRow[]): WinnersEntry[] {
  const groupMap = new Map<string, WinnersEntry>();
  for (const r of rows) {
    const key = `${r.stevne?.id}-${r.klasseid}`;
    let entry = groupMap.get(key);
    if (!entry) {
      entry = {
        year: yearOf(r.stevne?.dato),
        tournamentId: r.stevne?.id,
        throwers: [],
        klubb: r.klubb,
      };
      groupMap.set(key, entry);
    }
    if (r.kaster) entry.throwers.push(r.kaster);
  }
  return [...groupMap.values()].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/** Newest year present, falling back to the current year for an empty category. */
export function latestYear(rows: NMResultRow[], currentYear: number): number {
  return rows.reduce((m, r) => Math.max(m, yearOf(r.stevne?.dato) ?? 0), 0) || currentYear;
}
