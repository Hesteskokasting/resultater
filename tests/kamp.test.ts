import {
  calcMatchPoints,
  getOmgangStarterIndex,
  scoreForPlayer,
  matchScoreForPlayer,
  sideScore,
  ringsForPlayer,
  calcRingCount,
} from "@/utils/kamp/kamp";

describe("calcMatchPoints", () => {
  describe("tie", () => {
    it("returns [1.5, 1.5] when scores are equal", () => {
      expect(calcMatchPoints(21, 21)).toEqual([1.5, 1.5]);
    });

    it("returns [1.5, 1.5] when both scores are equal and above 21", () => {
      expect(calcMatchPoints(23, 23)).toEqual([1.5, 1.5]);
    });
  });

  describe("s1 wins", () => {
    it("gives loser 1 point when loser score is exactly 11", () => {
      expect(calcMatchPoints(21, 11)).toEqual([2, 1]);
    });

    it("gives loser 1 point when loser score is above 11", () => {
      expect(calcMatchPoints(25, 15)).toEqual([2, 1]);
    });

    it("gives loser 0 points when loser score is exactly 10", () => {
      expect(calcMatchPoints(21, 10)).toEqual([2, 0]);
    });

    it("gives loser 0 points when loser score is below 11", () => {
      expect(calcMatchPoints(21, 5)).toEqual([2, 0]);
    });

    it("gives loser 0 points when loser score is 0", () => {
      expect(calcMatchPoints(21, 0)).toEqual([2, 0]);
    });
  });

  describe("s2 wins", () => {
    it("gives loser 1 point when loser score is exactly 11", () => {
      expect(calcMatchPoints(11, 21)).toEqual([1, 2]);
    });

    it("gives loser 1 point when loser score is above 11", () => {
      expect(calcMatchPoints(15, 25)).toEqual([1, 2]);
    });

    it("gives loser 0 points when loser score is exactly 10", () => {
      expect(calcMatchPoints(10, 21)).toEqual([0, 2]);
    });

    it("gives loser 0 points when loser score is below 11", () => {
      expect(calcMatchPoints(5, 21)).toEqual([0, 2]);
    });

    it("gives loser 0 points when loser score is 0", () => {
      expect(calcMatchPoints(0, 21)).toEqual([0, 2]);
    });
  });
});

