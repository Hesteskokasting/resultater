import { canStartTournament, type StartTournamentInput } from "@/utils/stevneStart";

const base: StartTournamentInput = {
  hasInitialMethod: true,
  isStandaloneKongelag: false,
  isTeam: false,
  playerCount: 8,
  pairCount: 4,
  isRoundBased: false,
  isCascade: false,
  roundCount: null,
};

describe("canStartTournament", () => {
  it("lets a ready stevne start", () => {
    expect(canStartTournament(base)).toBeNull();
  });

  it("blocks when no innleiande metode is set", () => {
    expect(canStartTournament({ ...base, hasInitialMethod: false })).toMatch(/kastemetode/);
  });

  it("allows standalone Kongelag without an innleiande metode", () => {
    expect(
      canStartTournament({ ...base, hasInitialMethod: false, isStandaloneKongelag: true }),
    ).toBeNull();
  });

  it("blocks a singel stevne with fewer than 2 players", () => {
    expect(canStartTournament({ ...base, playerCount: 1 })).toMatch(/minst 2 spelarar/);
  });

  it("blocks a par stevne with fewer than 4 players", () => {
    const msg = canStartTournament({ ...base, isTeam: true, playerCount: 3, pairCount: 1 });
    expect(msg).toMatch(/minst 2 par/);
  });

  it("blocks a round-based metode without antal rundar", () => {
    expect(canStartTournament({ ...base, isRoundBased: true, roundCount: null })).toMatch(
      /antal rundar/,
    );
  });

  it("blocks a cascade metode above the round cap", () => {
    // 4 entries cap out at 2 rounds
    const msg = canStartTournament({
      ...base,
      playerCount: 4,
      isRoundBased: true,
      isCascade: true,
      roundCount: 9,
    });
    expect(msg).toMatch(/maks/);
  });

  it("counts pairs, not players, against the cascade cap", () => {
    const input = {
      ...base,
      isTeam: true,
      playerCount: 16,
      pairCount: 4,
      isRoundBased: true,
      isCascade: true,
      roundCount: 3,
    };
    expect(canStartTournament(input)).toMatch(/maks/);
    expect(canStartTournament({ ...input, roundCount: 2 })).toBeNull();
  });
});
