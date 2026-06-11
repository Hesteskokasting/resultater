import { buildSwissRunde1Pairs, buildSwissPairs } from '@/services/kampGenereringInnledendeService'

// Helpers to build fully-connected unplayedMatches (no prior matches played)
function allUnplayed(ids: number[]): Record<number, number[]> {
  const result: Record<number, number[]> = {}
  for (const id of ids) result[id] = ids.filter(k => k !== id)
  return result
}

function zeroByes(ids: number[]): Record<number, number> {
  const result: Record<number, number> = {}
  for (const id of ids) result[id] = 0
  return result
}

// ── buildSwissRunde1Pairs ─────────────────────────────────────────────────────

describe('buildSwissRunde1Pairs', () => {
  it('pairs positions sequentially: (1,2), (3,4), (5,6) for N=6', () => {
    const pairs = buildSwissRunde1Pairs(6)
    expect(pairs[0]).toEqual({ p1Pos: 1, p2Pos: 2, erWalkover: false })
    expect(pairs[1]).toEqual({ p1Pos: 3, p2Pos: 4, erWalkover: false })
    expect(pairs[2]).toEqual({ p1Pos: 5, p2Pos: 6, erWalkover: false })
  })

  it('even N: produces N/2 matches with no walkovers', () => {
    const pairs = buildSwissRunde1Pairs(8)
    expect(pairs.length).toBe(4)
    expect(pairs.every(p => !p.erWalkover)).toBe(true)
  })

  it('odd N: produces ceil(N/2) matches with exactly one walkover at the end', () => {
    const pairs = buildSwissRunde1Pairs(5)
    expect(pairs.length).toBe(3)
    const walkovers = pairs.filter(p => p.erWalkover)
    expect(walkovers.length).toBe(1)
    expect(walkovers[0]).toEqual({ p1Pos: 5, p2Pos: null, erWalkover: true })
  })
})

// ── buildSwissPairs ───────────────────────────────────────────────────────────

describe('buildSwissPairs', () => {
  describe('basic properties', () => {
    it('all player kasterids appear exactly once across all returned matches', () => {
      const ids = [1, 2, 3, 4]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      const seen = new Set<number>()
      for (const p of pairs!) {
        seen.add(p.p1)
        if (!p.erWalkover) seen.add(p.p2!)
      }
      expect(seen.size).toBe(4)
      expect(seen).toContain(1)
      expect(seen).toContain(4)
    })

    it('produces Math.ceil(N/2) matches for even N', () => {
      const ids = [1, 2, 3, 4, 5, 6]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      expect(pairs!.length).toBe(3)
    })

    it('produces Math.ceil(N/2) matches for odd N', () => {
      const ids = [1, 2, 3, 4, 5]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      expect(pairs!.length).toBe(3)
    })
  })

  describe('rematch avoidance', () => {
    it('never pairs two players who have already played', () => {
      // Round 1: (1,2) and (3,4) have played
      const ids = [1, 2, 3, 4]
      const unplayed: Record<number, number[]> = {
        1: [3, 4],
        2: [3, 4],
        3: [1, 2],
        4: [1, 2],
      }
      const pairs = buildSwissPairs(ids, unplayed, zeroByes(ids))
      expect(pairs).not.toBeNull()
      for (const p of pairs!) {
        if (!p.erWalkover) {
          const key = `${p.p1}-${p.p2}`
          expect(key).not.toBe('1-2')
          expect(key).not.toBe('3-4')
        }
      }
    })

    it('returns null when all possible pairings are exhausted', () => {
      const ids = [1, 2, 3, 4]
      const noneUnplayed: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] }
      expect(buildSwissPairs(ids, noneUnplayed, zeroByes(ids))).toBeNull()
    })
  })

  describe('walkover behavior', () => {
    it('odd N: exactly one walkover with p2=null', () => {
      const ids = [1, 2, 3, 4, 5]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      const walkovers = pairs!.filter(p => p.erWalkover)
      expect(walkovers.length).toBe(1)
      expect(walkovers[0]!.p2).toBeNull()
    })

    it('walkover goes to the lowest-ranked player (last in rankedKasterids) with 0 prior byes', () => {
      const ids = [1, 2, 3, 4, 5]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      const bye = pairs!.find(p => p.erWalkover)
      // Player 5 is last in rankedKasterids and has 0 byes
      expect(bye?.p1).toBe(5)
    })

    it('skips a player who already has a bye; gives it to the next eligible', () => {
      const ids = [1, 2, 3, 4, 5]
      const byes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } // player 5 already had a bye
      const pairs = buildSwissPairs(ids, allUnplayed(ids), byes)
      const bye = pairs!.find(p => p.erWalkover)
      // Player 5 skipped (byes >= 1); player 4 is next lowest with 0 byes
      expect(bye?.p1).toBe(4)
    })

    it('walkover entry is last in the returned array', () => {
      const ids = [1, 2, 3]
      const pairs = buildSwissPairs(ids, allUnplayed(ids), zeroByes(ids))
      // tryPairing adds the bye first internally; sort must push it to the end
      expect(pairs![pairs!.length - 1]!.erWalkover).toBe(true)
      expect(pairs![0]!.erWalkover).toBe(false)
    })

    it('does not mutate the caller\'s byeCount object', () => {
      const ids = [1, 2, 3]
      const byes = zeroByes(ids)
      buildSwissPairs(ids, allUnplayed(ids), byes)
      expect(byes[1]).toBe(0)
      expect(byes[2]).toBe(0)
      expect(byes[3]).toBe(0)
    })
  })
})
