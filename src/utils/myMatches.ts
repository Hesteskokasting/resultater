import { getAllMatchSides, sideScore, type PlayerScore } from "@/utils/kamp";

export interface MyMatchPlayer extends PlayerScore {
  kasterid?: number | null;
  /** The joined kaster row — absent on a bye side. */
  kaster?: unknown;
  kamp_plassering?: number | null;
}

export interface MyMatch<T extends MyMatchPlayer = MyMatchPlayer> {
  stevneid?: number | null;
  er_bekreftet?: boolean | null;
  er_walkover?: boolean | null;
  er_tre_spelarar?: boolean | null;
  spelarar?: T[] | null;
}

type Identified<T> = T & { kasterid: number };

/**
 * The match's players grouped into sides by startnummer, with my own side first.
 * startNrMap spans several stevner (see getStartNumbersForTournaments), so it is
 * narrowed to this match's stevne before grouping.
 */
export function matchSides<T extends MyMatchPlayer>(
  match: MyMatch<T> | null | undefined,
  throwerId: number,
  startNrMap: Record<string, number>,
): { mine: Identified<T>[]; others: Identified<T>[][] } {
  const players = (match?.spelarar ?? []).filter((s): s is Identified<T> => s.kasterid != null);
  const localMap: Record<number, number> = {};
  for (const s of players) {
    const nr = match?.stevneid != null ? startNrMap[`${match.stevneid}:${s.kasterid}`] : undefined;
    if (nr != null) localMap[s.kasterid] = nr;
  }
  const sides = getAllMatchSides(players, localMap);
  const mineIdx = sides.findIndex((side) => side.members.some((m) => m.kasterid === throwerId));
  return {
    mine: mineIdx === -1 ? [] : (sides[mineIdx]?.members ?? []),
    others: sides.filter((_, i) => i !== mineIdx).map((side) => side.members),
  };
}

/** A walkover's opponent is a bye: either no side at all, or a row with no kaster. */
export function isByeSide(members: MyMatchPlayer[] | undefined): boolean {
  return !members?.length || members.every((m) => m.kaster == null);
}

function sideTotal(members: MyMatchPlayer[], isConfirmed: boolean): number {
  return sideScore({ rep: members[0]!, members }, isConfirmed);
}

export type MatchOutcome =
  | { kind: "walkover" }
  | { kind: "placement"; placement: number }
  | { kind: "score"; me: number; them: number; confirmed: boolean }
  | { kind: "unknown" };

/**
 * How the match ended for one thrower. A walkover is only ever generated for an
 * odd entry count, so the opponent is a bye and the thrower always advances — it
 * is never played. A 3-side match is decided by placement, not by score.
 * Anything the data cannot answer is "unknown".
 */
export function matchOutcome<T extends MyMatchPlayer>(
  match: MyMatch<T> | null | undefined,
  throwerId: number,
  startNrMap: Record<string, number>,
): MatchOutcome {
  const confirmed = match?.er_bekreftet ?? false;
  const { mine, others } = matchSides(match, throwerId, startNrMap);

  if (match?.er_walkover) return { kind: "walkover" };

  if (confirmed && (match?.er_tre_spelarar || others.length > 1)) {
    const placement = mine.find((m) => m.kasterid === throwerId)?.kamp_plassering;
    return placement == null ? { kind: "unknown" } : { kind: "placement", placement };
  }

  const opponents = others[0];
  if (!mine.length || !opponents?.length) return { kind: "unknown" };
  return {
    kind: "score",
    me: sideTotal(mine, confirmed),
    them: sideTotal(opponents, confirmed),
    confirmed,
  };
}
