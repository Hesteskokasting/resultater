import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { coalesceReload } from "@/utils/coalesceReload";

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
});
