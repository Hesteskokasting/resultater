import { beregnCupRundeParingar } from '@/utils/kastemetoder-logikk'
import type { CupParing } from '@/types'

function players(n: number) {
  return Array.from({ length: n }, (_, i) => ({ kasterid: i + 1, plassering: i + 1 }))
}

// Run fn many times to verify invariants that must hold despite Math.random() shuffling
function repeat(times: number, fn: () => void): void {
  for (let i = 0; i < times; i++) fn()
}

function flatIds(parings: CupParing[]): number[] {
  return parings.flatMap(p => p.spelarar as number[]).sort((a, b) => a - b)
}

describe('beregnCupRundeParingar', () => {
  describe('player coverage', () => {
    it('every player appears exactly once — 4 players, 2-player matches', () => {
      repeat(20, () => {
        expect(flatIds(beregnCupRundeParingar(players(4)))).toEqual([1, 2, 3, 4])
      })
    })

    it('every player appears exactly once — 9 players, 3-player matches', () => {
      repeat(20, () => {
        expect(flatIds(beregnCupRundeParingar(players(9)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
      })
    })

    it('every player appears exactly once when seeding is disabled', () => {
      repeat(20, () => {
        expect(flatIds(beregnCupRundeParingar(players(9), { medSeeding: false }))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
      })
    })

    it('every player appears exactly once when round 1 has walkovers', () => {
      // 4 players, isRunde1=true: 1 walkover + 1 three-player match = all 4 players
      repeat(20, () => {
        expect(flatIds(beregnCupRundeParingar(players(4), { isRunde1: true }))).toEqual([1, 2, 3, 4])
      })
    })
  })

  describe('match size constraints', () => {
    it('no non-walkover match has fewer than 2 players', () => {
      repeat(20, () => {
        for (const n of [4, 6, 8, 9]) {
          const parings = beregnCupRundeParingar(players(n))
          for (const p of parings) {
            if (!p.erWalkover) expect(p.spelarar.length).toBeGreaterThanOrEqual(2)
          }
        }
      })
    })

    it('no match has more than 3 players', () => {
      repeat(20, () => {
        for (const n of [4, 6, 8, 9, 10]) {
          const parings = beregnCupRundeParingar(players(n))
          for (const p of parings) expect(p.spelarar.length).toBeLessThanOrEqual(3)
        }
      })
    })

    it('erTreSpelarar is true if and only if the match has 3 players', () => {
      repeat(20, () => {
        const parings = beregnCupRundeParingar(players(9))
        for (const p of parings.filter(m => !m.erWalkover)) {
          expect(p.erTreSpelarar).toBe(p.spelarar.length === 3)
        }
      })
    })
  })

  describe('seeding (medSeeding: true)', () => {
    it('no two top-pool players share a match — 4 players, 2 lanes', () => {
      // Top pool = players 1 and 2 (first totalBanes players by plassering).
      // They are shuffled into separate lanes, so they can never meet.
      repeat(50, () => {
        const parings = beregnCupRundeParingar(players(4), { medSeeding: true })
        for (const match of parings.filter(p => !p.erWalkover)) {
          const topCount = (match.spelarar as number[]).filter(id => id <= 2).length
          expect(topCount).toBeLessThanOrEqual(1)
        }
      })
    })

    it('no two second-pool players share a match — 4 players, 2 lanes', () => {
      repeat(50, () => {
        const parings = beregnCupRundeParingar(players(4), { medSeeding: true })
        for (const match of parings.filter(p => !p.erWalkover)) {
          const midCount = (match.spelarar as number[]).filter(id => id >= 3).length
          expect(midCount).toBeLessThanOrEqual(1)
        }
      })
    })

    it('each 3-player match has exactly one player from each seed pool — 9 players', () => {
      // 9 players, c3=3: pools are {1,2,3}, {4,5,6}, {7,8,9} — one per match
      repeat(50, () => {
        const parings = beregnCupRundeParingar(players(9), { medSeeding: true })
        for (const match of parings.filter(p => !p.erWalkover)) {
          const ids = match.spelarar as number[]
          expect(ids.filter(id => id <= 3).length).toBe(1)
          expect(ids.filter(id => id >= 4 && id <= 6).length).toBe(1)
          expect(ids.filter(id => id >= 7).length).toBe(1)
        }
      })
    })
  })

  describe('walkovers', () => {
    it('produces no walkovers by default (isRunde1 defaults to false)', () => {
      repeat(20, () => {
        const parings = beregnCupRundeParingar(players(4))
        expect(parings.every(p => !p.erWalkover)).toBe(true)
      })
    })

    it('top seed gets a walkover in round 1 when player count % 3 === 1', () => {
      // 4 players: 4 % 3 = 1 → 1 walkover for kasterid 1 (best plassering)
      repeat(20, () => {
        const parings = beregnCupRundeParingar(players(4), { isRunde1: true })
        const walkovers = parings.filter(p => p.erWalkover)
        expect(walkovers).toHaveLength(1)
        expect(walkovers[0].spelarar).toEqual([1])
      })
    })

    it('walkover entries always contain exactly 1 player', () => {
      repeat(20, () => {
        const parings = beregnCupRundeParingar(players(4), { isRunde1: true })
        for (const p of parings.filter(m => m.erWalkover)) {
          expect(p.spelarar).toHaveLength(1)
        }
      })
    })

    it('runde1Oppsett.walkovers controls the number of walkovers', () => {
      // 10 players, 2 walkovers: the 2 top seeds walk over
      repeat(20, () => {
        const parings = beregnCupRundeParingar(
          players(10),
          { isRunde1: true, runde1Oppsett: { walkovers: 2, c3: 0, c2: 4 } }
        )
        const walkovers = parings.filter(p => p.erWalkover)
        expect(walkovers).toHaveLength(2)
        const walkoverIds = walkovers.flatMap(p => p.spelarar as number[]).sort((a, b) => a - b)
        expect(walkoverIds).toEqual([1, 2])
      })
    })
  })
})
