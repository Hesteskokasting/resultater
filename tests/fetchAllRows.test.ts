/**
 * PostgREST caps a response at 1000 rows without saying so, so anything reading a
 * whole table has to page. These pin down that the paging stops, and that it does
 * not depend on the server cap actually being 1000.
 */
import { fetchAllRows } from "@/utils/fetchAllRows";

/** A fake table of `total` rows, served in pages of at most `cap`. */
function table(total: number, cap: number) {
  const calls: [number, number][] = [];
  const rows = Array.from({ length: total }, (_, i) => i);
  const page = (from: number, to: number) => {
    calls.push([from, to]);
    return Promise.resolve({
      data: rows.slice(from, Math.min(to + 1, from + cap)),
      error: null as unknown,
    });
  };
  return { calls, page };
}

describe("fetchAllRows", () => {
  it("gathers every row past the 1000-row cap", async () => {
    const t = table(1632, 1000);
    const { data, error } = await fetchAllRows(t.page);

    expect(error).toBeNull();
    expect(data).toHaveLength(1632);
    expect(data[1631]).toBe(1631);
    expect(t.calls).toEqual([
      [0, 999],
      [1000, 1999],
      [1632, 2631],
    ]);
  });

  // A short page cannot be told apart from a low server cap, so the loop confirms
  // with one empty request rather than risking a truncated list.
  it("confirms the end with an empty page", async () => {
    const t = table(261, 1000);
    const { data } = await fetchAllRows(t.page);

    expect(data).toHaveLength(261);
    expect(t.calls).toEqual([
      [0, 999],
      [261, 1260],
    ]);
  });

  it("pages correctly when the server cap is lower than the page size", async () => {
    const t = table(1200, 500);
    const { data } = await fetchAllRows(t.page);

    expect(data).toHaveLength(1200);
    expect(t.calls[1]).toEqual([500, 1499]);
  });

  it("returns the rows it already had when a page fails", async () => {
    const err = { message: "boom" };
    let call = 0;
    const { data, error } = await fetchAllRows<number>(() => {
      call += 1;
      return Promise.resolve(
        call === 1
          ? { data: Array.from({ length: 1000 }, (_, i) => i), error: null }
          : { data: null, error: err },
      );
    });

    expect(error).toBe(err);
    expect(data).toHaveLength(1000);
  });
});
