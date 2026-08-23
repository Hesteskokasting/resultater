import { buildParticipantMaps } from "@/utils/stevne/participantMaps";

describe("buildParticipantMaps", () => {
  it("maps startnummer, posisjon and hcp per kaster", () => {
    const maps = buildParticipantMaps([
      { kasterid: 1, startnummer: 1, posisjon: null, hcp: 5 },
      { kasterid: 2, startnummer: 2, posisjon: null, hcp: 0 },
    ]);

    expect(maps.startNumberMap).toEqual({ 1: 1, 2: 2 });
    expect(maps.positionMap).toEqual({});
    // hcp 0 is the norm, so only real handicaps get an entry
    expect(maps.hcpMap).toEqual({ 1: 5 });
    expect(maps.isTeam).toBe(false);
  });

  it("reads Par/Mix off a shared startnummer", () => {
    const maps = buildParticipantMaps([
      { kasterid: 1, startnummer: 1, posisjon: 1 },
      { kasterid: 2, startnummer: 1, posisjon: 2 },
      { kasterid: 3, startnummer: 2, posisjon: 1 },
      { kasterid: 4, startnummer: 2, posisjon: 2 },
    ]);

    expect(maps.isTeam).toBe(true);
    expect(maps.positionMap).toEqual({ 1: 1, 2: 2, 3: 1, 4: 2 });
  });

  it("leaves a row without startnummer out instead of giving it 0", () => {
    const maps = buildParticipantMaps([
      { kasterid: 1, startnummer: null },
      { kasterid: 2, startnummer: null },
    ]);

    // Two 0s would group both onto one side in getMatchSides
    expect(maps.startNumberMap).toEqual({});
    expect(maps.isTeam).toBe(false);
  });

  it("skips rows with no kasterid", () => {
    const maps = buildParticipantMaps([{ kasterid: null, startnummer: 3 }]);
    expect(maps.startNumberMap).toEqual({});
  });
});
