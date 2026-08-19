import { describe, expect, it } from "vite-plus/test";
import { createFlashTracker } from "@/utils/flashTracker";

function tracker() {
  let now = 1000;
  const t = createFlashTracker(8000, () => now);
  return { t, tick: (ms: number) => (now += ms) };
}

describe("createFlashTracker", () => {
  it("never flashes what was already there on the first pass", () => {
    const { t } = tracker();
    expect([...t.pick([1, 2, 3])]).toEqual([]);
  });

  it("flashes a new id, and keeps flashing it across re-renders inside the window", () => {
    const { t, tick } = tracker();
    t.pick([1]);
    expect([...t.pick([1, 2])]).toEqual([2]);
    tick(3000);
    expect([...t.pick([1, 2])]).toEqual([2]);
  });

  it("stops flashing once the animation window has passed", () => {
    const { t, tick } = tracker();
    t.pick([1]);
    t.pick([1, 2]);
    tick(8000);
    expect([...t.pick([1, 2])]).toEqual([]);
  });

  it("does not flash a whole other stevne's ids after reset", () => {
    const { t } = tracker();
    t.pick([1, 2]);
    t.reset();
    expect([...t.pick([50, 51])]).toEqual([]);
  });

  it("flashes again when an id returns after being unconfirmed", () => {
    const { t } = tracker();
    t.pick([1, 2]);
    t.pick([1]);
    expect([...t.pick([1, 2])]).toEqual([2]);
  });
});
