import type { QueryData, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { calcMatchPoints, type MatchSide } from "@/utils/kamp";
import { verifyRowsAffected } from "@/utils/verifiedWrite";

const _kampSpelarQuery = supabase.from("kamp_spelar").select(`
  id, kasterid,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, dato, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);

export type MatchPlayerRow = QueryData<typeof _kampSpelarQuery>[number];

export async function getMyMatches(
  kasterid: number,
): Promise<{ data: MatchPlayerRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp_spelar")
    .select(`
      id, kasterid,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, dato, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid, score_poeng,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `)
    .eq("kasterid", kasterid);
  if (error) logError("getMyMatches", error);
  return { data: data ?? [], error };
}

// ── Scoreboard types ──────────────────────────────────────────────────────────

const _kampScoreboardQuery = supabase.from("kamp").select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `);

export type MatchRow = QueryData<typeof _kampScoreboardQuery>[number];
export type MatchPlayerInMatch = MatchRow["spelarar"][number];

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlKamperQuery = supabase.from("kamp").select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`);
export type InitialMatchRow = QueryData<typeof _innlKamperQuery>[number];
export type InitialMatchPlayerRow = InitialMatchRow["spelarar"][number];

export async function getInitialRoundMatches(
  stevneid: number,
): Promise<{ data: InitialMatchRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp")
    .select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq("stevneid", stevneid)
    .eq("fase", "innledende")
    .order("runde_nummer")
    .order("bane_nummer");
  if (error) logError("getInitialRoundMatches", error);
  return { data: data ?? [], error };
}

export async function hasMatchRounds(spelarIds: number[]): Promise<boolean> {
  if (!spelarIds.length) return false;
  const { data, error } = await supabase
    .from("kamp_omgang")
    .select("id")
    .in("kamp_spelar_id", spelarIds)
    .limit(1);
  if (error) logError("hasMatchRounds", error);
  return (data?.length ?? 0) > 0;
}

export async function deleteMatchRounds(spelarIds: number[]): Promise<{ error: unknown }> {
  if (!spelarIds.length) return { error: null };
  const { error } = await supabase.from("kamp_omgang").delete().in("kamp_spelar_id", spelarIds);
  if (error) logError("deleteMatchRounds", error);
  return { error };
}

export async function updateMatchPlayerScoreFast(
  id: number,
  scorePoints: number,
  kampPoeng?: number,
): Promise<{ error: unknown }> {
  const update =
    kampPoeng !== undefined
      ? { score_poeng: scorePoints, kamp_poeng: kampPoeng }
      : { score_poeng: scorePoints };
  return _runWithTimeout(
    "updateMatchPlayerScoreFast",
    supabase.from("kamp_spelar").update(update).eq("id", id),
  );
}

// ── Scoreboard read ───────────────────────────────────────────────────────────

export async function getMatch(id: number): Promise<{ data: MatchRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp")
    .select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) logError("getMatch", error);
  return { data, error };
}

export interface MatchResultInfo {
  startNumberMap: Record<number, number>;
  positionMap: Record<number, number>;
  hcpMap: Map<number, number>;
}

export async function getMatchResultInfo(
  stevneId: number,
  kasterids: number[],
): Promise<MatchResultInfo> {
  if (!kasterids.length) return { startNumberMap: {}, positionMap: {}, hcpMap: new Map() };
  const { data, error } = await supabase
    .from("resultat")
    .select("kasterid, startnummer, posisjon, hcp")
    .eq("stevneid", stevneId)
    .in("kasterid", kasterids);
  if (error) logError("getMatchResultInfo", error);

  const startNumberMap: Record<number, number> = {};
  const positionMap: Record<number, number> = {};
  const hcpMap = new Map<number, number>();
  for (const r of data ?? []) {
    if (r.kasterid == null) continue;
    if (r.startnummer != null) startNumberMap[r.kasterid] = r.startnummer;
    if (r.posisjon != null) positionMap[r.kasterid] = r.posisjon;
    hcpMap.set(r.kasterid, r.hcp ?? 0);
  }
  return { startNumberMap, positionMap, hcpMap };
}

/**
 * startnummer per (stevneid, kasterid) across several stevner, keyed
 * `${stevneid}:${kasterid}`. Used to group a match's players into sides
 * (same startnummer = same pair) when the stevne context varies per match,
 * e.g. the "Mine kampar" list which spans many stevner.
 */
export async function getStartNumbersForTournaments(
  stevneIds: number[],
): Promise<Record<string, number>> {
  if (!stevneIds.length) return {};
  const { data, error } = await supabase
    .from("resultat")
    .select("stevneid, kasterid, startnummer")
    .in("stevneid", stevneIds);
  if (error) logError("getStartNumbersForTournaments", error);
  const map: Record<string, number> = {};
  for (const r of data ?? []) {
    if (r.kasterid != null && r.startnummer != null) {
      map[`${r.stevneid}:${r.kasterid}`] = r.startnummer;
    }
  }
  return map;
}

export async function getNextMatchForOrganizer(
  stevneId: number,
  baneNummer: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp")
    .select("id")
    .eq("stevneid", stevneId)
    .eq("bane_nummer", baneNummer)
    .eq("er_bekreftet", false)
    .eq("er_walkover", false)
    .order("runde_nummer")
    .limit(1)
    .maybeSingle();
  if (error) logError("getNextMatchForOrganizer", error);
  return { data, error };
}

export async function getNextMatchForParticipant(
  stevneId: number,
  kasterid: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data: myRows, error: mineErr } = await supabase
    .from("kamp_spelar")
    .select("kampid")
    .eq("kasterid", kasterid);
  if (mineErr) {
    logError("getNextMatchForParticipant:minekampar", mineErr);
    return { data: null, error: mineErr };
  }

  const matchIds = (myRows ?? []).map((ks) => ks.kampid).filter((id): id is number => id != null);
  if (!matchIds.length) return { data: null, error: null };

  const { data, error } = await supabase
    .from("kamp")
    .select("id")
    .in("id", matchIds)
    .eq("stevneid", stevneId)
    .eq("er_bekreftet", false)
    .eq("er_walkover", false)
    .order("runde_nummer")
    .limit(1)
    .maybeSingle();
  if (error) logError("getNextMatchForParticipant", error);
  return { data, error };
}

export async function isParticipantInMatch(kampId: number, kasterid: number): Promise<boolean> {
  const { data } = await supabase
    .from("kamp_spelar")
    .select("id")
    .eq("kampid", kampId)
    .eq("kasterid", kasterid)
    .maybeSingle();
  return !!data;
}

// ── Match confirm ─────────────────────────────────────────────────────────────

export type RoundScoreRow = {
  kamp_spelar_id: number | null;
  score: number | null;
  antall_ringer: number | null;
};

type MatchPlayerUpdateValues = { score_poeng: number; kamp_poeng: number; antall_ringer: number };

/**
 * One match side at confirmation. playerIds are kamp_spelar ids ordered by
 * posisjon (rep first): 1 for Singel, 2 for Par/Mix. baseScore is the directly
 * entered side total, used when the match has no omgang rows. kasterid is the
 * rep's, needed only when the losing side has to be reported to the RPC.
 */
export type MatchSideConfirm = { playerIds: number[]; baseScore: number; kasterid?: number };

/** A grouped match side as the confirm needs it: members by posisjon, rep first. */
export function toConfirmSide<
  T extends { id: number; kasterid: number; score_poeng?: number | null },
>(side: MatchSide<T> | null | undefined): MatchSideConfirm | null {
  if (!side) return null;
  return {
    playerIds: side.members.map((m) => m.id),
    kasterid: side.rep.kasterid,
    baseScore: side.members.reduce((sum, m) => sum + (m.score_poeng ?? 0), 0),
  };
}

export type MatchPlayerUpdates = {
  updates: Map<number, MatchPlayerUpdateValues>;
  /** Side totals in `sides` order — these decide the result of the match. */
  totals: number[];
};

/**
 * Computes the kamp_spelar write per player. Each player's score_poeng and
 * antall_ringer come from their OWN omgang rows (pair members alternate
 * omgangar), while kamp_poeng comes from the SIDE totals and is written to
 * every member of the side. Side HCP and walkover/fallback scores land on the
 * representative (playerIds[0]) so the side sum stays correct.
 *
 * kamp_poeng is only meaningful for two sides; a 3-side match ranks by
 * placement instead and every player keeps kamp_poeng 0.
 */
export function buildMatchPlayerUpdates(params: {
  roundData: RoundScoreRow[];
  sides: (MatchSideConfirm | null)[];
  /** Per-side HCP, in `sides` order. */
  hcp?: number[];
  erWalkover?: boolean;
}): MatchPlayerUpdates {
  const { roundData, sides, hcp = [], erWalkover = false } = params;

  const updates = new Map<number, MatchPlayerUpdateValues>();
  for (const side of sides) {
    for (const id of side?.playerIds ?? []) {
      updates.set(id, { score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 });
    }
  }

  const totals = sides.map(() => 0);
  const repOf = (i: number): number | undefined => sides[i]?.playerIds[0];

  if (erWalkover) {
    totals[0] = 21;
    const rep = repOf(0);
    if (rep != null) updates.get(rep)!.score_poeng = 21;
  } else if (roundData.length) {
    for (const row of roundData) {
      const id = row.kamp_spelar_id;
      if (id == null) continue;
      const u = updates.get(id);
      if (!u) continue;
      u.score_poeng += row.score ?? 0;
      u.antall_ringer += row.antall_ringer ?? 0;
      const idx = sides.findIndex((side) => side?.playerIds.includes(id));
      if (idx !== -1) totals[idx] = (totals[idx] ?? 0) + (row.score ?? 0);
    }
    // HCP applies only to scoreboard-round sums; direct scores are already final.
    // Stored on the rep so the side sum includes it exactly once.
    sides.forEach((_, i) => {
      const h = hcp[i] ?? 0;
      if (!h) return;
      totals[i] = (totals[i] ?? 0) + h;
      const rep = repOf(i);
      if (rep != null) updates.get(rep)!.score_poeng += h;
    });
  } else {
    // Quick-score fallback: the directly-entered side total lives on the rep row
    sides.forEach((side, i) => {
      if (!side) return;
      totals[i] = side.baseScore;
      const rep = repOf(i);
      if (rep != null) updates.get(rep)!.score_poeng = side.baseScore;
    });
  }

  if (sides.filter(Boolean).length <= 2) {
    const [kp1, kp2] = calcMatchPoints(totals[0] ?? 0, totals[1] ?? 0);
    for (const id of sides[0]?.playerIds ?? []) updates.get(id)!.kamp_poeng = kp1;
    for (const id of sides[1]?.playerIds ?? []) updates.get(id)!.kamp_poeng = kp2;
  }

  return { updates, totals };
}

/**
 * The losing side's kasterid — any member works, the elimination RPC resolves
 * the full side from resultat.startnummer. Equal totals eliminate the side
 * listed last, matching how the scoreboard declares a winner.
 */
export function losingSideKasterid(
  sides: (MatchSideConfirm | null)[],
  totals: number[],
): number | null {
  const present = sides
    .map((side, i) => ({ side, total: totals[i] ?? 0 }))
    .filter((entry): entry is { side: MatchSideConfirm; total: number } => entry.side != null);
  if (present.length < 2) return null;
  const loser = present.reduce((worst, cand) => (cand.total <= worst.total ? cand : worst));
  return loser.side.kasterid ?? null;
}

// RLS only allows participant updates while er_bekreftet = false, so a zero-row
// write means the match was already confirmed (typically by the opponent).
const ALREADY_CONFIRMED_MESSAGE = "Kampen er allereie stadfesta av ein annan deltakar.";

/**
 * Writes every player's score to kamp_spelar. Runs before er_bekreftet is set,
 * which is what makes one implementation serve both phases: participants may
 * write kamp_spelar right up until the match is confirmed.
 */
async function _persistMatchScores(params: {
  sides: (MatchSideConfirm | null)[];
  hcp?: number[];
  erWalkover: boolean;
}): Promise<{ error: unknown; totals: number[] }> {
  const { sides, hcp, erWalkover } = params;
  const allIds = sides.flatMap((side) => side?.playerIds ?? []);
  if (!allIds.length) return { error: null, totals: sides.map(() => 0) };

  let roundData: RoundScoreRow[] = [];
  let resolvedSides = sides;

  if (!erWalkover) {
    const { data: fetched, error: omgErr } = await supabase
      .from("kamp_omgang")
      .select("kamp_spelar_id, score, antall_ringer")
      .in("kamp_spelar_id", allIds);
    if (omgErr) {
      logError("confirmMatch:omgangar", omgErr);
      return { error: omgErr, totals: sides.map(() => 0) };
    }
    roundData = fetched ?? [];

    if (!roundData.length) {
      // Re-read the stored scores — a baseScore captured at render time may be stale
      const { data: fresh } = await supabase
        .from("kamp_spelar")
        .select("id, score_poeng")
        .in("id", allIds);
      const scoreById = new Map((fresh ?? []).map((s) => [s.id, s.score_poeng ?? 0]));
      resolvedSides = sides.map((side) => {
        if (!side) return null;
        const known = side.playerIds.filter((id) => scoreById.has(id));
        if (!known.length) return side;
        return { ...side, baseScore: known.reduce((sum, id) => sum + scoreById.get(id)!, 0) };
      });
    }
  }

  const { updates, totals } = buildMatchPlayerUpdates({
    roundData,
    sides: resolvedSides,
    hcp,
    erWalkover,
  });

  const results = await Promise.all(
    [...updates.entries()].map(([id, values]) =>
      verifyRowsAffected(
        supabase.from("kamp_spelar").update(values).eq("id", id).select("id"),
        ALREADY_CONFIRMED_MESSAGE,
      ),
    ),
  );
  const error = results.find((r) => r.error)?.error ?? null;
  if (error) logError("confirmMatch:spelarar", error);
  return { error, totals };
}

/** What happens to a match beyond its scores, once those are stored. */
export type MatchOutcome =
  /** Innledende: only the confirm flag — the standings read kamp_poeng. */
  | { type: "innledende" }
  /**
   * Cup confirmed from the scoreboard. Goes through the SECURITY DEFINER RPC
   * because RLS blocks a participant from writing kamp_spelar and resultat once
   * er_bekreftet is set. The losing side follows from the scores unless
   * orderedKasterids ranks a 3-side match explicitly.
   */
  | { type: "cup"; orderedKasterids?: number[] | null }
  /** Cup confirmed from the organizer view: explicit ranking, written directly. */
  | {
      type: "cup-arrangor";
      stevneId: number;
      roundNumber: number;
      roundName: string | null;
      allThrowerIds: number[];
      /** All members of the eliminated side ([] = none). Singel: one kasterid. */
      eliminatedIds: number[];
      /** Advancing sides in rank order; every member of a side shares its kamp_plassering. */
      advancingSides: number[][];
    };

/**
 * Confirms one match: store the scores, then settle the outcome. Both steps are
 * shared by every entry point — scoreboard and numberpad, innledende and cup —
 * so a match always ends up with its score in kamp_spelar.score_poeng.
 *
 * A 3-side cup match confirmed from the organizer dialog carries no scores; the
 * score step then simply writes back what is already stored.
 */
export async function confirmMatch(params: {
  kampId: number;
  /** Sides in display order; a null entry is a side with no players (walkover). */
  sides: (MatchSideConfirm | null)[];
  hcp?: number[];
  erWalkover?: boolean;
  outcome: MatchOutcome;
}): Promise<{ error: unknown }> {
  const { kampId, sides, hcp, erWalkover = false, outcome } = params;

  const { error: scoreErr, totals } = await _persistMatchScores({ sides, hcp, erWalkover });
  if (scoreErr) return { error: scoreErr };

  if (outcome.type === "innledende") {
    const { error } = await verifyRowsAffected(
      supabase.from("kamp").update({ er_bekreftet: true }).eq("id", kampId).select("id"),
      ALREADY_CONFIRMED_MESSAGE,
    );
    if (error) logError("confirmMatch:kamp", error);
    return { error };
  }

  if (outcome.type === "cup") {
    const eliminatedId =
      outcome.orderedKasterids?.length === 3
        ? (outcome.orderedKasterids[2] ?? null)
        : losingSideKasterid(sides, totals);
    const { error } = await supabase.rpc("bekreft_avsluttende_kamp_deltakar", {
      p_kamp_id: kampId,
      p_eliminert_kasterid: eliminatedId ?? undefined,
    });
    if (error) logError("confirmMatch:cup", error);
    return { error };
  }

  return _finishCupAsOrganizer(kampId, outcome);
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslKamperQuery = supabase.from("kamp").select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`);
export type FinalMatchRow = QueryData<typeof _avslKamperQuery>[number];
export type FinalMatchPlayerRow = FinalMatchRow["spelarar"][number];

