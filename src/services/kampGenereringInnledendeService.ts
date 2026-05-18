import { supabase } from '../supabase'
import { sorterStilling, type KampForSortering } from '../organizer/org-shared'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface KampPar { p1Pos: number; p2Pos: number | null; erWalkover: boolean }
interface KampMedBane { id: number; bane_nummer: number | null }
interface KampSpelarInsert { kampid: number; kasterid: number; posisjon: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }

export async function genererInnledendeKamper(
  stevneid: number,
  kastemetodeNavn: string,
  antallRunder: number,
): Promise<number> {
  const { data: pameldingar, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, kaster(klubbid)')
    .eq('stevneid', stevneid)
    .order('id')

  if (error) throw new Error('Feil ved henting av påmelding: ' + error.message)
  if (!pameldingar?.length) throw new Error('Ingen spelarar påmelde.')

  for (let i = pameldingar.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pameldingar[i], pameldingar[j]] = [pameldingar[j], pameldingar[i]]
  }

  const N = pameldingar.length
  const posToKasterid: Record<number, number> = {}
  const resultatRows = pameldingar.map((p, i) => {
    posToKasterid[i + 1] = p.kasterid
    const klubbid = (p.kaster as { klubbid: number | null } | null)?.klubbid ?? null
    return { stevneid, kasterid: p.kasterid, klubbid, startnummer: i + 1 }
  })

  await supabase.from('resultat').delete().eq('stevneid', stevneid)
  const { error: resErr } = await supabase.from('resultat').insert(resultatRows)
  if (resErr) throw new Error('Feil ved lagring av startnummer: ' + resErr.message)

  const erCascade = kastemetodeNavn.toLowerCase().includes('gloppen')

  if (erCascade) {
    return _insertCascadeMatches(stevneid, posToKasterid, N, antallRunder)
  } else {
    return _insertSwissRunde1(stevneid, posToKasterid, N)
  }
}

