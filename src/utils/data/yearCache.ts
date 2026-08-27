/**
 * One-slot buffer for pages that show a single season at a time: switching year
 * back and forth is free, but only the last year stays in memory. A failed load
 * is never buffered, so the next attempt retries instead of serving the failure.
 */
export function yearCache<T>(load: (year: number) => Promise<T | null>): {
  get: (year: number) => Promise<T | null>;
  clear: () => void;
} {
  let cached: { year: number; data: T } | null = null;
  return {
    async get(year: number): Promise<T | null> {
      if (cached?.year === year) return cached.data;
      const data = await load(year);
      if (data) cached = { year, data };
      return data;
    },
    clear(): void {
      cached = null;
    },
  };
}
