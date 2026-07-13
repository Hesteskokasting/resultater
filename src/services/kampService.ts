import type { QueryData, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { calcMatchPoints } from '@/utils/kamp'
import { verifyRowsAffected } from '@/utils/verifiedWrite'

const _kampSpelarQuery = supabase.from('kamp_spelar').select(`
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

export type MatchPlayerRow = QueryData<typeof _kampSpelarQuery>[number]

export async function getMyMatches(kasterid: number): Promise<{ data: MatchPlayerRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp_spelar')
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
    .eq('kasterid', kasterid)
  if (error) logError('getMyMatches', error)
  return { data: data ?? [], error }
}

// ── Scoreboard types ──────────────────────────────────────────────────────────

const _kampScoreboardQuery = supabase
  .from('kamp')
  .select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `)

export type MatchRow = QueryData<typeof _kampScoreboardQuery>[number]
export type MatchPlayerInMatch = MatchRow['spelarar'][number]

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlKamperQuery = supabase.from('kamp').select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`)
export type InitialMatchRow = QueryData<typeof _innlKamperQuery>[number]
export type InitialMatchPlayerRow = InitialMatchRow['spelarar'][number]

export async function getInitialRoundMatches(stevneid: number): Promise<{ data: InitialMatchRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .order('runde_nummer')
    .order('bane_nummer')
  if (error) logError('getInitialRoundMatches', error)
  return { data: data ?? [], error }
}

export async function hasMatchRounds(spelarIds: number[]): Promise<boolean> {
  if (!spelarIds.length) return false
  const { data, error } = await supabase
    .from('kamp_omgang')
    .select('id')
    .in('kamp_spelar_id', spelarIds)
    .limit(1)
  if (error) logError('hasMatchRounds', error)
  return (data?.length ?? 0) > 0
}

export async function deleteMatchRounds(spelarIds: number[]): Promise<{ error: unknown }> {
  if (!spelarIds.length) return { error: null }
  const { error } = await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarIds)
  if (error) logError('deleteMatchRounds', error)
  return { error }
}

export async function updateMatchPlayerScoreFast(
  id: number,
  scorePoints: number,
  kampPoeng?: number,
): Promise<{ error: unknown }> {
  const update = kampPoeng !== undefined
    ? { score_poeng: scorePoints, kamp_poeng: kampPoeng }
    : { score_poeng: scorePoints }
  return _runWithTimeout('updateMatchPlayerScoreFast', supabase.from('kamp_spelar').update(update).eq('id', id))
}

// ── Scoreboard read ───────────────────────────────────────────────────────────

export async function getMatch(id: number): Promise<{ data: MatchRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('getMatch', error)
  return { data, error }
}

export interface MatchResultInfo {
  startNumberMap: Record<number, number>
  positionMap: Record<number, number>
  hcpMap: Map<number, number>
}

export async function getMatchResultInfo(
  stevneId: number,
  kasterids: number[],
): Promise<MatchResultInfo> {
  if (!kasterids.length) return { startNumberMap: {}, positionMap: {}, hcpMap: new Map() }
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, startnummer, posisjon, hcp')
    .eq('stevneid', stevneId)
    .in('kasterid', kasterids)
  if (error) logError('getMatchResultInfo', error)

  const startNumberMap: Record<number, number> = {}
  const positionMap: Record<number, number> = {}
  const hcpMap = new Map<number, number>()
  for (const r of data ?? []) {
    if (r.kasterid == null) continue
    if (r.startnummer != null) startNumberMap[r.kasterid] = r.startnummer
    if (r.posisjon != null) positionMap[r.kasterid] = r.posisjon
    hcpMap.set(r.kasterid, r.hcp ?? 0)
  }
  return { startNumberMap, positionMap, hcpMap }
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
  if (!stevneIds.length) return {}
  const { data, error } = await supabase
    .from('resultat')
    .select('stevneid, kasterid, startnummer')
    .in('stevneid', stevneIds)
  if (error) logError('getStartNumbersForTournaments', error)
  const map: Record<string, number> = {}
  for (const r of data ?? []) {
    if (r.kasterid != null && r.startnummer != null) {
      map[`${r.stevneid}:${r.kasterid}`] = r.startnummer
    }
  }
  return map
}

export async function getNextMatchForOrganizer(
  stevneId: number,
  baneNummer: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneId)
    .eq('bane_nummer', baneNummer)
    .eq('er_bekreftet', false)
    .eq('er_walkover', false)
    .order('runde_nummer')
    .limit(1)
    .maybeSingle()
  if (error) logError('getNextMatchForOrganizer', error)
  return { data, error }
}

export async function getNextMatchForParticipant(
  stevneId: number,
  kasterid: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data: myRows, error: mineErr } = await supabase
    .from('kamp_spelar')
    .select('kampid')
    .eq('kasterid', kasterid)
  if (mineErr) {
    logError('getNextMatchForParticipant:minekampar', mineErr)
    return { data: null, error: mineErr }
  }

  const matchIds = (myRows ?? []).map(ks => ks.kampid).filter((id): id is number => id != null)
  if (!matchIds.length) return { data: null, error: null }

  const { data, error } = await supabase
    .from('kamp')
    .select('id')
    .in('id', matchIds)
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', false)
    .eq('er_walkover', false)
    .order('runde_nummer')
    .limit(1)
    .maybeSingle()
  if (error) logError('getNextMatchForParticipant', error)
  return { data, error }
}

export async function isParticipantInMatch(kampId: number, kasterid: number): Promise<boolean> {
  const { data } = await supabase
    .from('kamp_spelar')
    .select('id')
    .eq('kampid', kampId)
    .eq('kasterid', kasterid)
    .maybeSingle()
  return !!data
}

// ── Scoreboard write ──────────────────────────────────────────────────────────

export type MatchPlayerConfirmData = {
  playerId: number    // kamp_spelar.id
  kasterid: number
  scorePoints: number  // fallback if omgang data is missing
}

export type RoundScoreRow = { kamp_spelar_id: number | null; score: number | null; antall_ringer: number | null }

type MatchPlayerUpdateValues = { score_poeng: number; kamp_poeng: number; antall_ringer: number }

/** One match side at confirmation: kamp_spelar ids ordered by posisjon (rep first). 1 id for Singel, 2 for Par/Mix. */
export type MatchSideConfirm = { playerIds: number[]; baseScore: number }

/**
 * Computes the kamp_spelar write per player. Each player's score_poeng and
 * antall_ringer come from their OWN omgang rows (pair members alternate
 * omgangar), while kamp_poeng comes from the SIDE totals and is written to
 * every member of the side. Side HCP and walkover/fallback scores land on the
 * representative (playerIds[0]) so the side sum stays correct.
 */
export function buildMatchPlayerUpdates(params: {
  roundData: RoundScoreRow[]
  side1: MatchSideConfirm | null
  side2: MatchSideConfirm | null
  hcp1: number
  hcp2: number
  erWalkover: boolean
}): Map<number, MatchPlayerUpdateValues> {
  const { roundData, side1, side2, hcp1, hcp2, erWalkover } = params

  const updates = new Map<number, MatchPlayerUpdateValues>()
  for (const side of [side1, side2]) {
    for (const id of side?.playerIds ?? []) {
      updates.set(id, { score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    }
  }

  let t1 = 0, t2 = 0
  const rep1 = side1?.playerIds[0]
  const rep2 = side2?.playerIds[0]

  if (erWalkover) {
    t1 = 21
    if (rep1 != null) updates.get(rep1)!.score_poeng = 21
  } else if (roundData.length) {
    for (const row of roundData) {
      if (row.kamp_spelar_id == null) continue
      const u = updates.get(row.kamp_spelar_id)
      if (!u) continue
      u.score_poeng += row.score ?? 0
      u.antall_ringer += row.antall_ringer ?? 0
      if (side1?.playerIds.includes(row.kamp_spelar_id)) t1 += row.score ?? 0
      else t2 += row.score ?? 0
    }
    // HCP applies only to scoreboard-round sums; direct scores are already final.
    // Stored on the rep so the side sum includes it exactly once.
    t1 += hcp1
    t2 += hcp2
    if (hcp1 && rep1 != null) updates.get(rep1)!.score_poeng += hcp1
    if (hcp2 && rep2 != null) updates.get(rep2)!.score_poeng += hcp2
  } else {
    // Quick-score fallback: the directly-entered side total lives on the rep row
    if (side1) {
      t1 = side1.baseScore
      if (rep1 != null) updates.get(rep1)!.score_poeng = t1
    }
    if (side2) {
      t2 = side2.baseScore
      if (rep2 != null) updates.get(rep2)!.score_poeng = t2
    }
  }

  const [kp1, kp2] = calcMatchPoints(t1, t2)
  for (const id of side1?.playerIds ?? []) updates.get(id)!.kamp_poeng = kp1
  for (const id of side2?.playerIds ?? []) updates.get(id)!.kamp_poeng = kp2

  return updates
}

/** Par/Mix: a side's kamp_spelar ids include the rep and (when present) the partner. */
function _sidePlayerIds(p: { playerId: number } | null, partnerId: number | null): number[] {
  return p ? [p.playerId, ...(partnerId != null ? [partnerId] : [])] : []
}

export async function confirmInitialMatch(params: {
  kampId: number
  p1: MatchPlayerConfirmData | null
  p2: MatchPlayerConfirmData | null
  hcp1: number
  hcp2: number
  erWalkover?: boolean
  // Par/Mix: the partner kamp_spelar rows receive the same written values as
  // their side's representative (omgangar and combined totals live on the rep).
  p1PartnerId?: number | null
  p2PartnerId?: number | null
}): Promise<{ error: unknown }> {
  const { kampId, p1, p2, hcp1, hcp2, erWalkover = false, p1PartnerId = null, p2PartnerId = null } = params

  const side1Ids = _sidePlayerIds(p1, p1PartnerId)
  const side2Ids = _sidePlayerIds(p2, p2PartnerId)
  const allIds = [...side1Ids, ...side2Ids]

  let roundData: RoundScoreRow[] = []
  let p1BaseScore = p1?.scorePoints ?? 0
  let p2BaseScore = p2?.scorePoints ?? 0

  if (!erWalkover) {
    const { data: fetched, error: omgErr } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score, antall_ringer')
      .in('kamp_spelar_id', allIds)
    if (omgErr) {
      logError('confirmInitialMatch:omgangar', omgErr)
      return { error: omgErr }
    }
    roundData = fetched ?? []

    if (!roundData.length) {
      // Re-fetch score_poeng fresh from DB — passed scorePoints may be stale (captured at render time)
      const repIds = [p1?.playerId, p2?.playerId].filter((id): id is number => id != null)
      const { data: freshScores } = await supabase
        .from('kamp_spelar')
        .select('id, score_poeng')
        .in('id', repIds)
      const scoreMap = Object.fromEntries((freshScores ?? []).map(s => [s.id, s.score_poeng ?? 0]))
      p1BaseScore = p1 ? (scoreMap[p1.playerId] ?? p1.scorePoints) : 0
      p2BaseScore = p2 ? (scoreMap[p2.playerId] ?? p2.scorePoints) : 0
    }
  }

  const updates = buildMatchPlayerUpdates({
    roundData,
    side1: p1 ? { playerIds: side1Ids, baseScore: p1BaseScore } : null,
    side2: p2 ? { playerIds: side2Ids, baseScore: p2BaseScore } : null,
    hcp1, hcp2, erWalkover,
  })

  // RLS only allows updates while er_bekreftet = false, so a zero-row write
  // here means the match was already confirmed (typically by the opponent).
  const alreadyConfirmedMessage = 'Kampen er allereie stadfesta av ein annan deltakar.'

  const spelarUpdates = [...updates.entries()].map(([id, values]) =>
    verifyRowsAffected(
      supabase.from('kamp_spelar').update(values).eq('id', id).select('id'),
      alreadyConfirmedMessage,
    ),
  )

  if (spelarUpdates.length) {
    const results = await Promise.all(spelarUpdates)
    const spelarErr = results.find(r => r.error)?.error
    if (spelarErr) {
      logError('confirmInitialMatch:spelarar', spelarErr)
      return { error: spelarErr }
    }
  }

  const { error } = await verifyRowsAffected(
    supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId).select('id'),
    alreadyConfirmedMessage,
  )
  if (error) logError('confirmInitialMatch:kamp', error)
  return { error }
}

/**
 * Decides which side lost by comparing SIDE totals: each side's omgang rows
 * are summed across all members (pair members alternate omgangar), falling
 * back to the rep's scorePoints when the side has no rows. Returns the losing
 * side's kasterid — any member works, the elimination RPC resolves the full
 * side from resultat.startnummer.
 */
export function buildEliminatedThrowerId(params: {
  roundData: Array<{ kamp_spelar_id: number | null; score: number | null }>
  p1: { playerIds: number[]; kasterid: number; scorePoints: number } | null
  p2: { playerIds: number[]; kasterid: number; scorePoints: number } | null
}): number | null {
  const { roundData, p1, p2 } = params

  const sideTotal = (side: { playerIds: number[]; scorePoints: number } | null): number => {
    if (!side) return 0
    const rows = roundData.filter(o => o.kamp_spelar_id != null && side.playerIds.includes(o.kamp_spelar_id))
    if (!rows.length) return side.scorePoints
    return rows.reduce((sum, o) => sum + (o.score ?? 0), 0)
  }

  const t1 = sideTotal(p1)
  const t2 = sideTotal(p2)
  return t1 >= t2 ? (p2?.kasterid ?? null) : (p1?.kasterid ?? null)
}

export async function confirmFinalMatch(params: {
  kampId: number
  p1: MatchPlayerConfirmData | null
  p2: MatchPlayerConfirmData | null
  orderedKasterids: number[] | null  // 3-unit: [1st, 2nd, 3rd] side-rep kasterids
  // Par/Mix: partner kamp_spelar ids so side totals include both members
  p1PartnerId?: number | null
  p2PartnerId?: number | null
}): Promise<{ error: unknown }> {
  const { kampId, p1, p2, orderedKasterids, p1PartnerId = null, p2PartnerId = null } = params

  let eliminatedId: number | null = null
  if (orderedKasterids?.length === 3) {
    eliminatedId = orderedKasterids[2] ?? null
  } else {
    const side1Ids = _sidePlayerIds(p1, p1PartnerId)
    const side2Ids = _sidePlayerIds(p2, p2PartnerId)
    const { data: roundData } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score')
      .in('kamp_spelar_id', [...side1Ids, ...side2Ids])

    eliminatedId = buildEliminatedThrowerId({
      roundData: roundData ?? [],
      p1: p1 ? { playerIds: side1Ids, kasterid: p1.kasterid, scorePoints: p1.scorePoints } : null,
      p2: p2 ? { playerIds: side2Ids, kasterid: p2.kasterid, scorePoints: p2.scorePoints } : null,
    })
  }

  const { error } = await supabase.rpc('bekreft_avsluttende_kamp_deltakar', {
    p_kamp_id: kampId,
    p_eliminert_kasterid: eliminatedId ?? undefined,
  })
  if (error) { logError('confirmFinalMatch', error); return { error } }

  return { error: null }
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslKamperQuery = supabase.from('kamp').select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`)
export type FinalMatchRow = QueryData<typeof _avslKamperQuery>[number]
export type FinalMatchPlayerRow = FinalMatchRow['spelarar'][number]

