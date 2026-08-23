import {
  sortResults,
  nextResultSort,
  resultFilterOptions,
  filterResults,
  type ResultSort,
} from "@/pages/kasterDetaljLogic";

// Minimal rows matching the shape sortResults needs (ResultDetailRow satisfies it too).
function row(plassering: number | null, dato: string | null) {
  return { plassering, stevne: dato === null ? null : { dato } };
}

function placements(rows: ReturnType<typeof row>[], sort: ResultSort): (number | null)[] {
  return sortResults(rows, sort).map((r) => r.plassering);
}

function dates(rows: ReturnType<typeof row>[], sort: ResultSort): (string | null)[] {
  return sortResults(rows, sort).map((r) => r.stevne?.dato ?? null);
}

describe("sortResults", () => {
  describe("dato", () => {
    const rows = [row(1, "2024-05-10"), row(2, "2026-06-28"), row(3, "2025-09-07")];

    it("sorts descending (newest first) — the default", () => {
      expect(dates(rows, { column: "dato", direction: "desc" })).toEqual([
        "2026-06-28",
        "2025-09-07",
        "2024-05-10",
      ]);
    });

    it("sorts ascending (oldest first)", () => {
      expect(dates(rows, { column: "dato", direction: "asc" })).toEqual([
        "2024-05-10",
        "2025-09-07",
        "2026-06-28",
      ]);
    });
  });

  describe("plassering", () => {
    it("ascending puts best (1) first", () => {
      const rows = [row(35, "2025-05-30"), row(9, "2025-06-21"), row(24, "2025-06-22")];
      expect(placements(rows, { column: "plassering", direction: "asc" })).toEqual([9, 24, 35]);
    });

    it("descending puts worst first", () => {
      const rows = [row(35, "2025-05-30"), row(9, "2025-06-21"), row(24, "2025-06-22")];
      expect(placements(rows, { column: "plassering", direction: "desc" })).toEqual([35, 24, 9]);
    });

    it("sinks missing placement to the bottom when ascending", () => {
      const rows = [row(null, "2026-06-26"), row(28, "2026-06-28"), row(52, "2026-06-27")];
      expect(placements(rows, { column: "plassering", direction: "asc" })).toEqual([28, 52, null]);
    });

    it("sinks missing placement to the bottom when descending too", () => {
      const rows = [row(null, "2026-06-26"), row(28, "2026-06-28"), row(52, "2026-06-27")];
      expect(placements(rows, { column: "plassering", direction: "desc" })).toEqual([52, 28, null]);
    });

    it("keeps multiple missing placements at the bottom", () => {
      const rows = [row(null, "2026-06-03"), row(36, "2026-05-31"), row(null, "2026-05-09")];
      expect(placements(rows, { column: "plassering", direction: "asc" })).toEqual([
        36,
        null,
        null,
      ]);
    });
  });

  it("does not mutate the input array", () => {
    const rows = [row(3, "2024-01-01"), row(1, "2025-01-01")];
    const before = [...rows];
    sortResults(rows, { column: "plassering", direction: "asc" });
    expect(rows).toEqual(before);
  });
});

// ── nextResultSort ────────────────────────────────────────────────────────────

describe("nextResultSort", () => {
  it("flips the direction on the same column", () => {
    expect(nextResultSort({ column: "dato", direction: "desc" }, "dato")).toEqual({
      column: "dato",
      direction: "asc",
    });
  });

  it("starts placement best-first and date newest-first", () => {
    expect(nextResultSort({ column: "dato", direction: "asc" }, "plassering")).toEqual({
      column: "plassering",
      direction: "asc",
    });
    expect(nextResultSort({ column: "plassering", direction: "asc" }, "dato")).toEqual({
      column: "dato",
      direction: "desc",
    });
  });
});

// ── Result filtering ──────────────────────────────────────────────────────────

function filterRow(dato: string | null, typeId: number | null, typeName = "NC") {
  return {
    stevne:
      dato === null
        ? null
        : { dato, stevnetype: typeId === null ? null : { id: typeId, navn: typeName } },
  };
}

describe("resultFilterOptions", () => {
  it("lists each year once, newest first", () => {
    const { years } = resultFilterOptions([
      filterRow("2024-05-01", 1),
      filterRow("2026-05-01", 1),
      filterRow("2024-09-01", 1),
    ]);
    expect(years).toEqual([2026, 2024]);
  });

  it("lists each type once, alphabetically, and skips rows without one", () => {
    const { types } = resultFilterOptions([
      filterRow("2026-05-01", 2, "SNC"),
      filterRow("2026-05-02", 1, "NC"),
      filterRow("2026-05-03", 2, "SNC"),
      filterRow("2026-05-04", null),
      filterRow(null, null),
    ]);
    expect(types).toEqual([
      [1, "NC"],
      [2, "SNC"],
    ]);
  });
});

describe("filterResults", () => {
  const rows = [filterRow("2025-05-01", 1, "NC"), filterRow("2026-05-01", 2, "SNC")];

  it("keeps everything on the alle sentinel", () => {
    expect(filterResults(rows, "alle", "alle")).toHaveLength(2);
  });

  it("filters on year and on type, and combines both", () => {
    expect(filterResults(rows, "2026", "alle")).toHaveLength(1);
    expect(filterResults(rows, "alle", "1")).toHaveLength(1);
    expect(filterResults(rows, "2026", "1")).toHaveLength(0);
  });
});
