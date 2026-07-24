import { supabase } from '@/supabase'
import { sortStandings, type MatchForSorting } from '@/organizer/org-shared'
import { createCourts, type NewCourt } from '@/services/xkastKongelagService'
import { calcXkastLayout } from '@/utils/calcXkastLayout'
import { isXkastMethodName } from '@/utils/kastemetode'
import { errorMessage } from '@/utils/errorMessage'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface Matchup { p1Pos: number; p2Pos: number | null; isWalkover: boolean }
interface MatchWithLane { id: number; bane_nummer: number | null }
interface MatchWithMatchId { id: number; match_id: string }
interface RoundMatchups { roundNumber: number; matchups: Matchup[] }
interface MatchPlayerInsert { kampid: number; kasterid: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }
interface SwissMatchup { p1: number; p2: number | null; isWalkover: boolean }

interface EntryMember { kasterid: number; klubbid: number | null }
/** One competition unit: a single player (Singel) or a pair (Par/Mix), members ordered by posisjon. */
interface Entry { members: EntryMember[] }

async function _fetchSingelEntries(stevneid: number): Promise<Entry[]> {
  const { data: pameldingar, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, kaster(klubbid)')
    .eq('stevneid', stevneid)
    .order('id')

  if (error) throw new Error('Feil ved henting av påmelding: ' + error.message)
  if (!pameldingar?.length) throw new Error('Ingen spelarar påmelde.')

  return pameldingar.map(p => ({
    members: [{
      kasterid: p.kasterid,
      klubbid: (p.kaster as { klubbid: number | null } | null)?.klubbid ?? null,
    }],
  }))
}

async function _fetchParEntries(stevneid: number): Promise<Entry[]> {
  const { data: pameldingar, error } = await supabase
    .from('pamelding')
    .select('kasterid, lag_id, posisjon, kaster(klubbid)')
    .eq('stevneid', stevneid)
    .not('lag_id', 'is', null)
    .order('lag_id')
    .order('posisjon')

  if (error) throw new Error('Feil ved henting av påmelding: ' + error.message)
  if (!pameldingar?.length) throw new Error('Ingen par påmelde.')

  const lagMap = new Map<number, EntryMember[]>()
  for (const row of pameldingar) {
    if (row.lag_id == null) continue
    const members = lagMap.get(row.lag_id) ?? []
    members.push({
      kasterid: row.kasterid,
      klubbid: (row.kaster as { klubbid: number | null } | null)?.klubbid ?? null,
    })
    lagMap.set(row.lag_id, members)
  }

  const entries = [...lagMap.values()].filter(m => m.length === 2).map(members => ({ members }))
  if (!entries.length) throw new Error('Ingen komplette par funne.')
  if (entries.length < 2) throw new Error('Treng minst 2 par for å starte.')
  return entries
}

export async function generateInitialRoundMatches(
  stevneid: number,
  throwingMethodName: string,
  roundCount: number,
  isTeam = false,
): Promise<number> {
  const entries = isTeam ? await _fetchParEntries(stevneid) : await _fetchSingelEntries(stevneid)

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j]!, entries[i]!]
  }

  const N = entries.length
  const posToKasterids: Record<number, number[]> = {}
  const resultatRows: { stevneid: number; kasterid: number; klubbid: number | null; startnummer: number; posisjon: number | null }[] = []

  entries.forEach((entry, i) => {
    const startnummer = i + 1
    posToKasterids[startnummer] = entry.members.map(m => m.kasterid)
    entry.members.forEach((member, mi) => {
      resultatRows.push({
        stevneid,
        kasterid: member.kasterid,
        klubbid: member.klubbid,
        startnummer,
        posisjon: isTeam ? mi + 1 : null,
      })
    })
  })

  await supabase.from('resultat').delete().eq('stevneid', stevneid)
  const { error: resErr } = await supabase.from('resultat').insert(resultatRows)
  if (resErr) throw new Error('Feil ved lagring av startnummer: ' + resErr.message)

  if (isXkastMethodName(throwingMethodName)) {
    return _insertXkastCourts(stevneid, posToKasterids, N)
  }

  const isCascade = throwingMethodName.toLowerCase().includes('gloppen')

  if (isCascade) {
    return _insertCascadeMatches(stevneid, posToKasterids, N, roundCount)
  } else {
    return _insertSwissRound1(stevneid, posToKasterids, N)
  }
}

