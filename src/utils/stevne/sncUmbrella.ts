export interface LiveTournamentRow {
  id: number;
  dato?: string | null;
  erfullfort?: boolean | null;
  snc_hovudstevne_id?: number | null;
}

/** The umbrellas to fetch: every SNC parent that has a running local stevne. */
export function collectSncParentIds(ongoing: LiveTournamentRow[]): number[] {
  return [
    ...new Set(ongoing.map((s) => s.snc_hovudstevne_id).filter((id): id is number => id != null)),
  ];
}

/**
 * Swaps the running local stevner for the umbrella they belong to, so an SNC
 * round shows as one card rather than one per venue. A finished umbrella must
 * not reappear as live just because a local is still running, and one with its
 * own live phase is already among the plain stevner. Re-sorted by date —
 * inserting the umbrellas would otherwise drop the query's order.
 */
export function mergeSncUmbrellas<T extends LiveTournamentRow>(ongoing: T[], sncParents: T[]): T[] {
  const plainLive = ongoing.filter((s) => s.snc_hovudstevne_id == null);
  const plainLiveIds = new Set(plainLive.map((s) => s.id));
  return [...plainLive, ...sncParents.filter((s) => !s.erfullfort && !plainLiveIds.has(s.id))].sort(
    (a, b) => (a.dato ?? "").localeCompare(b.dato ?? ""),
  );
}