const _kampSpelarerQuery = supabase.from('kamp_spelar').select(
  'id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)',
)
export type MatchPlayerScoreRow = QueryData<typeof _kampSpelarerQuery>[number]

export async function getFinalRoundMatches(stevneid: number): Promise<{ data: FinalMatchRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq('stevneid', stevneid)
    .order('runde_nummer')
    .order('bane_nummer')
  if (error) logError('getFinalRoundMatches', error)
  return { data: data ?? [], error }
}

export async function getMatchPlayers(kampId: number): Promise<{ data: MatchPlayerScoreRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp_spelar')
    .select('id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)')
    .eq('kampid', kampId)
  if (error) logError('getMatchPlayers', error)
  return { data: data ?? [], error }
}

export async function setMatchPlayerPlacements(
  kampId: number,
  entries: { kasterid: number; plassering: number }[],
): Promise<{ error: unknown }> {
  if (!entries.length) return { error: null }
  const results = await Promise.all(
    entries.map(e =>
      supabase.from('kamp_spelar')
        .update({ kamp_plassering: e.plassering })
        .eq('kampid', kampId)
        .eq('kasterid', e.kasterid),
    ),
  )
  const err = results.find(r => r.error)?.error ?? null
  if (err) logError('setMatchPlayerPlacements', err)
  return { error: err }
}

