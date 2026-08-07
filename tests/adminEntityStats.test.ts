import {
  countBy,
  countByClubId,
  countTournamentsPerMonth,
  isOngoing,
  summarizeClubs,
  summarizeThrowers,
  summarizeTournamentYear,
  tournamentStatusShare,
} from "@/utils/adminEntityStats";

const YEAR = 2026;

function tournament(
  id: number,
  overrides: Partial<{
    dato: string | null;
    erfullfort: boolean;
    stevne_fase: string | null;
    ernm: boolean;
  }> = {},
) {
  return {
    id,
    dato: `${YEAR}-06-0${id}`,
    erfullfort: false,
    stevne_fase: null,
    ernm: false,
    ...overrides,
  };
}

describe("countBy", () => {
  it("sorts by size then name and reports what it cut", () => {
    const rows = [{ k: "b" }, { k: "b" }, { k: "a" }, { k: "c" }, { k: "d" }];
    const result = countBy(rows, (r) => r.k, { top: 2 });
    expect(result.entries).toEqual([
      { label: "b", count: 2 },
      { label: "a", count: 1 },
    ]);
    expect(result.omittedCount).toBe(2);
  });

  it("buckets blank and missing keys under the fallback", () => {
    const rows = [{ k: null }, { k: "  " }, { k: undefined }, { k: "Oslo" }];
    expect(countBy(rows, (r) => r.k, { fallback: "Utan" }).entries).toEqual([
      { label: "Utan", count: 3 },
      { label: "Oslo", count: 1 },
    ]);
  });

  it("omits nothing when everything fits", () => {
    expect(countBy([{ k: "a" }], (r) => r.k).omittedCount).toBe(0);
  });
});

describe("isOngoing", () => {
  it("is true only for an unfinished tournament in a running phase", () => {
    expect(isOngoing({ erfullfort: false, stevne_fase: "innledende" })).toBe(true);
    expect(isOngoing({ erfullfort: false, stevne_fase: "avsluttende" })).toBe(true);
    expect(isOngoing({ erfullfort: true, stevne_fase: "avsluttende" })).toBe(false);
    expect(isOngoing({ erfullfort: false, stevne_fase: null })).toBe(false);
    expect(isOngoing({ erfullfort: false, stevne_fase: "ikke_startet" })).toBe(false);
  });
});

describe("summarizeTournamentYear", () => {
  const rows = [
    tournament(1, { erfullfort: true, dato: `${YEAR}-01-01`, ernm: true }),
    tournament(2, { stevne_fase: "innledende", dato: `${YEAR}-06-02` }),
    tournament(3, { dato: `${YEAR}-09-03` }),
    tournament(4, { dato: `${YEAR}-08-04` }),
  ];
  const registrations = new Map([
    [1, 20],
    [2, 10],
  ]);

  it("splits the year and totals the registrations", () => {
    const s = summarizeTournamentYear(rows, registrations, `${YEAR}-07-01`);
    expect(s).toMatchObject({
      total: 4,
      completed: 1,
      ongoing: 1,
      upcoming: 2,
      notStarted: 2,
      nm: 1,
      registrations: 30,
    });
  });

  it("averages only over tournaments that actually have registrations", () => {
    const s = summarizeTournamentYear(rows, registrations, `${YEAR}-07-01`);
    expect(s.avgRegistrations).toBe(15);
    expect(summarizeTournamentYear(rows, new Map(), `${YEAR}-07-01`).avgRegistrations).toBe(0);
  });

  it("picks the earliest upcoming tournament as next", () => {
    const s = summarizeTournamentYear(rows, registrations, `${YEAR}-07-01`);
    expect(s.next?.id).toBe(4);
  });

  it("has no next once the season is over", () => {
    const s = summarizeTournamentYear(rows, registrations, `${YEAR}-12-31`);
    expect(s.next).toBeNull();
    expect(s.upcoming).toBe(0);
  });
});

describe("countTournamentsPerMonth", () => {
  it("returns 12 buckets and ignores other years", () => {
    const rows = [
      { dato: `${YEAR}-06-01` },
      { dato: `${YEAR}-06-20` },
      { dato: `${YEAR - 1}-06-01` },
      { dato: null },
    ];
    const result = countTournamentsPerMonth(rows, YEAR);
    expect(result).toHaveLength(12);
    expect(result[5]?.count).toBe(2);
    expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(2);
  });
});

describe("tournamentStatusShare", () => {
  it("always returns the three states in a fixed order", () => {
    const rows = [
      tournament(1, { erfullfort: true }),
      tournament(2, { stevne_fase: "avsluttende" }),
      tournament(3),
      tournament(4),
    ];
    expect(tournamentStatusShare(rows)).toEqual([
      { label: "Fullført", count: 1 },
      { label: "Pågåande", count: 1 },
      { label: "Ikkje starta", count: 2 },
    ]);
  });
});

describe("summarizeThrowers", () => {
  const rows = [
    { eraktiv: true, medlemsnummer: 1, klubb: { navn: "Oslo HK" } },
    { eraktiv: true, medlemsnummer: null, klubb: { navn: "Oslo HK" } },
    { eraktiv: false, medlemsnummer: null, klubb: null },
    { eraktiv: true, medlemsnummer: null, klubb: { navn: " " } },
  ];

  it("counts activity, club coverage and data completeness", () => {
    expect(summarizeThrowers(rows)).toEqual({
      total: 4,
      active: 3,
      inactive: 1,
      withClub: 2,
      withoutClub: 2,
      withMemberNumber: 1,
      clubCount: 1,
    });
  });
});

describe("summarizeClubs", () => {
  const clubs = [
    { id: 1, navn: "Oslo HK", eraktiv: true },
    { id: 2, navn: "Bergen HK", eraktiv: true },
    { id: 3, navn: "Gamle HK", eraktiv: false },
  ];

  it("counts members, hosts and the biggest club", () => {
    const members = new Map([
      [1, 10],
      [2, 4],
    ]);
    const hosting = new Map([[1, 2]]);

    expect(summarizeClubs(clubs, members, hosting)).toEqual({
      total: 3,
      active: 2,
      inactive: 1,
      withMembers: 2,
      withoutMembers: 1,
      hosting: 1,
      avgMembers: 4.7,
      largest: { label: "Oslo HK", count: 10 },
    });
  });

  it("reports no largest club when nobody has members", () => {
    expect(summarizeClubs(clubs, new Map(), new Map()).largest).toBeNull();
  });
});

describe("countByClubId", () => {
  it("counts rows per club id and skips rows without one", () => {
    const rows = [{ c: 1 }, { c: 1 }, { c: 2 }, { c: null }, { c: undefined }];
    const result = countByClubId(rows, (r) => r.c);
    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(1);
    expect(result.size).toBe(2);
  });
});
