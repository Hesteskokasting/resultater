import {
  RECORD_METHODS,
  findRecordMethod,
  isFemale,
  recordThrower,
  filterAndRankRecords,
} from "@/utils/rekorderLogikk";
import type { RecordsFilter } from "@/utils/rekorderLogikk";

function record(
  metode: string,
  poeng: number,
  fornavn: string,
  kjonn = "M",
  klubb_navn = "Bergen HK",
) {
  return {
    metode,
    poeng,
    kasterid: 1,
    fornavn,
    etternavn: "Hansen",
    kjonn_navn: kjonn,
    klubb_navn,
    stevne_id: 5,
    stevne_navn: "NM",
    ar: 2025,
  } as never;
}

const base: RecordsFilter = { method: "kongelag", gender: "alle", searchText: "" };

describe("findRecordMethod", () => {
  it("falls back to the first method for an unknown value", () => {
    expect(findRecordMethod("tullball")).toBe(RECORD_METHODS[0]);
    expect(findRecordMethod("heilmatch")!.maxPoints).toBe(1000);
  });
});

describe("isFemale", () => {
  it("matches the M/K code the view actually stores", () => {
    expect(isFemale({ kjonn_navn: "K" })).toBe(true);
    expect(isFemale({ kjonn_navn: "M" })).toBe(false);
    expect(isFemale({ kjonn_navn: null })).toBe(false);
  });
});

describe("recordThrower", () => {
  it("fills the nullable name columns with empty strings", () => {
    expect(recordThrower({ kasterid: null, fornavn: null, etternavn: "Berg" } as never)).toEqual({
      id: 0,
      fornavn: "",
      etternavn: "Berg",
    });
  });
});

describe("filterAndRankRecords", () => {
  const rows = [
    record("kongelag", 150, "Kari", "K"),
    record("kongelag", 180, "Ola"),
    record("kongelag", 180, "Per"),
    record("kongelag", 120, "Nils"),
    record("minimatch", 300, "Ola"),
  ];

  it("keeps only the chosen method, best first", () => {
    const list = filterAndRankRecords(rows, base);
    expect(list.map((r) => r.poeng)).toEqual([180, 180, 150, 120]);
  });

  // Competition placement: the tie shares 1, and the next row skips to 3.
  it("gives tied scores the same placement and skips the next", () => {
    expect(filterAndRankRecords(rows, base).map((r) => r.plassering)).toEqual([1, 1, 3, 4]);
  });

  it("filters by gender", () => {
    expect(filterAndRankRecords(rows, { ...base, gender: "damer" })).toHaveLength(1);
    expect(filterAndRankRecords(rows, { ...base, gender: "herrer" })).toHaveLength(3);
  });

  it("searches thrower and club, and re-ranks the narrowed list", () => {
    const byName = filterAndRankRecords(rows, { ...base, searchText: "KARI" });
    expect(byName).toHaveLength(1);
    expect(byName[0]!.plassering).toBe(1);
    expect(filterAndRankRecords(rows, { ...base, searchText: "bergen" })).toHaveLength(4);
    expect(filterAndRankRecords(rows, { ...base, searchText: "oslo" })).toEqual([]);
  });

  it("does not mutate the rows it was given", () => {
    filterAndRankRecords(rows, base);
    expect(rows[0]).not.toHaveProperty("plassering");
  });
});