const _kampSpelarerQuery = supabase
  .from("kamp_spelar")
  .select("id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)");
export type MatchPlayerScoreRow = QueryData<typeof _kampSpelarerQuery>[number];

export async function getFinalRoundMatches(
  stevneid: number,
): Promise<{ data: FinalMatchRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp")
    .select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq("stevneid", stevneid)
    .order("runde_nummer")
    .order("bane_nummer");
  if (error) logError("getFinalRoundMatches", error);
  return { data: data ?? [], error };
}

export async function getMatchPlayers(
  kampId: number,
): Promise<{ data: MatchPlayerScoreRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp_spelar")
    .select("id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)")
    .eq("kampid", kampId);
  if (error) logError("getMatchPlayers", error);
  return { data: data ?? [], error };
}

export async function setMatchPlayerPlacements(
  kampId: number,
  entries: { kasterid: number; plassering: number }[],
): Promise<{ error: unknown }> {
  if (!entries.length) return { error: null };
  const results = await Promise.all(
    entries.map((e) =>
      supabase
        .from("kamp_spelar")
        .update({ kamp_plassering: e.plassering })
        .eq("kampid", kampId)
        .eq("kasterid", e.kasterid),
    ),
  );
  const err = results.find((r) => r.error)?.error ?? null;
  if (err) logError("setMatchPlayerPlacements", err);
  return { error: err };
}

