// X-kast/Kongelag omgang scoring: 4 shoes, each scoring 5 (ringer)
// or 0–3 by distance from the stake. Mirrors the database CHECKs in
// 20260722192417 + 20260722201248 so bad entries are caught in the UI
// before a rejected insert.

export const SHOES_PER_OMGANG = 4;
export const RINGER_POENG = 5;
export const MAX_SHOE_POENG_WITHOUT_RINGER = 3;
export const OMGANG_MAX_POENG = SHOES_PER_OMGANG * RINGER_POENG;
export const OMGANG_MAX_RINGER = SHOES_PER_OMGANG;

/**
 * Valid ringer counts for a poeng total over `shoes` shoes: r must satisfy
 * 5r ≤ poeng ≤ 5r + 3·(shoes − r). Defaults to one omgang (4 shoes); pass a
 * larger shoe count for aggregate/total validation.
 */
export function validRingerRange(
  poeng: number,
  shoes: number = SHOES_PER_OMGANG,
): { min: number; max: number } {
  const min = Math.max(
    0,
    Math.ceil(
      (poeng - MAX_SHOE_POENG_WITHOUT_RINGER * shoes) /
        (RINGER_POENG - MAX_SHOE_POENG_WITHOUT_RINGER),
    ),
  );
  const max = Math.min(shoes, Math.floor(poeng / RINGER_POENG));
  return { min, max };
}

/**
 * Ring choices the numberpad should offer for a poengsum: `allowed` counts
 * (empty = the poengsum itself is impossible, e.g. 19), and `autoSelected`
 * when only one count is possible (e.g. poeng 3 → 0 ringer).
 */
export function ringOptions(poeng: number): { allowed: number[]; autoSelected: number | null } {
  const { min, max } = validRingerRange(poeng);
  if (min > max) return { allowed: [], autoSelected: null };
  const allowed = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return { allowed, autoSelected: allowed.length === 1 ? allowed[0]! : null };
}

export function isValidOmgangEntry(poeng: number, antallRinger: number): boolean {
  if (!Number.isInteger(poeng) || !Number.isInteger(antallRinger)) return false;
  if (poeng < 0 || poeng > OMGANG_MAX_POENG) return false;
  if (antallRinger < 0 || antallRinger > OMGANG_MAX_RINGER) return false;
  const { min, max } = validRingerRange(poeng);
  return antallRinger >= min && antallRinger <= max;
}

/** Total shoes thrown across a whole X-kast/Kongelag (4 shoes per omgang). */
export function totalShoes(antallOmganger: number): number {
  return SHOES_PER_OMGANG * antallOmganger;
}

/** Max poeng / ringere for a full X-kast/Kongelag total (e.g. Minimatch 15 → 300 / 60). */
export function totalMaxPoeng(antallOmganger: number): number {
  return totalShoes(antallOmganger) * RINGER_POENG;
}
export function totalMaxRinger(antallOmganger: number): number {
  return totalShoes(antallOmganger);
}

/** Aggregate-level validity for a directly-entered total, same shoe model at total scale. */
export function isValidTotalEntry(
  poeng: number,
  antallRinger: number,
  antallOmganger: number,
): boolean {
  if (!Number.isInteger(poeng) || !Number.isInteger(antallRinger)) return false;
  const shoes = totalShoes(antallOmganger);
  if (poeng < 0 || poeng > totalMaxPoeng(antallOmganger)) return false;
  if (antallRinger < 0 || antallRinger > totalMaxRinger(antallOmganger)) return false;
  const { min, max } = validRingerRange(poeng, shoes);
  return antallRinger >= min && antallRinger <= max;
}
