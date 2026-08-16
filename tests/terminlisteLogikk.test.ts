import { linkedThrowerId } from "@/utils/kaster";
import {
  groupSchedule,
  sortSchedule,
  findNearestUpcomingId,
  filterSchedule,
  canRegisterForTournament,
  countSncLocals,
  filterOptionsFromRows,
  type ScheduleSort,
} from "@/utils/terminlisteLogikk";

// Minimal rows matching the shape each function needs.
function groupRow(dato: string, stevneFase: string | null = null, erfullfort = false) {
  return { dato, stevne_fase: stevneFase, erfullfort };
}

function sortRow(
  overrides: {
    navn?: string | null;
    dato?: string;
    sted?: string | null;
    innledende?: string | null;
    avsluttende?: string | null;
    klubb?: string | null;
    stevnetype?: string | null;
    kategori?: string | null;
  } = {},
) {
  return {
    navn: overrides.navn ?? null,
    dato: overrides.dato ?? "2026-01-01",
    sted: overrides.sted ?? null,
    innledende: overrides.innledende != null ? { navn: overrides.innledende } : null,
    avsluttende: overrides.avsluttende != null ? { navn: overrides.avsluttende } : null,
    klubb: overrides.klubb != null ? { navn: overrides.klubb } : null,
    stevnetype: overrides.stevnetype != null ? { navn: overrides.stevnetype } : null,
    kategori: overrides.kategori != null ? { navn: overrides.kategori } : null,
  };
}

describe("groupSchedule", () => {
  const today = "2026-07-28";

  it("buckets a future, not-started stevne as upcoming", () => {
    const groups = groupSchedule([groupRow("2026-08-01", null)], today);
    expect(groups.upcoming).toHaveLength(1);
    expect(groups.past).toHaveLength(0);
  });

  it("buckets a stevne dated today, not started, as upcoming", () => {
    const groups = groupSchedule([groupRow(today, "ikke_startet")], today);
    expect(groups.upcoming[0]!.rows).toHaveLength(1);
    expect(groups.past).toHaveLength(0);
  });

  it("buckets a stevne dated today but already live as past", () => {
    const groups = groupSchedule([groupRow(today, "innledende")], today);
    expect(groups.upcoming).toHaveLength(0);
    expect(groups.past[0]!.rows).toHaveLength(1);
  });

  it("buckets a stevne dated today but already finished as past", () => {
    const groups = groupSchedule([groupRow(today, "avsluttende")], today);
    expect(groups.upcoming).toHaveLength(0);
    expect(groups.past[0]!.rows).toHaveLength(1);
  });

  it("buckets a future, not-started but erfullfort stevne as past", () => {
    const groups = groupSchedule([groupRow("2026-08-01", "ikke_startet", true)], today);
    expect(groups.upcoming).toHaveLength(0);
    expect(groups.past[0]!.rows).toHaveLength(1);
  });

  it("buckets a stevne dated today, not started but erfullfort, as past", () => {
    const groups = groupSchedule([groupRow(today, null, true)], today);
    expect(groups.upcoming).toHaveLength(0);
    expect(groups.past[0]!.rows).toHaveLength(1);
  });

  it("buckets a date before today as past regardless of phase", () => {
    const groups = groupSchedule([groupRow("2026-07-01", null)], today);
    expect(groups.upcoming).toHaveLength(0);
    expect(groups.past[0]!.rows).toHaveLength(1);
  });

  it("orders upcoming months ascending", () => {
    const groups = groupSchedule(
      [groupRow("2026-09-05"), groupRow("2026-07-30"), groupRow("2026-08-15")],
      today,
    );
    expect(groups.upcoming.map((g) => g.key)).toEqual(["2026-07", "2026-08", "2026-09"]);
  });

  it("orders past months descending", () => {
    const groups = groupSchedule(
      [
        groupRow("2026-05-05", "ferdig"),
        groupRow("2026-03-30", "ferdig"),
        groupRow("2026-04-15", "ferdig"),
      ],
      today,
    );
    expect(groups.past.map((g) => g.key)).toEqual(["2026-05", "2026-04", "2026-03"]);
  });

  it("groups multiple rows into the same month and preserves input order within it", () => {
    const groups = groupSchedule(
      [groupRow("2026-08-01"), groupRow("2026-08-20"), groupRow("2026-08-10")],
      today,
    );
    expect(groups.upcoming).toHaveLength(1);
    expect(groups.upcoming[0]!.rows.map((r) => r.dato)).toEqual([
      "2026-08-01",
      "2026-08-20",
      "2026-08-10",
    ]);
  });

  it("formats the month label in Norwegian, upper-cased", () => {
    const groups = groupSchedule([groupRow("2026-08-01")], today);
    expect(groups.upcoming[0]!.label).toBe("AUGUST 2026");
  });

  it("returns empty arrays for empty input", () => {
    expect(groupSchedule([], today)).toEqual({ upcoming: [], past: [] });
  });
});

