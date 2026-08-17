// ── Cup match write flows ─────────────────────────────────────────────────────
//
// A 2-side cup match is settled or corrected in several steps that must agree
// with each other: the side scores in kamp_spelar, the per-match placements, the
// bracket state (runde_eliminert / final plassering) and the confirm flag. The
// steps live here rather than in a click handler so the ordering is in one place
// and the ranking rule can be tested on its own.
//
import {
  confirmMatch,
  toConfirmSide,
  updateWinnerLoser,
  updateMatchPlayerScoreFast,
  deleteMatchRounds,
  setMatchPlayerPlacements,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import { type MatchSide } from "@/utils/kamp";
import { logError } from "@/utils/logError";

export type FinalMatchPlayerKnown = FinalMatchPlayerRow & { kasterid: number };
export type CupSide = MatchSide<FinalMatchPlayerKnown> | null;

export interface CupRanking {
  winnerIds: number[];
  loserIds: number[];
  /** Every member of a side shares its kamp_plassering: winner 1, loser 2. */
  placements: { kasterid: number; plassering: number }[];
}

/**
 * A cup match has to produce a winner — a draw would leave the bracket with no
 * one to advance and no one to eliminate. Both entry points below refuse one.
 */
export const CUP_TIE_MESSAGE = "Ein cupkamp kan ikkje ende uavgjort.";

/** Highest side total wins. Equal totals are rejected before this is reached. */
export function cupRanking(side1: CupSide, side2: CupSide, s1: number, s2: number): CupRanking {
  const winner = s1 >= s2 ? side1 : side2;
  const loser = s1 >= s2 ? side2 : side1;
  const winnerIds = winner?.members.map((m) => m.kasterid) ?? [];
  const loserIds = loser?.members.map((m) => m.kasterid) ?? [];
  return {
    winnerIds,
    loserIds,
    placements: [
      ...winnerIds.map((kasterid) => ({ kasterid, plassering: 1 })),
      ...loserIds.map((kasterid) => ({ kasterid, plassering: 2 })),
    ],
  };
}

/**
 * Writes the side totals to each side's rep; partner rows are zeroed so the side
 * sum is not polluted by stale per-player values.
 */
export async function writeCupSideScores(
  side1: CupSide,
  side2: CupSide,
  s1: number,
  s2: number,
): Promise<{ error: unknown }> {
  const updates: Promise<{ error: unknown }>[] = [];
  if (side1?.rep.id) updates.push(updateMatchPlayerScoreFast(side1.rep.id, s1));
  if (side2?.rep.id) updates.push(updateMatchPlayerScoreFast(side2.rep.id, s2));
  for (const side of [side1, side2]) {
    for (const member of side?.members.slice(1) ?? []) {
      updates.push(updateMatchPlayerScoreFast(member.id, 0));
    }
  }
  try {
    const results = await Promise.all(updates);
    return { error: results.find((r) => r.error)?.error ?? null };
  } catch (e) {
    logError("cupKampService.writeCupSideScores", e);
    return { error: e };
  }
}

/** Settles an unconfirmed 2-side cup match: the loser is out, the winner advances. */
export async function settleCupMatch(params: {
  stevneId: number;
  kamp: FinalMatchRow;
  sides: MatchSide<FinalMatchPlayerKnown>[];
  s1: number;
  s2: number;
}): Promise<{ error: unknown }> {
  const { stevneId, kamp, sides, s1, s2 } = params;
  if (s1 === s2) return { error: new Error(CUP_TIE_MESSAGE) };

  const side1 = sides[0] ?? null;
  const side2 = sides[1] ?? null;
  const { winnerIds, loserIds } = cupRanking(side1, side2, s1, s2);

  return confirmMatch({
    kampId: kamp.id,
    sides: [toConfirmSide(side1, s1), toConfirmSide(side2, s2)],
    outcome: {
      type: "cup-ranked",
      stevneId,
      roundNumber: kamp.runde_nummer,
      roundName: kamp.runde_navn,
      allThrowerIds: sides.flatMap((s) => s.members.map((m) => m.kasterid)),
      eliminatedIds: loserIds,
      advancingSides: winnerIds.length ? [winnerIds] : [],
    },
  });
}

/** Which step of a rescore failed, so the caller can name it in its message. */
export type CupRescoreStep = "uavgjort" | "omgangar" | "score" | "plassering" | "bracket";

/**
 * Corrects an already-confirmed 2-side cup match. The typed-in total replaces any
 * omgang detail, and the placements and the bracket move with it — otherwise the
 * corrected score would contradict who went on.
 */
export async function rescoreCupMatch(params: {
  stevneId: number;
  kamp: FinalMatchRow;
  sides: MatchSide<FinalMatchPlayerKnown>[];
  s1: number;
  s2: number;
}): Promise<{ error: unknown; step: CupRescoreStep | null }> {
  const { stevneId, kamp, sides, s1, s2 } = params;
  // Checked before the omgangar are deleted — a rejected correction must leave
  // the stored match exactly as it was.
  if (s1 === s2) return { error: new Error(CUP_TIE_MESSAGE), step: "uavgjort" };

  const side1 = sides[0] ?? null;
  const side2 = sides[1] ?? null;
  const playerIds = sides.flatMap((s) => s.members.map((m) => m.id));

  if (playerIds.length) {
    const { error } = await deleteMatchRounds(playerIds);
    if (error) return { error, step: "omgangar" };
  }

  const { error: scoreError } = await writeCupSideScores(side1, side2, s1, s2);
  if (scoreError) return { error: scoreError, step: "score" };

  const { winnerIds, loserIds, placements } = cupRanking(side1, side2, s1, s2);

  const { error: placementError } = await setMatchPlayerPlacements(kamp.id, placements);
  if (placementError) return { error: placementError, step: "plassering" };

  const { error: bracketError } = await updateWinnerLoser({
    stevneId,
    roundNumber: kamp.runde_nummer,
    roundName: kamp.runde_navn,
    allThrowerIds: sides.flatMap((s) => s.members.map((m) => m.kasterid)),
    newWinnerIds: winnerIds,
    newLoserIds: loserIds,
  });
  if (bracketError) return { error: bracketError, step: "bracket" };

  return { error: null, step: null };
}
