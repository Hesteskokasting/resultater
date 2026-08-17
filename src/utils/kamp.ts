export interface PlayerScore {
  score_poeng?: number | null;
  omgangar?: { score?: number | null }[] | null;
}

export interface PlayerRings {
  antall_ringer?: number | null;
  omgangar?: { antall_ringer?: number | null }[] | null;
}

export interface PlayerWithThrowerId {
  kasterid: number;
}

export function calcMatchPoints(s1: number, s2: number): [number, number] {
  if (s1 === s2) return [1.5, 1.5];
  if (s1 > s2) return [2, s2 >= 11 ? 1 : 0];
  return [s1 >= 11 ? 1 : 0, 2];
}

export interface MatchSide<T> {
  /** Representative row (posisjon 1) — carries the side's score and omgangar. */
  rep: T;
  /** 1 member for Singel, 2 for Par/Mix, ordered by posisjon. */
  members: T[];
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
  const groups = new Map<number | string, T[]>();
  for (const sp of spelarar ?? []) {
    const key = startnrMap[sp.kasterid] ?? `kaster-${sp.kasterid}`;
    const members = groups.get(key) ?? [];
    members.push(sp);
    groups.set(key, members);
  }

  return [...groups.entries()]
    .sort(
      ([a], [b]) => (typeof a === "number" ? a : Infinity) - (typeof b === "number" ? b : Infinity),
    )
    .map(([, members]) => {
      members.sort(
        (x, y) =>
          (posisjonMap[x.kasterid] ?? Infinity) - (posisjonMap[y.kasterid] ?? Infinity) ||
          x.kasterid - y.kasterid,
      );
      // groups entries are created non-empty (push on insert), so members[0] always exists
      return { rep: members[0]!, members };
    });
}

/** Two-sided convenience wrapper around getAllMatchSides. */
export function getMatchSides<T extends PlayerWithThrowerId>(
  spelarar: T[] | null | undefined,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number> = {},
): [MatchSide<T> | null, MatchSide<T> | null] {
  const sides = getAllMatchSides(spelarar, startnrMap, posisjonMap);
  return [sides[0] ?? null, sides[1] ?? null];
}

/**
 * Which side member throws a given omgang. Members alternate in posisjon
 * order: posisjon 1 throws omgang 1, 3, 5…, posisjon 2 throws 2, 4, 6…
 * (round-robin, so it generalizes to N members). Singel: always the player.
 */
export function getOmgangThrowerId(sideSpelarIds: number[], omgang: number): number | null {
  if (!sideSpelarIds.length) return null;
  return sideSpelarIds[(omgang - 1) % sideSpelarIds.length] ?? null;
}

/** 0-based index of the side that starts a given omgang (2 omgangar per side). */
export function getOmgangStarterIndex(omgang: number, numSides: number): number {
  return Math.floor((omgang - 1) / 2) % numSides;
}

export interface PairableStandingRow {
  kasterid: number;
  navn?: string | null;
  startnummer?: number | null;
  score_poeng?: number | null;
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
  const groups = new Map<number | string, T[]>();
  for (const row of rows) {
    const key = row.startnummer ?? `kaster-${row.kasterid}`;
    const members = groups.get(key) ?? [];
    members.push(row);
    groups.set(key, members);
  }

  return [...groups.values()].map((members) => {
    // groups entries are created non-empty (push on insert), so members[0] always exists
    if (members.length === 1) return members[0]!;
    members.sort(
      (a, b) =>
        (posisjonMap[a.kasterid] ?? Infinity) - (posisjonMap[b.kasterid] ?? Infinity) ||
        a.kasterid - b.kasterid,
    );
    return {
      ...members[0]!,
      navn: members.map((m) => m.navn ?? `Spelar ${m.kasterid}`).join(" / "),
      score_poeng: members.reduce((sum, m) => sum + (m.score_poeng ?? 0), 0),
    };
  });
}

/**
 * Live score of a match still being played: the omgang rows are the truth while
 * they are being registered, with the directly entered score_poeng as fallback.
 * Confirmed matches must use matchScoreForPlayer/sideScore instead.
 */
export function scoreForPlayer(sp: PlayerScore | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.score ?? 0), 0);
  return sp?.score_poeng ?? 0;
}