describe("sortSchedule", () => {
  it("sorts by dato ascending", () => {
    const rows = [
      sortRow({ dato: "2026-08-10" }),
      sortRow({ dato: "2026-07-01" }),
      sortRow({ dato: "2026-09-05" }),
    ];
    const sort: ScheduleSort = { column: "dato", direction: "asc" };
    expect(sortSchedule(rows, sort).map((r) => r.dato)).toEqual([
      "2026-07-01",
      "2026-08-10",
      "2026-09-05",
    ]);
  });

  it("sorts by dato descending", () => {
    const rows = [
      sortRow({ dato: "2026-08-10" }),
      sortRow({ dato: "2026-07-01" }),
      sortRow({ dato: "2026-09-05" }),
    ];
    const sort: ScheduleSort = { column: "dato", direction: "desc" };
    expect(sortSchedule(rows, sort).map((r) => r.dato)).toEqual([
      "2026-09-05",
      "2026-08-10",
      "2026-07-01",
    ]);
  });

  it("sorts by navn using Norwegian locale compare", () => {
    const rows = [
      sortRow({ navn: "Øystre Cup" }),
      sortRow({ navn: "Aker Cup" }),
      sortRow({ navn: "Bergen Cup" }),
    ];
    const sort: ScheduleSort = { column: "navn", direction: "asc" };
    expect(sortSchedule(rows, sort).map((r) => r.navn)).toEqual([
      "Aker Cup",
      "Bergen Cup",
      "Øystre Cup",
    ]);
  });

  it("sorts by metode joining innledende and avsluttende", () => {
    const rows = [
      sortRow({ innledende: "Nordhordlandsmetoden", avsluttende: "Cup" }),
      sortRow({ innledende: "Gloppen" }),
    ];
    const sort: ScheduleSort = { column: "metode", direction: "asc" };
    expect(
      sortSchedule(rows, sort).map((r) =>
        `${r.innledende?.navn ?? ""} ${r.avsluttende?.navn ?? ""}`.trim(),
      ),
    ).toEqual(["Gloppen", "Nordhordlandsmetoden Cup"]);
  });

  it("sorts by type, merging stevnetype and kategori into one field", () => {
    const rows = [
      sortRow({ stevnetype: "SNC", kategori: "Kongelag" }),
      sortRow({ stevnetype: "DNC", kategori: "Singel" }),
    ];
    const sort: ScheduleSort = { column: "type", direction: "asc" };
    expect(
      sortSchedule(rows, sort).map((r) =>
        `${r.stevnetype?.navn ?? ""} ${r.kategori?.navn ?? ""}`.trim(),
      ),
    ).toEqual(["DNC Singel", "SNC Kongelag"]);
  });

  it("does not mutate the input array", () => {
    const rows = [sortRow({ dato: "2026-09-01" }), sortRow({ dato: "2026-07-01" })];
    const before = [...rows];
    sortSchedule(rows, { column: "dato", direction: "asc" });
    expect(rows).toEqual(before);
  });
});

describe("findNearestUpcomingId", () => {
  function nearestRow(id: number, dato: string) {
    return { id, dato };
  }

  it("returns undefined for no groups", () => {
    expect(findNearestUpcomingId([])).toBeUndefined();
  });

  it("picks the earliest dato across a single group", () => {
    const groups = [
      {
        key: "2026-08",
        label: "AUGUST 2026",
        rows: [
          nearestRow(1, "2026-08-20"),
          nearestRow(2, "2026-08-01"),
          nearestRow(3, "2026-08-10"),
        ],
      },
    ];
    expect(findNearestUpcomingId(groups)).toBe(2);
  });

  it("picks the earliest dato across multiple groups, not just the first group", () => {
    const groups = [
      { key: "2026-07", label: "JULI 2026", rows: [nearestRow(1, "2026-07-28")] },
      { key: "2026-08", label: "AUGUST 2026", rows: [nearestRow(2, "2026-08-01")] },
    ];
    expect(findNearestUpcomingId(groups)).toBe(1);
  });
});

// ── Filtering ─────────────────────────────────────────────────────────────────

function named(id: number, navn: string) {
  return { id, navn };
}

function filterRow(overrides: Record<string, unknown> = {}) {
  return {
    navn: "Vinterstevnet",
    sted: "Førde",
    ernm: false,
    snc_hovudstevne_id: null,
    klubb: named(3, "Førde HK"),
    stevnetype: named(4, "Lokalt"),
    kategori: named(5, "Singel"),
    innledende: named(6, "Gloppen"),
    avsluttende: named(7, "Cup"),
    ...overrides,
  };
}

