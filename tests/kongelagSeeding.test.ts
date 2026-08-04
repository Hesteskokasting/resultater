import { describe, expect, it } from "vite-plus/test";
import {
  orderKongelagSeeding,
  buildKongelagCourts,
  type KongelagSeedingRow,
} from "@/utils/kongelagSeeding";

function xkastRow(kasterid: number, poeng: number, ringer: number): KongelagSeedingRow {
  return {
    kasterid,
    poeng_xkast: poeng,
    antall_ring_xkast: ringer,
    kamp_poeng_innl: null,
    score_poeng_innl: null,
  };
}

function kampRow(kasterid: number, kampPoeng: number, scorePoeng: number): KongelagSeedingRow {
  return {
    kasterid,
    poeng_xkast: null,
    antall_ring_xkast: null,
    kamp_poeng_innl: kampPoeng,
    score_poeng_innl: scorePoeng,
  };
}

describe("orderKongelagSeeding", () => {
  it("ranks X-kast innledende by poeng, then ringere", () => {
    const rows = [xkastRow(1, 180, 20), xkastRow(2, 220, 15), xkastRow(3, 180, 25)];
    expect(orderKongelagSeeding(rows)).toEqual([2, 3, 1]);
  });

  it("ranks kamp innledende by kamp_poeng, then score_poeng", () => {
    // kamp_poeng_innl accumulates win=2/draw=1/loss=0 per match; 1.5 comes from a draw split
    const rows = [kampRow(1, 4, 63), kampRow(2, 6, 58), kampRow(3, 4, 71), kampRow(4, 1.5, 40)];
    expect(orderKongelagSeeding(rows)).toEqual([2, 3, 1, 4]);
  });

  it("uses X-kast columns when any row has them (mixed nulls sort last)", () => {
    const rows = [xkastRow(1, 150, 12), { ...kampRow(2, 8, 80), poeng_xkast: null }];
    expect(orderKongelagSeeding(rows)).toEqual([1, 2]);
  });

  it("does not mutate the input array", () => {
    const rows = [xkastRow(1, 100, 5), xkastRow(2, 200, 10)];
    orderKongelagSeeding(rows);
    expect(rows[0]?.kasterid).toBe(1);
  });
});

describe("buildKongelagCourts", () => {
  it("splits into two waves when lanes is null — half the field scores for the other half", () => {
    const courts = buildKongelagCourts([5, 3, 8], null);
    expect(courts).toEqual([
      { pulje: 1, baneNummer: 1, kasterids: [5] },
      { pulje: 2, baneNummer: 1, kasterids: [3] },
      { pulje: 2, baneNummer: 2, kasterids: [8] },
    ]);
  });

  it("splits into two waves even when the lanes fit the whole field", () => {
    const kasterids = [1, 2, 3, 4, 5, 6, 7, 8];
    const courts = buildKongelagCourts(kasterids, 8);
    expect(courts.map((c) => c.pulje)).toEqual([1, 1, 1, 1, 2, 2, 2, 2]);
    expect(courts.flatMap((c) => c.kasterids)).toEqual(kasterids);
  });

  it("keeps at least two puljer for an odd field", () => {
    const puljer = new Set(buildKongelagCourts([1, 2, 3, 4, 5], null).map((c) => c.pulje));
    expect([...puljer]).toEqual([1, 2]);
  });

  it("still honours a lane cap stricter than half the field", () => {
    const courts = buildKongelagCourts([1, 2, 3, 4, 5, 6], 2);
    expect(courts.map((c) => c.pulje)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it("leaves a single-player field in one pulje — nobody is left to score", () => {
    expect(buildKongelagCourts([7], null)).toEqual([{ pulje: 1, baneNummer: 1, kasterids: [7] }]);
  });

  it("splits two players into one pulje each", () => {
    expect(buildKongelagCourts([1, 2], null).map((c) => c.pulje)).toEqual([1, 2]);
  });

  it("splits into fair puljer capped by lanes, best players in pulje 1", () => {
    const kasterids = [1, 2, 3, 4, 5, 6, 7];
    const courts = buildKongelagCourts(kasterids, 4);
    expect(courts.map((c) => c.pulje)).toEqual([1, 1, 1, 2, 2, 2, 2]);
    expect(courts.map((c) => c.baneNummer)).toEqual([1, 2, 3, 1, 2, 3, 4]);
    expect(courts.flatMap((c) => c.kasterids)).toEqual(kasterids);
  });

  it("gives every court exactly one player", () => {
    for (const court of buildKongelagCourts([1, 2, 3, 4, 5], 2)) {
      expect(court.kasterids).toHaveLength(1);
    }
  });

  it("returns empty for no players", () => {
    expect(buildKongelagCourts([], 6)).toEqual([]);
  });
});
