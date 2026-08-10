import { buildCascadeMatchups } from "@/services/kampGenereringInnledendeService";
import { maxCascadeRounds } from "@/utils/kastemetode";

describe("buildCascadeMatchups", () => {
  describe("match count", () => {
    it("returns one array per round", () => {
      expect(buildCascadeMatchups(24, 4).length).toBe(4);
      expect(buildCascadeMatchups(24, 12).length).toBe(12);
    });

    it("each round has Math.ceil(N/2) matches for even N", () => {
      const rounds = buildCascadeMatchups(24, 3);
      for (const round of rounds) {
        expect(round.length).toBe(12);
      }
    });

    it("each round has Math.ceil(N/2) matches for odd N", () => {
      const rounds = buildCascadeMatchups(7, 3);
      for (const round of rounds) {
        expect(round.length).toBe(4);
      }
    });
  });

  describe("group isolation", () => {
    it("p1Pos is always in group 1 (1..totalCourts)", () => {
      const N = 24;
      const totalCourts = 12;
      for (const round of buildCascadeMatchups(N, 12)) {
        for (const match of round) {
          expect(match.p1Pos).toBeGreaterThanOrEqual(1);
          expect(match.p1Pos).toBeLessThanOrEqual(totalCourts);
        }
      }
    });

    it("p2Pos (non-walkover) is always in group 2 (totalCourts+1..N)", () => {
      const N = 24;
      const totalCourts = 12;
      for (const round of buildCascadeMatchups(N, 12)) {
        for (const match of round) {
          if (!match.isWalkover) {
            expect(match.p2Pos).not.toBeNull();
            expect(match.p2Pos!).toBeGreaterThan(totalCourts);
            expect(match.p2Pos!).toBeLessThanOrEqual(N);
          }
        }
      }
    });

    it("every player position appears exactly once per round", () => {
      const N = 24;
      for (const round of buildCascadeMatchups(N, 4)) {
        const seen = new Set<number>();
        for (const match of round) {
          expect(seen.has(match.p1Pos)).toBe(false);
          seen.add(match.p1Pos);
          if (!match.isWalkover) {
            expect(seen.has(match.p2Pos!)).toBe(false);
            seen.add(match.p2Pos!);
          }
        }
        expect(seen.size).toBe(N);
      }
    });
  });

  describe("no rematches", () => {
    it("no (p1Pos, p2Pos) pair repeats across all rounds (N=24, 12 rounds)", () => {
      const seen = new Set<string>();
      for (const round of buildCascadeMatchups(24, 12)) {
        for (const match of round) {
          if (!match.isWalkover) {
            const key = `${match.p1Pos}-${match.p2Pos}`;
            expect(seen.has(key)).toBe(false);
            seen.add(key);
          }
        }
      }
    });

    function firstRematchRound(N: number, roundCount: number): number | null {
      const seen = new Set<string>();
      const rounds = buildCascadeMatchups(N, roundCount);
      for (let ri = 0; ri < rounds.length; ri++) {
        for (const match of rounds[ri]!) {
          if (match.isWalkover) continue;
          const key = `${match.p1Pos}-${match.p2Pos}`;
          if (seen.has(key)) return ri + 1;
          seen.add(key);
        }
      }
      return null;
    }

    it.each([6, 7, 8, 9, 10, 11, 12, 23, 24, 25])(
      "N=%i stays rematch-free through maxCascadeRounds and breaks one round later",
      (N) => {
        const cap = maxCascadeRounds(N);
        expect(firstRematchRound(N, cap)).toBeNull();
        expect(firstRematchRound(N, cap + 1)).toBe(cap + 1);
      },
    );

    it("round cap is ceil(N/2) — exactly half for even N, rounded up for odd", () => {
      expect(maxCascadeRounds(10)).toBe(5);
      expect(maxCascadeRounds(11)).toBe(6);
      expect(maxCascadeRounds(24)).toBe(12);
    });

    it("the first over-cap round repeats round 1 in full, not just partly", () => {
      const N = 10;
      const rounds = buildCascadeMatchups(N, maxCascadeRounds(N) + 1);
      const key = (m: { p1Pos: number; p2Pos: number | null }): string => `${m.p1Pos}-${m.p2Pos}`;
      expect(new Set(rounds[rounds.length - 1]!.map(key))).toEqual(new Set(rounds[0]!.map(key)));
    });
  });

  describe("walkover behavior", () => {
    it("odd N: exactly one walkover per round with p2Pos=null", () => {
      for (const round of buildCascadeMatchups(7, 3)) {
        const walkovers = round.filter((m) => m.isWalkover);
        expect(walkovers.length).toBe(1);
        expect(walkovers[0]!.p2Pos).toBeNull();
      }
    });

    it("even N: no walkovers in any round", () => {
      for (const round of buildCascadeMatchups(24, 12)) {
        expect(round.every((m) => !m.isWalkover)).toBe(true);
      }
    });
  });

  describe("spot checks (N=24)", () => {
    const rounds = buildCascadeMatchups(24, 4);

    it("round 1, court 1: p1Pos=1, p2Pos=13", () => {
      expect(rounds[0]![0]).toEqual({ p1Pos: 1, p2Pos: 13, isWalkover: false });
    });

    it("round 4, court 10: p1Pos=1, p2Pos=16", () => {
      expect(rounds[3]![9]).toEqual({ p1Pos: 1, p2Pos: 16, isWalkover: false });
    });
  });
});
