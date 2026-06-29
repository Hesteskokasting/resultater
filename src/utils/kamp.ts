export interface PlayerScore {
  score_poeng?: number | null
  omgangar?: { score?: number | null }[] | null
}

export interface PlayerRings {
  antall_ringer?: number | null
  omgangar?: { antall_ringer?: number | null }[] | null
}

export interface PlayerWithThrowerId {
  kasterid: number
}

export function calcMatchPoints(s1: number, s2: number): [number, number] {
  if (s1 === s2) return [1.5, 1.5]
  if (s1 > s2) return [2, s2 >= 11 ? 1 : 0]
  return [s1 >= 11 ? 1 : 0, 2]
}

export interface MatchSide<T> {
  /** Representative row (posisjon 1) — carries the side's score and omgangar. */
  rep: T
  /** 1 member for Singel, 2 for Par/Mix, ordered by posisjon. */
  members: T[]
}

/**
 * Groups a match's kamp_spelar rows into sides by resultat.startnummer — the
 * competition-unit identity (unique per player in Singel, shared by both
 * players of a pair in Par/Mix). Sides are ordered by startnummer. Most
 * matches have two sides; 3-unit avsluttende matches have three.
 */
export function getAllMatchSides<T extends PlayerWithThrowerId>(
  spelarar: T[] | null | undefined,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number> = {},
): MatchSide<T>[] {
  const groups = new Map<number | string, T[]>()
  for (const sp of spelarar ?? []) {
    const key = startnrMap[sp.kasterid] ?? `kaster-${sp.kasterid}`
    const members = groups.get(key) ?? []
    members.push(sp)
    groups.set(key, members)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (typeof a === 'number' ? a : Infinity) - (typeof b === 'number' ? b : Infinity))
    .map(([, members]) => {
      members.sort((x, y) =>
        (posisjonMap[x.kasterid] ?? Infinity) - (posisjonMap[y.kasterid] ?? Infinity)
        || x.kasterid - y.kasterid,
      )
      // groups entries are created non-empty (push on insert), so members[0] always exists
      return { rep: members[0]!, members }
    })
}

/** Two-sided convenience wrapper around getAllMatchSides. */
export function getMatchSides<T extends PlayerWithThrowerId>(
  spelarar: T[] | null | undefined,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number> = {},
): [MatchSide<T> | null, MatchSide<T> | null] {
  const sides = getAllMatchSides(spelarar, startnrMap, posisjonMap)
  return [sides[0] ?? null, sides[1] ?? null]
}

/**
 * Which side member throws a given omgang. Members alternate in posisjon
 * order: posisjon 1 throws omgang 1, 3, 5…, posisjon 2 throws 2, 4, 6…
 * (round-robin, so it generalizes to N members). Singel: always the player.
 */
export function getOmgangThrowerId(sideSpelarIds: number[], omgang: number): number | null {
  if (!sideSpelarIds.length) return null
  return sideSpelarIds[(omgang - 1) % sideSpelarIds.length] ?? null
}

export interface PairableStandingRow {
  kasterid: number
  navn?: string | null
  startnummer?: number | null
  score_poeng?: number | null
}

/**
 * Collapses standings rows that share a startnummer (pair members) into one
 * row: the posisjon-1 member's values with both names joined and score_poeng
 * summed (each member carries only the omgangar they threw themselves). Rows
 * with a unique or missing startnummer pass through unchanged.
 */
export function groupStandingsByPair<T extends PairableStandingRow>(
  rows: T[],
  posisjonMap: Record<number, number> = {},
): T[] {
  const groups = new Map<number | string, T[]>()
  for (const row of rows) {
    const key = row.startnummer ?? `kaster-${row.kasterid}`
    const members = groups.get(key) ?? []
    members.push(row)
    groups.set(key, members)
  }

  return [...groups.values()].map(members => {
    // groups entries are created non-empty (push on insert), so members[0] always exists
    if (members.length === 1) return members[0]!
    members.sort((a, b) =>
      (posisjonMap[a.kasterid] ?? Infinity) - (posisjonMap[b.kasterid] ?? Infinity)
      || a.kasterid - b.kasterid,
    )
    return {
      ...members[0]!,
      navn: members.map(m => m.navn ?? `Spelar ${m.kasterid}`).join(' / '),
      score_poeng: members.reduce((sum, m) => sum + (m.score_poeng ?? 0), 0),
    }
  })
}

export function scoreForPlayer(sp: PlayerScore | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.score ?? 0), 0)
  return sp?.score_poeng ?? 0
}

export function ringsForPlayer(sp: PlayerRings | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0)
  return sp?.antall_ringer ?? 0
}

export function calcRingCount(score: number): number {
  return score === 6 ? 2 : (score === 3 || score === 4) ? 1 : 0
}
