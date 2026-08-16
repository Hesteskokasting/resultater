import { throwerName } from "@/utils/kaster";
import { assignPlacements } from "@/utils/tildelPlassering";
import type { RecordRow } from "@/services/rekorderService";

// ── Methods ───────────────────────────────────────────────────────────────────

export interface RecordMethod {
  value: string;
  label: string;
  maxPoints: number;
}

/**
 * Points, not rings — a Kongelag court is 40 rings but 200 points. The ring
 * ceilings live in `kasterDetaljLogikk` (MAX_RING) and are a different number
 * for the same method, so the two lists must not be merged.
 */
export const RECORD_METHODS: RecordMethod[] = [
  { value: "kongelag", label: "Kongelag", maxPoints: 200 },
  { value: "minimatch", label: "Minimatch", maxPoints: 300 },
  { value: "halvmatch", label: "Halvmatch", maxPoints: 500 },
  { value: "heilmatch", label: "Heilmatch", maxPoints: 1000 },
];

export function findRecordMethod(value: string): RecordMethod {
  return RECORD_METHODS.find((m) => m.value === value) ?? RECORD_METHODS[0]!;
}

// ── Filter ────────────────────────────────────────────────────────────────────

export type RecordGender = "alle" | "herrer" | "damer";

export interface RecordsFilter {
  method: string;
  gender: RecordGender;
  searchText: string;
}

export type RankedRecord = RecordRow & { plassering: number };

/** The view exposes the gender as its name, so the match is on text, not an id. */
export function isFemale(row: Pick<RecordRow, "kjonn_navn">): boolean {
  return (row.kjonn_navn ?? "").toLowerCase().includes("dame");
}

/** Every name column on the view is nullable; the thrower helpers want plain strings. */
export function recordThrower(row: RecordRow): { id: number; fornavn: string; etternavn: string } {
  return {
    id: row.kasterid ?? 0,
    fornavn: row.fornavn ?? "",
    etternavn: row.etternavn ?? "",
  };
}

/**
 * One method's record list, best first, with tied scores sharing a placement.
 * The search matches the thrower or the club.
 */
export function filterAndRankRecords(rows: RecordRow[], filter: RecordsFilter): RankedRecord[] {
  const search = filter.searchText.trim().toLowerCase();

  const ranked: RankedRecord[] = rows
    .filter((row) => {
      if (row.metode !== filter.method) return false;
      if (filter.gender === "damer" && !isFemale(row)) return false;
      if (filter.gender === "herrer" && isFemale(row)) return false;
      if (!search) return true;
      const name = throwerName(recordThrower(row)).toLowerCase();
      return name.includes(search) || (row.klubb_navn ?? "").toLowerCase().includes(search);
    })
    .map((row) => ({ ...row, plassering: 0 }))
    .sort((a, b) => (b.poeng ?? 0) - (a.poeng ?? 0));

  assignPlacements(ranked, (r) => r.poeng ?? 0);
  return ranked;
}
