/**
 * The SNC switch has to unregister before it can register — the trigger allows
 * only one local stevne per round. What matters is which step failed, since a
 * failure on the second one leaves the thrower entered nowhere.
 */

const mocks = vi.hoisted(() => {
  const responses: { data: unknown; error: unknown }[] = [];

  /**
   * Every builder method returns the same promise, which takes the next queued
   * response when it is awaited — the calls are sequential, so order holds.
   */
  function chain(): unknown {
    const query = Promise.resolve().then(() => responses.shift() ?? { data: null, error: null });
    const builder = query as unknown as Record<string, unknown>;
    for (const method of ["delete", "insert", "eq", "select", "single"]) {
      builder[method] = () => query;
    }
    return query;
  }

  return { responses, supabase: { from: () => chain() } };
});

vi.mock("@/supabase", () => ({ supabase: mocks.supabase }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { switchRegistration } from "@/services/pameldingService";

const deleteOk = { data: [{ id: 1 }], error: null };
const insertOk = { data: { id: 2 }, error: null };

beforeEach(() => {
  mocks.responses.length = 0;
});

describe("switchRegistration", () => {
  it("unregisters and registers again", async () => {
    mocks.responses.push(deleteOk, insertOk);
    expect(await switchRegistration(1, 9, 77)).toEqual({ error: null, step: null });
  });

  it("stops on a failed avmelding without registering anywhere", async () => {
    mocks.responses.push({ data: null, error: { message: "nei" } }, insertOk);
    const { step } = await switchRegistration(1, 9, 77);

    expect(step).toBe("avmelding");
    // The insert response is still queued — it was never consumed
    expect(mocks.responses).toHaveLength(1);
  });

  it("reports a failed pamelding, which leaves the thrower entered nowhere", async () => {
    mocks.responses.push(deleteOk, { data: null, error: { message: "nei" } });
    expect((await switchRegistration(1, 9, 77)).step).toBe("pamelding");
  });

  it("treats a delete that matched no rows as a failed avmelding", async () => {
    mocks.responses.push({ data: [], error: null }, insertOk);
    expect((await switchRegistration(1, 9, 77)).step).toBe("avmelding");
  });
});
