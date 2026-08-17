// ── Participant lookups from resultat rows ────────────────────────────────────
//
// Pure — no DOM, no fetching. Both fasene and the print banner need the same
// three maps off the same table, so they build them here rather than each their
// own way.
//
export interface ParticipantResultRow {
  kasterid: number | null;
  startnummer?: number | null;
  posisjon?: number | null;
  hcp?: number | null;
}

export interface ParticipantMaps {
  startNumberMap: Record<number, number>;
  /** Only throwers with a real handicap — an absent entry means 0. */
  hcpMap: Record<number, number>;
  positionMap: Record<number, number>;
  /** Par/Mix: two players share a startnummer */
  isTeam: boolean;
}

/**
 * A row without a startnummer is left out of startNumberMap on purpose:
 * getMatchSides then keys it per kaster instead of grouping every such row onto
 * one shared side.
 */
export function buildParticipantMaps(resultat: ParticipantResultRow[]): ParticipantMaps {
  const startNumberMap: Record<number, number> = {};
  const hcpMap: Record<number, number> = {};
  const positionMap: Record<number, number> = {};
  const snrCount = new Map<number, number>();

  for (const r of resultat) {
    if (r.kasterid == null) continue;
    if (r.startnummer != null) {
      startNumberMap[r.kasterid] = r.startnummer;
      snrCount.set(r.startnummer, (snrCount.get(r.startnummer) ?? 0) + 1);
    }
    if (r.posisjon != null) positionMap[r.kasterid] = r.posisjon;
    if (r.hcp != null && r.hcp > 0) hcpMap[r.kasterid] = r.hcp;
  }

  return { startNumberMap, hcpMap, positionMap, isTeam: [...snrCount.values()].some((c) => c > 1) };
}
