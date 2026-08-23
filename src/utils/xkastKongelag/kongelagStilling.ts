// Kongelag standing with innledende carry-over (Phases 3 & 4 in
// plans/x-kast_kongelag-schema.md): X-kast innledende carries a rounded,
// normalized share of poeng_xkast; kamp-based innledende (Gloppen/NHM)
// carries kamp_poeng_innl unrounded (can be fractional, e.g. 1.5 from a draw).

import type { KongelagSeedingRow } from "@/utils/xkastKongelag/kongelagSeeding";
import { OMGANG_MAX_POENG } from "@/utils/xkastKongelag/omgangValidation";
import {
  sortAndAssignPlacements,
  compareXkastRows,
  type XkastStandingRow,
} from "@/utils/xkastKongelag/xkastStilling";

export interface InnledendeMethodInfo {
  isXkast: boolean;
  antallOmganger: number | null;
}

/**
 * Normalizes the maximum X-kast total (antallOmganger × 20) to a 100-point
 * carry-over: Minimatch 15 → 1/3, Halvmatch 25 → 0.2, Heilmatch 50 → 0.1 —
 * the same factors as the 0.3333/0.20/0.10 table in the plan.
 */
export function xkastCarryOverFactor(antallOmganger: number): number {
  return 100 / (antallOmganger * OMGANG_MAX_POENG);
}

/** The factor as a display percentage: 15 omganger → 33.33, 25 → 20, 50 → 10. */
export function xkastCarryOverPercent(antallOmganger: number): number {
  return Number((xkastCarryOverFactor(antallOmganger) * 100).toFixed(2));
}

export function calcCarryOverByKasterid(
  rows: KongelagSeedingRow[],
  innledende: InnledendeMethodInfo,
): Record<number, number> {
  const factor =
    innledende.isXkast && innledende.antallOmganger
      ? xkastCarryOverFactor(innledende.antallOmganger)
      : 0;
  const result: Record<number, number> = {};
  for (const row of rows) {
    result[row.kasterid] = innledende.isXkast
      ? Math.round((row.poeng_xkast ?? 0) * factor)
      : (row.kamp_poeng_innl ?? 0);
  }
  return result;
}

export interface KongelagStandingRow extends XkastStandingRow {
  carryOver: number;
  displayTotal: number;
}

function compareRows(a: KongelagStandingRow, b: KongelagStandingRow): number {
  if (b.displayTotal !== a.displayTotal) return b.displayTotal - a.displayTotal;
  // Below displayTotal, the shared ranking applies (kongelag poeng → ringere → best omgang)
  return compareXkastRows(a, b);
}

/** Adds carry-over and re-ranks a Kongelag standing by displayTotal (poeng + carry-over). */
export function buildKongelagStanding(
  kongelagRows: XkastStandingRow[],
  carryOverByKasterid: Record<number, number>,
): KongelagStandingRow[] {
  const rows: KongelagStandingRow[] = kongelagRows.map((row) => {
    const carryOver = carryOverByKasterid[row.kasterid] ?? 0;
    return { ...row, carryOver, displayTotal: row.poeng + carryOver };
  });
  return sortAndAssignPlacements(rows, compareRows);
}
