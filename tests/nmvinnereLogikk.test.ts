import {
  NM_CATEGORIES,
  findCategory,
  defaultGender,
  genderOptions,
  subtitleText,
  buildWinnersList,
  latestYear,
} from "@/utils/nmvinnereLogikk";

function row(stevneId: number, dato: string, klasseid: number, name: string, klubb = "Bergen HK") {
  return {
    id: stevneId * 100 + klasseid,
    klasseid,
    kaster: { id: 1, fornavn: name, etternavn: "Hansen" },
    klubb: { id: 1, navn: klubb },
    stevne: { id: stevneId, dato },
  } as never;
}

describe("findCategory", () => {
  it("falls back to the first category for an unknown id", () => {
    expect(findCategory(9999)).toBe(NM_CATEGORIES[0]);
    expect(findCategory(4)!.name).toBe("Lag");
  });
});

describe("defaultGender / genderOptions", () => {
  it("gives Hesteskogolf 'all' and everything else 'open'", () => {
    expect(defaultGender("always")).toBe("all");
    expect(defaultGender("historical")).toBe("open");
    expect(defaultGender(false)).toBe("open");
  });

  it("offers no gender select for a category that never split", () => {
    expect(genderOptions(false)).toEqual([]);
  });

  it("leads with the neutral choice matching the default gender", () => {
    expect(genderOptions("always")[0]!.value).toBe("all");
    expect(genderOptions("historical")[0]!.value).toBe("open");
    expect(genderOptions("historical")).toHaveLength(3);
  });
});

describe("subtitleText", () => {
  it("appends the gender only when one is chosen", () => {
    expect(subtitleText("Singel", "men")).toBe("Singel Herrer");
    expect(subtitleText("Singel", "women")).toBe("Singel Damer");
    expect(subtitleText("Singel", "open")).toBe("Singel");
    expect(subtitleText("Hesteskogolf", "all")).toBe("Hesteskogolf");
  });
});

describe("buildWinnersList", () => {
  it("collapses a pair title into one entry with both throwers", () => {
    const list = buildWinnersList([
      row(5, "2020-06-01", 1, "Kari"),
      row(5, "2020-06-01", 1, "Ola"),
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]!.throwers.map((k) => k.fornavn)).toEqual(["Kari", "Ola"]);
    expect(list[0]!.year).toBe(2020);
  });

  // Same stevne, different class: two separate titles, not one merged row.
  it("keeps classes within the same stevne apart", () => {
    expect(
      buildWinnersList([row(5, "2020-06-01", 1, "Kari"), row(5, "2020-06-01", 3, "Ola")]),
    ).toHaveLength(2);
  });

  it("sorts newest year first", () => {
    const list = buildWinnersList([row(1, "2018-06-01", 1, "A"), row(2, "2024-06-01", 1, "B")]);
    expect(list.map((e) => e.year)).toEqual([2024, 2018]);
  });
});

describe("latestYear", () => {
  it("returns the newest year present", () => {
    expect(latestYear([row(1, "2018-06-01", 1, "A"), row(2, "2024-06-01", 1, "B")], 2026)).toBe(
      2024,
    );
  });

  it("falls back to the current year for an empty category", () => {
    expect(latestYear([], 2026)).toBe(2026);
  });
});
