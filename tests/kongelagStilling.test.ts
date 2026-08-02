import { describe, expect, it } from "vite-plus/test";
import {
  xkastCarryOverFactor,
  xkastCarryOverPercent,
  calcCarryOverByKasterid,
  buildKongelagStanding,
} from "@/utils/kongelagStilling";
import type { KongelagSeedingRow } from "@/utils/kongelagSeeding";
import type { XkastStandingRow } from "@/utils/xkastStilling";

function xkastRow(kasterid: number, poeng: number): KongelagSeedingRow {
  return {
    kasterid,
    poeng_xkast: poeng,
    antall_ring_xkast: 0,
    kamp_poeng_innl: null,
    score_poeng_innl: null,
  };
}

function kampRow(kasterid: number, kampPoeng: number): KongelagSeedingRow {
  return {
    kasterid,
    poeng_xkast: null,
    antall_ring_xkast: null,
    kamp_poeng_innl: kampPoeng,
    score_poeng_innl: 50,
  };
}

function standingRow(
  kasterid: number,
  poeng: number,
  ringer: number,
  omganger: number[],
): XkastStandingRow {
  return {
    kasterid,
    navn: `Kaster ${kasterid}`,
    poeng,
    antallRinger: ringer,
    antallOmganger: omganger.length,
    omgangPoengDesc: [...omganger].sort((a, b) => b - a),
    plassering: 0,
  };
}

describe("xkastCarryOverFactor", () => {
  it("normalizes every X-kast method max to 100", () => {
    // Minimatch 15×20=300, Halvmatch 25×20=500, Heilmatch 50×20=1000
    expect(300 * xkastCarryOverFactor(15)).toBe(100);
    expect(500 * xkastCarryOverFactor(25)).toBe(100);
    expect(1000 * xkastCarryOverFactor(50)).toBe(100);
  });
});

describe("xkastCarryOverPercent", () => {
  it("formats the factor as a percentage without float noise", () => {
    expect(xkastCarryOverPercent(15)).toBe(33.33);
    expect(xkastCarryOverPercent(25)).toBe(20);
    expect(xkastCarryOverPercent(50)).toBe(10);
  });
});

describe("calcCarryOverByKasterid", () => {
  it("rounds the normalized X-kast total", () => {
    const carry = calcCarryOverByKasterid([xkastRow(1, 300), xkastRow(2, 151)], {
      isXkast: true,
      antallOmganger: 15,
    });
    expect(carry[1]).toBe(100);
    expect(carry[2]).toBe(50); // 151/3 = 50.33…
  });

  it("passes kamp_poeng_innl through unrounded (fractional draw points)", () => {
    const carry = calcCarryOverByKasterid([kampRow(1, 1.5), kampRow(2, 4)], {
      isXkast: false,
      antallOmganger: null,
    });
    expect(carry[1]).toBe(1.5);
    expect(carry[2]).toBe(4);
  });

  it("treats missing innledende values as 0", () => {
    const carry = calcCarryOverByKasterid(
      [
        {
          kasterid: 1,
          poeng_xkast: null,
          antall_ring_xkast: null,
          kamp_poeng_innl: null,
          score_poeng_innl: null,
        },
      ],
      { isXkast: true, antallOmganger: 25 },
    );
    expect(carry[1]).toBe(0);
  });
});

describe("buildKongelagStanding", () => {
  it("ranks by displayTotal = kongelag poeng + carry-over", () => {
    // Player 2 trails in kongelag (140 vs 150) but the carry-over flips it
    const rows = [standingRow(1, 150, 20, [20, 16]), standingRow(2, 140, 18, [18, 15])];
    const standing = buildKongelagStanding(rows, { 1: 40, 2: 60 });
    expect(standing.map((r) => r.kasterid)).toEqual([2, 1]);
    expect(standing[0]?.displayTotal).toBe(200);
    expect(standing[0]?.carryOver).toBe(60);
  });

  it("breaks displayTotal ties on kongelag-only poeng", () => {
    const rows = [standingRow(1, 120, 10, [16]), standingRow(2, 130, 10, [16])];
    const standing = buildKongelagStanding(rows, { 1: 50, 2: 40 });
    expect(standing.map((r) => r.displayTotal)).toEqual([170, 170]);
    expect(standing.map((r) => r.kasterid)).toEqual([2, 1]);
    expect(standing.map((r) => r.plassering)).toEqual([1, 2]);
  });

  it("shares placements on full ties", () => {
    const rows = [
      standingRow(1, 120, 10, [16, 12]),
      standingRow(2, 120, 10, [16, 12]),
      standingRow(3, 110, 8, [14]),
    ];
    const standing = buildKongelagStanding(rows, {});
    expect(standing.map((r) => r.plassering)).toEqual([1, 1, 3]);
  });

  it("defaults missing carry-over to 0", () => {
    const standing = buildKongelagStanding([standingRow(1, 100, 6, [15])], {});
    expect(standing[0]?.carryOver).toBe(0);
    expect(standing[0]?.displayTotal).toBe(100);
  });
});
