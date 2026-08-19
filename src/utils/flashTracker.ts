/**
 * Decides which ids should carry a one-shot flash class on this render.
 *
 * The flash is a CSS animation on markup that innerHTML rebuilds on every render,
 * so "flash once" can't be a render counter — a confirm can be followed by one
 * re-render or by five, and the ones that never came left ids pending forever.
 * Track *when* an id first showed up instead and flash it for as long as the
 * animation lasts. Ids present on the first pass are pre-existing, never flashed.
 */
export function createFlashTracker(windowMs: number, now: () => number = Date.now) {
  /** id → first seen at; 0 means "was already there when we started watching". */
  let firstSeen = new Map<number, number>();
  let started = false;

  return {
    /** Forget everything — call when the view switches to another stevne. */
    reset(): void {
      firstSeen = new Map();
      started = false;
    },

    /** The subset of `ids` that appeared within the last windowMs. */
    pick(ids: Iterable<number>): Set<number> {
      const t = now();
      const current = new Set(ids);
      for (const id of current) if (!firstSeen.has(id)) firstSeen.set(id, started ? t : 0);
      // An id can drop out again (a confirm undone); let it flash if it returns.
      for (const id of firstSeen.keys()) if (!current.has(id)) firstSeen.delete(id);
      started = true;
      return new Set(
        [...current].filter((id) => firstSeen.get(id)! > 0 && t - firstSeen.get(id)! < windowMs),
      );
    },
  };
}