export async function confirmCupMatch(params: {
  kampId: number
  stevneId: number
  roundNumber: number
  roundName: string | null
  allThrowerIds: number[]
  /** All members of the eliminated side ([] = none). Singel: one kasterid. */
  eliminatedIds: number[]
  /** Advancing sides in rank order; every member of a side shares its kamp_plassering. */
  advancingSides: number[][]
}): Promise<{ error: unknown }> {
  const { kampId, stevneId, roundNumber, roundName, allThrowerIds, eliminatedIds, advancingSides } = params

  const { error: kampErr } = await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId)
  if (kampErr) { logError('confirmCupMatch:kamp', kampErr); return { error: kampErr } }

  // Write per-match rank to kamp_spelar for display (advancingSides = 1st, 2nd, …; eliminated = last)
  const matchPlacements = [
    ...advancingSides.flatMap((side, i) => side.map(kid => ({ kasterid: kid, plassering: i + 1 }))),
    ...eliminatedIds.map(kid => ({ kasterid: kid, plassering: advancingSides.length + 1 })),
  ]
  const { error: kpErr } = await setMatchPlayerPlacements(kampId, matchPlacements)
  if (kpErr) return { error: kpErr }

  // Semifinale losers are not finally eliminated — they advance to bronsefinale
  if (roundName === 'Semifinale') return { error: null }

  if (!eliminatedIds.length) return { error: null }

  if (roundName !== 'Finale' && roundName !== 'Bronsefinale') {
    const { error } = await _resetAndMarkEliminated(stevneId, roundNumber, allThrowerIds, eliminatedIds, 'confirmCupMatch')
    if (error) return { error }
  }

  // Write final tournament placement for Finale and Bronsefinale
  const winnerIds = advancingSides[0] ?? []
  if (roundName === 'Finale' && winnerIds.length) {
    const { error: vErr } = await supabase.from('resultat')
      .update({ plassering: 1 }).eq('stevneid', stevneId).in('kasterid', winnerIds)
    if (vErr) { logError('confirmCupMatch:plassering-vinnar', vErr); return { error: vErr } }
    const { error: tErr } = await supabase.from('resultat')
      .update({ plassering: 2 }).eq('stevneid', stevneId).in('kasterid', eliminatedIds)
    if (tErr) { logError('confirmCupMatch:plassering-tapar', tErr); return { error: tErr } }
  } else if (roundName === 'Bronsefinale' && winnerIds.length) {
    const { error: vErr } = await supabase.from('resultat')
      .update({ plassering: 3 }).eq('stevneid', stevneId).in('kasterid', winnerIds)
    if (vErr) { logError('confirmCupMatch:plassering-vinnar', vErr); return { error: vErr } }
    const { error: tErr } = await supabase.from('resultat')
      .update({ plassering: 4 }).eq('stevneid', stevneId).in('kasterid', eliminatedIds)
    if (tErr) { logError('confirmCupMatch:plassering-tapar', tErr); return { error: tErr } }
  }

  return { error: null }
}