/**
 * X-kast: no matches — startnummer order (randomised above) is packed onto
 * courts by calcXkastLayout: pairs when lanes are unlimited (odd player
 * alone on the last court); with stevne.tilgjengelige_baner set, players
 * fill the available courts directly (up to 3 per court), and puljer only
 * appear when the count exceeds lanes × 3. Returns the number of courts
 * created.
 */
async function _insertXkastCourts(
  stevneid: number,
  posToKasterids: Record<number, number[]>,
  N: number,
): Promise<number> {
  const { data: stevne, error } = await supabase
    .from('stevne')
    .select('tilgjengelige_baner')
    .eq('id', stevneid)
    .single()
  if (error) throw new Error('Feil ved henting av stevne: ' + error.message)

  const kasterids: number[] = []
  for (let pos = 1; pos <= N; pos++) kasterids.push(...(posToKasterids[pos] ?? []))

  const courts: NewCourt[] = []
  let next = 0
  calcXkastLayout(kasterids.length, stevne.tilgjengelige_baner).forEach((courtSizes, puljeIdx) => {
    courtSizes.forEach((courtSize, courtIdx) => {
      courts.push({
        pulje: puljeIdx + 1,
        baneNummer: courtIdx + 1,
        kasterids: kasterids.slice(next, next + courtSize),
      })
      next += courtSize
    })
  })

  const { error: courtError } = await createCourts(stevneid, 'innledende', courts)
  if (courtError) throw new Error('Feil ved oppretting av banar: ' + errorMessage(courtError))
  return courts.length
}

export function buildCascadeMatchups(N: number, roundCount: number): Matchup[][] {
  const paddedN = N % 2 === 0 ? N : N + 1
  const totalCourts = paddedN / 2
  const rounds: Matchup[][] = []

  for (let r = 1; r <= roundCount; r++) {
    const matches: Matchup[] = []
    for (let c = 1; c <= totalCourts; c++) {
      const p1Pos = ((c - 1 + r - 1) % totalCourts) + 1
      const rawP2Pos = ((c - 1 + 2 * (r - 1)) % totalCourts) + 1 + totalCourts
      const isWalkover = rawP2Pos > N
      matches.push({ p1Pos, p2Pos: isWalkover ? null : rawP2Pos, isWalkover })
    }
    rounds.push(matches)
  }

  return rounds
}

function _pushPlayerRows(
  playerRows: MatchPlayerInsert[],
  kampid: number,
  kasterids: number[],
  scorePoeng = 0,
  kampPoeng = 0,
): void {
  for (const kasterid of kasterids) {
    playerRows.push({ kampid, kasterid, score_poeng: scorePoeng, kamp_poeng: kampPoeng, antall_ringer: 0 })
  }
}

/**
 * Inserts all given rounds' kampar plus their kamp_spelar rows; returns the
 * match count. Everything goes in one kamp insert and one kamp_spelar insert:
 * the statement-level notify trigger then queues a single push per user for
 * the whole generation, no matter how many rounds it spans.
 */
