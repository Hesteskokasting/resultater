import { sumOpponentScore } from "@/pages/stevne/stevne-stats";

// score_poeng totals are accumulated sums, not per-omgang values, so they are
// not restricted to KAMP_POINT_VALUES.

describe("sumOpponentScore", () => {
  describe("Singel (posisjon null)", () => {
    const noPos = new Map<number, number>();

    it("2-player match: opponent is the other player", () => {
      const spelarar = [
        { kasterid: 1, score_poeng: 21 },
        { kasterid: 2, score_poeng: 14 },
      ];
      expect(sumOpponentScore({ kasterid: 1 }, spelarar, noPos)).toBe(14);
      expect(sumOpponentScore({ kasterid: 2 }, spelarar, noPos)).toBe(21);
    });

    it("3-player match: sums both other players", () => {
      const spelarar = [
        { kasterid: 1, score_poeng: 21 },
        { kasterid: 2, score_poeng: 18 },
        { kasterid: 3, score_poeng: 15 },
      ];
      expect(sumOpponentScore({ kasterid: 1 }, spelarar, noPos)).toBe(33); // 18 + 15
    });
  });

  describe("Par/Mix (posisjon 1 vs 1, 2 vs 2)", () => {
    // side A: kasterid 1 (pos 1), kasterid 2 (pos 2)
    // side B: kasterid 3 (pos 1), kasterid 4 (pos 2)
    const posMap = new Map<number, number>([
      [1, 1],
      [2, 2],
      [3, 1],
      [4, 2],
    ]);
    const spelarar = [
      { kasterid: 1, score_poeng: 12 },
      { kasterid: 2, score_poeng: 9 },
      { kasterid: 3, score_poeng: 10 },
      { kasterid: 4, score_poeng: 14 },
    ];

    it("posisjon-1 player is compared only to the other posisjon-1 player", () => {
      // kasterid 1 (pos 1) vs kasterid 3 (pos 1) — NOT partner (2) or self
      expect(sumOpponentScore({ kasterid: 1 }, spelarar, posMap)).toBe(10);
    });

    it("posisjon-2 player is compared only to the other posisjon-2 player", () => {
      // kasterid 2 (pos 2) vs kasterid 4 (pos 2)
      expect(sumOpponentScore({ kasterid: 2 }, spelarar, posMap)).toBe(14);
    });

    it("excludes the own partner (different posisjon, same side)", () => {
      // kasterid 4 (pos 2) must NOT count partner 3 (pos 1) — only opponent 2 (pos 2)
      expect(sumOpponentScore({ kasterid: 4 }, spelarar, posMap)).toBe(9);
    });
  });

  describe("3-pair Par match (6 players, same posisjon across three sides)", () => {
    // three posisjon-1 players: 1, 3, 5 — three posisjon-2 players: 2, 4, 6
    const posMap = new Map<number, number>([
      [1, 1],
      [2, 2],
      [3, 1],
      [4, 2],
      [5, 1],
      [6, 2],
    ]);
    const spelarar = [
      { kasterid: 1, score_poeng: 10 },
      { kasterid: 2, score_poeng: 8 },
      { kasterid: 3, score_poeng: 7 },
      { kasterid: 4, score_poeng: 9 },
      { kasterid: 5, score_poeng: 6 },
      { kasterid: 6, score_poeng: 5 },
    ];

    it("sums the two other same-posisjon players", () => {
      // kasterid 1 (pos 1) vs 3 and 5 → 7 + 6
      expect(sumOpponentScore({ kasterid: 1 }, spelarar, posMap)).toBe(13);
    });
  });
});
