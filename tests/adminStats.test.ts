import {
  countRegistrationsPerMonth,
  countThrowersPerClub,
  countTournamentsPerYear,
  countParticipantsPerYear,
  summarizeTournaments,
} from "@/admin/_adminStats";
import { monthOf, yearOf } from "@/utils/date";

describe("yearOf / monthOf", () => {
  it("reads year and month from an ISO date", () => {
    expect(yearOf("2026-08-02")).toBe(2026);
    expect(monthOf("2026-08-02")).toBe(8);
  });

  it("returns null for missing or unparseable values", () => {
    expect(yearOf(null)).toBeNull();
    expect(yearOf("")).toBeNull();
    expect(yearOf("abcd-01-01")).toBeNull();
    expect(monthOf(null)).toBeNull();
    expect(monthOf("2026")).toBeNull();
    expect(monthOf("2026-13-01")).toBeNull();
  });
});

describe("countTournamentsPerYear", () => {
  it("buckets by year, oldest first, keeping empty years as zero", () => {
    const rows = [
      { dato: "2026-01-05" },
      { dato: "2026-07-20" },
      { dato: "2024-03-03" },
      { dato: null },
    ];
    expect(countTournamentsPerYear(rows, 2026, 3)).toEqual([
      { label: "2024", count: 1 },
      { label: "2025", count: 0 },
      { label: "2026", count: 2 },
    ]);
  });

  it("ignores tournaments outside the window", () => {
    const rows = [{ dato: "2010-05-05" }, { dato: "2026-05-05" }];
    const result = countTournamentsPerYear(rows, 2026, 2);
    expect(result).toHaveLength(2);
    expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(1);
  });
});

describe("countRegistrationsPerMonth", () => {
  it("always returns 12 months and counts only the requested year", () => {
    const rows = [
      { opprettet_at: "2026-01-15T10:00:00Z" },
      { opprettet_at: "2026-01-20T10:00:00Z" },
      { opprettet_at: "2026-08-01T10:00:00Z" },
      { opprettet_at: "2025-08-01T10:00:00Z" },
      { opprettet_at: null },
    ];
    const result = countRegistrationsPerMonth(rows, 2026);
    expect(result).toHaveLength(12);
    expect(result[0]?.count).toBe(2);
    expect(result[7]?.count).toBe(1);
    expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(3);
  });
});

describe("countThrowersPerClub", () => {
  const club = (navn: string | null) => ({ klubb: navn === null ? null : { navn } });

  it("sorts clubs by size and caps the list", () => {
    const throwers = [club("Alfa"), club("Alfa"), club("Beta"), club("Gamma"), club("Gamma")];
    expect(countThrowersPerClub(throwers, 2)).toEqual([
      { label: "Alfa", count: 2 },
      { label: "Gamma", count: 2 },
    ]);
  });

  it("groups throwers without a club under one label", () => {
    const throwers = [club(null), club("  "), { klubb: undefined }, club("Alfa")];
    expect(countThrowersPerClub(throwers)).toEqual([
      { label: "Utan klubb", count: 3 },
      { label: "Alfa", count: 1 },
    ]);
  });
});

describe("countParticipantsPerYear", () => {
  it("counts distinct throwers per year and pads empty years", () => {
    const rows = [
      { kasterid: 1, stevne: { dato: "2026-01-05" } },
      { kasterid: 1, stevne: { dato: "2026-07-20" } },
      { kasterid: 2, stevne: { dato: "2026-07-20" } },
      { kasterid: null, stevne: { dato: "2026-07-20" } },
      { kasterid: 3, stevne: null },
    ];
    expect(countParticipantsPerYear(rows, 2026, 2)).toEqual([
      { label: "2025", count: 0 },
      { label: "2026", count: 2 },
    ]);
  });
});

describe("summarizeTournaments", () => {
  it("splits completed, ongoing and upcoming", () => {
    const rows = [
      { dato: "2026-01-01", erfullfort: true, stevne_fase: "avsluttende" },
      { dato: "2026-08-02", erfullfort: false, stevne_fase: "innledende" },
      { dato: "2026-09-01", erfullfort: false, stevne_fase: null },
      { dato: "2026-07-01", erfullfort: false, stevne_fase: "ikke_startet" },
    ];
    expect(summarizeTournaments(rows, "2026-08-02")).toEqual({
      total: 4,
      completed: 1,
      ongoing: 1,
      upcoming: 1,
    });
  });

  it("counts a tournament dated today as upcoming", () => {
    const rows = [{ dato: "2026-08-02", erfullfort: false, stevne_fase: null }];
    expect(summarizeTournaments(rows, "2026-08-02").upcoming).toBe(1);
  });
});