async function _insertRounds(
  stevneid: number,
  rounds: RoundMatchups[],
  posToKasterids: Record<number, number[]>,
  errorContext: string,
): Promise<number> {
  const matchupRows = rounds.flatMap(({ roundNumber, matchups }) =>
    matchups.map((matchup, ci) => ({
      matchup,
      row: {
        match_id: genMatchId(),
        stevneid,
        fase: 'innledende',
        runde_nummer: roundNumber,
        bane_nummer: ci + 1,
        er_bekreftet: false,
        er_walkover: matchup.isWalkover,
      },
    })),
  )

  const { data: insertedMatches, error: kampErr } = await supabase
    .from('kamp')
    .insert(matchupRows.map(mr => mr.row))
    .select('id, match_id')
  if (kampErr) throw new Error(`Feil ved innsetting av kampar (${errorContext}): ` + kampErr.message)

  // bane_nummer repeats across rounds, so the client-generated match_id is
  // the only key that maps inserted kamp ids back to their matchup.
  const matchIdToKampid: Record<string, number> = Object.fromEntries(
    (insertedMatches as MatchWithMatchId[]).map(k => [k.match_id, k.id]),
  )
  const playerRows: MatchPlayerInsert[] = []

  for (const { matchup, row } of matchupRows) {
    const kampid = matchIdToKampid[row.match_id]!
    _pushPlayerRows(playerRows, kampid, posToKasterids[matchup.p1Pos] ?? [], matchup.isWalkover ? 21 : 0, matchup.isWalkover ? 2 : 0)
    if (matchup.p2Pos != null) _pushPlayerRows(playerRows, kampid, posToKasterids[matchup.p2Pos] ?? [])
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(playerRows)
  if (spErr) throw new Error(`Feil ved innsetting av spelarar (${errorContext}): ` + spErr.message)

  return matchupRows.length
}

async function _insertCascadeMatches(
  stevneid: number,
  posToKasterids: Record<number, number[]>,
  N: number,
  roundCount: number,
): Promise<number> {
  const allRounds = buildCascadeMatchups(N, roundCount)
  return _insertRounds(
    stevneid,
    allRounds.map((matchups, ri) => ({ roundNumber: ri + 1, matchups })),
    posToKasterids,
    'kaskade',
  )
}

export function buildSwissRound1Matchups(N: number): Matchup[] {
  const matchups: Matchup[] = []
  for (let i = 1; i <= N; i += 2) {
    const isWalkover = i + 1 > N
    matchups.push({ p1Pos: i, p2Pos: isWalkover ? null : i + 1, isWalkover })
  }
  return matchups
}

async function _insertSwissRound1(
  stevneid: number,
  posToKasterids: Record<number, number[]>,
  N: number,
): Promise<number> {
  return _insertRounds(stevneid, [{ roundNumber: 1, matchups: buildSwissRound1Matchups(N) }], posToKasterids, 'Swiss runde 1')
}

export function buildSwissMatchups(
  ranked: number[],
  unplayedMatches: Record<number, number[]>,
  byeCount: Record<number, number>,
): SwissMatchup[] | null {
  const byes = { ...byeCount }

  function getByePlayer(ids: number[]): number | null {
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i]
      if (id !== undefined && (byes[id] ?? 0) < 1) return id
    }
    return null
  }

  function tryPairing(ids: number[], matchesSoFar: SwissMatchup[]): SwissMatchup[] | null {
    if (ids.length === 0) return matchesSoFar
    if (ids.length % 2 === 1) {
      const byeKasterid = getByePlayer(ids)
      if (byeKasterid === null) return null
      byes[byeKasterid] = (byes[byeKasterid] ?? 0) + 1
      matchesSoFar.push({ p1: byeKasterid, p2: null, isWalkover: true })
      const rest = ids.filter(k => k !== byeKasterid)
      const result = tryPairing(rest, matchesSoFar)
      if (result) return result
      byes[byeKasterid] = (byes[byeKasterid] ?? 0) - 1
      matchesSoFar.pop()
      return null
    }
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p1 = ids[i]!
        const p2 = ids[j]!
        if (unplayedMatches[p1]?.includes(p2)) {
          matchesSoFar.push({ p1, p2, isWalkover: false })
          const rest = ids.filter(k => k !== p1 && k !== p2)
          const result = tryPairing(rest, matchesSoFar)
          if (result) return result
          matchesSoFar.pop()
        }
      }
    }
    return null
  }

  const matchups = tryPairing(ranked, [])
  if (!matchups) return null

  matchups.sort((a, b) => (a.isWalkover ? 1 : 0) - (b.isWalkover ? 1 : 0))
  return matchups
}

