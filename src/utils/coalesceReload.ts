/**
 * Collapses a burst of realtime events into a few reloads.
 *
 * Postgres realtime emits one event per changed row, so a bulk write (a
 * multi-row omgang insert, an autofullfør run) fires hundreds of events. Calling
 * the reload directly per event floods the browser connection pool
 * (ERR_INSUFFICIENT_RESOURCES). This debounces the burst and, while a reload is
 * in flight, queues exactly one trailing run instead of piling them up.
 */
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
