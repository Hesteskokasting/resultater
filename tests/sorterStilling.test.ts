import { sortStandings, type StandingRow, type MatchForSorting } from "@/utils/stilling";

function p(kasterid: number, overrides: Partial<StandingRow> = {}): StandingRow {
  return { kasterid, ...overrides };
}

function confirmedMatch(
  spelarar: { kasterid: number; kamp_poeng: number; score_poeng?: number }[],
): MatchForSorting {
  return { er_bekreftet: true, spelarar };
}

function unconfirmedMatch(
  spelarar: { kasterid: number; kamp_poeng: number; score_poeng?: number }[],
): MatchForSorting {
  return { er_bekreftet: false, spelarar };
}

function ids(stilling: StandingRow[]): number[] {
  return stilling.map((s) => s.kasterid);
}

describe("sortStandings", () => {
  describe("final plassering", () => {
    it("puts player with plassering before player without", () => {
      const a = p(1, { plassering: 1 });
      const b = p(2);
      expect(ids(sortStandings([b, a], []))).toEqual([1, 2]);
    });

    it("sorts multiple placed players by plassering ascending", () => {
      const a = p(1, { plassering: 3 });
      const b = p(2, { plassering: 1 });
      const c = p(3, { plassering: 2 });
      expect(ids(sortStandings([a, b, c], []))).toEqual([2, 3, 1]);
    });
  });

  describe("active vs eliminated", () => {
    it("puts active player (runde_eliminert null) before eliminated", () => {
      const active = p(1, { kamp_poeng: 0 });
      const eliminated = p(2, { kamp_poeng: 6, runde_eliminert: 3 });
      expect(ids(sortStandings([eliminated, active], []))).toEqual([1, 2]);
    });

    it("puts player eliminated in later round before one eliminated earlier", () => {
      const lateOut = p(1, { runde_eliminert: 3 });
      const earlyOut = p(2, { runde_eliminert: 1 });
      expect(ids(sortStandings([earlyOut, lateOut], []))).toEqual([1, 2]);
    });
  });

  describe("kamp_poeng tiebreak", () => {
    it("puts player with more kamp_poeng first", () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 80 });
      const b = p(2, { kamp_poeng: 6, score_poeng: 60 });
      expect(ids(sortStandings([a, b], []))).toEqual([2, 1]);
    });
  });

  describe("score_poeng tiebreak", () => {
    it("puts player with more score_poeng first when kamp_poeng is equal", () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 60 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 80 });
      expect(ids(sortStandings([a, b], []))).toEqual([2, 1]);
    });
  });

  describe("head-to-head tiebreak", () => {
    it("puts h2h winner first when overall kamp_poeng and score_poeng are equal", () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 50 });
      const h2h = confirmedMatch([
        { kasterid: 1, kamp_poeng: 2, score_poeng: 21 },
        { kasterid: 2, kamp_poeng: 0, score_poeng: 10 },
      ]);
      expect(ids(sortStandings([b, a], [h2h]))).toEqual([1, 2]);
    });

    it("ranks h2h winner first even when they have a lower max single-match score", () => {
      // player 2 wins h2h 21–16 (kamp_poeng 2 vs 1), but player 1 scores 26 elsewhere
      // without h2h, max-single-match would pick player 1 (26 > 21)
      const a = p(1, { kamp_poeng: 4, score_poeng: 50 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 50 });
      const h2h = confirmedMatch([
        { kasterid: 1, kamp_poeng: 1, score_poeng: 16 },
        { kasterid: 2, kamp_poeng: 2, score_poeng: 21 },
      ]);
      const matchA = confirmedMatch([{ kasterid: 1, kamp_poeng: 2, score_poeng: 26 }]);
      expect(ids(sortStandings([a, b], [h2h, matchA]))).toEqual([2, 1]);
    });

    it("ignores unconfirmed matches", () => {
      // b would win h2h if the match were confirmed, but it isn't
      const a = p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 2 });
      const unconfirmed = unconfirmedMatch([
        { kasterid: 1, kamp_poeng: 0, score_poeng: 10 },
        { kasterid: 2, kamp_poeng: 2, score_poeng: 21 },
      ]);
      // falls through to start number → a (startnummer 1) wins
      expect(ids(sortStandings([b, a], [unconfirmed]))).toEqual([1, 2]);
    });

    it("ranks a three-way tie on h2h points within the tied group", () => {
      // Deliberately stricter than the written rules, which drop h2h at 3+ tied.
      // 1 beat 2, 2 beat 3, 1 beat 3 → 4 h2h points to player 1, 2 to player 2, 0 to player 3
      const rows = [
        p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 3 }),
        p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 2 }),
        p(3, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 }),
      ];
      const matches = [
        confirmedMatch([
          { kasterid: 1, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 2, kamp_poeng: 0, score_poeng: 8 },
        ]),
        confirmedMatch([
          { kasterid: 2, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 3, kamp_poeng: 0, score_poeng: 8 },
        ]),
        confirmedMatch([
          { kasterid: 1, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 3, kamp_poeng: 0, score_poeng: 8 },
        ]),
      ];
      expect(ids(sortStandings(rows, matches))).toEqual([1, 2, 3]);
    });

    it("gives a circular three-way tie the same order whatever the input order", () => {
      // 1 beat 2, 2 beat 3, 3 beat 1 — h2h is level at 2 points each, so the
      // criteria below it decide and no input order may change the result
      const rows = [
        p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 3 }),
        p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 2 }),
        p(3, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 }),
      ];
      const matches = [
        confirmedMatch([
          { kasterid: 1, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 2, kamp_poeng: 0, score_poeng: 8 },
        ]),
        confirmedMatch([
          { kasterid: 2, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 3, kamp_poeng: 0, score_poeng: 8 },
        ]),
        confirmedMatch([
          { kasterid: 3, kamp_poeng: 2, score_poeng: 21 },
          { kasterid: 1, kamp_poeng: 0, score_poeng: 8 },
        ]),
      ];
      // all three peak at 21, so start number decides: 3 (1), 2 (2), 1 (3)
      const expected = [3, 2, 1];
      expect(ids(sortStandings(rows, matches))).toEqual(expected);
      expect(ids(sortStandings([...rows].reverse(), matches))).toEqual(expected);
      expect(ids(sortStandings([rows[1]!, rows[2]!, rows[0]!], matches))).toEqual(expected);
    });
  });

  describe("max single-match score tiebreak", () => {
    it("puts player with higher best match score first after h2h tie", () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 50 });
      // h2h tied
      const h2h = confirmedMatch([
        { kasterid: 1, kamp_poeng: 1.5, score_poeng: 21 },
        { kasterid: 2, kamp_poeng: 1.5, score_poeng: 21 },
      ]);
      // a has a better individual match score elsewhere
      const matchA = confirmedMatch([{ kasterid: 1, kamp_poeng: 2, score_poeng: 25 }]);
      const matchB = confirmedMatch([{ kasterid: 2, kamp_poeng: 2, score_poeng: 20 }]);
      expect(ids(sortStandings([b, a], [h2h, matchA, matchB]))).toEqual([1, 2]);
    });

    it("uses stored score_poeng, not partial omgang rows, on a confirmed match", () => {
      // player 1's match holds only omgang 1 (3) while the confirmed total is 21
      const a = p(1, { kamp_poeng: 2, score_poeng: 21, startnummer: 1 });
      const b = p(2, { kamp_poeng: 2, score_poeng: 21, startnummer: 11 });
      const matchA: MatchForSorting = {
        er_bekreftet: true,
        spelarar: [{ kasterid: 1, kamp_poeng: 2, score_poeng: 21, omgangar: [{ score: 3 }] }],
      };
      const matchB = confirmedMatch([{ kasterid: 2, kamp_poeng: 2, score_poeng: 21 }]);
      // fully tied → start number decides
      expect(ids(sortStandings([b, a], [matchA, matchB]))).toEqual([1, 2]);
    });
  });

  describe("start number tiebreak", () => {
    it("puts player with lower start number first when everything else is equal", () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 3 });
      const b = p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 });
      expect(ids(sortStandings([a, b], []))).toEqual([2, 1]);
    });
  });

  describe("does not mutate input", () => {
    it("returns a new array without modifying the original", () => {
      const a = p(1, { kamp_poeng: 2 });
      const b = p(2, { kamp_poeng: 6 });
      const original = [a, b];
      sortStandings(original, []);
      expect(original).toEqual([a, b]);
    });
  });
});
