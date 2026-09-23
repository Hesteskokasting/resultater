import { describe, expect, it } from "vite-plus/test";
import { pushPlayerRows } from "@/services/kampGenereringInnledendeService";

describe("pushPlayerRows", () => {
  it("gives a walkover pair 21 in total, like a single player", () => {
    const rows: Parameters<typeof pushPlayerRows>[0] = [];
    pushPlayerRows(rows, 1, [10, 11], 21, 2, 1);
    expect(rows.map((r) => r.score_poeng)).toEqual([21, 0]);
    expect(rows.map((r) => r.kamp_poeng)).toEqual([2, 2]);
    expect(rows.map((r) => r.kamp_plassering)).toEqual([1, 1]);
  });
});
