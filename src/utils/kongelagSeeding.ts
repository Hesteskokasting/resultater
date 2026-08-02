import { calcPuljeSizes } from "@/utils/calcPuljeSizes";

/** Innledende result columns used to seed the Kongelag phase (one row per kaster). */
export interface KongelagSeedingRow {
  kasterid: number;
  poeng_xkast: number | null;
  antall_ring_xkast: number | null;
  kamp_poeng_innl: number | null;
  score_poeng_innl: number | null;
}

/** Matches the service-layer NewCourt shape without importing from services (utils stay pure). */
export interface KongelagCourt {
  pulje: number;
  baneNummer: number;
  kasterids: number[];
}

/**
 * Orders kasterids best-first from innledende results. X-kast innledende ranks
 * by poeng_xkast → antall_ring_xkast; kamp-based innledende (Gloppen/NHM) by
 * kamp_poeng_innl → score_poeng_innl. Missing values sort last.
 */
export function orderKongelagSeeding(rows: KongelagSeedingRow[]): number[] {
  const isXkast = rows.some((r) => r.poeng_xkast != null);
  const primary = (r: KongelagSeedingRow): number =>
    (isXkast ? r.poeng_xkast : r.kamp_poeng_innl) ?? -1;
  const secondary = (r: KongelagSeedingRow): number =>
    (isXkast ? r.antall_ring_xkast : r.score_poeng_innl) ?? -1;

  return [...rows]
    .sort((a, b) => primary(b) - primary(a) || secondary(b) - secondary(a))
    .map((r) => r.kasterid);
}

/**
 * Assigns seeded kasterids to Kongelag courts: puljer sized by calcPuljeSizes
 * (cap = available lanes; null = one pulje), one player per court. Best
 * players fill pulje 1, bane 1.
 */
export function buildKongelagCourts(kasterids: number[], lanes: number | null): KongelagCourt[] {
  if (!kasterids.length) return [];
  const cap = lanes ?? kasterids.length;
  const courts: KongelagCourt[] = [];
  let next = 0;
  calcPuljeSizes(kasterids.length, cap).forEach((puljeSize, puljeIdx) => {
    for (let i = 0; i < puljeSize; i++) {
      courts.push({
        pulje: puljeIdx + 1,
        baneNummer: i + 1,
        kasterids: [kasterids[next]!],
      });
      next++;
    }
  });
  return courts;
}
