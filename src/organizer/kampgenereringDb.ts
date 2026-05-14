import { supabase } from '../supabase.js'
import { beregnCupRundeParingar } from '../utils/kastemetoder-logikk.js'
import { sorterStilling, type KampForSortering } from './org-shared.js'
import type { RundeOppsett } from '../types'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface KampPar { p1Pos: number; p2Pos: number | null; erWalkover: boolean }
interface KampMedBane { id: number; bane_nummer: number | null }
interface KampMedMatchId { id: number; match_id: string }
interface KampSpelarInsert { kampid: number; kasterid: number; posisjon: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }

interface GruppeForCup {
  gruppeNavn: string | null
  spelarar: { kasterid: number; plassering: number }[]
  runde1Oppsett?: RundeOppsett | null
}

interface Runde1Format {
  [gruppeNavn: string]: RundeOppsett | undefined
}

interface AktivCupSpelar {
  kasterid: number
  gruppeid: number | null
  gruppe: { navn: string } | null
  plassering: number | null
  kamp_poeng_innl: number | null
  score_poeng_innl: number | null
  startnummer: number | null
}

export async function genererInnledendeKamper(
  stevneid: number,
  kastemetodeNavn: string,
  antallRunder: number,
): Promise<number> {
  const { data: pameldingar, error } = await supabase
    .from('pamelding')
    .select('id, kasterid')
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
    return { stevneid, kasterid: p.kasterid, startnummer: i + 1 }
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

// --- CUP avsluttende ---

async function _insertCupParingar(
  stevneid: number,
  paringar: ReturnType<typeof beregnCupRundeParingar>,
  rundeNummer: number,
  gruppeNavn: string | null,
  baneStart = 0,
  rundeNavn: string | null = null,
): Promise<number> {
  const matchIds = paringar.map(() => genMatchId())
  let baneNr = baneStart
  const rundekampar = paringar.map((p, i) => ({
    match_id: matchIds[i],
    stevneid,
    fase: 'avsluttende',
    runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn ?? null,
    bane_nummer: p.erWalkover ? null : ++baneNr,
    er_bekreftet: false,
    er_walkover: p.erWalkover,
    er_tre_spelarar: p.erTreSpelarar,
    runde_navn: rundeNavn,
  }))

  const { data: innsettaKampar, error: kampErr } = await supabase
    .from('kamp').insert(rundekampar).select('id, match_id')
  if (kampErr) throw new Error('Feil ved innsetting av cup-kampar: ' + kampErr.message)

  const matchIdMap: Record<string, number> = Object.fromEntries(
    (innsettaKampar as KampMedMatchId[]).map(k => [k.match_id, k.id]),
  )
  const spelarRader: KampSpelarInsert[] = []

  for (let i = 0; i < paringar.length; i++) {
    const kampid = matchIdMap[matchIds[i]]
    paringar[i].spelarar.forEach((kasterid, pos) => {
      spelarRader.push({ kampid, kasterid: kasterid as number, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av cup-spelarar: ' + spErr.message)

  return (innsettaKampar as KampMedMatchId[]).length
}

async function _hentAktiveCupSpelarar(stevneid: number): Promise<AktivCupSpelar[]> {
  const { data: resultat } = await supabase
    .from('resultat')
    .select('kasterid, gruppeid, gruppe:gruppeid(navn), plassering, kamp_poeng_innl, score_poeng_innl, startnummer')
    .eq('stevneid', stevneid)
    .is('runde_eliminert', null)

  return (resultat ?? []) as AktivCupSpelar[]
}

export async function genererCupRunde1(
  stevneid: number,
  grupper: GruppeForCup[],
  medSeeding: boolean,
  runde1Format: Runde1Format | null = null,
): Promise<number> {
  const gruppeOrder = ['A', 'B', 'C']
  let totalKampar = 0

  for (const gr of grupper) {
    const paringar = beregnCupRundeParingar(gr.spelarar, { medSeeding, isRunde1: true, runde1Oppsett: gr.runde1Oppsett ?? null })
    const { data: maxBane } = await supabase.from('kamp')
      .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
      .eq('runde_nummer', 1).not('bane_nummer', 'is', null)
      .order('bane_nummer', { ascending: false }).limit(1)
    const dbMaxBane = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

    let formatBaneOffset = 0
    if (runde1Format && gr.gruppeNavn) {
      const myIdx = gruppeOrder.indexOf(gr.gruppeNavn)
      for (let i = 0; i < myIdx; i++) {
        const prev = runde1Format[gruppeOrder[i]]
        if (prev) formatBaneOffset += (prev.c3 ?? 0) + (prev.c2 ?? 0)
      }
    }

    const baneStart = Math.max(dbMaxBane, formatBaneOffset)
    const erSemfinale = gr.spelarar.length === 4
    totalKampar += await _insertCupParingar(stevneid, paringar, 1, gr.gruppeNavn, baneStart, erSemfinale ? 'Semifinale' : null)
  }
  return totalKampar
}

export async function genererNesteCupRunde(
  stevneid: number,
  medSeeding: boolean,
): Promise<{ rundeNummer: number; antallKampar: number; erSemfinale: boolean }> {
  const { data: kampar } = await supabase
    .from('kamp')
    .select('runde_nummer, gruppe_navn')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .order('runde_nummer', { ascending: false })
    .limit(1)

  const sisteRunde = (kampar as { runde_nummer: number }[] | null)?.[0]?.runde_nummer ?? 0
  const rundeNummer = sisteRunde + 1

  const aktive = await _hentAktiveCupSpelarar(stevneid)

  const gruppeMap: Record<string, AktivCupSpelar[]> = {}
  for (const sp of aktive) {
    const gNavn = sp.gruppe?.navn ?? 'null'
    if (!gruppeMap[gNavn]) gruppeMap[gNavn] = []
    gruppeMap[gNavn].push(sp)
  }

  const totalAktive = aktive.length
  const erSemfinale = totalAktive === 4
  let totalKampar = 0
  let baneOffset = 0

  for (const [gNavn, spListe] of Object.entries(gruppeMap)) {
    spListe.sort((a, b) =>
      (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
      (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0) ||
      (a.startnummer ?? 0) - (b.startnummer ?? 0)
    )
    const spelGruppe = spListe.map((sp, i) => ({ kasterid: sp.kasterid, plassering: i + 1 }))
    const paringar = beregnCupRundeParingar(spelGruppe, { medSeeding, isRunde1: false })

    const rundekampar = paringar.map((p, i) => ({
      match_id: genMatchId(),
      stevneid,
      fase: 'avsluttende',
      runde_nummer: rundeNummer,
      gruppe_navn: gNavn !== 'null' ? gNavn : null,
      bane_nummer: baneOffset + i + 1,
      er_bekreftet: false,
      er_walkover: p.erWalkover,
      er_tre_spelarar: p.erTreSpelarar,
      runde_navn: erSemfinale ? 'Semifinale' : null,
    }))

    const { data: innsettaKampar, error: kampErr } = await supabase
      .from('kamp').insert(rundekampar).select('id, bane_nummer')
    if (kampErr) throw new Error('Feil: ' + kampErr.message)

    const spelarRader: KampSpelarInsert[] = []
    const baneMap: Record<number, number> = Object.fromEntries(
      (innsettaKampar as KampMedBane[]).map(k => [k.bane_nummer, k.id]),
    )
    for (let i = 0; i < paringar.length; i++) {
      const kampid = baneMap[baneOffset + i + 1]
      paringar[i].spelarar.forEach((kasterid, pos) => {
        spelarRader.push({ kampid, kasterid: kasterid as number, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      })
    }
    const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
    if (spErr) throw new Error('Feil: ' + spErr.message)

    totalKampar += (innsettaKampar as KampMedBane[]).length
    baneOffset += paringar.length
  }

  return { rundeNummer, antallKampar: totalKampar, erSemfinale }
}

export async function genererNesteCupRundeForGruppe(
  stevneid: number,
  gruppeNavn: string,
  medSeeding: boolean,
): Promise<{ rundeNummer: number; antallKampar: number }> {
  const { data: kampar } = await supabase.from('kamp')
    .select('runde_nummer')
    .eq('stevneid', stevneid).eq('fase', 'avsluttende').eq('gruppe_navn', gruppeNavn)
    .order('runde_nummer', { ascending: false }).limit(1)
  const rundeNummer = ((kampar as { runde_nummer: number }[] | null)?.[0]?.runde_nummer ?? 0) + 1

  const aktive = (await _hentAktiveCupSpelarar(stevneid))
    .filter(sp => sp.gruppe?.navn === gruppeNavn)
  aktive.sort((a, b) =>
    (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
    (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0) ||
    (a.startnummer ?? 0) - (b.startnummer ?? 0)
  )
  const spelarar = aktive.map((sp, i) => ({ kasterid: sp.kasterid, plassering: i + 1 }))
  const erSemfinale = spelarar.length === 4
  const paringar = beregnCupRundeParingar(spelarar, { medSeeding, isRunde1: false })

  const { data: maxBane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', rundeNummer).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  const baneStart = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

  const matchIds = paringar.map(() => genMatchId())
  let baneNr = baneStart
  const rundekampar = paringar.map((p, i) => ({
    match_id: matchIds[i], stevneid, fase: 'avsluttende',
    runde_nummer: rundeNummer, gruppe_navn: gruppeNavn,
    bane_nummer: p.erWalkover ? null : ++baneNr, er_bekreftet: false,
    er_walkover: p.erWalkover, er_tre_spelarar: p.erTreSpelarar,
    runde_navn: erSemfinale ? 'Semifinale' : null,
  }))

  const { data: innsetta, error } = await supabase.from('kamp')
    .insert(rundekampar).select('id, match_id')
  if (error) throw new Error('Feil: ' + error.message)

  const matchIdMap: Record<string, number> = Object.fromEntries(
    (innsetta as KampMedMatchId[]).map(k => [k.match_id, k.id]),
  )
  const spelarRader: KampSpelarInsert[] = []
  for (let i = 0; i < paringar.length; i++) {
    const kampid = matchIdMap[matchIds[i]]
    paringar[i].spelarar.forEach((kasterid, pos) => {
      spelarRader.push({ kampid, kasterid: kasterid as number, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    })
  }
  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil: ' + spErr.message)

  return { rundeNummer, antallKampar: (innsetta as KampMedMatchId[]).length }
}

export async function genererFinaleOgBronsefinale(
  stevneid: number,
  gruppeNavn: string,
): Promise<void> {
  interface SemiSpelar {
    id: number
    kasterid: number | null
    score_poeng: number
    posisjon: number | null
    omgangar: { score: number | null }[] | null
  }
  interface SemiKamp {
    id: number
    runde_nummer: number
    spelarar: SemiSpelar[] | null
  }

  const { data: semikampar } = await supabase
    .from('kamp')
    .select('id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon, omgangar:kamp_omgang(score))')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .eq('gruppe_navn', gruppeNavn)
    .eq('runde_navn', 'Semifinale')
    .eq('er_bekreftet', true)

  if (!semikampar?.length) throw new Error('Semifinalane er ikkje bekrefta.')

  const typedSemi = semikampar as SemiKamp[]
  const rundeNummer = typedSemi[0].runde_nummer + 1
  const vinnarar: (number | null)[] = []
  const taparar: (number | null)[] = []

  for (const kamp of typedSemi) {
    const sp = kamp.spelarar ?? []
    const sorted = [...sp].sort((a, b) => {
      const sA = a.omgangar?.length ? a.omgangar.reduce((s, o) => s + (o.score ?? 0), 0) : (a.score_poeng ?? 0)
      const sB = b.omgangar?.length ? b.omgangar.reduce((s, o) => s + (o.score ?? 0), 0) : (b.score_poeng ?? 0)
      return sB - sA
    })
    if (sorted[0]) vinnarar.push(sorted[0].kasterid)
    if (sorted[1]) taparar.push(sorted[1].kasterid)
  }

  const { data: maxBane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', rundeNummer).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  const baneStart = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

  const finale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn, bane_nummer: baneStart + 1, runde_navn: 'Finale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }
  const bronsefinale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn, bane_nummer: baneStart + 2, runde_navn: 'Bronsefinale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }

  const { data: kampar, error } = await supabase
    .from('kamp').insert([finale, bronsefinale]).select('id, runde_navn')
  if (error) throw new Error('Feil: ' + error.message)

  const typedKampar = kampar as { id: number; runde_navn: string | null }[]
  const finaleId = typedKampar.find(k => k.runde_navn === 'Finale')!.id
  const bronseId = typedKampar.find(k => k.runde_navn === 'Bronsefinale')!.id

  const spelarRader: KampSpelarInsert[] = [
    ...vinnarar.filter((k): k is number => k != null).map((kid, i) => ({ kampid: finaleId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
    ...taparar.filter((k): k is number => k != null).map((kid, i) => ({ kampid: bronseId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
  ]
  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil: ' + spErr.message)

  for (const kid of taparar) {
    if (kid == null) continue
    await supabase.from('resultat')
      .update({ runde_eliminert: typedSemi[0].runde_nummer, plassering: 3 })
      .eq('stevneid', stevneid).eq('kasterid', kid)
  }
}
