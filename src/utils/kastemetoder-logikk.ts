// Cup avsluttende kastemetode — ren logikk (ingen DB-kall)

import type { RundeOppsett, CupRunde, CupParing } from '@/types'

interface Spelar {
  kasterid: number | string
  plassering: number
}

interface Runde1Param {
  runde1?: RundeOppsett | null
  walkovers1?: number | null
}

interface ParingParam {
  medSeeding?: boolean
  isRunde1?: boolean
  walkoverTall?: number | null
  runde1Oppsett?: RundeOppsett | null
}

// --- Interne hjelpar ---

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Kan m spelarar nå nøyaktig 2 finalistar med reine rundar (berre 3-spelar ELLER berre 2-spelar)?
// Kjelde: cup-logikk_referanse.js canReachTwo
function kanNa2(n: number): boolean {
  if (n === 2 || n === 4) return true
  if (n < 2) return false
  if (n % 3 === 0) return kanNa2(Math.floor(n / 3) * 2)
  if (n % 2 === 0) return kanNa2(n / 2)
  return false
}

// Finn beste splitting av n spelarar: fortrekk reine 3-spelar rundar, så 2-spelar
function bestSplit(n: number): { c3: number; c2: number } {
  if (n % 3 === 0) return { c3: n / 3, c2: 0 }
  if (n % 2 === 0) return { c3: 0, c2: n / 2 }
  return { c3: 0, c2: 0 } // skal ikkje skje for gyldige gruppestr.
}

// --- Eksporterte funksjonar ---

// Returnerer gyldige runde 1-oppsett for n spelarar som reine konfigurasjonar:
// - Pure 3-spelar: w = n%3, n%3+3, … (maks 2 gyldige, w ≤ floor(n/2))
// - Pure 2-spelar: w = n%2, n%2+2, … (maks 2 gyldige, w ≤ floor(n/2))
// Returnerer [{walkovers, c3, c2}], sortert aukande walkovers, c3 synkande
export function gyldigeRunde1Oppsett(n: number): RundeOppsett[] {
  if (n < 2) return []
  const oppsett: RundeOppsett[] = []
  const halvN = Math.floor(n / 2)

  // Pure 3-spelar (c2 = 0)
  for (let w = n % 3; w <= halvN && w <= 3 && oppsett.filter(o => o.c2 === 0).length < 2; w += 3) {
    const c3 = (n - w) / 3
    if (c3 < 1) break
    const advance = w + 2 * c3
    if (kanNa2(advance)) oppsett.push({ walkovers: w, c3, c2: 0 })
  }

  // Pure 2-spelar (c3 = 0)
  for (let w = n % 2; w <= halvN && w <= 3 && oppsett.filter(o => o.c3 === 0).length < 2; w += 2) {
    const c2 = (n - w) / 2
    if (c2 < 1) break
    const advance = w + c2
    const erDuplikat = oppsett.some(o => o.walkovers === w && o.c3 === 0 && o.c2 === c2)
    if (!erDuplikat && kanNa2(advance)) oppsett.push({ walkovers: w, c3: 0, c2 })
  }

  // Sorter: aukande walkovers, deretter c3 synkande (3-spelar fremst ved likt walkover-tal)
  oppsett.sort((a, b) => a.walkovers - b.walkovers || b.c3 - a.c3)
  return oppsett
}

// Er n ein gyldig gruppestr. for Cup? (inkl. 2-spelar-baner i runde 1)
export function erGyldigGruppeStorrelse(n: number): boolean {
  if (n === 2) return true // finale-match direkte — inga runde 1 nødvendig
  return gyldigeRunde1Oppsett(n).length > 0
}

// Returnerer alle gyldige {nA, nB} split for n spelarar
// nA: 50–80 % av n, nB = n - nA, begge gyldige gruppestr.
export function beregnGyldigeGruppeStorrelsar(n: number): { nA: number; nB: number }[] {
  const minA = Math.ceil(n * 0.5)
  const maxA = Math.floor(n * 0.8)
  const splits: { nA: number; nB: number }[] = []
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
// runde1: overstyrer runde 1-oppsett {walkovers, c3, c2} (standard: første gyldige frå gyldigeRunde1Oppsett)
// walkovers1: bakoverkompatibel — vert konvertert til runde1 internt
export function beregnCupStruktur(n: number, { runde1 = null, walkovers1 = null }: Runde1Param = {}): CupRunde[] {
  const rundar: CupRunde[] = []
  let gjenstaar = n
  let rundeNr = 1
  let erRunde1 = true

  while (gjenstaar > 2) {
    let c3: number, c2: number, walkovers: number
    if (erRunde1) {
      let r1: RundeOppsett | null = runde1
      if (!r1 && walkovers1 !== null) {
        // Bakoverkompatibilitet: walkovers1 styrer berre walkover-tal med pure 3-spelar
        r1 = { walkovers: walkovers1, c3: Math.floor((gjenstaar - walkovers1) / 3), c2: 0 }
      }
      if (!r1) {
        r1 = gyldigeRunde1Oppsett(gjenstaar)[0] ?? { walkovers: gjenstaar % 3, c3: Math.floor(gjenstaar / 3), c2: 0 }
      }
      walkovers = r1.walkovers
      c3 = r1.c3
      c2 = r1.c2
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
// runde1Oppsett: {walkovers, c3, c2} — overstyrer runde 1-oppsett fullt ut
// walkoverTall: bakoverkompatibel — overstyrer berre walkover-tal med pure 3-spelar
export function beregnCupRundeParingar(spelarar: Spelar[], { medSeeding = true, isRunde1 = false, walkoverTall = null, runde1Oppsett = null }: ParingParam = {}): CupParing[] {
  const paringar: CupParing[] = []
  let aktive = [...spelarar]

  // Walkover: berre i runde 1
  if (isRunde1) {
    const wCount = runde1Oppsett?.walkovers ?? walkoverTall ?? aktive.length % 3
    if (wCount > 0) {
      const walkoverSpel = aktive.slice(0, wCount) // beste rangerte
      aktive = aktive.slice(wCount)
      for (const sp of walkoverSpel) {
        paringar.push({ spelarar: [sp.kasterid], erWalkover: true, erTreSpelarar: false })
      }
    }
  }

  const n = aktive.length
  let c3: number, c2: number
  if (runde1Oppsett && isRunde1) {
    c3 = runde1Oppsett.c3
    c2 = runde1Oppsett.c2
  } else if (isRunde1) {
    c3 = Math.floor(n / 3)
    c2 = 0
  } else {
    const s = bestSplit(n)
    c3 = s.c3; c2 = s.c2
  }
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