async function _finishCupAsOrganizer(
  kampId: number,
  outcome: Extract<MatchOutcome, { type: "cup-arrangor" }>,
): Promise<{ error: unknown }> {
  const { stevneId, roundNumber, roundName, allThrowerIds, eliminatedIds, advancingSides } =
    outcome;

  const { error: kampErr } = await supabase
    .from("kamp")
    .update({ er_bekreftet: true })
    .eq("id", kampId);
  if (kampErr) {
    logError("confirmMatch:cup-arrangor:kamp", kampErr);
    return { error: kampErr };
  }

  // Write per-match rank to kamp_spelar for display (advancingSides = 1st, 2nd, …; eliminated = last)
  const matchPlacements = [
    ...advancingSides.flatMap((side, i) =>
      side.map((kid) => ({ kasterid: kid, plassering: i + 1 })),
    ),
    ...eliminatedIds.map((kid) => ({ kasterid: kid, plassering: advancingSides.length + 1 })),
  ];
  const { error: kpErr } = await setMatchPlayerPlacements(kampId, matchPlacements);
  if (kpErr) return { error: kpErr };

  // Semifinale losers are not finally eliminated — they advance to bronsefinale
  if (roundName === "Semifinale") return { error: null };

  if (!eliminatedIds.length) return { error: null };

  if (roundName !== "Finale" && roundName !== "Bronsefinale") {
    const { error } = await _resetAndMarkEliminated(
      stevneId,
      roundNumber,
      allThrowerIds,
      eliminatedIds,
      "confirmMatch:cup-arrangor",
    );
    if (error) return { error };
  }

  // Write final tournament placement for Finale and Bronsefinale
  const winnerIds = advancingSides[0] ?? [];
  if (roundName === "Finale" && winnerIds.length) {
    const { error: vErr } = await supabase
      .from("resultat")
      .update({ plassering: 1 })
      .eq("stevneid", stevneId)
      .in("kasterid", winnerIds);
    if (vErr) {
      logError("confirmMatch:cup-arrangor:plassering-vinnar", vErr);
      return { error: vErr };
    }
    const { error: tErr } = await supabase
      .from("resultat")
      .update({ plassering: 2 })
      .eq("stevneid", stevneId)
      .in("kasterid", eliminatedIds);
    if (tErr) {
      logError("confirmMatch:cup-arrangor:plassering-tapar", tErr);
      return { error: tErr };
    }
  } else if (roundName === "Bronsefinale" && winnerIds.length) {
    const { error: vErr } = await supabase
      .from("resultat")
      .update({ plassering: 3 })
      .eq("stevneid", stevneId)
      .in("kasterid", winnerIds);
    if (vErr) {
      logError("confirmMatch:cup-arrangor:plassering-vinnar", vErr);
      return { error: vErr };
    }
    const { error: tErr } = await supabase
      .from("resultat")
      .update({ plassering: 4 })
      .eq("stevneid", stevneId)
      .in("kasterid", eliminatedIds);
    if (tErr) {
      logError("confirmMatch:cup-arrangor:plassering-tapar", tErr);
      return { error: tErr };
    }
  }

  return { error: null };
}

