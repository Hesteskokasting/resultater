import { supabase } from '../supabase.js'

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
