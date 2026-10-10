// ── Cup match write flows ─────────────────────────────────────────────────────
//
// A 2-side cup match is settled or corrected by one RPC that writes the side
// scores, the per-match placements, the bracket state and the confirm flag
// together. The ranking rule lives here so it can be tested on its own.
//
import {
  confirmMatch,
  toConfirmSide,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import { type MatchSide } from "@/utils/kamp/kamp";

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
 * one to advance and no one to eliminate. settleCupMatch refuses one.
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
 * Settles a 2-side cup match, or corrects one already confirmed: the loser is
 * out, the winner advances. The typed-in totals replace any omgang detail, and
 * everything is written in one transaction.
 */
export async function settleCupMatch(params: {
  kamp: FinalMatchRow;
  sides: MatchSide<FinalMatchPlayerKnown>[];
  s1: number;
  s2: number;
}): ReturnType<typeof confirmMatch> {
  const { kamp, sides, s1, s2 } = params;
  if (s1 === s2) return { error: new Error(CUP_TIE_MESSAGE) };

  const side1 = sides[0] ?? null;
  const side2 = sides[1] ?? null;
  const { winnerIds, loserIds } = cupRanking(side1, side2, s1, s2);

  return confirmMatch({
    kampId: kamp.id,
    sides: [toConfirmSide(side1, { baseScore: s1 }), toConfirmSide(side2, { baseScore: s2 })],
    outcome: {
      type: "cup-ranked",
      eliminatedIds: loserIds,
      advancingSides: winnerIds.length ? [winnerIds] : [],
      deleteRounds: true,
    },
  });
}
