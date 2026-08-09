import {
  buildMatchPlayerUpdates,
  losingSideKasterid,
  type MatchSideConfirm,
  type RoundScoreRow,
} from "@/services/kampService";

// The losing side follows from the SIDE totals buildMatchPlayerUpdates computes,
// so the stored score and the elimination can never disagree. The 3-player case
// (orderedKasterids[2]) bypasses this entirely.

// NOTE: a tie is impossible by game rules — a player must win by 2+ score_poeng.
// The tie fallback (which eliminates the side listed last) is therefore
// unreachable in valid game flow and is not tested here.

const P1_ID = 101;
const P2_ID = 202;
const P1_KASTERID = 101;
const P2_KASTERID = 201;

const p1: MatchSideConfirm = { playerIds: [P1_ID], kasterid: P1_KASTERID, baseScore: 0 };
const p2: MatchSideConfirm = { playerIds: [P2_ID], kasterid: P2_KASTERID, baseScore: 0 };

function row(spelarId: number, score: number | null): RoundScoreRow {
  return { kamp_spelar_id: spelarId, score, antall_ringer: 0 };
}

/** The elimination as confirmMatch derives it: build the updates, read the totals. */
function eliminated(roundData: RoundScoreRow[], sides: (MatchSideConfirm | null)[]): number | null {
  const { totals } = buildMatchPlayerUpdates({ roundData, sides });
  return losingSideKasterid(sides, totals);
}

describe("losingSideKasterid", () => {
  describe("winner/loser from omgang scores", () => {
    it("returns p2.kasterid when p1 has the higher total", () => {
      // p1: 6+6+4=16, p2: 6+4=10 → p2 eliminated
      const roundData = [row(P1_ID, 6), row(P2_ID, 6), row(P1_ID, 6), row(P2_ID, 4), row(P1_ID, 4)];
      expect(eliminated(roundData, [p1, p2])).toBe(P2_KASTERID);
    });

    it("returns p1.kasterid when p2 has the higher total", () => {
      // p1: 6+4=10, p2: 6+6+6=18 → p1 eliminated
      const roundData = [row(P1_ID, 6), row(P2_ID, 6), row(P1_ID, 4), row(P2_ID, 6), row(P2_ID, 6)];
      expect(eliminated(roundData, [p1, p2])).toBe(P1_KASTERID);
    });

    it("treats null score values as 0", () => {
      const roundData = [row(P1_ID, null), row(P2_ID, 6)];
      // p1 = 0, p2 = 6 → p1 eliminated
      expect(eliminated(roundData, [p1, p2])).toBe(P1_KASTERID);
    });
  });

  describe("baseScore fallback", () => {
    it("uses the directly entered scores when there are no omgang rows", () => {
      const res = eliminated(
        [],
        [
          { ...p1, baseScore: 20 },
          { ...p2, baseScore: 14 },
        ],
      );
      // p1=20 > p2=14 → p2 eliminated
      expect(res).toBe(P2_KASTERID);
    });
  });

  describe("missing side", () => {
    it("returns null when there is no second side", () => {
      expect(eliminated([], [p1, null])).toBeNull();
      expect(eliminated([], [null, null])).toBeNull();
    });
  });

  describe("Par/Mix — side totals sum both members (they alternate omgangar)", () => {
    // pair A: kamp_spelar ids 11 (posisjon 1) and 12; pair B: 21 and 22
    const parA: MatchSideConfirm = { playerIds: [11, 12], kasterid: 1, baseScore: 0 };
    const parB: MatchSideConfirm = { playerIds: [21, 22], kasterid: 3, baseScore: 0 };

    it("eliminates the pair with the lower SIDE total, not the lower rep total", () => {
      // A: rep 6+4=10, partner 3+1=4 → side 14
      // B: rep 6+6=12, partner 2+1=3 → side 15
      const roundData = [
        row(11, 6),
        row(21, 6), // omgang 1 (posisjon 1)
        row(12, 3),
        row(22, 2), // omgang 2 (posisjon 2)
        row(11, 4),
        row(21, 6), // omgang 3
        row(12, 1),
        row(22, 1), // omgang 4
      ];
      // A side = 14, B side = 15 → A eliminated
      expect(eliminated(roundData, [parA, parB])).toBe(1);
    });

    it("eliminates on HCP-adjusted totals, since HCP decides the match", () => {
      // raw: A 6, B 8 — with HCP 4 on A: A 10 → B eliminated
      const roundData = [row(11, 6), row(21, 8)];
      const { totals } = buildMatchPlayerUpdates({
        roundData,
        sides: [parA, parB],
        hcp: [4, 0],
      });
      expect(totals).toEqual([10, 8]);
      expect(losingSideKasterid([parA, parB], totals)).toBe(3);
    });
  });
});