const noFilter = {
  searchText: "",
  tournamentTypeId: "",
  throwingMethodId: "",
  clubId: "",
  categoryId: "",
};

describe("filterSchedule", () => {
  it("always hides local SNC stevner", () => {
    const rows = [filterRow(), filterRow({ snc_hovudstevne_id: 90 })];
    expect(filterSchedule(rows, noFilter, undefined)).toHaveLength(1);
  });

  it("searches across name, place, club, type, category and both metoder", () => {
    const rows = [filterRow()];
    for (const text of ["vinter", "førde hk", "lokalt", "singel", "gloppen", "cup"]) {
      expect(filterSchedule(rows, { ...noFilter, searchText: text }, undefined)).toHaveLength(1);
    }
    expect(filterSchedule(rows, { ...noFilter, searchText: "kongelag" }, undefined)).toEqual([]);
  });

  it("filters on the ernm flag when the NM type option is picked", () => {
    // The NM option's own id is 9, but the flag is what decides.
    const rows = [filterRow({ ernm: true, stevnetype: named(4, "Lokalt") }), filterRow()];
    expect(filterSchedule(rows, { ...noFilter, tournamentTypeId: "9" }, 9)).toHaveLength(1);
  });

  it("matches a kastemetode in either fase", () => {
    const rows = [filterRow()];
    expect(filterSchedule(rows, { ...noFilter, throwingMethodId: "6" }, undefined)).toHaveLength(1);
    expect(filterSchedule(rows, { ...noFilter, throwingMethodId: "7" }, undefined)).toHaveLength(1);
    expect(filterSchedule(rows, { ...noFilter, throwingMethodId: "8" }, undefined)).toEqual([]);
  });

  it("combines filters — every one has to match", () => {
    const rows = [filterRow()];
    const filter = { ...noFilter, clubId: "3", categoryId: "99" };
    expect(filterSchedule(rows, filter, undefined)).toEqual([]);
  });
});

describe("filterOptionsFromRows", () => {
  it("lists each used value once, sorted, and skips local SNC rows", () => {
    const options = filterOptionsFromRows([
      filterRow(),
      filterRow({ stevnetype: named(2, "Åpent"), klubb: null, avsluttende: named(6, "Gloppen") }),
      filterRow({ snc_hovudstevne_id: 90, klubb: named(99, "Skjult HK") }),
    ]);
    expect(options.stevnetyper.map((o) => o.navn)).toEqual(["Lokalt", "Åpent"]);
    expect(options.kastemetoder.map((o) => o.navn)).toEqual(["Cup", "Gloppen"]);
    expect(options.klubber.map((o) => o.id)).toEqual([3]);
    expect(options.kategorier.map((o) => o.id)).toEqual([5]);
  });
});

describe("canRegisterForTournament", () => {
  const row = { dato: "2026-08-20", stevne_fase: null, erfullfort: false };

  it("allows registration on the day of the stevne, while it has not started", () => {
    expect(canRegisterForTournament(row, true, "2026-08-20")).toBe(true);
  });

  it("refuses a stevne that has been and gone", () => {
    expect(canRegisterForTournament(row, true, "2026-08-21")).toBe(false);
  });

  it("refuses a started or closed stevne", () => {
    expect(
      canRegisterForTournament({ ...row, stevne_fase: "innledende" }, true, "2026-08-01"),
    ).toBe(false);
    expect(canRegisterForTournament({ ...row, erfullfort: true }, true, "2026-08-01")).toBe(false);
  });

  it("refuses anyone without an approved thrower link", () => {
    expect(canRegisterForTournament(row, false, "2026-08-01")).toBe(false);
  });
});

describe("countSncLocals", () => {
  it("counts the locals per umbrella and ignores plain stevner", () => {
    const counts = countSncLocals([
      { snc_hovudstevne_id: 90 },
      { snc_hovudstevne_id: 90 },
      { snc_hovudstevne_id: 91 },
      { snc_hovudstevne_id: null },
    ]);
    expect([...counts]).toEqual([
      [90, 2],
      [91, 1],
    ]);
  });
});

describe("linkedThrowerId", () => {
  const profil = { kasterid: 12, kobling_status: "godkjent", kobling_kasterid: null };

  it("gives the kasterid once the link is approved", () => {
    expect(linkedThrowerId({ user: {}, profil, clubs: [] } as never)).toBe(12);
  });

  it("refuses a pending or rejected link, and a missing profile", () => {
    for (const status of ["venter", "avvist", "ingen", null]) {
      const auth = { user: {}, profil: { ...profil, kobling_status: status }, clubs: [] };
      expect(linkedThrowerId(auth as never)).toBeNull();
    }
    expect(linkedThrowerId(null)).toBeNull();
    expect(linkedThrowerId({ user: {}, profil: null, clubs: [] } as never)).toBeNull();
  });
});