async function _insertCascadeMatches(
  stevneid: number,
  posToKasterid: Record<number, number>,
  N: number,
  antallRunder: number,
): Promise<number> {
  const paddedN = N % 2 === 0 ? N : N + 1
  const totalCourts = paddedN / 2
  let totaltKampar = 0

  for (let r = 1; r <= antallRunder; r++) {
    const rundekampar = []
    const kampPairs: KampPar[] = []

    for (let c = 1; c <= totalCourts; c++) {
      const p1Pos = ((c - 1 + r - 1) % totalCourts) + 1
      const p2Pos = ((c - 1 + 2 * (r - 1)) % totalCourts) + 1 + totalCourts
      const erWalkover = p2Pos > N

      rundekampar.push({
        match_id: genMatchId(),
        stevneid,
        fase: 'innledende',
        runde_nummer: r,
        bane_nummer: c,
        er_bekreftet: false,
        er_walkover: erWalkover,
      })
      kampPairs.push({ p1Pos, p2Pos, erWalkover })
    }

    const { data: innsettaKampar, error: kampErr } = await supabase
      .from('kamp')
      .insert(rundekampar)
      .select('id, bane_nummer')
    if (kampErr) throw new Error(`Feil ved innsetting av kampar (runde ${r}): ` + kampErr.message)

    const baneToKampId: Record<number, number> = Object.fromEntries(
      (innsettaKampar as KampMedBane[]).map(k => [k.bane_nummer, k.id]),
    )
    const spelarRader: KampSpelarInsert[] = []

    for (let ci = 0; ci < totalCourts; ci++) {
      const bane = ci + 1
      const kampid = baneToKampId[bane]
      const { p1Pos, p2Pos, erWalkover } = kampPairs[ci]

      spelarRader.push({ kampid, kasterid: posToKasterid[p1Pos], posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      if (!erWalkover) spelarRader.push({ kampid, kasterid: posToKasterid[p2Pos!], posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    }

    const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
    if (spErr) throw new Error(`Feil ved innsetting av spelarar (runde ${r}): ` + spErr.message)

    totaltKampar += (innsettaKampar as KampMedBane[]).length
  }

  return totaltKampar
}

async function _insertSwissRunde1(
  stevneid: number,
  posToKasterid: Record<number, number>,
  N: number,
): Promise<number> {
  const rundekampar = []
  const kampPairs: KampPar[] = []
  let court = 1

  for (let i = 1; i <= N; i += 2) {
    const erWalkover = i + 1 > N
    rundekampar.push({
      match_id: genMatchId(),
      stevneid,
      fase: 'innledende',
      runde_nummer: 1,
      bane_nummer: court,
      er_bekreftet: false,
      er_walkover: erWalkover,
    })
    kampPairs.push({ p1Pos: i, p2Pos: erWalkover ? null : i + 1, erWalkover })
    court++
  }

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
    const bane = ci + 1
    const kampid = baneToKampId[bane]
    const { p1Pos, p2Pos, erWalkover } = kampPairs[ci]

    spelarRader.push({ kampid, kasterid: posToKasterid[p1Pos], posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    if (!erWalkover) spelarRader.push({ kampid, kasterid: posToKasterid[p2Pos!], posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return (innsettaKampar as KampMedBane[]).length
}

export async function genererNesteSwissRunde(
  stevneid: number,
): Promise<{ rundeNummer: number; antallKampar: number }> {
  const { data: rawKampar, error } = await supabase
    .from('kamp')
    .select('id, runde_nummer, er_bekreftet, er_walkover, spelarar:kamp_spelar(kasterid, kamp_poeng, score_poeng, posisjon)')
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .order('runde_nummer')

  if (error) throw new Error('Feil ved henting av kampar: ' + error.message)

  const kampar = rawKampar as KampForSortering[]
  const rundeNummer = Math.max(...(rawKampar as { runde_nummer: number }[]).map(k => k.runde_nummer)) + 1

  const alleKasterids = new Set<number>()
  for (const kamp of kampar) {
    for (const sp of kamp.spelarar ?? []) {
      if (sp.kasterid != null) alleKasterids.add(sp.kasterid)
    }
  }
  const kasteridListe = [...alleKasterids]

  const unplayedMatches: Record<number, number[]> = {}
  for (const kid of kasteridListe) {
    unplayedMatches[kid] = kasteridListe.filter(k => k !== kid)
  }
  for (const kamp of kampar) {
    const sp = (kamp.spelarar ?? []).filter(s => s.kasterid != null)
    if (sp.length === 2) {
      const a = sp[0].kasterid as number
      const b = sp[1].kasterid as number
      unplayedMatches[a] = unplayedMatches[a].filter(k => k !== b)
      unplayedMatches[b] = unplayedMatches[b].filter(k => k !== a)
    }
  }

  const byes: Record<number, number> = {}
  for (const kid of kasteridListe) byes[kid] = 0
  for (const kamp of (rawKampar as { er_walkover: boolean; spelarar: { kasterid: number | null; posisjon: number | null }[] | null }[])) {
    if (!kamp.er_walkover) continue
    const p1 = (kamp.spelarar ?? []).find(s => s.posisjon === 1)
    if (p1?.kasterid != null) byes[p1.kasterid] = (byes[p1.kasterid] ?? 0) + 1
  }

  const spelarar = kasteridListe.map(kid => {
    let kamp_poeng = 0, score_poeng = 0
    for (const kamp of kampar) {
      const sp = (kamp.spelarar ?? []).find(s => s.kasterid === kid)
      if (sp) {
        kamp_poeng += sp.kamp_poeng ?? 0
        score_poeng += 0 // score_poeng not in KampForSortering — accumulated separately
      }
    }
    // Hent score_poeng frå rådata
    for (const k of (rawKampar as { spelarar: { kasterid: number | null; score_poeng: number | null }[] | null }[])) {
      const sp = (k.spelarar ?? []).find(s => s.kasterid === kid)
      if (sp) score_poeng += sp.score_poeng ?? 0
    }
    return { kasterid: kid, kamp_poeng, score_poeng }
  })

  const playerStats = sorterStilling(spelarar, kampar)

  interface SwissPar { p1: number; p2: number | null; erWalkover: boolean }

  function getByePlayer(stats: typeof playerStats): typeof playerStats[0] | null {
    for (let i = stats.length - 1; i >= 0; i--) {
      if ((byes[stats[i].kasterid] ?? 0) < 1) return stats[i]
    }
    return null
  }

  function tryPairing(stats: typeof playerStats, matchesSoFar: SwissPar[]): SwissPar[] | null {
    if (stats.length === 0) return matchesSoFar
    if (stats.length % 2 === 1) {
      const byePlayer = getByePlayer(stats)
      if (!byePlayer) return null
      byes[byePlayer.kasterid]++
      matchesSoFar.push({ p1: byePlayer.kasterid, p2: null, erWalkover: true })
      const rest = stats.filter(p => p.kasterid !== byePlayer.kasterid)
      const result = tryPairing(rest, matchesSoFar)
      if (result) return result
      byes[byePlayer.kasterid]--
      matchesSoFar.pop()
      return null
    }
    for (let i = 0; i < stats.length; i++) {
      const p1 = stats[i]
      for (let j = i + 1; j < stats.length; j++) {
        const p2 = stats[j]
        if (unplayedMatches[p1.kasterid]?.includes(p2.kasterid)) {
          matchesSoFar.push({ p1: p1.kasterid, p2: p2.kasterid, erWalkover: false })
          const rest = stats.filter(p => p.kasterid !== p1.kasterid && p.kasterid !== p2.kasterid)
          const result = tryPairing(rest, matchesSoFar)
          if (result) return result
          matchesSoFar.pop()
        }
      }
    }
    return null
  }

  const pairs = tryPairing(playerStats, [])
  if (!pairs) throw new Error('Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.')

  pairs.sort((a, b) => (a.erWalkover ? 1 : 0) - (b.erWalkover ? 1 : 0))

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
    spelarRader.push({ kampid, kasterid: p1, posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    if (!erWalkover) spelarRader.push({ kampid, kasterid: p2!, posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return { rundeNummer, antallKampar: (innsettaKampar as KampMedBane[]).length }
}
