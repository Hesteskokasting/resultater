import { supabase } from '@/supabase'
import { sorterStilling, type KampForSortering } from '@/organizer/org-shared'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface KampPar { p1Pos: number; p2Pos: number | null; erWalkover: boolean }
interface KampMedBane { id: number; bane_nummer: number | null }
interface KampSpelarInsert { kampid: number; kasterid: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }
interface SwissPar { p1: number; p2: number | null; erWalkover: boolean }

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

export async function genererInnledendeKamper(
  stevneid: number,
  kastemetodeNavn: string,
  antallRunder: number,
  erLag = false,
): Promise<number> {
  const entries = erLag ? await _fetchParEntries(stevneid) : await _fetchSingelEntries(stevneid)

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]]
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
        posisjon: erLag ? mi + 1 : null,
      })
    })
  })

  await supabase.from('resultat').delete().eq('stevneid', stevneid)
  const { error: resErr } = await supabase.from('resultat').insert(resultatRows)
  if (resErr) throw new Error('Feil ved lagring av startnummer: ' + resErr.message)

  const erCascade = kastemetodeNavn.toLowerCase().includes('gloppen')

  if (erCascade) {
    return _insertCascadeMatches(stevneid, posToKasterids, N, antallRunder)
  } else {
    return _insertSwissRunde1(stevneid, posToKasterids, N)
  }
}

export function buildCascadePairs(N: number, antallRunder: number): KampPar[][] {
  const paddedN = N % 2 === 0 ? N : N + 1
  const totalCourts = paddedN / 2
  const rounds: KampPar[][] = []

  for (let r = 1; r <= antallRunder; r++) {
    const matches: KampPar[] = []
    for (let c = 1; c <= totalCourts; c++) {
      const p1Pos = ((c - 1 + r - 1) % totalCourts) + 1
      const rawP2Pos = ((c - 1 + 2 * (r - 1)) % totalCourts) + 1 + totalCourts
      const erWalkover = rawP2Pos > N
      matches.push({ p1Pos, p2Pos: erWalkover ? null : rawP2Pos, erWalkover })
    }
    rounds.push(matches)
  }

  return rounds
}

