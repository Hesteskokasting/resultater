// ── Standings: shapes and ranking ─────────────────────────────────────────────
//
// Pure derivation over kamp/resultat rows — no DOM, no fetching. The tables that
// draw these rows live in pages/stevne/faseView.ts, and kampgenerering ranks with
// sortStandings too, which is why this is not a view concern.
//
import { matchScoreForPlayer, getMatchSides, groupStandingsByPair } from "@/utils/kamp";
import type { Tables } from "@/types";

// Minimal shapes for organizer kamp data (spelarar is an aliased join from kamp_spelar)
export interface StandingMatchPlayer {
  kasterid: number;
  kamp_poeng: number;
  score_poeng: number;
  antall_ringer?: number | null;
  omgangar?: Pick<Tables<"kamp_omgang">, "score" | "antall_ringer">[] | null;
  kaster?: { fornavn: string; etternavn: string } | null;
}

export interface StandingMatch extends Pick<
  Tables<"kamp">,
  "er_bekreftet" | "er_walkover" | "runde_nummer" | "bane_nummer"
> {
  spelarar?: StandingMatchPlayer[] | null;
}

export interface MatchForSorting {
  er_bekreftet: boolean;
  spelarar?:
    | {
        kasterid: number | null;
        kamp_poeng: number | null;
        score_poeng?: number | null;
        omgangar?: { score?: number | null }[] | null;
      }[]
    | null;
}

export interface StandingRow {
  kasterid: number;
  navn?: string | null;
  startnummer?: number | null;
  kamp_poeng?: number | null;
  score_poeng?: number | null;
  /** X-kast innledande poeng/ringere — present when the cup is fed by an X-kast format. */
  poeng_xkast?: number | null;
  antall_ring_xkast?: number | null;
  runde_eliminert?: number | null;
  plassering?: number | null;
  hcp?: number | null;
  gruppe?: { navn: string } | null;
  antall_kamper?: number | null;
}

export interface PlayerMapRow {
  kasterid: number;
  navn: string;
  startnummer: number | null;
  kamp_poeng: number;
  score_poeng: number;
  antall_kamper: number;
}

export function buildInitialPlayerMap(
  allMatches: StandingMatch[],
  startNumberMap: Record<number, number>,
): { playerMap: Record<number, PlayerMapRow>; realThrowerIds: Set<number> } {
  const playerMap: Record<number, PlayerMapRow> = {};
  const realThrowerIds = new Set<number>();

  for (const match of allMatches) {
    // In a walkover only the bye side counts — exclude any phantom opposing side
    // (side-based: the bye pair's own partner shares the startnummer and stays in).
    const [, byeSide2] = match.er_walkover
      ? getMatchSides(match.spelarar, startNumberMap)
      : [null, null];
    for (const sp of match.spelarar ?? []) {
      if (!sp.kasterid || !sp.kaster) continue;
      if (match.er_walkover && byeSide2?.members.some((m) => m.kasterid === sp.kasterid)) continue;
      realThrowerIds.add(sp.kasterid);
      const playerRow = (playerMap[sp.kasterid] ??= {
        kasterid: sp.kasterid,
        navn: `${sp.kaster.fornavn} ${sp.kaster.etternavn}`,
        startnummer: startNumberMap[sp.kasterid] ?? null,
        kamp_poeng: 0,
        score_poeng: 0,
        antall_kamper: 0,
      });
      if (match.er_bekreftet) {
        playerRow.kamp_poeng += sp.kamp_poeng;
        playerRow.score_poeng += sp.score_poeng;
        playerRow.antall_kamper += 1;
      }
    }
  }

  return { playerMap, realThrowerIds };
}

export function buildFinalStandings(
  initialRoundMatches: StandingMatch[],
  resultat: Array<{
    kasterid: number;
    startnummer: number | null;
    plassering: number | null;
    runde_eliminert: number | null;
    gruppe: { navn: string } | null;
    poeng_xkast?: number | null;
    antall_ring_xkast?: number | null;
  }>,
  nameMap: Record<number, string>,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number> = {},
): StandingRow[] {
  const { playerMap } = buildInitialPlayerMap(initialRoundMatches, startNumberMap);
  const rows = resultat.map((r) => ({
    kasterid: r.kasterid,
    navn: nameMap[r.kasterid] ?? `Spelar ${r.kasterid}`,
    startnummer: r.startnummer,
    plassering: r.plassering,
    runde_eliminert: r.runde_eliminert,
    kamp_poeng: playerMap[r.kasterid]?.kamp_poeng ?? 0,
    score_poeng: playerMap[r.kasterid]?.score_poeng ?? 0,
    // X-kast innledande scores live on resultat, not in kamp rows
    poeng_xkast: r.poeng_xkast ?? null,
    antall_ring_xkast: r.antall_ring_xkast ?? null,
    gruppe: r.gruppe,
  }));
  // Par/Mix: one row per pair (no-op for Singel — every startnummer is unique)
  return sortStandings(groupStandingsByPair(rows, positionMap), initialRoundMatches);
}

/**
 * Placement order for a two-group cup: A takes 1..nA, then B, then anyone
 * ungrouped. sortStandings interleaves the groups, and filtering keeps each
 * group's own order intact.
 */
