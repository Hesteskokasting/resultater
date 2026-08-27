import { throwerNamesByClub, filterClubs, filterMembers } from "@/pages/klubbLogic";

function thrower(fornavn: string, etternavn: string, klubbId: number | null) {
  return { fornavn, etternavn, klubb: klubbId === null ? null : { id: klubbId } };
}

const clubs = [
  { id: 1, navn: "Bergen HK" },
  { id: 2, navn: "Oslo HK" },
];

describe("throwerNamesByClub", () => {
  it("groups lower-cased names per club and skips throwers without one", () => {
    const map = throwerNamesByClub([
      thrower("Kari", "Nordmann", 1),
      thrower("Ola", "Hansen", 1),
      thrower("Per", "Berg", 2),
      thrower("Uten", "Klubb", null),
    ]);
    expect(map.get(1)).toEqual(["kari nordmann", "ola hansen"]);
    expect(map.get(2)).toEqual(["per berg"]);
    expect(map.size).toBe(2);
  });
});

describe("filterClubs", () => {
  const namesByClub = throwerNamesByClub([
    thrower("Kari", "Nordmann", 1),
    thrower("Per", "Berg", 2),
  ]);

  it("returns the same list when the search is blank", () => {
    expect(filterClubs(clubs, namesByClub, "  ")).toBe(clubs);
  });

  it("matches on the club name", () => {
    expect(filterClubs(clubs, namesByClub, "oslo")).toEqual([clubs[1]]);
  });

  // The whole point of the name map: searching a thrower finds their club.
  it("matches on a member's name", () => {
    expect(filterClubs(clubs, namesByClub, "nordmann")).toEqual([clubs[0]]);
  });

  it("gives an empty list when nothing matches", () => {
    expect(filterClubs(clubs, namesByClub, "trondheim")).toEqual([]);
  });
});

describe("filterMembers", () => {
  const members = [
    { fornavn: "Kari", etternavn: "Nordmann" },
    { fornavn: "Ola", etternavn: "Hansen" },
  ];

  it("returns the same list when the search is blank", () => {
    expect(filterMembers(members, "")).toBe(members);
  });

  it("matches on either name part, case-insensitively", () => {
    expect(filterMembers(members, "HANSEN")).toEqual([members[1]]);
    expect(filterMembers(members, "kari")).toEqual([members[0]]);
  });
});
