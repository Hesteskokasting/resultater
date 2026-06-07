import { buildCascadePairs } from '@/services/kampGenereringInnledendeService'

describe('buildCascadePairs', () => {
  describe('match count', () => {
    it('returns one array per round', () => {
      expect(buildCascadePairs(24, 4).length).toBe(4)
      expect(buildCascadePairs(24, 12).length).toBe(12)
    })

    it('each round has Math.ceil(N/2) matches for even N', () => {
      const rounds = buildCascadePairs(24, 3)
      for (const round of rounds) {
        expect(round.length).toBe(12)
      }
    })

    it('each round has Math.ceil(N/2) matches for odd N', () => {
      const rounds = buildCascadePairs(7, 3)
      for (const round of rounds) {
        expect(round.length).toBe(4)
      }
    })
  })

  describe('group isolation', () => {
    it('p1Pos is always in group 1 (1..totalCourts)', () => {
      const N = 24
      const totalCourts = 12
      for (const round of buildCascadePairs(N, 12)) {
        for (const match of round) {
          expect(match.p1Pos).toBeGreaterThanOrEqual(1)
          expect(match.p1Pos).toBeLessThanOrEqual(totalCourts)
        }
      }
    })

    it('p2Pos (non-walkover) is always in group 2 (totalCourts+1..N)', () => {
      const N = 24
      const totalCourts = 12
      for (const round of buildCascadePairs(N, 12)) {
        for (const match of round) {
          if (!match.erWalkover) {
            expect(match.p2Pos).not.toBeNull()
            expect(match.p2Pos!).toBeGreaterThan(totalCourts)
            expect(match.p2Pos!).toBeLessThanOrEqual(N)
          }
        }
      }
    })

    it('every player position appears exactly once per round', () => {
      const N = 24
      for (const round of buildCascadePairs(N, 4)) {
        const seen = new Set<number>()
        for (const match of round) {
          expect(seen.has(match.p1Pos)).toBe(false)
          seen.add(match.p1Pos)
          if (!match.erWalkover) {
            expect(seen.has(match.p2Pos!)).toBe(false)
            seen.add(match.p2Pos!)
          }
        }
        expect(seen.size).toBe(N)
      }
    })
  })

  describe('no rematches', () => {
    it('no (p1Pos, p2Pos) pair repeats across all rounds (N=24, 12 rounds)', () => {
      const seen = new Set<string>()
      for (const round of buildCascadePairs(24, 12)) {
        for (const match of round) {
          if (!match.erWalkover) {
            const key = `${match.p1Pos}-${match.p2Pos}`
            expect(seen.has(key)).toBe(false)
            seen.add(key)
          }
        }
      }
    })
  })

  describe('walkover behavior', () => {
    it('odd N: exactly one walkover per round with p2Pos=null', () => {
      for (const round of buildCascadePairs(7, 3)) {
        const walkovers = round.filter(m => m.erWalkover)
        expect(walkovers.length).toBe(1)
        expect(walkovers[0].p2Pos).toBeNull()
      }
    })

    it('even N: no walkovers in any round', () => {
      for (const round of buildCascadePairs(24, 12)) {
        expect(round.every(m => !m.erWalkover)).toBe(true)
      }
    })
  })

  describe('spot checks (N=24)', () => {
    const rounds = buildCascadePairs(24, 4)

    it('round 1, court 1: p1Pos=1, p2Pos=13', () => {
      expect(rounds[0][0]).toEqual({ p1Pos: 1, p2Pos: 13, erWalkover: false })
    })

    it('round 4, court 10: p1Pos=1, p2Pos=16', () => {
      expect(rounds[3][9]).toEqual({ p1Pos: 1, p2Pos: 16, erWalkover: false })
    })
  })
})
