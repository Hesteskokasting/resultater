import { matchOutcome, matchSides, isByeSide, type MyMatchPlayer } from "@/utils/kamp/myMatches";

const ME = 1;

function player(kasterid: number, score: number, extra: Record<string, unknown> = {}) {
  return { kasterid, kaster: { fornavn: "A", etternavn: "B" }, score_poeng: score, ...extra };
}

/** Two singel sides in stevne 9: startnummer 1 is me, 2 is the opponent. */
const startNrMap = { "9:1": 1, "9:2": 2, "9:3": 3 };

function match(spelarar: MyMatchPlayer[], extra: Record<string, unknown> = {}) {
  return { stevneid: 9, er_bekreftet: true, spelarar, ...extra };
}

describe("matchOutcome", () => {
  it("reads the score off my own side and the opponent's", () => {
    const result = matchOutcome(match([player(1, 21), player(2, 13)]), ME, startNrMap);
    expect(result).toEqual({ kind: "score", me: 21, them: 13, confirmed: true });
  });

  it("marks an unconfirmed match so the caller can keep it neutral", () => {
    const result = matchOutcome(
      match([player(1, 0), player(2, 0)], { er_bekreftet: false }),
      ME,
      startNrMap,
    );
    expect(result).toEqual({ kind: "score", me: 0, them: 0, confirmed: false });
  });

  it("advances on a walkover — the opponent is always a bye", () => {
    const bye = { kasterid: 2, kaster: null, score_poeng: 0 };
    const result = matchOutcome(match([player(1, 0), bye], { er_walkover: true }), ME, startNrMap);
    expect(result).toEqual({ kind: "walkover" });
  });

  it("uses the placement, not the score, for a 3-side match", () => {
    const result = matchOutcome(
      match([player(1, 15, { kamp_plassering: 2 }), player(2, 21), player(3, 9)]),
      ME,
      startNrMap,
    );
    expect(result).toEqual({ kind: "placement", placement: 2 });
  });

  it("falls back to unknown when a 3-side match has no placement yet", () => {
    const result = matchOutcome(
      match([player(1, 15), player(2, 21), player(3, 9)]),
      ME,
      startNrMap,
    );
    expect(result).toEqual({ kind: "unknown" });
  });

  it("returns unknown when I am not in the match", () => {
    expect(matchOutcome(match([player(2, 21), player(3, 9)]), ME, startNrMap).kind).toBe("unknown");
  });

  it("sums both members of a pair sharing a startnummer", () => {
    const pairMap = { "9:1": 1, "9:4": 1, "9:2": 2, "9:5": 2 };
    const result = matchOutcome(
      match([player(1, 12), player(4, 9), player(2, 8), player(5, 6)]),
      ME,
      pairMap,
    );
    expect(result).toEqual({ kind: "score", me: 21, them: 14, confirmed: true });
  });
});

describe("matchSides", () => {
  it("puts my own side first and keeps the rest as separate sides", () => {
    const { mine, others } = matchSides(
      match([player(1, 0), player(2, 0), player(3, 0)]),
      ME,
      startNrMap,
    );
    expect(mine.map((m) => m.kasterid)).toEqual([1]);
    expect(others.map((side) => side.map((m) => m.kasterid))).toEqual([[2], [3]]);
  });

  it("ignores a startnummer from another stevne", () => {
    const { mine, others } = matchSides(match([player(1, 0), player(2, 0)]), ME, {
      "8:1": 1,
      "8:2": 1,
    });
    expect(mine).toHaveLength(1);
    expect(others).toHaveLength(1);
  });
});

describe("isByeSide", () => {
  it("treats a missing side and a kaster-less row alike", () => {
    expect(isByeSide(undefined)).toBe(true);
    expect(isByeSide([])).toBe(true);
    expect(isByeSide([{ kasterid: 2, kaster: null }])).toBe(true);
    expect(isByeSide([{ kasterid: 2, kaster: {} }])).toBe(false);
  });
});