describe("scoreForPlayer", () => {
  it("returns 0 for null", () => {
    expect(scoreForPlayer(null)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(scoreForPlayer(undefined)).toBe(0);
  });

  it("returns score_poeng when no omgangar", () => {
    expect(scoreForPlayer({ score_poeng: 21 })).toBe(21);
  });

  it("returns 0 when score_poeng is null and no omgangar", () => {
    expect(scoreForPlayer({ score_poeng: null })).toBe(0);
  });

  it("sums omgangar scores when omgangar is present", () => {
    expect(scoreForPlayer({ omgangar: [{ score: 6 }, { score: 4 }, { score: 3 }] })).toBe(13);
  });

  it("treats null omgang score as 0", () => {
    expect(scoreForPlayer({ omgangar: [{ score: 6 }, { score: null }] })).toBe(6);
  });

  it("prefers omgangar over score_poeng when both are present", () => {
    expect(scoreForPlayer({ score_poeng: 99, omgangar: [{ score: 6 }, { score: 4 }] })).toBe(10);
  });

  it("falls back to score_poeng when omgangar is an empty array", () => {
    expect(scoreForPlayer({ score_poeng: 21, omgangar: [] })).toBe(21);
  });
});

describe("matchScoreForPlayer", () => {
  it("uses omgangar while the match is unconfirmed", () => {
    expect(matchScoreForPlayer({ score_poeng: 0, omgangar: [{ score: 6 }] }, false)).toBe(6);
  });

  it("uses stored score_poeng once the match is confirmed", () => {
    // half-finished omgangar left behind by an interrupted scoreboard
    expect(matchScoreForPlayer({ score_poeng: 21, omgangar: [{ score: 3 }] }, true)).toBe(21);
  });

  it("falls back to omgangar when a confirmed match has no stored score", () => {
    // cup matches confirmed before the confirm path persisted score_poeng
    const sp = { score_poeng: 0, omgangar: [{ score: 6 }, { score: 4 }] };
    expect(matchScoreForPlayer(sp, true)).toBe(10);
    expect(matchScoreForPlayer({ score_poeng: null, omgangar: [{ score: 21 }] }, true)).toBe(21);
  });

  it("returns 0 for null", () => {
    expect(matchScoreForPlayer(null, true)).toBe(0);
    expect(matchScoreForPlayer(null, false)).toBe(0);
  });
});

describe("sideScore", () => {
  const pair = {
    rep: { score_poeng: 12, omgangar: [{ score: 3 }] },
    members: [
      { score_poeng: 12, omgangar: [{ score: 3 }] },
      { score_poeng: 9, omgangar: [{ score: 2 }] },
    ],
  };

  it("sums both pair members", () => {
    expect(sideScore(pair, true)).toBe(21);
    expect(sideScore(pair, false)).toBe(5);
  });

  it("returns 0 for a missing side", () => {
    expect(sideScore(null, true)).toBe(0);
  });
});

describe("ringsForPlayer", () => {
  it("returns 0 for null", () => {
    expect(ringsForPlayer(null)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(ringsForPlayer(undefined)).toBe(0);
  });

  it("returns antall_ringer when no omgangar", () => {
    expect(ringsForPlayer({ antall_ringer: 3 })).toBe(3);
  });

  it("returns 0 when antall_ringer is null and no omgangar", () => {
    expect(ringsForPlayer({ antall_ringer: null })).toBe(0);
  });

  it("sums omgangar rings when omgangar is present", () => {
    expect(ringsForPlayer({ omgangar: [{ antall_ringer: 2 }, { antall_ringer: 1 }] })).toBe(3);
  });

  it("treats null omgang ring count as 0", () => {
    expect(ringsForPlayer({ omgangar: [{ antall_ringer: 2 }, { antall_ringer: null }] })).toBe(2);
  });

  it("prefers omgangar over antall_ringer when both are present", () => {
    expect(
      ringsForPlayer({ antall_ringer: 99, omgangar: [{ antall_ringer: 1 }, { antall_ringer: 2 }] }),
    ).toBe(3);
  });

  it("falls back to antall_ringer when omgangar is an empty array", () => {
    expect(ringsForPlayer({ antall_ringer: 3, omgangar: [] })).toBe(3);
  });
});

describe("calcRingCount", () => {
  it("returns 2 rings for score 6", () => {
    expect(calcRingCount(6)).toBe(2);
  });

  it("returns 1 ring for score 4", () => {
    expect(calcRingCount(4)).toBe(1);
  });

  it("returns 1 ring for score 3", () => {
    expect(calcRingCount(3)).toBe(1);
  });

  it("returns 0 rings for score 2", () => {
    expect(calcRingCount(2)).toBe(0);
  });

  it("returns 0 rings for score 1", () => {
    expect(calcRingCount(1)).toBe(0);
  });

  it("returns 0 rings for score 0", () => {
    expect(calcRingCount(0)).toBe(0);
  });
});

describe("getOmgangStarterIndex", () => {
  it("rotates every 2 omgangar while all sides are active", () => {
    const starters = [1, 2, 3, 4, 5, 6, 7].map((o) => getOmgangStarterIndex(o, 3));
    expect(starters).toEqual([0, 0, 1, 1, 2, 2, 0]);
  });

  it("skips a side that finished, so the two left keep alternating", () => {
    // side 0 finished at omgang 4; sides 1 and 2 then alternate, 0 never gets it back
    const finished = [4, null, null];
    expect(getOmgangStarterIndex(5, 3, finished)).toBe(2);
    expect(getOmgangStarterIndex(6, 3, finished)).toBe(2);
    expect(getOmgangStarterIndex(7, 3, finished)).toBe(1);
    expect(getOmgangStarterIndex(9, 3, finished)).toBe(2);
  });

  it("moves the turn off a side that finished mid-block", () => {
    // side 1 owns omgang 3-4 but finished at omgang 3
    expect(getOmgangStarterIndex(4, 3, [null, 3, null])).toBe(2);
  });

  it("keeps the plain rotation for 2 sides", () => {
    expect([1, 2, 3, 4, 5].map((o) => getOmgangStarterIndex(o, 2))).toEqual([0, 0, 1, 1, 0]);
  });
});