/** Regular cup rounds: clear this round's eliminations for the match's players, then mark the losers. */
async function _resetAndMarkEliminated(
  stevneId: number,
  roundNumber: number,
  allThrowerIds: number[],
  eliminatedIds: number[],
  logContext: string,
): Promise<{ error: unknown }> {
  const { error: resetErr } = await supabase
    .from("resultat")
    .update({ runde_eliminert: null })
    .eq("stevneid", stevneId)
    .eq("runde_eliminert", roundNumber)
    .in("kasterid", allThrowerIds);
  if (resetErr) {
    logError(`${logContext}:reset`, resetErr);
    return { error: resetErr };
  }
  if (eliminatedIds.length) {
    const { error } = await supabase
      .from("resultat")
      .update({ runde_eliminert: roundNumber })
      .eq("stevneid", stevneId)
      .in("kasterid", eliminatedIds);
    if (error) {
      logError(`${logContext}:eliminert`, error);
      return { error };
    }
  }
  return { error: null };
}

export async function updateWinnerLoser(params: {
  stevneId: number;
  roundNumber: number;
  roundName: string | null;
  allThrowerIds: number[];
  /** All members of the winning/losing side. Singel: one kasterid. */
  newWinnerIds: number[];
  newLoserIds: number[];
}): Promise<{ error: unknown }> {
  const { stevneId, roundNumber, roundName, allThrowerIds, newWinnerIds, newLoserIds } = params;
  const isSemifinal = roundName === "Semifinale";
  const isFinal = roundName === "Finale";
  const isBronzeFinal = roundName === "Bronsefinale";

  // Write per-match rank to kamp_spelar (score correction path — need kampId)
  // kamp_plassering update is handled by the caller (cup.ts score edit handler) when re-confirming

  if (isSemifinal) {
    // Semifinale losers are not finally eliminated — no runde_eliminert changes
    return { error: null };
  }

  if (isFinal || isBronzeFinal) {
    // Write final tournament placement
    const winnerRank = isFinal ? 1 : 3;
    const loserRank = isFinal ? 2 : 4;
    if (newWinnerIds.length) {
      const { error } = await supabase
        .from("resultat")
        .update({ plassering: winnerRank })
        .eq("stevneid", stevneId)
        .in("kasterid", newWinnerIds);
      if (error) {
        logError("updateWinnerLoser:plassering-vinnar", error);
        return { error };
      }
    }
    if (newLoserIds.length) {
      const { error } = await supabase
        .from("resultat")
        .update({ plassering: loserRank })
        .eq("stevneid", stevneId)
        .in("kasterid", newLoserIds);
      if (error) {
        logError("updateWinnerLoser:plassering-tapar", error);
        return { error };
      }
    }
  } else {
    const { error } = await _resetAndMarkEliminated(
      stevneId,
      roundNumber,
      allThrowerIds,
      newLoserIds,
      "updateWinnerLoser",
    );
    if (error) return { error };
  }

  return { error: null };
}

