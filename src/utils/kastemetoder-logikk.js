// Cup avsluttende kastemetode — ren logikk (ingen DB-kall)

// --- Interne hjelpar ---

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Kan m spelarar nå nøyaktig 2 finalistar med reine rundar (berre 3-spelar ELLER berre 2-spelar)?
// Kjelde: cup-logikk_referanse.js canReachTwo
function kanNa2(n) {
  if (n === 2 || n === 4) return true
  if (n < 2) return false
  if (n % 3 === 0) return kanNa2(Math.floor(n / 3) * 2)
  if (n % 2 === 0) return kanNa2(n / 2)
  return false
}

// Finn beste splitting av n spelarar: fortrekk reine 3-spelar rundar, så 2-spelar
function bestSplit(n) {
  if (n % 3 === 0) return { c3: n / 3, c2: 0 }
  if (n % 2 === 0) return { c3: 0, c2: n / 2 }
  return { c3: 0, c2: 0 } // skal ikkje skje for gyldige gruppestr.
}

// --- Eksporterte funksjonar ---

// Er n ein gyldig gruppestr. for Cup?
// Runde 1: floor(n/3) baner + n%3 walkover → advance = floor(n/3)*2 + n%3
// Advance-antal må kunne nå 2 utan fleire walkover
export function erGyldigGruppeStorrelse(n) {
  if (n < 2) return false
  const advance = Math.floor(n / 3) * 2 + (n % 3)
  return kanNa2(advance)
}

// Returnerer alle gyldige {nA, nB} split for n spelarar
// nA: 50–80 % av n, nB = n - nA, begge gyldige gruppestr.
export function beregnGyldigeGruppeStorrelsar(n) {
  const minA = Math.ceil(n * 0.5)
  const maxA = Math.floor(n * 0.8)
  const splits = []
  for (let nA = maxA; nA >= minA; nA--) {
    const nB = n - nA
    if (nB >= 2 && erGyldigGruppeStorrelse(nA) && erGyldigGruppeStorrelse(nB)) {
      splits.push({ nA, nB })
    }
  }
  return splits
}

// Berekn cup-struktur (for preview av sluttspillstruktur)
// Returnerer [{runde, spelarar, baner, treSpelarar, walkovers, vidare}]
export function beregnCupStruktur(n) {
  const rundar = []
  let gjenstaar = n
  let rundeNr = 1
  let erRunde1 = true

  while (gjenstaar > 2) {
    let c3, c2, walkovers
    if (erRunde1) {
      c3 = Math.floor(gjenstaar / 3)
      walkovers = gjenstaar % 3
      c2 = 0
      erRunde1 = false
    } else {
      const s = bestSplit(gjenstaar)
      c3 = s.c3; c2 = s.c2; walkovers = 0
    }
    const vidare = c3 * 2 + c2 + walkovers
    rundar.push({ runde: rundeNr, spelarar: gjenstaar, baner: c3 + c2, treSpelarar: c3 > 0, walkovers, vidare })
    gjenstaar = vidare
    rundeNr++
  }
  return rundar
}

// Generer paringar for runde 1 (walkover tillate) eller seinare rundar (ingen walkover)
// spelarar: [{kasterid, plassering}] sortert etter plassering (beste fyrst)
// medSeeding: fordel spelarar i seed-puljar
// isRunde1: walkover tillate for topp-rangerte spelarar
export function beregnCupRundeParingar(spelarar, { medSeeding = true, isRunde1 = false } = {}) {
  const paringar = []
  let aktive = [...spelarar]

  // Walkover: berre i runde 1
  if (isRunde1 && aktive.length % 3 !== 0) {
    const wCount = aktive.length % 3
    const walkoverSpel = aktive.slice(0, wCount) // beste rangerte
    aktive = aktive.slice(wCount)
    for (const sp of walkoverSpel) {
      paringar.push({ spelarar: [sp.kasterid], erWalkover: true, erTreSpelarar: false })
    }
  }

  const n = aktive.length
  const { c3, c2 } = isRunde1
    ? { c3: Math.floor(n / 3), c2: 0 }
    : bestSplit(n)
  const totalBaner = c3 + c2

  if (medSeeding && totalBaner > 0) {
    // Pulje 1 (beste totalBaner): 1 spelar til kvar bane
    // Pulje 2 (neste totalBaner): 1 spelar til kvar bane
    // Pulje 3 (resterande c3): 1 spelar til kvar 3-spelar bane
    const p1 = shuffle(aktive.slice(0, totalBaner))
    const p2 = shuffle(aktive.slice(totalBaner, 2 * totalBaner))
    const p3 = shuffle(aktive.slice(2 * totalBaner)) // lengd = c3
    let p3idx = 0
    for (let bane = 0; bane < totalBaner; bane++) {
      const erTre = bane < c3
      const baneSpelarar = [p1[bane], p2[bane]]
      if (erTre && p3[p3idx]) baneSpelarar.push(p3[p3idx++])
      paringar.push({
        spelarar: baneSpelarar.map(s => s.kasterid),
        erWalkover: false,
        erTreSpelarar: erTre,
      })
    }
  } else {
    // Ingen seeding: tilfeldig
    const shuffled = shuffle(aktive)
    let idx = 0
    for (let i = 0; i < c3; i++) {
      paringar.push({
        spelarar: shuffled.slice(idx, idx + 3).map(s => s.kasterid),
        erWalkover: false, erTreSpelarar: true,
      })
      idx += 3
    }
    for (let i = 0; i < c2; i++) {
      paringar.push({
        spelarar: shuffled.slice(idx, idx + 2).map(s => s.kasterid),
        erWalkover: false, erTreSpelarar: false,
      })
      idx += 2
    }
  }

  return paringar
}
