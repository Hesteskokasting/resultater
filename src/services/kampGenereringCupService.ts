import { supabase } from '@/supabase'
import { calcCupRoundPairings } from '@/utils/kastemetoder-logikk'
import type { RoundSetup } from '@/types'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface MatchWithLane { id: number; bane_nummer: number | null }
interface MatchWithMatchId { id: number; match_id: string }
interface MatchPlayerInsert { kampid: number; kasterid: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }

interface GroupForCup {
  groupName: string | null
  spelarar: { kasterid: number; plassering: number }[]
  runde1Oppsett?: RoundSetup | null
}

interface Round1Format {
  [groupName: string]: RoundSetup | undefined
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Side membership from resultat.startnummer: each kasterid maps to all
 * kasterids sharing its startnummer (posisjon order). Singel: the player
 * alone. The cup algorithms operate on one representative kasterid per side;
 * this expands them back to full kamp_spelar rows at insert time.
 */
interface SideInfo {
  kasteridToSnr: Record<number, number>
  snrToMembers: Record<number, number[]>
}

async function _fetchSideInfo(stevneid: number): Promise<SideInfo> {
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, startnummer, posisjon')
    .eq('stevneid', stevneid)
  if (error) throw new Error('Feil ved henting av resultat: ' + error.message)

  const kasteridToSnr: Record<number, number> = {}
  const rawMembers: Record<number, { kasterid: number; posisjon: number | null }[]> = {}
  for (const row of data ?? []) {
    if (row.kasterid == null || row.startnummer == null) continue
    kasteridToSnr[row.kasterid] = row.startnummer
    const sideRows = (rawMembers[row.startnummer] ??= [])
    sideRows.push({ kasterid: row.kasterid, posisjon: row.posisjon })
  }

  const snrToMembers: Record<number, number[]> = {}
  for (const [snr, members] of Object.entries(rawMembers)) {
    members.sort((a, b) => (a.posisjon ?? Infinity) - (b.posisjon ?? Infinity) || a.kasterid - b.kasterid)
    snrToMembers[Number(snr)] = members.map(m => m.kasterid)
  }
  return { kasteridToSnr, snrToMembers }
}

function _sideMembers(sideInfo: SideInfo, kasterid: number): number[] {
  const snr = sideInfo.kasteridToSnr[kasterid]
  return (snr != null ? sideInfo.snrToMembers[snr] : undefined) ?? [kasterid]
}

async function _insertCupPairings(
  stevneid: number,
  pairings: ReturnType<typeof calcCupRoundPairings>,
  roundNumber: number,
  groupName: string | null,
  sideInfo: SideInfo,
  laneStart = 0,
  roundName: string | null = null,
): Promise<number> {
  const matchIds = pairings.map(() => genMatchId())
  let laneNr = laneStart
  const roundMatches = pairings.map((p, i) => ({
    match_id: matchIds[i]!,
    stevneid,
    fase: 'avsluttende',
    runde_nummer: roundNumber,
    gruppe_navn: groupName ?? null,
    bane_nummer: p.isWalkover ? null : ++laneNr,
    er_bekreftet: p.isWalkover,
    er_walkover: p.isWalkover,
    er_tre_spelarar: p.isThreePlayers,
    runde_navn: roundName,
  }))

  const { data: insertedMatches, error: matchErr } = await supabase
    .from('kamp').insert(roundMatches).select('id, match_id')
  if (matchErr) throw new Error('Feil ved innsetting av cup-kampar: ' + matchErr.message)

  const matchIdMap: Record<string, number> = Object.fromEntries(
    (insertedMatches as MatchWithMatchId[]).map(k => [k.match_id, k.id]),
  )
  const playerRows: MatchPlayerInsert[] = []

  for (const [i, pairing] of pairings.entries()) {
    // matchIds maps 1:1 to pairings, and every inserted kamp comes back with its match_id
    const kampid = matchIdMap[matchIds[i]!]!
    pairing.players.forEach((kasterid) => {
      for (const member of _sideMembers(sideInfo, kasterid as number)) {
        playerRows.push({ kampid, kasterid: member, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      }
    })
  }

  const { error: playerErr } = await supabase.from('kamp_spelar').insert(playerRows)
  if (playerErr) throw new Error('Feil ved innsetting av cup-spelarar: ' + playerErr.message)

  return (insertedMatches as MatchWithMatchId[]).length
}

// ── Public exports ────────────────────────────────────────────────────────────

export async function generateCupRound1(
  stevneid: number,
  groups: GroupForCup[],
  withSeeding: boolean,
  round1Format: Round1Format | null = null,
): Promise<number> {
  const groupOrder = ['A', 'B', 'C']
  let totalMatches = 0
  const sideInfo = await _fetchSideInfo(stevneid)

  for (const gr of groups) {
    const pairings = calcCupRoundPairings(gr.spelarar, { medSeeding: withSeeding, isRunde1: true, runde1Oppsett: gr.runde1Oppsett ?? null })
    const { data: maxLane } = await supabase.from('kamp')
      .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
      .eq('runde_nummer', 1).not('bane_nummer', 'is', null)
      .order('bane_nummer', { ascending: false }).limit(1)
    const dbMaxLane = (maxLane as MatchWithLane[] | null)?.[0]?.bane_nummer ?? 0

    let formatLaneOffset = 0
    if (round1Format && gr.groupName) {
      const myIdx = groupOrder.indexOf(gr.groupName)
      for (const group of groupOrder.slice(0, myIdx)) {
        const prev = round1Format[group]
        if (prev) formatLaneOffset += (prev.c3 ?? 0) + (prev.c2 ?? 0)
      }
    }

    const laneStart = Math.max(dbMaxLane, formatLaneOffset)
    const isSemifinal = gr.spelarar.length === 4
    totalMatches += await _insertCupPairings(stevneid, pairings, 1, gr.groupName, sideInfo, laneStart, isSemifinal ? 'Semifinale' : null)
  }
  return totalMatches
}

/** Highest assigned lane number for the round, so new matches continue after it. */
async function _fetchLaneStart(stevneid: number, roundNumber: number): Promise<number> {
  const { data: maxLane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', roundNumber).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  return (maxLane as MatchWithLane[] | null)?.[0]?.bane_nummer ?? 0
}

export async function generateNextCupRoundForGroup(
  stevneid: number,
  groupName: string,
  withSeeding: boolean,
  sortedPlayers: { kasterid: number; plassering: number }[],
): Promise<{ roundNumber: number; matchCount: number }> {
  const { data: matches } = await supabase.from('kamp')
    .select('runde_nummer')
    .eq('stevneid', stevneid).eq('fase', 'avsluttende').eq('gruppe_navn', groupName)
    .order('runde_nummer', { ascending: false }).limit(1)
  const roundNumber = ((matches as { runde_nummer: number }[] | null)?.[0]?.runde_nummer ?? 0) + 1

  const isSemifinal = sortedPlayers.length === 4
  const pairings = calcCupRoundPairings(sortedPlayers, { medSeeding: withSeeding, isRunde1: false })

  const laneStart = await _fetchLaneStart(stevneid, roundNumber)

  const sideInfo = await _fetchSideInfo(stevneid)
  const matchCount = await _insertCupPairings(
    stevneid, pairings, roundNumber, groupName, sideInfo, laneStart,
    isSemifinal ? 'Semifinale' : null,
  )
  return { roundNumber, matchCount }
}

export async function generateFinaleAndBronzeFinal(
  stevneid: number,
  groupName: string,
): Promise<void> {
  interface SemiPlayer {
    id: number
    kasterid: number | null
    score_poeng: number
    omgangar: { score: number | null }[] | null
  }
  interface SemiMatch {
    id: number
    runde_nummer: number
    spelarar: SemiPlayer[] | null
  }

  const { data: semiMatches } = await supabase
    .from('kamp')
    .select('id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .eq('gruppe_navn', groupName)
    .eq('runde_navn', 'Semifinale')
    .eq('er_bekreftet', true)

  if (!semiMatches?.length) throw new Error('Semifinalane er ikkje bekrefta.')

  const sideInfo = await _fetchSideInfo(stevneid)
  const typedSemi = semiMatches as SemiMatch[]
  const roundNumber = typedSemi[0]!.runde_nummer + 1
  // One entry per side: all member kasterids of the winning/losing unit
  const winners: number[][] = []
  const losers: number[][] = []

  for (const kamp of typedSemi) {
    // Group rows into sides by startnummer; side score = sum of members'
    // own omgangar (pair members alternate throws) or score_poeng fallback
    const sider = new Map<number | string, { kasterids: number[]; score: number }>()
    for (const sp of kamp.spelarar ?? []) {
      if (sp.kasterid == null) continue
      const key = sideInfo.kasteridToSnr[sp.kasterid] ?? `kaster-${sp.kasterid}`
      const side = sider.get(key) ?? { kasterids: [], score: 0 }
      side.kasterids.push(sp.kasterid)
      side.score += sp.omgangar?.length
        ? sp.omgangar.reduce((s, o) => s + (o.score ?? 0), 0)
        : (sp.score_poeng ?? 0)
      sider.set(key, side)
    }
    const sorted = [...sider.values()].sort((a, b) => b.score - a.score)
    if (sorted[0]) winners.push(sorted[0].kasterids)
    if (sorted[1]) losers.push(sorted[1].kasterids)
  }

  const laneStart = await _fetchLaneStart(stevneid, roundNumber)

  const finale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: roundNumber,
    gruppe_navn: groupName, bane_nummer: laneStart + 1, runde_navn: 'Finale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }
  const bronsefinale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: roundNumber,
    gruppe_navn: groupName, bane_nummer: laneStart + 2, runde_navn: 'Bronsefinale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }

  const { data: insertedMatches, error } = await supabase
    .from('kamp').insert([finale, bronsefinale]).select('id, runde_navn')
  if (error) throw new Error('Feil: ' + error.message)

  const typedMatches = insertedMatches as { id: number; runde_navn: string | null }[]
  const finaleId = typedMatches.find(k => k.runde_navn === 'Finale')!.id
  const bronzeId = typedMatches.find(k => k.runde_navn === 'Bronsefinale')!.id

  const playerRows: MatchPlayerInsert[] = [
    ...winners.flat().map(kid => ({ kampid: finaleId, kasterid: kid, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
    ...losers.flat().map(kid => ({ kampid: bronzeId, kasterid: kid, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
  ]
  const { error: playerErr } = await supabase.from('kamp_spelar').insert(playerRows)
  if (playerErr) throw new Error('Feil: ' + playerErr.message)
}
