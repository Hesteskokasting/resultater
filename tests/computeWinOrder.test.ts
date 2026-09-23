import { describe, expect, it } from "vite-plus/test";
import { computeWinOrder } from "@/components/scoreboard/scoreboardData";
import type { MatchRoundRow } from "@/services/kampService";

const SIDES = [[1], [2], [3]];

/** One omgang per entry: the score each side threw, in SIDES order (null = did not throw). */
function rounds(omgangar: (number | null)[][]): MatchRoundRow[] {
  let id = 0;
  return omgangar.flatMap((scores, o) =>
    scores.flatMap((score, i) =>
      score == null
        ? []
        : [{ id: ++id, kamp_spelar_id: i + 1, omgang: o + 1, score, antall_ringer: 0 }],
    ),
  );
}

describe("computeWinOrder", () => {
  it("places sides 1-2-3 when they finish one by one", () => {
    // A 21 in omgang 4 (C 12); B 23 in omgang 6 (C 18)
    const r = rounds([
      [6, 6, 3],
      [6, 4, 3],
      [6, 6, 3],
      [3, 4, 3],
      [null, 2, 3],
      [null, 1, 3],
    ]);
    expect(computeWinOrder(r, SIDES).places).toEqual([1, 2, 3]);
  });

  it("gives two sides that finish together on equal totals a shared first place", () => {
    // Omgang 4: A 22, B 22, C 20
    const r = rounds([
      [6, 6, 6],
      [6, 6, 6],
      [6, 6, 6],
      [4, 4, 2],
    ]);
    const { order, places } = computeWinOrder(r, SIDES);
    expect(places).toEqual([1, 1, 3]);
    expect(order[2]).toBe(2);
  });

  it("ranks two sides that finish together by total", () => {
    // Omgang 4: A 21, B 22, C 19 — both are 2 clear of C, B has more
    const r = rounds([
      [6, 6, 6],
      [6, 6, 6],
      [6, 6, 6],
      [3, 4, 1],
    ]);
    expect(computeWinOrder(r, SIDES).places).toEqual([2, 1, 3]);
  });

  it("finishes no one while the last side is within 2 points", () => {
    // Omgang 4: A 22, B 22, C 21
    const r = rounds([
      [6, 6, 6],
      [6, 6, 6],
      [6, 6, 6],
      [4, 4, 3],
    ]);
    expect(computeWinOrder(r, SIDES).places).toEqual([null, null, null]);
  });
});
