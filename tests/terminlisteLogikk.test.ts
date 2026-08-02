import {
  groupSchedule,
  sortSchedule,
  findNearestUpcomingId,
  type ScheduleSort,
} from "@/utils/terminlisteLogikk";

// Minimal rows matching the shape each function needs.
function groupRow(dato: string, stevneFase: string | null = null) {
  return { dato, stevne_fase: stevneFase };
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
