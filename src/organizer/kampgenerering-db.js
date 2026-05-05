import { supabase } from '../supabase.js'
import { beregnCupRundeParingar } from '../utils/kastemetoder-logikk.js'

function genMatchId() {
  return crypto.randomUUID()
}

export async function genererInnledendeKamper(stevneid, kastemetodeNavn, antallRunder) {
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
  const posToKasterid = {}
  const resultatRows = pameldingar.map((p, i) => {
    posToKasterid[i + 1] = p.kasterid
    return { stevneid, kasterid: p.kasterid, startnummer: i + 1 }
  })

  await supabase.from('resultat').delete().eq('stevneid', stevneid)
  const { error: resErr } = await supabase.from('resultat').insert(resultatRows)
  if (resErr) throw new Error('Feil ved lagring av startnummer: ' + resErr.message)

  const erCascade = kastemetodeNavn.toLowerCase().includes('gloppen')
  let antallKampar = 0

  if (erCascade) {
    antallKampar = await _insertCascadeMatches(stevneid, posToKasterid, N, antallRunder)
  } else {
    antallKampar = await _insertSwissRunde1(stevneid, posToKasterid, N)
  }

  return antallKampar
}

async function _insertCascadeMatches(stevneid, posToKasterid, N, antallRunder) {
  const paddedN = N % 2 === 0 ? N : N + 1
  const totalCourts = paddedN / 2
  let totaltKampar = 0

  for (let r = 1; r <= antallRunder; r++) {
    const rundekampar = []
    const kampPairs = []

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

    const baneToKampId = Object.fromEntries(innsettaKampar.map(k => [k.bane_nummer, k.id]))
    const spelarRader = []

    for (let ci = 0; ci < totalCourts; ci++) {
      const bane = ci + 1
      const kampid = baneToKampId[bane]
      const { p1Pos, p2Pos, erWalkover } = kampPairs[ci]

      spelarRader.push({ kampid, kasterid: posToKasterid[p1Pos], posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      if (!erWalkover) spelarRader.push({ kampid, kasterid: posToKasterid[p2Pos], posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    }

    const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
    if (spErr) throw new Error(`Feil ved innsetting av spelarar (runde ${r}): ` + spErr.message)

    totaltKampar += innsettaKampar.length
  }

  return totaltKampar
}

async function _insertSwissRunde1(stevneid, posToKasterid, N) {
  const rundekampar = []
  const kampPairs = []
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

  const baneToKampId = Object.fromEntries(innsettaKampar.map(k => [k.bane_nummer, k.id]))
  const spelarRader = []

  for (let ci = 0; ci < kampPairs.length; ci++) {
    const bane = ci + 1
    const kampid = baneToKampId[bane]
    const { p1Pos, p2Pos, erWalkover } = kampPairs[ci]

    spelarRader.push({ kampid, kasterid: posToKasterid[p1Pos], posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    if (!erWalkover) spelarRader.push({ kampid, kasterid: posToKasterid[p2Pos], posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return innsettaKampar.length
}

export async function genererNesteSwissRunde(stevneid) {
  const { data: kampar, error } = await supabase
    .from('kamp')
    .select(`
      id, runde_nummer, er_bekreftet, er_walkover,
      spelarar:kamp_spelar(id, kasterid, kamp_poeng, score_poeng, posisjon)
    `)
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .order('runde_nummer')

  if (error) throw new Error('Feil ved henting av kampar: ' + error.message)

  const rundeNummer = Math.max(...kampar.map(k => k.runde_nummer)) + 1

  // Samle alle reelle kasterids
  const alleKasterids = new Set()
  for (const kamp of kampar) {
    for (const sp of kamp.spelarar ?? []) {
      if (sp.kasterid) alleKasterids.add(sp.kasterid)
    }
  }
  const kasteridListe = [...alleKasterids]

  // Bygg unplayedMatches — start med alle moglege par, trekk frå spelapar
  const unplayedMatches = {}
  for (const kid of kasteridListe) {
    unplayedMatches[kid] = kasteridListe.filter(k => k !== kid)
  }
  for (const kamp of kampar) {
    const sp = (kamp.spelarar ?? []).filter(s => s.kasterid)
    if (sp.length === 2) {
      const [a, b] = [sp[0].kasterid, sp[1].kasterid]
      unplayedMatches[a] = unplayedMatches[a].filter(k => k !== b)
      unplayedMatches[b] = unplayedMatches[b].filter(k => k !== a)
    }
  }

  // Bygg playerStats frå bekrefte kampar
  const statsMap = {}
  for (const kid of kasteridListe) statsMap[kid] = { kasterid: kid, kampPoeng: 0, scorePoeng: 0 }
  for (const kamp of kampar) {
    if (!kamp.er_bekreftet) continue
    for (const sp of kamp.spelarar ?? []) {
      if (!sp.kasterid) continue
      statsMap[sp.kasterid].kampPoeng += sp.kamp_poeng ?? 0
      statsMap[sp.kasterid].scorePoeng += sp.score_poeng ?? 0
    }
  }

  // Bygg byes — tel walkovers (er_walkover + posisjon 1) per kasterid
  const byes = {}
  for (const kid of kasteridListe) byes[kid] = 0
  for (const kamp of kampar) {
    if (!kamp.er_walkover) continue
    const p1 = (kamp.spelarar ?? []).find(s => s.posisjon === 1)
    if (p1?.kasterid) byes[p1.kasterid] = (byes[p1.kasterid] ?? 0) + 1
  }

  // Sorter stats: høgast poeng fyrst
  let playerStats = Object.values(statsMap).sort(
    (a, b) => b.kampPoeng - a.kampPoeng || b.scorePoeng - a.scorePoeng || a.kasterid - b.kasterid
  )

  function getByeCandidate(stats) {
    const eligible = stats.filter(p => (byes[p.kasterid] ?? 0) < 1)
    if (!eligible.length) return null
    return [...eligible].sort((a, b) => a.kampPoeng - b.kampPoeng || a.scorePoeng - b.scorePoeng)[0]
  }

  function tryPairing(stats, matchesSoFar) {
    if (stats.length === 0) return matchesSoFar
    if (stats.length % 2 === 1) {
      const byePlayer = getByeCandidate(stats)
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

  const baneToKampId = Object.fromEntries(innsettaKampar.map(k => [k.bane_nummer, k.id]))
  const spelarRader = []

  for (let i = 0; i < pairs.length; i++) {
    const { p1, p2, erWalkover } = pairs[i]
    const kampid = baneToKampId[i + 1]
    spelarRader.push({ kampid, kasterid: p1, posisjon: 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    if (!erWalkover) spelarRader.push({ kampid, kasterid: p2, posisjon: 2, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av Swiss spelarar: ' + spErr.message)

  return { rundeNummer, antallKampar: innsettaKampar.length }
}

// --- CUP avsluttende ---

async function _insertCupParingar(stevneid, paringar, rundeNummer, gruppeNavn) {
  const rundekampar = paringar.map((p, i) => ({
    match_id: genMatchId(),
    stevneid,
    fase: 'avsluttende',
    runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn ?? null,
    bane_nummer: i + 1,
    er_bekreftet: false,
    er_walkover: p.erWalkover,
    er_tre_spelarar: p.erTreSpelarar,
  }))

  const { data: innsettaKampar, error: kampErr } = await supabase
    .from('kamp').insert(rundekampar).select('id, bane_nummer')
  if (kampErr) throw new Error('Feil ved innsetting av cup-kampar: ' + kampErr.message)

  const spelarRader = []
  const baneMap = Object.fromEntries(innsettaKampar.map(k => [k.bane_nummer, k.id]))

  for (let i = 0; i < paringar.length; i++) {
    const kampid = baneMap[i + 1]
    paringar[i].spelarar.forEach((kasterid, pos) => {
      spelarRader.push({ kampid, kasterid, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av cup-spelarar: ' + spErr.message)

  return innsettaKampar.length
}

// Hent aktive cup-spelarar (ikkje eliminerte) per gruppe
async function _hentAktiveCupSpelarar(stevneid) {
  const { data: resultat } = await supabase
    .from('resultat')
    .select('kasterid, gruppeid, gruppe:gruppeid(navn), plassering, kamp_poeng_innl, score_poeng_innl, startnummer')
    .eq('stevneid', stevneid)
    .is('runde_eliminert', null)

  return resultat ?? []
}

// Generer runde 1 av cup avsluttende fase
// grupper: [{gruppeNavn: 'A'|'B'|null, spelarar: [{kasterid, plassering}]}]
export async function genererCupRunde1(stevneid, grupper, medSeeding) {
  let totalKampar = 0
  for (const gr of grupper) {
    const paringar = beregnCupRundeParingar(gr.spelarar, { medSeeding, isRunde1: true })
    totalKampar += await _insertCupParingar(stevneid, paringar, 1, gr.gruppeNavn)
  }
  return totalKampar
}

// Generer neste cup-runde basert på aktive spelarar (ikkje eliminerte)
export async function genererNesteCupRunde(stevneid, medSeeding) {
  const { data: kampar } = await supabase
    .from('kamp')
    .select('runde_nummer, gruppe_navn')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .order('runde_nummer', { ascending: false })
    .limit(1)

  const sisteRunde = kampar?.[0]?.runde_nummer ?? 0
  const rundeNummer = sisteRunde + 1

  const aktive = await _hentAktiveCupSpelarar(stevneid)

  // Grupper aktive spelarar per gruppe, sorter etter innledande rangering
  const gruppeMap = {}
  for (const sp of aktive) {
    const gNavn = sp.gruppe?.navn ?? null
    if (!gruppeMap[gNavn]) gruppeMap[gNavn] = []
    gruppeMap[gNavn].push(sp)
  }

  for (const [gNavn, spListe] of Object.entries(gruppeMap)) {
    spListe.sort((a, b) =>
      (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
      (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0) ||
      (a.startnummer ?? 0) - (b.startnummer ?? 0)
    )
    gruppeMap[gNavn] = spListe.map((sp, i) => ({ kasterid: sp.kasterid, plassering: i + 1 }))
  }

  let totalKampar = 0
  let baneOffset = 0

  // Sjekk om det er 4 aktive totalt (= semfinale)
  const totalAktive = aktive.length
  const erSemfinale = totalAktive === 4

  for (const [gNavn, spelGruppe] of Object.entries(gruppeMap)) {
    let paringar
    paringar = beregnCupRundeParingar(spelGruppe, { medSeeding, isRunde1: false })

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

    const spelarRader = []
    const baneMap = Object.fromEntries(innsettaKampar.map(k => [k.bane_nummer, k.id]))
    for (let i = 0; i < paringar.length; i++) {
      const kampid = baneMap[baneOffset + i + 1]
      paringar[i].spelarar.forEach((kasterid, pos) => {
        spelarRader.push({ kampid, kasterid, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      })
    }
    const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
    if (spErr) throw new Error('Feil: ' + spErr.message)

    totalKampar += innsettaKampar.length
    baneOffset += paringar.length
  }

  return { rundeNummer, antallKampar: totalKampar, erSemfinale }
}

// Generer finale og bronsefinale etter at semifinalar er bekrefta
// Vinnarar av semfinale → Finale, taparar → Bronsefinale
export async function genererFinaleOgBronsefinale(stevneid) {
  const { data: semikampar } = await supabase
    .from('kamp')
    .select(`
      id, runde_nummer,
      spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon,
        omgangar:kamp_omgang(score))
    `)
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .eq('runde_navn', 'Semifinale')
    .eq('er_bekreftet', true)

  if (!semikampar?.length) throw new Error('Semifinalane er ikkje bekrefta.')

  const rundeNummer = semikampar[0].runde_nummer + 1
  const vinnarar = []
  const taparar = []

  for (const kamp of semikampar) {
    const sp = kamp.spelarar ?? []
    const sorted = [...sp].sort((a, b) => {
      const sA = a.omgangar?.reduce((s, o) => s + (o.score ?? 0), 0) ?? a.score_poeng ?? 0
      const sB = b.omgangar?.reduce((s, o) => s + (o.score ?? 0), 0) ?? b.score_poeng ?? 0
      return sB - sA
    })
    if (sorted[0]) vinnarar.push(sorted[0].kasterid)
    if (sorted[1]) taparar.push(sorted[1].kasterid)
  }

  const finale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    bane_nummer: 1, runde_navn: 'Finale', er_bekreftet: false,
    er_walkover: false, er_tre_spelarar: false,
  }
  const bronsefinale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    bane_nummer: 2, runde_navn: 'Bronsefinale', er_bekreftet: false,
    er_walkover: false, er_tre_spelarar: false,
  }

  const { data: kampar, error } = await supabase
    .from('kamp').insert([finale, bronsefinale]).select('id, bane_nummer')
  if (error) throw new Error('Feil: ' + error.message)

  const finaleId = kampar.find(k => k.bane_nummer === 1)?.id
  const bronseId = kampar.find(k => k.bane_nummer === 2)?.id

  const spelarRader = [
    ...vinnarar.map((kid, i) => ({ kampid: finaleId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
    ...taparar.map((kid, i) => ({ kampid: bronseId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
  ]
  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil: ' + spErr.message)

  // Sett plassering for semfinale-taparar (3.–4. plass inntil finale er spela)
  for (const kid of taparar) {
    await supabase.from('resultat')
      .update({ runde_eliminert: semikampar[0].runde_nummer, plassering: 3 })
      .eq('stevneid', stevneid).eq('kasterid', kid)
  }
}