function _pushSpelarRader(spelarRader: KampSpelarInsert[], kampid: number, kasterids: number[]): void {
  for (const kasterid of kasterids) {
    spelarRader.push({ kampid, kasterid, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
  }
}

async function _insertCascadeMatches(
  stevneid: number,
  posToKasterids: Record<number, number[]>,
  N: number,
  antallRunder: number,
): Promise<number> {
  const allRounds = buildCascadePairs(N, antallRunder)
  let totaltKampar = 0

  for (let ri = 0; ri < allRounds.length; ri++) {
    const roundPairs = allRounds[ri]
    const rundeNummer = ri + 1

    const rundekampar = roundPairs.map((pair, ci) => ({
      match_id: genMatchId(),
      stevneid,
      fase: 'innledende',
      runde_nummer: rundeNummer,
      bane_nummer: ci + 1,
      er_bekreftet: false,
      er_walkover: pair.erWalkover,
    }))

    const { data: innsettaKampar, error: kampErr } = await supabase
      .from('kamp')
      .insert(rundekampar)
      .select('id, bane_nummer')
    if (kampErr) throw new Error(`Feil ved innsetting av kampar (runde ${rundeNummer}): ` + kampErr.message)

    const baneToKampId: Record<number, number> = Object.fromEntries(
      (innsettaKampar as KampMedBane[]).map(k => [k.bane_nummer, k.id]),
    )
    const spelarRader: KampSpelarInsert[] = []

    for (let ci = 0; ci < roundPairs.length; ci++) {
      const { p1Pos, p2Pos, erWalkover } = roundPairs[ci]
      const kampid = baneToKampId[ci + 1]
      _pushSpelarRader(spelarRader, kampid, posToKasterids[p1Pos])
      if (!erWalkover) _pushSpelarRader(spelarRader, kampid, posToKasterids[p2Pos!])
    }

    const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
    if (spErr) throw new Error(`Feil ved innsetting av spelarar (runde ${rundeNummer}): ` + spErr.message)

    totaltKampar += (innsettaKampar as KampMedBane[]).length
  }

  return totaltKampar
}

export function buildSwissRunde1Pairs(N: number): KampPar[] {
  const pairs: KampPar[] = []
  for (let i = 1; i <= N; i += 2) {
    const erWalkover = i + 1 > N
    pairs.push({ p1Pos: i, p2Pos: erWalkover ? null : i + 1, erWalkover })
  }
  return pairs
}

async function _insertSwissRunde1(
  stevneid: number,
  posToKasterids: Record<number, number[]>,
  N: number,
): Promise<number> {
  const kampPairs = buildSwissRunde1Pairs(N)

  const rundekampar = kampPairs.map((pair, ci) => ({
    match_id: genMatchId(),
    stevneid,
    fase: 'innledende',
    runde_nummer: 1,
    bane_nummer: ci + 1,
    er_bekreftet: false,
    er_walkover: pair.erWalkover,
  }))

  const { data: innsettaKampar, error: kampErr } = await supabase
    .from('kamp')
    .insert(rundekampar)
    .select('id, bane_nummer')
  if (kampErr) throw new Error('Feil ved innsetting av Swiss runde 1: ' + kampErr.message)

  const baneToKampId: Record<number, number> = Object.fromEntries(
    (innsettaKampar as KampMedBane[]).map(k => [k.bane_nummer, k.id]),
  )
  const spelarRader: KampSpelarInsert[] = []

  for (let ci = 0; ci < kampPairs.length; ci++) {
    const { p1Pos, p2Pos, erWalkover } = kampPairs[ci]
    const kampid = baneToKampId[ci + 1]
    _pushSpelarRader(spelarRader, kampid, posToKasterids[p1Pos])
    if (!erWalkover) _pushSpelarRader(spelarRader, kampid, posToKasterids[p2Pos!])
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return (innsettaKampar as KampMedBane[]).length
}

export function buildSwissPairs(
  rankedKasterids: number[],
  unplayedMatches: Record<number, number[]>,
  byeCount: Record<number, number>,
): SwissPar[] | null {
  const byes = { ...byeCount }

  function getByePlayer(ids: number[]): number | null {
    for (let i = ids.length - 1; i >= 0; i--) {
      if ((byes[ids[i]] ?? 0) < 1) return ids[i]
    }
    return null
  }

  function tryPairing(ids: number[], matchesSoFar: SwissPar[]): SwissPar[] | null {
    if (ids.length === 0) return matchesSoFar
    if (ids.length % 2 === 1) {
      const byeKasterid = getByePlayer(ids)
      if (byeKasterid === null) return null
      byes[byeKasterid]++
      matchesSoFar.push({ p1: byeKasterid, p2: null, erWalkover: true })
      const rest = ids.filter(k => k !== byeKasterid)
      const result = tryPairing(rest, matchesSoFar)
      if (result) return result
      byes[byeKasterid]--
      matchesSoFar.pop()
      return null
    }
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p1 = ids[i]
        const p2 = ids[j]
        if (unplayedMatches[p1]?.includes(p2)) {
          matchesSoFar.push({ p1, p2, erWalkover: false })
          const rest = ids.filter(k => k !== p1 && k !== p2)
          const result = tryPairing(rest, matchesSoFar)
          if (result) return result
          matchesSoFar.pop()
        }
      }
    }
    return null
  }

  const pairs = tryPairing(rankedKasterids, [])
  if (!pairs) return null

  pairs.sort((a, b) => (a.erWalkover ? 1 : 0) - (b.erWalkover ? 1 : 0))
  return pairs
}

export async function genererNesteSwissRunde(
  stevneid: number,
): Promise<{ rundeNummer: number; antallKampar: number }> {
  const { data: rawKampar, error } = await supabase
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
    if (!snrToKasterids[rad.startnummer]) snrToKasterids[rad.startnummer] = []
    snrToKasterids[rad.startnummer].push(rad.kasterid)
  }

  type KampRad = {
    runde_nummer: number
    er_walkover: boolean
    spelarar: { kasterid: number | null; kamp_poeng: number | null; score_poeng: number | null }[] | null
  }
  const kampRader = rawKampar as KampRad[]
  const rundeNummer = Math.max(...kampRader.map(k => k.runde_nummer)) + 1
  const alleSnr = Object.keys(snrToKasterids).map(Number)

  const unplayed: Record<number, number[]> = {}
  for (const snr of alleSnr) unplayed[snr] = alleSnr.filter(s => s !== snr)
  for (const kamp of kampRader) {
    if (kamp.er_walkover) continue
    const snrs = [...new Set(
      (kamp.spelarar ?? [])
        .map(s => (s.kasterid != null ? kasteridToSnr[s.kasterid] : undefined))
        .filter((s): s is number => s != null),
    )]
    if (snrs.length === 2) {
      unplayed[snrs[0]] = (unplayed[snrs[0]] ?? []).filter(s => s !== snrs[1])
      unplayed[snrs[1]] = (unplayed[snrs[1]] ?? []).filter(s => s !== snrs[0])
    }
  }

  const byes: Record<number, number> = {}
  for (const snr of alleSnr) byes[snr] = 0
  for (const kamp of kampRader) {
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
  const standing = alleSnr.map(snr => {
    const members = snrToKasterids[snr]
    let kampPoeng = 0
    let scorePoeng = 0
    for (const kamp of kampRader) {
      const sideRows = (kamp.spelarar ?? []).filter(
        (s): s is typeof s & { kasterid: number } => s.kasterid != null && members.includes(s.kasterid),
      )
      if (!sideRows.length) continue
      kampPoeng += sideRows[0].kamp_poeng ?? 0
      for (const s of sideRows) scorePoeng += s.score_poeng ?? 0
    }
    return { kasterid: members[0], kamp_poeng: kampPoeng, score_poeng: scorePoeng, startnummer: snr }
  })

  const ranked = sorterStilling(standing, rawKampar as KampForSortering[])
  const rankedSnr = ranked.map(r => kasteridToSnr[r.kasterid])

  const pairs = buildSwissPairs(rankedSnr, unplayed, byes)
  if (!pairs) throw new Error('Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.')

  const rundekampar = pairs.map((pair, i) => ({
    match_id: genMatchId(),
    stevneid,
    fase: 'innledende',
    runde_nummer: rundeNummer,
    bane_nummer: i + 1,
    er_bekreftet: false,
    er_walkover: pair.erWalkover,
  }))

  const { data: innsettaKampar, error: kampErr } = await supabase
    .from('kamp')
    .insert(rundekampar)
    .select('id, bane_nummer')
  if (kampErr) throw new Error('Feil ved innsetting av ny Swiss-runde: ' + kampErr.message)

  const baneToKampId: Record<number, number> = Object.fromEntries(
    (innsettaKampar as KampMedBane[]).map(k => [k.bane_nummer, k.id]),
  )
  const spelarRader: KampSpelarInsert[] = []

  for (let i = 0; i < pairs.length; i++) {
    const { p1, p2, erWalkover } = pairs[i]
    const kampid = baneToKampId[i + 1]
    _pushSpelarRader(spelarRader, kampid, snrToKasterids[p1] ?? [])
    if (!erWalkover) _pushSpelarRader(spelarRader, kampid, snrToKasterids[p2!] ?? [])
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return { rundeNummer, antallKampar: (innsettaKampar as KampMedBane[]).length }
}
