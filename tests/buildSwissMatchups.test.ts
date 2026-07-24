import { buildSwissRound1Matchups, buildSwissMatchups } from '@/services/kampGenereringInnledendeService'

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

// ── buildSwissRound1Matchups ─────────────────────────────────────────────────

describe('buildSwissRound1Matchups', () => {
  it('matches positions sequentially: (1,2), (3,4), (5,6) for N=6', () => {
    const matchups = buildSwissRound1Matchups(6)
    expect(matchups[0]).toEqual({ p1Pos: 1, p2Pos: 2, isWalkover: false })
    expect(matchups[1]).toEqual({ p1Pos: 3, p2Pos: 4, isWalkover: false })
    expect(matchups[2]).toEqual({ p1Pos: 5, p2Pos: 6, isWalkover: false })
  })

  it('even N: produces N/2 matches with no walkovers', () => {
    const matchups = buildSwissRound1Matchups(8)
    expect(matchups.length).toBe(4)
    expect(matchups.every(m => !m.isWalkover)).toBe(true)
  })

  it('odd N: produces ceil(N/2) matches with exactly one walkover at the end', () => {
    const matchups = buildSwissRound1Matchups(5)
    expect(matchups.length).toBe(3)
    const walkovers = matchups.filter(m => m.isWalkover)
    expect(walkovers.length).toBe(1)
    expect(walkovers[0]).toEqual({ p1Pos: 5, p2Pos: null, isWalkover: true })
  })
})

// ── buildSwissMatchups ────────────────────────────────────────────────────────

describe('buildSwissMatchups', () => {
  describe('basic properties', () => {
    it('all player kasterids appear exactly once across all returned matches', () => {
      const ids = [1, 2, 3, 4]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      const seen = new Set<number>()
      for (const m of matchups!) {
        seen.add(m.p1)
        if (!m.isWalkover) seen.add(m.p2!)
      }
      expect(seen.size).toBe(4)
      expect(seen).toContain(1)
      expect(seen).toContain(4)
    })

    it('produces Math.ceil(N/2) matches for even N', () => {
      const ids = [1, 2, 3, 4, 5, 6]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      expect(matchups!.length).toBe(3)
    })

    it('produces Math.ceil(N/2) matches for odd N', () => {
      const ids = [1, 2, 3, 4, 5]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      expect(matchups!.length).toBe(3)
    })
  })

  describe('rematch avoidance', () => {
    it('never matches two players who have already played', () => {
      // Round 1: (1,2) and (3,4) have played
      const ids = [1, 2, 3, 4]
      const unplayed: Record<number, number[]> = {
        1: [3, 4],
        2: [3, 4],
        3: [1, 2],
        4: [1, 2],
      }
      const matchups = buildSwissMatchups(ids, unplayed, zeroByes(ids))
      expect(matchups).not.toBeNull()
      for (const m of matchups!) {
        if (!m.isWalkover) {
          const key = `${m.p1}-${m.p2}`
          expect(key).not.toBe('1-2')
          expect(key).not.toBe('3-4')
        }
      }
    })

    it('returns null when all possible matchups are exhausted', () => {
      const ids = [1, 2, 3, 4]
      const noneUnplayed: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] }
      expect(buildSwissMatchups(ids, noneUnplayed, zeroByes(ids))).toBeNull()
    })
  })

  describe('walkover behavior', () => {
    it('odd N: exactly one walkover with p2=null', () => {
      const ids = [1, 2, 3, 4, 5]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      const walkovers = matchups!.filter(m => m.isWalkover)
      expect(walkovers.length).toBe(1)
      expect(walkovers[0]!.p2).toBeNull()
    })

    it('walkover goes to the lowest-ranked player (last in rankedKasterids) with 0 prior byes', () => {
      const ids = [1, 2, 3, 4, 5]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      const bye = matchups!.find(m => m.isWalkover)
      // Player 5 is last in rankedKasterids and has 0 byes
      expect(bye?.p1).toBe(5)
    })

    it('skips a player who already has a bye; gives it to the next eligible', () => {
      const ids = [1, 2, 3, 4, 5]
      const byes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } // player 5 already had a bye
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), byes)
      const bye = matchups!.find(m => m.isWalkover)
      // Player 5 skipped (byes >= 1); player 4 is next lowest with 0 byes
      expect(bye?.p1).toBe(4)
    })

    it('walkover entry is last in the returned array', () => {
      const ids = [1, 2, 3]
      const matchups = buildSwissMatchups(ids, allUnplayed(ids), zeroByes(ids))
      // tryPairing adds the bye first internally; sort must push it to the end
      expect(matchups![matchups!.length - 1]!.isWalkover).toBe(true)
      expect(matchups![0]!.isWalkover).toBe(false)
    })

    it('does not mutate the caller\'s byeCount object', () => {
      const ids = [1, 2, 3]
      const byes = zeroByes(ids)
      buildSwissMatchups(ids, allUnplayed(ids), byes)
      expect(byes[1]).toBe(0)
      expect(byes[2]).toBe(0)
      expect(byes[3]).toBe(0)
    })
  })
})
