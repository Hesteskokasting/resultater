import { describe, expect, it } from "vite-plus/test";
import { buildXkastStanding, compareOmgangArrays } from "@/utils/xkastStilling";
import type { XkastStandingParticipant } from "@/utils/xkastStilling";

// Omgang values follow the X-kast shoe model (4 shoes at 5/3/2/1/0):
// every (poeng, ringer) pair below satisfies isValidOmgangEntry.
function participant(
  kasterid: number,
  navn: string,
  omganger: [poeng: number, ringer: number | null][],
): XkastStandingParticipant {
  return {
    kasterid,
    navn,
    omganger: omganger.map(([poeng, antall_ringer]) => ({ poeng, antall_ringer })),
  };
}

describe("compareOmgangArrays", () => {
  it("ranks the higher best omgang first", () => {
    expect(compareOmgangArrays([20, 5], [15, 15])).toBeLessThan(0);
  });

  it("falls through equal entries to the next level", () => {
    expect(compareOmgangArrays([15, 10], [15, 12])).toBeGreaterThan(0);
  });

  it("treats a missing omgang as worse than a recorded 0", () => {
    expect(compareOmgangArrays([15, 0], [15])).toBeLessThan(0);
  });

  it("returns 0 for identical arrays", () => {
    expect(compareOmgangArrays([12, 5, 0], [12, 5, 0])).toBe(0);
  });
});

describe("buildXkastStanding", () => {
  it("ranks by total poeng first", () => {
    const rows = buildXkastStanding([
      participant(1, "Lav", [
        [5, 1],
        [3, 0],
      ]),
      participant(2, "Hog", [
        [12, 2],
        [10, 2],
      ]),
    ]);
    expect(rows.map((r) => r.kasterid)).toEqual([2, 1]);
    expect(rows[0]).toMatchObject({ poeng: 22, antallRinger: 4, plassering: 1 });
    expect(rows[1]).toMatchObject({ poeng: 8, antallRinger: 1, plassering: 2 });
  });

  it("breaks poeng ties on total ringere", () => {
    const rows = buildXkastStanding([
      participant(1, "Faa ringar", [
        [12, 0],
        [8, 1],
      ]), // 20 poeng, 1 ringer
      participant(2, "Mange ringar", [
        [10, 2],
        [10, 2],
      ]), // 20 poeng, 4 ringere
    ]);
    expect(rows.map((r) => r.kasterid)).toEqual([2, 1]);
    expect(rows.map((r) => r.plassering)).toEqual([1, 2]);
  });

  it("breaks poeng+ringer ties on best single omgang", () => {
    const rows = buildXkastStanding([
      participant(1, "Jamn", [
        [10, 2],
        [10, 2],
      ]), // best omgang 10
      participant(2, "Topp", [
        [15, 3],
        [5, 1],
      ]), // best omgang 15
    ]);
    expect(rows.map((r) => r.kasterid)).toEqual([2, 1]);
  });

  it("gives fully tied players the same placement and skips ahead", () => {
    const rows = buildXkastStanding([
      participant(1, "A", [
        [12, 2],
        [5, 1],
      ]),
      participant(2, "B", [
        [12, 2],
        [5, 1],
      ]),
      participant(3, "C", [
        [5, 1],
        [5, 1],
      ]),
    ]);
    expect(rows.map((r) => r.plassering)).toEqual([1, 1, 3]);
  });

  it("counts null ringere as zero without affecting poeng", () => {
    const rows = buildXkastStanding([
      participant(1, "A", [
        [12, null],
        [8, 1],
      ]),
    ]);
    expect(rows[0]).toMatchObject({ poeng: 20, antallRinger: 1, antallOmganger: 2 });
  });

  it("handles the empty list", () => {
    expect(buildXkastStanding([])).toEqual([]);
  });

  it("uses a manual total instead of summing omganger", () => {
    const rows = buildXkastStanding([
      {
        kasterid: 1,
        navn: "Manuell",
        omganger: [],
        manualTotal: { poeng: 120, antallRinger: 18, antallOmganger: 15 },
      },
      participant(2, "Omgang", [
        [12, 2],
        [10, 2],
      ]),
    ]);
    expect(rows.map((r) => r.kasterid)).toEqual([1, 2]);
    expect(rows[0]).toMatchObject({ poeng: 120, antallRinger: 18, antallOmganger: 15 });
  });

  it("loses a poeng+ringer tie to an omgang player (empty tiebreaker array)", () => {
    const rows = buildXkastStanding([
      {
        kasterid: 1,
        navn: "Manuell",
        omganger: [],
        manualTotal: { poeng: 20, antallRinger: 4, antallOmganger: 2 },
      },
      participant(2, "Omgang", [
        [10, 2],
        [10, 2],
      ]), // 20 poeng, 4 ringere, best omgang 10 > manual's nothing
    ]);
    expect(rows.map((r) => r.kasterid)).toEqual([2, 1]);
    expect(rows.map((r) => r.plassering)).toEqual([1, 2]);
  });
});
