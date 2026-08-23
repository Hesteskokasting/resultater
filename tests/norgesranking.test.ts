import {
  calcRingInfo,
  buildRankingList,
  filterRanking,
  MIN_STEVNER,
  type EventInfo,
} from "@/pages/norgesrankingLogic";
import type { RankingResultRow } from "@/services/norgesrankingService";

// ── Factories ─────────────────────────────────────────────────────────────────

function mkEventInfo(innledMetode: string | null, avslMetode: string | null = null): EventInfo {
  return { navn: "Test", dato: "2025-01-01", typeNamn: "NR", innledMetode, avslMetode };
}

function mkRaw(xkast: number | null = null, kongelag: number | null = null): RankingResultRow {
  return { antall_ring_xkast: xkast, antall_ring_kongelag: kongelag } as RankingResultRow;
}

let nextId = 1;

function mkRes(
  kasterid: number,
  stevneid: number,
  xkast: number | null = null,
  kongelag: number | null = null,
): RankingResultRow {
  return {
    id: nextId++,
    kasterid,
    stevneid,
    klubbid: 10,
    antall_ring_xkast: xkast,
    antall_ring_kongelag: kongelag,
    kaster: { id: kasterid, fornavn: `F${kasterid}`, etternavn: `E${kasterid}` },
    klubb: { id: 10, navn: "Klubb A" },
  } as RankingResultRow;
}

// ── calcRingInfo ────────────────────────────────────────────────────────────

describe("calcRingInfo", () => {
  describe("Minimatch", () => {
    it("computes prosent as antall_ring_xkast / 60 * 100", () => {
      const info = calcRingInfo(mkRaw(30), mkEventInfo("Minimatch"));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Minimatch");
      expect(info[0]!.prosent).toBeCloseTo(50, 5);
      expect(info[0]!.antallRing).toBe(30);
    });
  });

  describe("Halvmatch", () => {
    it("uses antall_ring_xkast directly as prosent", () => {
      const info = calcRingInfo(mkRaw(75), mkEventInfo("Halvmatch"));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Halvmatch");
      expect(info[0]!.prosent).toBe(75);
    });
  });

  describe("Heilmatch", () => {
    it("computes prosent as antall_ring_xkast / 200 * 100", () => {
      const info = calcRingInfo(mkRaw(100), mkEventInfo("Heilmatch"));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Heilmatch");
      expect(info[0]!.prosent).toBeCloseTo(50, 5);
    });
  });

  describe("Kongelag", () => {
    it("computes prosent as antall_ring_kongelag / 40 * 100", () => {
      const info = calcRingInfo(mkRaw(null, 20), mkEventInfo(null));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Kongelag");
      expect(info[0]!.prosent).toBeCloseTo(50, 5);
      expect(info[0]!.antallRing).toBe(20);
    });

    it("is added regardless of method name (Kongelag is field-based, not method-based)", () => {
      // xkast method is unknown so xkast produces nothing, but kongelag always appears
      const info = calcRingInfo(mkRaw(null, 20), mkEventInfo("UnknownMethod"));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Kongelag");
    });
  });

  describe("multiple ring sources", () => {
    it("returns both an xkast entry and a Kongelag entry when both fields are set", () => {
      const info = calcRingInfo(mkRaw(60, 40), mkEventInfo("Minimatch"));
      expect(info).toHaveLength(2);
      expect(info.map((i) => i.metodeNamn).sort()).toEqual(["Kongelag", "Minimatch"]);
    });
  });

  describe("method matching on avslMetode", () => {
    it("matches the method on avslMetode when innledMetode does not match", () => {
      const info = calcRingInfo(mkRaw(60), mkEventInfo("OtherMethod", "Halvmatch"));
      expect(info).toHaveLength(1);
      expect(info[0]!.metodeNamn).toBe("Halvmatch");
    });
  });

  describe("no data", () => {
    it("returns empty array when both fields are null", () => {
      expect(calcRingInfo(mkRaw(null, null), mkEventInfo("Halvmatch"))).toHaveLength(0);
    });

    it("produces no xkast entry when antall_ring_xkast is null even if method matches", () => {
      const info = calcRingInfo(mkRaw(null, null), mkEventInfo("Minimatch"));
      expect(info.find((i) => i.metodeNamn === "Minimatch")).toBeUndefined();
    });

    it("produces no xkast entry when stevneInfo is undefined", () => {
      // Method cannot be determined → xkast produces nothing; kongelag still appears
      const withKongelag = calcRingInfo(mkRaw(60, 20), undefined);
      expect(withKongelag.find((i) => i.metodeNamn !== "Kongelag")).toBeUndefined();
      expect(withKongelag).toHaveLength(1);
    });
  });
});

// ── buildRankingList ──────────────────────────────────────────────────────────

