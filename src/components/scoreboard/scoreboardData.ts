import type { MatchRoundRow, MatchPlayerInMatch, MatchRow } from "@/services/kampService";
import {
  getMatchRounds,
  saveMatchRound,
  subscribeToScoreboardChanges,
} from "@/services/kampService";
import { calcRingCount, findFinishedPlayer, getOmgangThrowerId } from "@/utils/kamp";
import { unsubscribeChannel } from "@/utils/realtime";

/**
 * Everything the boards do that is not DOM: folding omgang rows into per-side
 * numbers, working out who is finished, writing a new omgang, and keeping the
 * board in sync with other devices. Scoring rules themselves live in utils/kamp.
 */

/** One omgang of a two-player match, both sides folded into a single row. */
export interface DuelRound {
  omgang: number;
  s1: number;
  s2: number;
  r1: number;
  r2: number;
}

/** Member kamp_spelar ids in posisjon order; Singel falls back to the rep alone. */
export function sideIdsOf(ks: MatchPlayerInMatch | null, ids?: number[] | null): number[] {
  if (ids?.length) return ids;
  return ks ? [ks.id] : [];
}

export function playerName(ks: MatchPlayerInMatch | null, fallback = "Spelar"): string {
  return ks?.kaster ? `${ks.kaster.fornavn} ${ks.kaster.etternavn}` : fallback;
}

export async function loadDuelRounds(side1Ids: number[], side2Ids: number[]): Promise<DuelRound[]> {
  const ids = [...side1Ids, ...side2Ids];
  if (!ids.length) return [];
  const { data } = await getMatchRounds(ids);

  const byOmgang: Record<number, DuelRound> = {};
  for (const row of data) {
    if (row.kamp_spelar_id == null) continue;
    const entry = (byOmgang[row.omgang] ??= { omgang: row.omgang, s1: 0, s2: 0, r1: 0, r2: 0 });
    const isSide1 = side1Ids.includes(row.kamp_spelar_id);
    entry[isSide1 ? "s1" : "s2"] = row.score ?? 0;
    entry[isSide1 ? "r1" : "r2"] = row.antall_ringer ?? 0;
  }
  return Object.values(byOmgang).sort((a, b) => a.omgang - b.omgang);
}

export async function loadRounds(spelarIds: number[]): Promise<MatchRoundRow[]> {
  if (!spelarIds.length) return [];
  const { data } = await getMatchRounds(spelarIds);
  return data;
}

export function roundFor(
  rounds: MatchRoundRow[],
  ids: number[],
  omgang: number,
): MatchRoundRow | undefined {
  return rounds.find(
    (r) => r.kamp_spelar_id != null && ids.includes(r.kamp_spelar_id) && r.omgang === omgang,
  );
}

export function sideTotal(rounds: MatchRoundRow[], ids: number[]): number {
  return rounds
    .filter((r) => r.kamp_spelar_id != null && ids.includes(r.kamp_spelar_id))
    .reduce((sum, r) => sum + (r.score ?? 0), 0);
}

export function lastOmgangNumber(rounds: { omgang: number }[]): number {
  return rounds.length ? Math.max(...rounds.map((r) => r.omgang)) : 0;
}

/**
 * Placement race: replays the omgangar and notes the omgang each side reached
 * its target in. Repeats within an omgang because a finished side leaving can
 * make the next one finished too, and the last side left is ranked with it.
 */
export function computeWinOrder(
  rounds: MatchRoundRow[],
  sideIds: number[][],
): { order: number[]; finishedAtOmgang: (number | null)[] } {
  const finishedAtOmgang: (number | null)[] = sideIds.map(() => null);
  const order: number[] = [];
  if (!rounds.length) return { order, finishedAtOmgang };

  const maxOmgang = lastOmgangNumber(rounds);
  const active = new Set(sideIds.map((_, i) => i));
  const totals = sideIds.map(() => 0);

  for (let omgang = 1; omgang <= maxOmgang; omgang++) {
    for (const i of active) {
      const row = roundFor(rounds, sideIds[i] ?? [], omgang);
      if (row) totals[i] = (totals[i] ?? 0) + (row.score ?? 0);
    }
    let finished = findFinishedPlayer(active, totals);
    while (finished !== null && active.size > 1) {
      order.push(finished);
      finishedAtOmgang[finished] = omgang;
      active.delete(finished);
      finished = findFinishedPlayer(active, totals);
    }
  }

  if (active.size === 1 && order.length === sideIds.length - 1) {
    for (const i of active) {
      order.push(i);
      finishedAtOmgang[i] = maxOmgang;
    }
  }
  return { order, finishedAtOmgang };
}

/** Writes one row per side that has a thrower this omgang. */
export async function saveOmgang(
  omgang: number,
  sides: { ids: number[]; score: number }[],
): Promise<{ error: unknown }> {
  const inserts = [];
  for (const side of sides) {
    const thrower = getOmgangThrowerId(side.ids, omgang);
    if (thrower == null) continue;
    inserts.push({
      kamp_spelar_id: thrower,
      omgang,
      score: side.score,
      antall_ringer: calcRingCount(side.score),
    });
  }
  return saveMatchRound(inserts);
}

export function setupScoreboardRealtime(
  kamp: MatchRow,
  spelarIds: number[],
  reloadAndDraw: () => Promise<void>,
  onKampBekreft?: () => Promise<void>,
): () => void {
  const channel = subscribeToScoreboardChanges(
    kamp.id,
    spelarIds,
    reloadAndDraw,
    async () => {
      kamp.er_bekreftet = true;
      await reloadAndDraw();
      await onKampBekreft?.();
    },
    reloadAndDraw,
  );
  const onVisible = async () => {
    if (document.visibilityState !== "visible") return;
    await reloadAndDraw();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    void unsubscribeChannel(channel);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