export function orderStandingsByGroup(standings: StandingRow[]): StandingRow[] {
  const inGroup = (row: StandingRow, navn: string): boolean => row.gruppe?.navn === navn;
  return [
    ...standings.filter((r) => inGroup(r, "A")),
    ...standings.filter((r) => inGroup(r, "B")),
    ...standings.filter((r) => !inGroup(r, "A") && !inGroup(r, "B")),
  ];
}

/**
 * Head-to-head points within one tied block: kamp_poeng from the confirmed
 * matches where at least two members of the block met, as a mini round-robin.
 * Deliberately one number per player rather than a pairwise comparison — A beats
 * B, B beats C, C beats A is an ordinary result, and a comparator that can
 * contradict itself lets Array.sort land on an order no ranking rule justifies.
 *
 * NB: the written rules drop head-to-head entirely once three or more are tied.
 * We keep it as this mini round-robin instead, which stays decisive in the cases
 * the rules leave to the scores alone. Deliberate — to follow the rules to the
 * letter, skip the block when it holds more than two rows.
 */
function headToHeadPoints(block: StandingRow[], confirmed: MatchForSorting[]): Map<number, number> {
  const points = new Map<number, number>(block.map((r) => [r.kasterid, 0]));
  for (const kamp of confirmed) {
    const met = (kamp.spelarar ?? []).filter((s) => s.kasterid != null && points.has(s.kasterid));
    if (met.length < 2) continue;
    for (const sp of met) {
      points.set(sp.kasterid!, (points.get(sp.kasterid!) ?? 0) + (sp.kamp_poeng ?? 0));
    }
  }
  return points;
}

export function sortStandings(standings: StandingRow[], matches: MatchForSorting[]): StandingRow[] {
  const confirmed = matches.filter((k) => k.er_bekreftet);

  // X-kast innledande ranks on poeng_xkast → ringere, kamp-based innledande on
  // kamp_poeng → score_poeng. Decided once for the table, as the columns are.
  const useXkast = standings.some((r) => r.poeng_xkast != null);
  const primaryOf = (r: StandingRow): number =>
    useXkast ? (r.poeng_xkast ?? 0) : (r.kamp_poeng ?? 0);
  const secondaryOf = (r: StandingRow): number =>
    useXkast ? (r.antall_ring_xkast ?? 0) : (r.score_poeng ?? 0);

  // Each player's confirmed match scores, best first. Every match here is
  // confirmed, so this reads the stored totals the SP column adds up.
  const scoreCache = new Map<number, number[]>();
  const scoresFor = (kasterid: number): number[] => {
    let scores = scoreCache.get(kasterid);
    if (!scores) {
      scores = confirmed
        .flatMap((k) => k.spelarar?.filter((s) => s.kasterid === kasterid) ?? [])
        .map((s) => matchScoreForPlayer(s, true))
        .sort((x, y) => y - x);
      scoreCache.set(kasterid, scores);
    }
    return scores;
  };

  const ordered = [...standings].sort((a, b) => {
    // Players with a final plassering (1–4) always rank above non-plassered players.
    if (a.plassering != null && b.plassering != null) return a.plassering - b.plassering;
    if (a.plassering != null) return -1;
    if (b.plassering != null) return 1;

    // Active players (runde_eliminert == null) always come first
    const aActive = a.runde_eliminert == null;
    const bActive = b.runde_eliminert == null;
    if (aActive !== bActive) return aActive ? -1 : 1;

    // For eliminated: later round = better placement
    if (!aActive) {
      const roundDiff = (b.runde_eliminert ?? 0) - (a.runde_eliminert ?? 0);
      if (roundDiff !== 0) return roundDiff;
    }

    const primaryDiff = primaryOf(b) - primaryOf(a);
    if (primaryDiff !== 0) return primaryDiff;
    const secondaryDiff = secondaryOf(b) - secondaryOf(a);
    if (secondaryDiff !== 0) return secondaryDiff;

    // Highest score in a single match, then next-highest. A match the other
    // player does not have counts as 0, so unequal match counts still compare
    // the same way round whichever order the pair arrives in.
    const sA = scoresFor(a.kasterid);
    const sB = scoresFor(b.kasterid);
    for (let i = 0; i < Math.max(sA.length, sB.length); i++) {
      const scoreDiff = (sB[i] ?? 0) - (sA[i] ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
    }

    return (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity) || a.kasterid - b.kasterid;
  });

  // Head-to-head outranks the single-match scores, so it is applied afterwards
  // to each block the criteria above left tied. Rows with a final plassering are
  // ranked by it alone and never join a block.
  const blockKey = (r: StandingRow): string | null =>
    r.plassering != null ? null : `${r.runde_eliminert ?? ""}|${primaryOf(r)}|${secondaryOf(r)}`;

  const resolved: StandingRow[] = [];
  for (let i = 0; i < ordered.length;) {
    const key = blockKey(ordered[i]!);
    let end = i + 1;
    if (key != null) while (end < ordered.length && blockKey(ordered[end]!) === key) end++;
    const block = ordered.slice(i, end);
    if (block.length > 1) {
      const points = headToHeadPoints(block, confirmed);
      // Stable sort: players level on h2h keep the order the criteria above gave them
      block.sort((a, b) => (points.get(b.kasterid) ?? 0) - (points.get(a.kasterid) ?? 0));
    }
    resolved.push(...block);
    i = end;
  }
  return resolved;
}
