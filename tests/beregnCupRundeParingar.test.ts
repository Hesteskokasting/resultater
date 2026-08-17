import { calcCupRoundPairings } from "@/utils/kastemetoder-logikk";
import type { CupPairing } from "@/types";

function players(n: number) {
  return Array.from({ length: n }, (_, i) => ({ kasterid: i + 1, plassering: i + 1 }));
}

// Preserves array order — makes seeding tests deterministic and reproducible
const identity = <T>(arr: T[]): T[] => [...arr];

function flatIds(parings: CupPairing[]): number[] {
  return parings.flatMap((p) => p.players as number[]).sort((a, b) => a - b);
}

describe("calcCupRoundPairings", () => {
  describe("player coverage", () => {
    it("every player appears exactly once — 4 players, 2-player matches", () => {
      expect(flatIds(calcCupRoundPairings(players(4)))).toEqual([1, 2, 3, 4]);
    });

    it("every player appears exactly once — 9 players, 3-player matches", () => {
      expect(flatIds(calcCupRoundPairings(players(9)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("every player appears exactly once when seeding is disabled", () => {
      expect(flatIds(calcCupRoundPairings(players(9), { medSeeding: false }))).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
    });

    it("every player appears exactly once when round 1 has walkovers", () => {
      // 4 players, isRunde1=true: 1 walkover + 1 three-player match = all 4 players
      expect(flatIds(calcCupRoundPairings(players(4), { isRunde1: true }))).toEqual([1, 2, 3, 4]);
    });
  });

  describe("match size constraints", () => {
    it("no non-walkover match has fewer than 2 players", () => {
      for (const n of [4, 6, 8, 9]) {
        const parings = calcCupRoundPairings(players(n));
        for (const p of parings) {
          if (!p.isWalkover) expect(p.players.length).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it("no match has more than 3 players", () => {
      for (const n of [4, 6, 8, 9, 10]) {
        const parings = calcCupRoundPairings(players(n));
        for (const p of parings) expect(p.players.length).toBeLessThanOrEqual(3);
      }
    });

    it("isThreePlayers is true if and only if the match has 3 players", () => {
      const parings = calcCupRoundPairings(players(9));
      for (const p of parings.filter((m) => !m.isWalkover)) {
        expect(p.isThreePlayers).toBe(p.players.length === 3);
      }
    });
  });

  describe("seeding (medSeeding: true)", () => {
    it("places top-pool and bottom-pool players in separate matches — 4 players, 2 lanes", () => {
      // pool1=[1,2], pool2=[3,4]; identity shuffle preserves order
      // → match 0: [p1[0]=1, p2[0]=3], match 1: [p1[1]=2, p2[1]=4]
      const parings = calcCupRoundPairings(players(4), { medSeeding: true, shuffleFn: identity });
      const matchIds = parings
        .filter((p) => !p.isWalkover)
        .map((p) => (p.players as number[]).sort((a, b) => a - b));
      expect(matchIds).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });

    it("gives each 3-player match one player from each seed pool — 9 players", () => {
      // pool1=[1,2,3], pool2=[4,5,6], pool3=[7,8,9]; identity shuffle preserves order
      // → match 0: [1,4,7], match 1: [2,5,8], match 2: [3,6,9]
      const parings = calcCupRoundPairings(players(9), { medSeeding: true, shuffleFn: identity });
      const matchIds = parings
        .filter((p) => !p.isWalkover)
        .map((p) => (p.players as number[]).sort((a, b) => a - b));
      expect(matchIds).toEqual([
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ]);
    });

    it("without seeding, assigns players into matches in array order", () => {
      // identity shuffle on flat [1,2,3,4] → matches [1,2] and [3,4]
      const parings = calcCupRoundPairings(players(4), { medSeeding: false, shuffleFn: identity });
      const matchIds = parings.filter((p) => !p.isWalkover).map((p) => p.players as number[]);
      expect(matchIds).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });

  describe("walkovers", () => {
    it("produces no walkovers by default (isRunde1 defaults to false)", () => {
      const parings = calcCupRoundPairings(players(4));
      expect(parings.every((p) => !p.isWalkover)).toBe(true);
    });

    it("top seed gets a walkover in round 1 when player count % 3 === 1", () => {
      // 4 players: 4 % 3 = 1 → 1 walkover for kasterid 1 (best plassering)
      const parings = calcCupRoundPairings(players(4), { isRunde1: true });
      const walkovers = parings.filter((p) => p.isWalkover);
      expect(walkovers).toHaveLength(1);
      expect(walkovers[0]!.players).toEqual([1]);
    });

    it("walkover entries always contain exactly 1 player", () => {
      const parings = calcCupRoundPairings(players(4), { isRunde1: true });
      for (const p of parings.filter((m) => m.isWalkover)) {
        expect(p.players).toHaveLength(1);
      }
    });

    it("a 2-player group plays one match instead of two walkovers", () => {
      for (const opts of [{}, { runde1Oppsett: { walkovers: 0, c3: 0, c2: 1 } }]) {
        const parings = calcCupRoundPairings(players(2), { isRunde1: true, ...opts });
        expect(parings).toHaveLength(1);
        expect(parings[0]!.isWalkover).toBe(false);
        expect(parings[0]!.players).toHaveLength(2);
      }
    });

    it("runde1Oppsett.walkovers controls the number of walkovers", () => {
      // 10 players, 2 walkovers: the 2 top seeds walk over
      const parings = calcCupRoundPairings(players(10), {
        isRunde1: true,
        runde1Oppsett: { walkovers: 2, c3: 0, c2: 4 },
      });
      const walkovers = parings.filter((p) => p.isWalkover);
      expect(walkovers).toHaveLength(2);
      const walkoverIds = walkovers.flatMap((p) => p.players as number[]).sort((a, b) => a - b);
      expect(walkoverIds).toEqual([1, 2]);
    });
  });
});