export async function generateNextSwissRound(
  stevneid: number,
): Promise<{ roundNumber: number; matchCount: number }> {
  const { data: rawMatches, error } = await supabase
    .from('kamp')
    .select('id, runde_nummer, er_bekreftet, er_walkover, spelarar:kamp_spelar(kasterid, kamp_poeng, score_poeng)')
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .order('runde_nummer')

  if (error) throw new Error('Feil ved henting av kampar: ' + error.message)

  const { data: resultatRader, error: resErr } = await supabase
    .from('resultat')
    .select('kasterid, startnummer')
    .eq('stevneid', stevneid)
  if (resErr) throw new Error('Feil ved henting av resultat: ' + resErr.message)

  // resultat.startnummer is the competition-unit identity: unique per player in
  // Singel, shared by both players of a pair in Par/Mix. All pairing logic is
  // keyed on startnummer so the same code handles both.
  const kasteridToSnr: Record<number, number> = {}
  const snrToKasterids: Record<number, number[]> = {}
  for (const rad of resultatRader ?? []) {
    if (rad.kasterid == null || rad.startnummer == null) continue
    kasteridToSnr[rad.kasterid] = rad.startnummer
    const sideMembers = (snrToKasterids[rad.startnummer] ??= [])
    sideMembers.push(rad.kasterid)
  }

  type MatchRow = {
    runde_nummer: number
    er_walkover: boolean
    spelarar: { kasterid: number | null; kamp_poeng: number | null; score_poeng: number | null }[] | null
  }
  const matchRows = rawMatches as MatchRow[]
  const roundNumber = Math.max(...matchRows.map(k => k.runde_nummer)) + 1
  const allStartNrs = Object.keys(snrToKasterids).map(Number)

  const unplayed: Record<number, number[]> = {}
  for (const snr of allStartNrs) unplayed[snr] = allStartNrs.filter(s => s !== snr)
  for (const kamp of matchRows) {
    if (kamp.er_walkover) continue
    const snrs = [...new Set(
      (kamp.spelarar ?? [])
        .map(s => (s.kasterid != null ? kasteridToSnr[s.kasterid] : undefined))
        .filter((s): s is number => s != null),
    )]
    if (snrs.length === 2) {
      const [snrA, snrB] = snrs
      if (snrA === undefined || snrB === undefined) continue
      unplayed[snrA] = (unplayed[snrA] ?? []).filter(s => s !== snrB)
      unplayed[snrB] = (unplayed[snrB] ?? []).filter(s => s !== snrA)
    }
  }

  const byes: Record<number, number> = {}
  for (const snr of allStartNrs) byes[snr] = 0
  for (const kamp of matchRows) {
    if (!kamp.er_walkover) continue
    const sp = (kamp.spelarar ?? [])[0]
    if (sp?.kasterid != null) {
      const snr = kasteridToSnr[sp.kasterid]
      if (snr) byes[snr] = (byes[snr] ?? 0) + 1
    }
  }

  // Rank units by side totals: kamp_poeng is identical for all members of a
  // side (any row works), while score_poeng is per-player (pair members
  // alternate omgangar) and must be summed across the side.
  const standing = allStartNrs.map(snr => {
    // allStartNrs is derived from Object.keys(snrToKasterids) and entries are
    // created non-empty, so both lookups below always hit.
    const members = snrToKasterids[snr]!
    let matchPoints = 0
    let scorePoints = 0
    for (const kamp of matchRows) {
      const sideRows = (kamp.spelarar ?? []).filter(
        (s): s is typeof s & { kasterid: number } => s.kasterid != null && members.includes(s.kasterid),
      )
      const firstRow = sideRows[0]
      if (!firstRow) continue
      matchPoints += firstRow.kamp_poeng ?? 0
      for (const s of sideRows) scorePoints += s.score_poeng ?? 0
    }
    return { kasterid: members[0]!, kamp_poeng: matchPoints, score_poeng: scorePoints, startnummer: snr }
  })

  const ranked = sortStandings(standing, rawMatches as MatchForSorting[])
  const rankedSnr = ranked
    .map(r => kasteridToSnr[r.kasterid])
    .filter((snr): snr is number => snr !== undefined)

  const matchups = buildSwissMatchups(rankedSnr, unplayed, byes)
  if (!matchups) throw new Error('Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.')

  const roundMatches = matchups.map((matchup, i) => ({
    match_id: genMatchId(),
    stevneid,
    fase: 'innledende',
    runde_nummer: roundNumber,
    bane_nummer: i + 1,
    er_bekreftet: false,
    er_walkover: matchup.isWalkover,
  }))

  const { data: insertedMatches, error: kampErr } = await supabase
    .from('kamp')
    .insert(roundMatches)
    .select('id, bane_nummer')
  if (kampErr) throw new Error('Feil ved innsetting av ny Swiss-runde: ' + kampErr.message)

  const laneToMatchId: Record<number, number> = Object.fromEntries(
    (insertedMatches as MatchWithLane[]).map(k => [k.bane_nummer, k.id]),
  )
  const playerRows: MatchPlayerInsert[] = []

  for (const [i, matchup] of matchups.entries()) {
    const kampid = laneToMatchId[i + 1]!
    _pushPlayerRows(playerRows, kampid, snrToKasterids[matchup.p1] ?? [], matchup.isWalkover ? 21 : 0, matchup.isWalkover ? 2 : 0)
    if (matchup.p2 != null) _pushPlayerRows(playerRows, kampid, snrToKasterids[matchup.p2] ?? [])
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(playerRows)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return { roundNumber, matchCount: (insertedMatches as MatchWithLane[]).length }
}
