/**
 * The year buffer decides how often a full season is refetched, and a stale hit
 * would show one year's results under another year's heading.
 */

const mocks = vi.hoisted(() => {
  const rules = vi.fn();
  // norgescupService builds query objects at module load purely for their types;
  // getRules is the only chain actually awaited, and it ends in maybeSingle().
  const chain: unknown = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === "maybeSingle") return () => Promise.resolve(rules());
        if (prop === "then") return undefined;
        return () => chain;
      },
    },
  );
  return { rules, fetchAllRows: vi.fn(), from: () => chain };
});

vi.mock("@/supabase", () => ({ supabase: { from: mocks.from } }));
vi.mock("@/utils/fetchAllRows", () => ({ fetchAllRows: mocks.fetchAllRows }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { loadCupYear, clearCupYearCache } from "@/services/norgescupService";

function resultRow(stevneId: number, year: number) {
  return {
    id: 1,
    nc_poeng: 10,
    stevneid: stevneId,
    stevne: {
      id: stevneId,
      navn: "NC Bergen",
      dato: `${year}-05-01`,
      stevnetype: { id: 1, navn: "NC" },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  clearCupYearCache();
  mocks.rules.mockReturnValue({ data: { year: 2025, maxtotal: 6 }, error: null });
  mocks.fetchAllRows.mockImplementation(async () => ({ data: [resultRow(7, 2025)], error: null }));
});

describe("loadCupYear", () => {
  it("fetches once and serves the same year from the buffer", async () => {
    const first = await loadCupYear(2025);
    const second = await loadCupYear(2025);

    expect(first).toBe(second);
    expect(mocks.fetchAllRows).toHaveBeenCalledTimes(1);
    expect(first!.tournaments).toHaveLength(1);
    expect(first!.results).toHaveLength(1);
  });

  it("refetches when the year changes", async () => {
    await loadCupYear(2025);
    await loadCupYear(2024);
    expect(mocks.fetchAllRows).toHaveBeenCalledTimes(2);
  });

  it("refetches after the buffer is cleared", async () => {
    await loadCupYear(2025);
    clearCupYearCache();
    await loadCupYear(2025);
    expect(mocks.fetchAllRows).toHaveBeenCalledTimes(2);
  });

  it("gives null on a failed fetch and buffers nothing", async () => {
    mocks.fetchAllRows.mockResolvedValue({ data: [], error: { message: "boom" } });
    expect(await loadCupYear(2025)).toBeNull();

    mocks.fetchAllRows.mockResolvedValue({ data: [resultRow(7, 2025)], error: null });
    expect(await loadCupYear(2025)).not.toBeNull();
  });
});