// ── Scoreboard omgangar ───────────────────────────────────────────────────────

const _kampOmgangQuery = supabase
  .from("kamp_omgang")
  .select("id, kamp_spelar_id, omgang, score, antall_ringer");
export type MatchRoundRow = QueryData<typeof _kampOmgangQuery>[number];

export async function getMatchRounds(
  spelarIds: number[],
): Promise<{ data: MatchRoundRow[]; error: unknown }> {
  if (!spelarIds.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from("kamp_omgang")
    .select("id, kamp_spelar_id, omgang, score, antall_ringer")
    .in("kamp_spelar_id", spelarIds)
    .order("omgang");
  if (error) logError("getMatchRounds", error);
  return { data: data ?? [], error };
}

const SAVE_TIMEOUT_MS = 10_000;

/** Races a Supabase write against SAVE_TIMEOUT_MS so scoreboard saves never hang. */
async function _runWithTimeout(
  logContext: string,
  query: PromiseLike<{ error: unknown }>,
): Promise<{ error: unknown }> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), SAVE_TIMEOUT_MS),
    );
    const { error } = await Promise.race([query, timeout]);
    if (error) logError(logContext, error);
    return { error };
  } catch (e) {
    logError(logContext, e);
    return { error: e };
  }
}

export async function saveMatchRound(
  inserts: { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[],
): Promise<{ error: unknown }> {
  if (!inserts.length) return { error: null };
  return _runWithTimeout("saveMatchRound", supabase.from("kamp_omgang").insert(inserts));
}

export async function updateMatchRound(
  rows: { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[],
): Promise<{ error: unknown }> {
  if (!rows.length) return { error: null };
  try {
    const results = await Promise.all(
      rows.map((r) =>
        supabase
          .from("kamp_omgang")
          .update({ score: r.score, antall_ringer: r.antall_ringer })
          .eq("kamp_spelar_id", r.kamp_spelar_id)
          .eq("omgang", r.omgang),
      ),
    );
    const err = results.find((r) => r.error)?.error ?? null;
    if (err) logError("updateMatchRound", err);
    return { error: err };
  } catch (e) {
    logError("updateMatchRound", e);
    return { error: e };
  }
}

export async function unconfirmMatch(kampId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from("kamp").update({ er_bekreftet: false }).eq("id", kampId);
  if (error) logError("unconfirmMatch", error);
  return { error };
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export type NextMatchPayload = { id: number; bane_nummer: number | null; er_walkover: boolean };

export function subscribeToNextMatch(
  stevneId: number,
  kampId: number,
  onNewKamp: (kamp: NextMatchPayload) => void,
): RealtimeChannel {
  return supabase
    .channel(`neste-kamp-${kampId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "kamp",
        filter: `stevneid=eq.${stevneId}`,
      },
      (payload) => {
        onNewKamp(payload.new as NextMatchPayload);
      },
    )
    .subscribe();
}

/**
 * kamp_omgang carries no stevneid, so its events cannot be filtered
 * server-side. `ownsKampSpelar` lets the view drop events for other stevner's
 * matches; unknown ids (DELETE only ships the primary key) fall through to a
 * reload. New kamper are still picked up — the kamp INSERT below is scoped to
 * this stevne and its reload refreshes the caller's id set.
 */
export function subscribeToMatchChanges(
  stevneid: number,
  channelName: string,
  onChange: () => void,
  ownsKampSpelar?: (kampSpelarId: number) => boolean,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "kamp_omgang" }, (payload) => {
      const spelarId =
        (payload.new as { kamp_spelar_id?: number })?.kamp_spelar_id ??
        (payload.old as { kamp_spelar_id?: number })?.kamp_spelar_id;
      if (spelarId != null && ownsKampSpelar && !ownsKampSpelar(spelarId)) return;
      onChange();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "kamp" }, (payload) => {
      const sid =
        (payload.new as { stevneid?: number })?.stevneid ??
        (payload.old as { stevneid?: number })?.stevneid;
      if (sid === stevneid) onChange();
    })
    .subscribe();
}

export function subscribeToScoreboardChanges(
  kampId: number,
  spelarIds: number[],
  onOmgangChange: () => Promise<void>,
  onKampBekreft: () => Promise<void>,
  onResubscribe?: () => Promise<void>,
): RealtimeChannel {
  let roundDebounce: ReturnType<typeof setTimeout> | null = null;

  return supabase
    .channel(`scoreboard-kamp-${kampId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "kamp_omgang" }, (payload) => {
      const p = payload.new as Record<string, unknown>;
      const o = payload.old as Record<string, unknown>;
      const changedId = p.kamp_spelar_id ?? o.kamp_spelar_id;
      if (!changedId || spelarIds.includes(changedId as number)) {
        if (roundDebounce) clearTimeout(roundDebounce);
        roundDebounce = setTimeout(() => {
          roundDebounce = null;
          void onOmgangChange();
        }, 50);
      }
    })
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "kamp", filter: `id=eq.${kampId}` },
      async (payload) => {
        if ((payload.new as { er_bekreftet?: boolean })?.er_bekreftet) {
          await onKampBekreft();
        }
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") void onResubscribe?.();
    });
}