/** Regular cup rounds: clear this round's eliminations for the match's players, then mark the losers. */
async function _resetAndMarkEliminated(
  stevneId: number,
  roundNumber: number,
  allThrowerIds: number[],
  eliminatedIds: number[],
  logContext: string,
): Promise<{ error: unknown }> {
  const { error: resetErr } = await supabase.from('resultat')
    .update({ runde_eliminert: null })
    .eq('stevneid', stevneId).eq('runde_eliminert', roundNumber).in('kasterid', allThrowerIds)
  if (resetErr) { logError(`${logContext}:reset`, resetErr); return { error: resetErr } }
  if (eliminatedIds.length) {
    const { error } = await supabase.from('resultat')
      .update({ runde_eliminert: roundNumber }).eq('stevneid', stevneId).in('kasterid', eliminatedIds)
    if (error) { logError(`${logContext}:eliminert`, error); return { error } }
  }
  return { error: null }
}

export async function updateWinnerLoser(params: {
  stevneId: number
  roundNumber: number
  roundName: string | null
  allThrowerIds: number[]
  /** All members of the winning/losing side. Singel: one kasterid. */
  newWinnerIds: number[]
  newLoserIds: number[]
}): Promise<{ error: unknown }> {
  const { stevneId, roundNumber, roundName, allThrowerIds, newWinnerIds, newLoserIds } = params
  const isSemifinal = roundName === 'Semifinale'
  const isFinal = roundName === 'Finale'
  const isBronzeFinal = roundName === 'Bronsefinale'

  // Write per-match rank to kamp_spelar (score correction path — need kampId)
  // kamp_plassering update is handled by the caller (cup.ts score edit handler) when re-confirming

  if (isSemifinal) {
    // Semifinale losers are not finally eliminated — no runde_eliminert changes
    return { error: null }
  }

  if (isFinal || isBronzeFinal) {
    // Write final tournament placement
    const winnerRank = isFinal ? 1 : 3
    const loserRank = isFinal ? 2 : 4
    if (newWinnerIds.length) {
      const { error } = await supabase.from('resultat')
        .update({ plassering: winnerRank }).eq('stevneid', stevneId).in('kasterid', newWinnerIds)
      if (error) { logError('updateWinnerLoser:plassering-vinnar', error); return { error } }
    }
    if (newLoserIds.length) {
      const { error } = await supabase.from('resultat')
        .update({ plassering: loserRank }).eq('stevneid', stevneId).in('kasterid', newLoserIds)
      if (error) { logError('updateWinnerLoser:plassering-tapar', error); return { error } }
    }
  } else {
    const { error } = await _resetAndMarkEliminated(stevneId, roundNumber, allThrowerIds, newLoserIds, 'updateWinnerLoser')
    if (error) return { error }
  }

  return { error: null }
}

