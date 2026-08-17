/**
 * Fullfør turnering is two writes with no transaction between them, so which
 * step failed decides what the organizer is told — placements on an open stevne
 * is a different mess from nothing written at all.
 */

const mocks = vi.hoisted(() => {
  // stevneService builds query objects at module load purely for their types
  const chain: unknown = new Proxy({}, { get: () => () => chain });
  return { writePlacements: vi.fn(), rpc: vi.fn(), from: () => chain };
});

vi.mock("@/supabase", () => ({ supabase: { from: mocks.from, rpc: mocks.rpc } }));
vi.mock("@/services/resultatService", () => ({ writePlacements: mocks.writePlacements }));
vi.mock("@/services/kampGenereringInnledendeService", () => ({
  generateInitialRoundMatches: vi.fn(),
}));
vi.mock("@/services/xkastKongelagService", () => ({ generateKongelagCourts: vi.fn() }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { completeTournament } from "@/services/stevneService";

const placements = [{ kasterid: 7 }];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.writePlacements.mockResolvedValue({ error: null });
  mocks.rpc.mockResolvedValue({ error: null });
});

describe("completeTournament", () => {
  it("writes the placements, then marks the stevne completed", async () => {
    expect(await completeTournament(5, placements)).toEqual({ error: null, step: null });
    expect(mocks.writePlacements).toHaveBeenCalledWith(5, placements);
  });

  it("never marks the stevne completed when the placements failed", async () => {
    mocks.writePlacements.mockResolvedValue({ error: { message: "nei" } });
    const { step } = await completeTournament(5, placements);

    expect(step).toBe("plassering");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("reports the fullfor step, where the placements are already stored", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "nei" } });
    expect((await completeTournament(5, placements)).step).toBe("fullfor");
  });
});
