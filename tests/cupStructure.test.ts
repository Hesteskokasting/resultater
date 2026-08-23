import { calcCupStructure } from "@/utils/kamp/cupStructure";

describe("calcCupStructure", () => {
  describe("round count", () => {
    it("returns empty for n=2 (only a final remains, no structure to generate)", () => {
      expect(calcCupStructure(2)).toEqual([]);
    });

    it("returns 1 round for n=4", () => {
      expect(calcCupStructure(4)).toHaveLength(1);
    });

    it("returns 2 rounds for n=8", () => {
      expect(calcCupStructure(8)).toHaveLength(2);
    });

    it("returns 3 rounds for n=9 (3-player groups throughout)", () => {
      expect(calcCupStructure(9)).toHaveLength(3);
    });
  });

  describe("round numbering", () => {
    it("labels rounds sequentially starting at 1", () => {
      const rounds = calcCupStructure(8);
      expect(rounds.map((r) => r.runde)).toEqual([1, 2]);
    });

    it("first round always has players equal to n", () => {
      expect(calcCupStructure(9)[0]!.players).toBe(9);
    });
  });

  describe("advancing chain", () => {
    it("each round's advancing equals the next round's players", () => {
      const rounds = calcCupStructure(9);
      for (let i = 0; i < rounds.length - 1; i++) {
        expect(rounds[i]!.advancing).toBe(rounds[i + 1]!.players);
      }
    });

    it("last round always advances to exactly 2 (for the final)", () => {
      for (const n of [4, 8, 9, 10]) {
        const rounds = calcCupStructure(n);
        expect(rounds[rounds.length - 1]!.advancing).toBe(2);
      }
    });
  });

  describe("walkover allocation", () => {
    it("round 1 has walkovers when the default oppsett requires them", () => {
      // n=10: gyldigeRunde1Oppsett(10) first entry is {walkovers:2, c3:0, c2:4}
      expect(calcCupStructure(10)[0]!.walkovers).toBe(2);
    });

    it("all rounds after round 1 have zero walkovers", () => {
      const rounds = calcCupStructure(10);
      for (const r of rounds.slice(1)) {
        expect(r.walkovers).toBe(0);
      }
    });

    it("round 1 has zero walkovers for clean group sizes like n=9", () => {
      expect(calcCupStructure(9)[0]!.walkovers).toBe(0);
    });
  });

  describe("group sizes (threePlayers and lanes)", () => {
    it("threePlayers is true when round uses 3-player matches", () => {
      // n=9: round 1 uses 3 groups of 3 players
      expect(calcCupStructure(9)[0]!.threePlayers).toBe(true);
    });

    it("threePlayers is false for pure 2-player rounds", () => {
      // n=8: all rounds are pure 2-player (bestSplit prefers 2-player for powers of 2)
      for (const r of calcCupStructure(8)) {
        expect(r.threePlayers).toBe(false);
      }
    });

    it("lanes equals c3+c2 (number of matches, not counting walkovers)", () => {
      // n=4: 2 semi-finals → 2 matches
      expect(calcCupStructure(4)[0]!.lanes).toBe(2);
      // n=9 round 1: 3 groups of 3 → 3 matches
      expect(calcCupStructure(9)[0]!.lanes).toBe(3);
    });

    it("players = lanes*3 + walkovers for all-3-player rounds", () => {
      // n=9: 9 = 3 matches * 3 players + 0 walkovers
      const r1 = calcCupStructure(9)[0]!;
      expect(r1.players).toBe(r1.lanes * 3 + r1.walkovers);
    });
  });

  describe("runde1 override", () => {
    it("uses the provided runde1 config and changes the resulting structure", () => {
      // Default for n=8: {walkovers:0, c3:0, c2:4} → advancing=4 → 2 rounds total
      // Override with:   {walkovers:2, c3:2, c2:0} → advancing=6 → 3 rounds total
      const rounds = calcCupStructure(8, { runde1: { walkovers: 2, c3: 2, c2: 0 } });
      expect(rounds[0]!.walkovers).toBe(2);
      expect(rounds[0]!.threePlayers).toBe(true);
      expect(rounds[0]!.lanes).toBe(2);
      expect(rounds).toHaveLength(3);
    });
  });
});
