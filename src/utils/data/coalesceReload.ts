/**
 * Collapses a burst of realtime events into a few reloads.
 *
 * Postgres realtime emits one event per changed row, so a bulk write (a
 * multi-row omgang insert, an autofullfør run) fires hundreds of events. Calling
 * the reload directly per event floods the browser connection pool
 * (ERR_INSUFFICIENT_RESOURCES). This debounces the burst and, while a reload is
 * in flight, queues exactly one trailing run instead of piling them up.
 */
let holds = 0;
const waitingForResume = new Set<() => void>();

/**
 * Blocks every coalesced reload until the returned release is called. A numberpad
 * takes one for its lifetime: repainting the view under an open pad is wasted
 * work, and on a court with 10-20 players entering scores at once, every one of
 * them would otherwise refetch the whole view on every throw anyone records.
 * Reloads that fall in the window are not dropped — one runs on release.
 */
export function holdReloads(): () => void {
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holds > 0) return;
    const resumers = [...waitingForResume];
    waitingForResume.clear();
    for (const resume of resumers) resume();
  };
}

export function coalesceReload(run: () => Promise<void> | void, delayMs = 150): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let pending = false;

  function schedule(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void fire(), delayMs);
  }

  async function fire(): Promise<void> {
    timer = null;
    if (holds > 0) {
      waitingForResume.add(schedule);
      return;
    }
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      await run();
    } finally {
      running = false;
      if (pending) {
        pending = false;
        schedule();
      }
    }
  }

  return schedule;
}
