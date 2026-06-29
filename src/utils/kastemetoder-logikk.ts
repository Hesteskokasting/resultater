// Cup avsluttende kastemetode — ren logikk (ingen DB-kall)

import type { RoundSetup, CupRound, CupPairing } from '@/types'

interface Player {
  kasterid: number | string
  plassering: number
}

interface Round1Param {
  runde1?: RoundSetup | null
  walkovers1?: number | null
}

interface PairingParam {
  medSeeding?: boolean
  isRunde1?: boolean
  walkoverTall?: number | null
  runde1Oppsett?: RoundSetup | null
  shuffleFn?: <T>(arr: T[]) => T[]
}

// --- Internal helpers ---

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

// Can m players reach exactly 2 finalists with clean rounds (only 3-player OR only 2-player)?
// Source: cup-logikk_referanse.js canReachTwo
function canReachTwo(n: number): boolean {
  if (n === 2 || n === 4) return true
  if (n < 2) return false
  if (n % 3 === 0) return canReachTwo(Math.floor(n / 3) * 2)
  if (n % 2 === 0) return canReachTwo(n / 2)
  return false
}

// Find best split of n players: prefer pure 3-player rounds, then 2-player
function bestSplit(n: number): { c3: number; c2: number } {
  if (n % 3 === 0) return { c3: n / 3, c2: 0 }
  if (n % 2 === 0) return { c3: 0, c2: n / 2 }
  return { c3: 0, c2: 0 } // should not happen for valid group sizes
}

// --- Eksporterte funksjonar ---

// Returnerer gyldige runde 1-oppsett for n spelarar som reine konfigurasjonar:
// - Pure 3-spelar: w = n%3, n%3+3, … (maks 2 gyldige, w ≤ floor(n/2))
// - Pure 2-spelar: w = n%2, n%2+2, … (maks 2 gyldige, w ≤ floor(n/2))
// Returnerer [{walkovers, c3, c2}], sortert aukande walkovers, c3 synkande
export function validRound1Setups(n: number): RoundSetup[] {
  if (n < 2) return []
  const setups: RoundSetup[] = []
  const halfN = Math.floor(n / 2)

  // Pure 3-player (c2 = 0)
  for (let w = n % 3; w <= halfN && w <= 3 && setups.filter(o => o.c2 === 0).length < 2; w += 3) {
    const c3 = (n - w) / 3
    if (c3 < 1) break
    const advance = w + 2 * c3
    if (canReachTwo(advance)) setups.push({ walkovers: w, c3, c2: 0 })
  }

  // Pure 2-player (c3 = 0)
  for (let w = n % 2; w <= halfN && w <= 3 && setups.filter(o => o.c3 === 0).length < 2; w += 2) {
    const c2 = (n - w) / 2
    if (c2 < 1) break
    const advance = w + c2
    const isDuplicate = setups.some(o => o.walkovers === w && o.c3 === 0 && o.c2 === c2)
    if (!isDuplicate && canReachTwo(advance)) setups.push({ walkovers: w, c3: 0, c2 })
  }

  // Sort: ascending walkovers, then c3 descending (3-player first at same walkover count)
  setups.sort((a, b) => a.walkovers - b.walkovers || b.c3 - a.c3)
  return setups
}

function isValidGroupSize(n: number): boolean {
  if (n === 2) return true // direct final match — no round 1 needed
  return validRound1Setups(n).length > 0
}

export function calcValidGroupSizes(n: number): { nA: number; nB: number }[] {
  const minA = Math.ceil(n * 0.5)
  const maxA = Math.round(n * 0.8)
  const splits: { nA: number; nB: number }[] = []
  for (let nA = maxA; nA >= minA; nA--) {
    const nB = n - nA
    if (nB >= 2 && isValidGroupSize(nA) && isValidGroupSize(nB)) {
      splits.push({ nA, nB })
    }
  }
  return splits
}

export function calcCupStructure(n: number, { runde1 = null, walkovers1 = null }: Round1Param = {}): CupRound[] {
  const rounds: CupRound[] = []
  let remaining = n
  let roundNr = 1
  let isRound1 = true

  while (remaining > 2) {
    let c3: number, c2: number, walkovers: number
    if (isRound1) {
      let r1: RoundSetup | null = runde1
      if (!r1 && walkovers1 !== null) {
        r1 = { walkovers: walkovers1, c3: Math.floor((remaining - walkovers1) / 3), c2: 0 }
      }
      if (!r1) {
        r1 = validRound1Setups(remaining)[0] ?? { walkovers: remaining % 3, c3: Math.floor(remaining / 3), c2: 0 }
      }
      walkovers = r1.walkovers
      c3 = r1.c3
      c2 = r1.c2
      isRound1 = false
    } else {
      const s = bestSplit(remaining)
      c3 = s.c3; c2 = s.c2; walkovers = 0
    }
    const advancing = c3 * 2 + c2 + walkovers
    rounds.push({ runde: roundNr, players: remaining, lanes: c3 + c2, threePlayers: c3 > 0, walkovers, advancing })
    remaining = advancing
    roundNr++
  }
  return rounds
}

export function calcCupRoundPairings(players: Player[], { medSeeding = true, isRunde1 = false, walkoverTall = null, runde1Oppsett = null, shuffleFn }: PairingParam = {}): CupPairing[] {
  const doShuffle = shuffleFn ?? shuffle
  const pairings: CupPairing[] = []
  let active = [...players]

  // Walkover: only in round 1
  if (isRunde1) {
    const wCount = runde1Oppsett?.walkovers ?? walkoverTall ?? active.length % 3
    if (wCount > 0) {
      const walkoverPlayers = active.slice(0, wCount) // top-ranked
      active = active.slice(wCount)
      for (const sp of walkoverPlayers) {
        pairings.push({ players: [sp.kasterid], isWalkover: true, isThreePlayers: false })
      }
    }
  }

  const n = active.length
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
  const totalLanes = c3 + c2

  if (medSeeding && totalLanes > 0) {
    // Pool 1 (top totalLanes): 1 player per lane
    // Pool 2 (next totalLanes): 1 player per lane
    // Pool 3 (remaining c3): 1 player per 3-player lane
    const p1 = doShuffle(active.slice(0, totalLanes))
    const p2 = doShuffle(active.slice(totalLanes, 2 * totalLanes))
    const p3 = doShuffle(active.slice(2 * totalLanes)) // length = c3
    let p3idx = 0
    for (let lane = 0; lane < totalLanes; lane++) {
      const isThree = lane < c3
      const lanePlayers = [p1[lane], p2[lane]].filter((s): s is Player => s != null)
      const third = isThree ? p3[p3idx] : undefined
      if (third) { lanePlayers.push(third); p3idx++ }
      pairings.push({
        players: lanePlayers.map(s => s.kasterid),
        isWalkover: false,
        isThreePlayers: isThree,
      })
    }
  } else {
    // No seeding: random
    const shuffled = doShuffle(active)
    let idx = 0
    for (let i = 0; i < c3; i++) {
      pairings.push({
        players: shuffled.slice(idx, idx + 3).map(s => s.kasterid),
        isWalkover: false, isThreePlayers: true,
      })
      idx += 3
    }
    for (let i = 0; i < c2; i++) {
      pairings.push({
        players: shuffled.slice(idx, idx + 2).map(s => s.kasterid),
        isWalkover: false, isThreePlayers: false,
      })
      idx += 2
    }
  }

  return pairings
}
