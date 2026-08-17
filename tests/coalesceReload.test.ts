import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { coalesceReload, holdReloads } from "@/utils/coalesceReload";

describe("coalesceReload", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("collapses a burst of events into one run", async () => {
    const run = vi.fn(() => Promise.resolve());
    const trigger = coalesceReload(run, 50);

    for (let i = 0; i < 500; i++) trigger();
    expect(run).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("queues exactly one trailing run for events during an in-flight run", async () => {
    let release: (() => void) | null = null;
    const run = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
    const trigger = coalesceReload(run, 50);

    trigger();
    await vi.advanceTimersByTimeAsync(50);
    expect(run).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 100; i++) trigger();
    await vi.advanceTimersByTimeAsync(50);
    expect(run).toHaveBeenCalledTimes(1);

    release!();
    await vi.advanceTimersByTimeAsync(50);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("runs again for events after the previous run settled", async () => {
    const run = vi.fn(() => Promise.resolve());
    const trigger = coalesceReload(run, 50);

    trigger();
    await vi.advanceTimersByTimeAsync(50);
    trigger();
    await vi.advanceTimersByTimeAsync(50);
    expect(run).toHaveBeenCalledTimes(2);
  });

  describe("holdReloads", () => {
    it("holds a burst while a pad is open and runs once on release", async () => {
      const run = vi.fn(() => Promise.resolve());
      const trigger = coalesceReload(run, 50);

      const release = holdReloads();
      for (let i = 0; i < 200; i++) trigger();
      await vi.advanceTimersByTimeAsync(500);
      expect(run).not.toHaveBeenCalled();

      release();
      await vi.advanceTimersByTimeAsync(50);
      expect(run).toHaveBeenCalledTimes(1);
    });

    it("stays held until the last of several holds is released", async () => {
      const run = vi.fn(() => Promise.resolve());
      const trigger = coalesceReload(run, 50);

      const releaseA = holdReloads();
      const releaseB = holdReloads();
      trigger();
      releaseA();
      await vi.advanceTimersByTimeAsync(50);
      expect(run).not.toHaveBeenCalled();

      releaseB();
      await vi.advanceTimersByTimeAsync(50);
      expect(run).toHaveBeenCalledTimes(1);
    });

    it("ignores a repeated release so the count cannot go negative", async () => {
      const run = vi.fn(() => Promise.resolve());
      const trigger = coalesceReload(run, 50);

      const release = holdReloads();
      release();
      release();

      const stillHeld = holdReloads();
      trigger();
      await vi.advanceTimersByTimeAsync(50);
      expect(run).not.toHaveBeenCalled();

      stillHeld();
      await vi.advanceTimersByTimeAsync(50);
      expect(run).toHaveBeenCalledTimes(1);
    });
  });
});
