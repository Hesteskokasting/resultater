/**
 * Splits participants into puljer as evenly as possible, given the venue's
 * court capacity (`stevne.tilgjengelige_baner` — max participants per pulje).
 * Fills fairly rather than greedily: 45 participants with cap 10 gives
 * [9, 9, 9, 9, 9], not [10, 10, 10, 10, 5]. The remainder goes to the LAST
 * groups, so with courts of 2–3 an odd-sized court always ends up last
 * (7 players, cap 3 → [2, 2, 3]).
 */
export function calcPuljeSizes(participantCount: number, maxPerPulje: number): number[] {
  if (!Number.isInteger(participantCount) || participantCount < 0) {
    throw new Error(`participantCount must be a non-negative integer, got ${participantCount}`);
  }
  if (!Number.isInteger(maxPerPulje) || maxPerPulje < 1) {
    throw new Error(`maxPerPulje must be a positive integer, got ${maxPerPulje}`);
  }
  if (participantCount === 0) return [];

  const puljeCount = Math.ceil(participantCount / maxPerPulje);
  const baseSize = Math.floor(participantCount / puljeCount);
  const remainder = participantCount % puljeCount;
  return Array.from(
    { length: puljeCount },
    (_, i) => baseSize + (i >= puljeCount - remainder ? 1 : 0),
  );
}