// ── Scoreboard omgangar ───────────────────────────────────────────────────────

const _kampOmgangQuery = supabase
  .from('kamp_omgang')
  .select('id, kamp_spelar_id, omgang, score, antall_ringer')
export type MatchRoundRow = QueryData<typeof _kampOmgangQuery>[number]

export async function getMatchRounds(spelarIds: number[]): Promise<{ data: MatchRoundRow[]; error: unknown }> {
  if (!spelarIds.length) return { data: [], error: null }
  const { data, error } = await supabase
    .from('kamp_omgang')
    .select('id, kamp_spelar_id, omgang, score, antall_ringer')
    .in('kamp_spelar_id', spelarIds)
    .order('omgang')
  if (error) logError('getMatchRounds', error)
  return { data: data ?? [], error }
}

const SAVE_TIMEOUT_MS = 10_000

/** Races a Supabase write against SAVE_TIMEOUT_MS so scoreboard saves never hang. */
async function _runWithTimeout(
  logContext: string,
  query: PromiseLike<{ error: unknown }>,
): Promise<{ error: unknown }> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), SAVE_TIMEOUT_MS),
    )
    const { error } = await Promise.race([query, timeout])
    if (error) logError(logContext, error)
    return { error }
  } catch (e) {
    logError(logContext, e)
    return { error: e }
  }
}

