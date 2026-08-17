/**
 * A query param carried inside the hash, as in "#/logginn?redirect=/stevne/5/info".
 * Also checks the real query string, because a redirect back from Supabase lands
 * its params there (before the fragment) rather than inside the hash.
 */
export function getHashQueryParam(name: string): string | null {
  return (
    new URLSearchParams(location.hash.split("?")[1] ?? "").get(name) ??
    new URLSearchParams(location.search).get(name)
  );
}

/** Runs `cleanup` once, the next time the user navigates to a different hash route. */
export function onNavigateAway(cleanup: () => void): void {
  window.addEventListener("hashchange", cleanup, { once: true });
}