/**
 * A player's score in one match. Once the match is confirmed the stored
 * score_poeng is authoritative — it includes HCP and survives omgang rows that
 * were left behind half-finished. Before that, the omgangar are the live truth.
 *
 * Falls back to the omgangar when a confirmed match has no stored score: cup
 * matches confirmed before the score-persisting confirm path existed keep their
 * score only in kamp_omgang.
 */
export function matchScoreForPlayer(
  sp: PlayerScore | null | undefined,
  isConfirmed: boolean,
): number {
  if (!isConfirmed) return scoreForPlayer(sp);
  const stored = sp?.score_poeng ?? 0;
  return stored > 0 ? stored : scoreForPlayer(sp);
}

/** Side total: each member carries only the omgangar they threw themselves. */
export function sideScore<T extends PlayerScore>(
  side: MatchSide<T> | null | undefined,
  isConfirmed: boolean,
): number {
  return side?.members.reduce((sum, m) => sum + matchScoreForPlayer(m, isConfirmed), 0) ?? 0;
}

export function ringsForPlayer(sp: PlayerRings | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0);
  return sp?.antall_ringer ?? 0;
}

export function calcRingCount(score: number): number {
  return score === 6 ? 2 : score === 3 || score === 4 ? 1 : 0;
}

// ── Scoreboard rules ──────────────────────────────────────────────────────────
// ponytail: these four have a single caller (Scoreboard) and describe interaction
// rather than the data model, unlike the rest of this file. Split into
// utils/scoreboardRules.ts if the section grows past a screen.

/** Score that ends a match. */
const WIN_SCORE = 21;

/** Scored without a ringer. Landing one closes the omgang for everyone else. */
const NON_RING_POINTS = [1, 2, 4];

/** Scored with a ringer. Only another ringer can answer it. */
const RING_POINTS = [3, 6];

/**
 * Whether a total wins. `bestOpponent` is whoever the caller measures against —
 * the other side in a 2-player match, the weakest still-active player in a
 * 3-player one. Innledende plays to 21 flat; every other fase needs two clear
 * points.
 */
export function hasWon(total: number, bestOpponent: number, requireTwoAhead: boolean): boolean {
  return total >= WIN_SCORE && (!requireTwoAhead || total - bestOpponent >= 2);
}

/** Whether a 2-player match is over on score alone (walkover/confirm are separate). */
export function matchIsDecided(t1: number, t2: number, fase: string | null | undefined): boolean {
  const twoAhead = fase !== "innledende";
  return hasWon(t1, t2, twoAhead) || hasWon(t2, t1, twoAhead);
}

/**
 * Index of a still-active player who has finished, or null. Measured against the
 * weakest remaining player, so the field empties from the top as each one lands.
 * A single remaining player never finishes this way — the caller places them.
 */
export function findFinishedPlayer(active: Iterable<number>, totals: number[]): number | null {
  const idxar = [...active];
  for (const i of idxar) {
    const others = idxar.filter((j) => j !== i);
    if (!others.length) continue;
    const weakest = Math.min(...others.map((j) => totals[j] ?? 0));
    if (hasWon(totals[i] ?? 0, weakest, true)) return i;
  }
  return null;
}

/**
 * Which point buttons each player cannot press, given what is already selected
 * this omgang. One selection locks the rest: a non-ring score closes the omgang
 * for everyone who has not answered, a ringer still allows another ringer. A
 * player's own selection stays pressable so it can be undone.
 *
 * `activeIdxar` defaults to every player; the 3-player board passes only those
 * still in the match, leaving the finished ones with no locks at all.
 */
export function pointButtonLocks(
  values: (number | null)[],
  pointValues: number[],
  activeIdxar: number[] = values.map((_, i) => i),
): Set<number>[] {
  const locks = values.map(() => new Set<number>());

  const selected = activeIdxar.map((i) => values[i]).filter((v): v is number => v != null);
  if (!selected.length) return locks;

  const hasNonRing = selected.some((v) => NON_RING_POINTS.includes(v));
  const hasRing = selected.some((v) => RING_POINTS.includes(v));

  for (const i of activeIdxar) {
    const lock = locks[i];
    if (!lock) continue;
    const own = values[i];
    if (own != null) {
      pointValues.forEach((n) => {
        if (n !== own) lock.add(n);
      });
    } else if (hasNonRing) {
      pointValues.forEach((n) => lock.add(n));
    } else if (hasRing) {
      NON_RING_POINTS.forEach((n) => lock.add(n));
    }
  }
  return locks;
}
