import { yearCache } from "@/utils/yearCache";

describe("yearCache", () => {
  it("loads once and serves the same year from the buffer", async () => {
    const load = vi.fn(async (year: number) => ({ year }));
    const cache = yearCache(load);

    const first = await cache.get(2025);
    const second = await cache.get(2025);

    expect(first).toBe(second);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads when the year changes, and again when it changes back", async () => {
    const load = vi.fn(async (year: number) => ({ year }));
    const cache = yearCache(load);

    await cache.get(2025);
    await cache.get(2024);
    await cache.get(2025);

    expect(load).toHaveBeenCalledTimes(3);
  });

  it("reloads after clear()", async () => {
    const load = vi.fn(async (year: number) => ({ year }));
    const cache = yearCache(load);

    await cache.get(2025);
    cache.clear();
    await cache.get(2025);

    expect(load).toHaveBeenCalledTimes(2);
  });

  // A buffered failure would keep the page empty until a reload.
  it("never buffers a failed load", async () => {
    const load = vi.fn(async (year: number) => (year === 2025 ? null : { year }));
    const cache = yearCache(load);

    expect(await cache.get(2025)).toBeNull();
    expect(await cache.get(2025)).toBeNull();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