describe("buildRankingList", () => {
  describe("top-5 selection", () => {
    it("averages only the best 5 results when a player has more than 5", () => {
      // 6 Halvmatch results: prosent = antall_ring_xkast directly
      // Best 5: 100+90+80+70+60=400, avg=80.0
      // All 6: 450/6=75.0
      const stevneid = 1;
      const resultater = [100, 90, 80, 70, 60, 50].map((rings, i) => mkRes(1, stevneid + i, rings));
      const stevnerMap = new Map(
        [100, 90, 80, 70, 60, 50].map((_, i) => [stevneid + i, mkEventInfo("Halvmatch")]),
      );
      const liste = buildRankingList(resultater, stevnerMap);
      expect(liste[0]!.snittProsent).toBe(80);
    });
  });

  describe("erGyldig", () => {
    it(`marks a player as invalid when they have fewer than ${MIN_STEVNER} ring entries`, () => {
      const resultater = Array.from({ length: MIN_STEVNER - 1 }, (_, i) => mkRes(1, i + 1, 80));
      const stevnerMap = new Map(
        Array.from({ length: MIN_STEVNER - 1 }, (_, i) => [i + 1, mkEventInfo("Halvmatch")]),
      );
      const liste = buildRankingList(resultater, stevnerMap);
      expect(liste[0]!.erGyldig).toBe(false);
    });

    it(`marks a player as valid when they have exactly ${MIN_STEVNER} ring entries`, () => {
      const resultater = Array.from({ length: MIN_STEVNER }, (_, i) => mkRes(1, i + 1, 80));
      const stevnerMap = new Map(
        Array.from({ length: MIN_STEVNER }, (_, i) => [i + 1, mkEventInfo("Halvmatch")]),
      );
      const liste = buildRankingList(resultater, stevnerMap);
      expect(liste[0]!.erGyldig).toBe(true);
    });
  });

  describe("sorting", () => {
    it("returns valid players sorted by snittProsent descending", () => {
      // Player 1: 5 results at 60 → snitt 60. Player 2: 5 results at 80 → snitt 80.
      const stevnerMap = new Map(
        Array.from({ length: 10 }, (_, i) => [i + 1, mkEventInfo("Halvmatch")]),
      );
      const p1 = Array.from({ length: 5 }, (_, i) => mkRes(1, i + 1, 60));
      const p2 = Array.from({ length: 5 }, (_, i) => mkRes(2, i + 6, 80));
      const liste = buildRankingList([...p1, ...p2], stevnerMap);
      expect(liste[0]!.snittProsent).toBeGreaterThan(liste[1]!.snittProsent);
    });
  });

  describe("tie placement", () => {
    it("assigns the same plassering to valid players with equal snittProsent", () => {
      // 3 players, each with 5 results at 70 → all tied at 1st
      // 4th player with higher score to push others to plassering 1
      const stevnerMap = new Map(
        Array.from({ length: 15 }, (_, i) => [i + 1, mkEventInfo("Halvmatch")]),
      );
      const p1 = Array.from({ length: 5 }, (_, i) => mkRes(1, i + 1, 70));
      const p2 = Array.from({ length: 5 }, (_, i) => mkRes(2, i + 6, 70));
      const p3 = Array.from({ length: 5 }, (_, i) => mkRes(3, i + 11, 50));
      const liste = buildRankingList([...p1, ...p2, ...p3], stevnerMap);
      const valid = liste.filter((r) => r.erGyldig);
      expect(valid[0]!.plassering).toBe(1);
      expect(valid[1]!.plassering).toBe(1);
      expect(valid[2]!.plassering).toBe(3);
    });
  });

  describe("valid before invalid", () => {
    it("places all valid players before invalid players in the output", () => {
      // Player 1: valid (5 results). Player 2: invalid (3 results, higher snitt).
      // Even though player 2 has higher snitt, player 1 comes first.
      const stevnerMap = new Map(
        Array.from({ length: 8 }, (_, i) => [i + 1, mkEventInfo("Halvmatch")]),
      );
      const validPlayer = Array.from({ length: 5 }, (_, i) => mkRes(1, i + 1, 40));
      const invalidPlayer = Array.from({ length: 3 }, (_, i) => mkRes(2, i + 6, 90));
      const liste = buildRankingList([...validPlayer, ...invalidPlayer], stevnerMap);
      expect(liste[0]!.erGyldig).toBe(true);
      expect(liste[1]!.erGyldig).toBe(false);
    });
  });
});

// ── filterRanking ─────────────────────────────────────────────────────────────

describe("filterRanking", () => {
  const list = [
    { navn: "Kari Nordmann", klubb: "Bergen HK" },
    { navn: "Ola Hansen", klubb: "Oslo HK" },
  ] as never as Parameters<typeof filterRanking>[0];

  it("returns the same list when the search is blank", () => {
    expect(filterRanking(list, "   ")).toBe(list);
  });

  it("matches on thrower name, case-insensitively", () => {
    expect(filterRanking(list, "kari")).toHaveLength(1);
  });

  it("matches on club too", () => {
    expect(filterRanking(list, "oslo")[0]!.navn).toBe("Ola Hansen");
  });

  it("gives an empty list when nothing matches", () => {
    expect(filterRanking(list, "trondheim")).toEqual([]);
  });
});