export async function saveMatchRound(
  inserts: { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[],
): Promise<{ error: unknown }> {
  if (!inserts.length) return { error: null }
  return _runWithTimeout('saveMatchRound', supabase.from('kamp_omgang').insert(inserts))
}

export async function updateMatchRound(
  rows: { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[],
): Promise<{ error: unknown }> {
  if (!rows.length) return { error: null }
  try {
    const results = await Promise.all(
      rows.map(r =>
        supabase
          .from('kamp_omgang')
          .update({ score: r.score, antall_ringer: r.antall_ringer })
          .eq('kamp_spelar_id', r.kamp_spelar_id)
          .eq('omgang', r.omgang),
      ),
    )
    const err = results.find(r => r.error)?.error ?? null
    if (err) logError('updateMatchRound', err)
    return { error: err }
  } catch (e) {
    logError('updateMatchRound', e)
    return { error: e }
  }
}

export async function unconfirmMatch(kampId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('kamp').update({ er_bekreftet: false }).eq('id', kampId)
  if (error) logError('unconfirmMatch', error)
  return { error }
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export type NextMatchPayload = { id: number; bane_nummer: number | null; er_walkover: boolean }

export function subscribeToNextMatch(
  stevneId: number,
  kampId: number,
  onNewKamp: (kamp: NextMatchPayload) => void,
): RealtimeChannel {
  return supabase
    .channel(`neste-kamp-${kampId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'kamp',
      filter: `stevneid=eq.${stevneId}`,
    }, (payload) => {
      onNewKamp(payload.new as NextMatchPayload)
    })
    .subscribe()
}

export function subscribeToMatchChanges(
  stevneid: number,
  channelName: string,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = (payload.new as { stevneid?: number })?.stevneid ?? (payload.old as { stevneid?: number })?.stevneid
      if (sid === stevneid) onChange()
    })
    .subscribe()
}

export function subscribeToScoreboardChanges(
  kampId: number,
  spelarIds: number[],
  onOmgangChange: () => Promise<void>,
  onKampBekreft: () => Promise<void>,
  onResubscribe?: () => Promise<void>,
): RealtimeChannel {
  let roundDebounce: ReturnType<typeof setTimeout> | null = null

  return supabase
    .channel(`scoreboard-kamp-${kampId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' },
      (payload) => {
        const p = payload.new as Record<string, unknown>
        const o = payload.old as Record<string, unknown>
        const changedId = p.kamp_spelar_id ?? o.kamp_spelar_id
        if (!changedId || spelarIds.includes(changedId as number)) {
          if (roundDebounce) clearTimeout(roundDebounce)
          roundDebounce = setTimeout(() => {
            roundDebounce = null
            void onOmgangChange()
          }, 50)
        }
      },
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kamp', filter: `id=eq.${kampId}` },
      async (payload) => {
        if ((payload.new as { er_bekreftet?: boolean })?.er_bekreftet) {
          await onKampBekreft()
        }
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') void onResubscribe?.()
    })
}
