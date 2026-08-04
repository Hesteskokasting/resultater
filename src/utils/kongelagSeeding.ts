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
 * Kongelag is thrown in waves: half the field throws while the other half
 * scores for them, so the field is always split across at least this many
 * puljer — independent of the lane count.
 */
export const KONGELAG_MIN_PULJER = 2;

/**
 * Assigns seeded kasterids to Kongelag courts: puljer sized by calcPuljeSizes,
 * one player per court.
 *
 * The best players throw last, so the puljer are filled from the last one
 * backwards — the top seeds land in the highest pulje number, and pulje 1 holds
 * the weakest. Within a pulje the seeding still runs best-first from bane 1.
 *
 * The pulje cap is the stricter of the available lanes and half the field, so a
 * venue with lanes to spare (or no lane count at all) still gets the two waves
 * Kongelag needs. A single-player field is the one exception — nobody is left
 * to score, so it stays one pulje.
 */
export function buildKongelagCourts(kasterids: number[], lanes: number | null): KongelagCourt[] {
  if (!kasterids.length) return [];
  const waveCap = Math.max(1, Math.ceil(kasterids.length / KONGELAG_MIN_PULJER));
  const cap = Math.min(lanes ?? kasterids.length, waveCap);
  const puljeSizes = calcPuljeSizes(kasterids.length, cap);
  const courts: KongelagCourt[] = [];
  let next = 0;
  // Reverse iteration keeps each size bound to its own pulje number; only the
  // fill order flips, so the best seeds go into the last pulje.
  for (let puljeIdx = puljeSizes.length - 1; puljeIdx >= 0; puljeIdx--) {
    for (let i = 0; i < puljeSizes[puljeIdx]!; i++) {
      courts.push({
        pulje: puljeIdx + 1,
        baneNummer: i + 1,
        kasterids: [kasterids[next]!],
      });
      next++;
    }
  }
  // Returned in display order (pulje 1 first) — generation order is the reverse.
  return courts.sort((a, b) => a.pulje - b.pulje || a.baneNummer - b.baneNummer);
}
