// X-kast/Kongelag omgang scoring: 4 shoes, each scoring 5 (ringer)
// or 0–3 by distance from the stake. Mirrors the database CHECKs in
// 20260722192417 + 20260722201248 so bad entries are caught in the UI
// before a rejected insert.

export const SHOES_PER_OMGANG = 4
export const RINGER_POENG = 5
export const MAX_SHOE_POENG_WITHOUT_RINGER = 3
export const OMGANG_MAX_POENG = SHOES_PER_OMGANG * RINGER_POENG
export const OMGANG_MAX_RINGER = SHOES_PER_OMGANG

/** Valid ringer counts for a given omgang total: r must satisfy 5r ≤ poeng ≤ 5r + 3·(4−r). */
export function validRingerRange(poeng: number): { min: number; max: number } {
  const min = Math.max(0, Math.ceil((poeng - MAX_SHOE_POENG_WITHOUT_RINGER * SHOES_PER_OMGANG) / (RINGER_POENG - MAX_SHOE_POENG_WITHOUT_RINGER)))
  const max = Math.min(OMGANG_MAX_RINGER, Math.floor(poeng / RINGER_POENG))
  return { min, max }
}

/**
 * Ring choices the numberpad should offer for a poengsum: `allowed` counts
 * (empty = the poengsum itself is impossible, e.g. 19), and `autoSelected`
 * when only one count is possible (e.g. poeng 3 → 0 ringer).
 */
export function ringOptions(poeng: number): { allowed: number[]; autoSelected: number | null } {
  const { min, max } = validRingerRange(poeng)
  if (min > max) return { allowed: [], autoSelected: null }
  const allowed = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return { allowed, autoSelected: allowed.length === 1 ? allowed[0]! : null }
}

export function isValidOmgangEntry(poeng: number, antallRinger: number): boolean {
  if (!Number.isInteger(poeng) || !Number.isInteger(antallRinger)) return false
  if (poeng < 0 || poeng > OMGANG_MAX_POENG) return false
  if (antallRinger < 0 || antallRinger > OMGANG_MAX_RINGER) return false
  const { min, max } = validRingerRange(poeng)
  return antallRinger >= min && antallRinger <= max
}
