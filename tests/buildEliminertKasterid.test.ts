import { buildEliminatedThrowerId } from '@/services/kampService'

// NOTE: the 3-player case (orderedKasterids[2]) bypasses this function entirely.
// buildEliminatedThrowerId is only called for 2-player avsluttende matches.

// NOTE: a tie is impossible by game rules — a player must win by 2+ score_poeng.
// The `t1 >= t2` fallback (which would eliminate p2) is therefore unreachable
// in valid game flow and is not tested here.

const P1_ID = 101
const P2_KASTERID = 201
const P2_ID = 202
const P1_KASTERID = 101

const p1 = { playerIds: [P1_ID], kasterid: P1_KASTERID, scorePoints: 0 }
const p2 = { playerIds: [P2_ID], kasterid: P2_KASTERID, scorePoints: 0 }

function row(spelarId: number, score: number | null) {
  return { kamp_spelar_id: spelarId, score }
}

describe('buildEliminatedThrowerId', () => {
  describe('winner/loser from omgang scores', () => {
    it('returns p2.kasterid when p1 has the higher total', () => {
      // p1: 6+6+4=16, p2: 6+4=10 → p2 eliminated
      const roundData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 6), row(P2_ID, 4),
        row(P1_ID, 4),
      ]
      expect(buildEliminatedThrowerId({ roundData, p1, p2 })).toBe(P2_KASTERID)
    })

    it('returns p1.kasterid when p2 has the higher total', () => {
      // p1: 6+4=10, p2: 6+6+6=18 → p1 eliminated
      const roundData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 4), row(P2_ID, 6),
                       row(P2_ID, 6),
      ]
      expect(buildEliminatedThrowerId({ roundData, p1, p2 })).toBe(P1_KASTERID)
    })

    it('sums multiple omgang rows per player correctly', () => {
      const roundData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 4), row(P2_ID, 6),
      ]
      // p1 total = 16, p2 total = 18 → p1 eliminated
      expect(buildEliminatedThrowerId({ roundData, p1, p2 })).toBe(P1_KASTERID)
    })

    it('treats null score values as 0', () => {
      const roundData = [row(P1_ID, null), row(P2_ID, 6)]
      // p1 = 0, p2 = 6 → p1 eliminated
      expect(buildEliminatedThrowerId({ roundData, p1, p2 })).toBe(P1_KASTERID)
    })
  })

  describe('scorePoints fallback', () => {
    it('uses scorePoints when roundData is empty', () => {
      const res = buildEliminatedThrowerId({
        roundData: [],
        p1: { ...p1, scorePoints: 20 },
        p2: { ...p2, scorePoints: 14 },
      })
      // p1=20 > p2=14 → p2 eliminated
      expect(res).toBe(P2_KASTERID)
    })

    it('uses scorePoints as fallback per player when that player has no omgang rows', () => {
      // p2 has no rows → falls back to p2.scorePoints=5; p1 has row score=6
      const roundData = [row(P1_ID, 6)]
      const res = buildEliminatedThrowerId({
        roundData,
        p1: { ...p1, scorePoints: 0 },
        p2: { ...p2, scorePoints: 5 },
      })
      // p1=6 > p2=5 → p2 eliminated
      expect(res).toBe(P2_KASTERID)
    })
  })

  describe('null player', () => {
    it('returns null when both players are null', () => {
      expect(buildEliminatedThrowerId({ roundData: [], p1: null, p2: null })).toBeNull()
    })
  })

  describe('Par/Mix — side totals sum both members (they alternate omgangar)', () => {
    // pair A: kamp_spelar ids 11 (posisjon 1) and 12; pair B: 21 and 22
    const parA = { playerIds: [11, 12], kasterid: 1, scorePoints: 0 }
    const parB = { playerIds: [21, 22], kasterid: 3, scorePoints: 0 }

    it('eliminates the pair with the lower SIDE total, not rep total', () => {
      // A: rep 6+4=10, partner 3+1=4 → side 14
      // B: rep 6+6=12, partner 2+1=3 → side 15 — B's rep beats A's rep, but A... B wins by side
      const roundData = [
        row(11, 6), row(21, 6),  // omgang 1 (posisjon 1)
        row(12, 3), row(22, 2),  // omgang 2 (posisjon 2)
        row(11, 4), row(21, 6),  // omgang 3
        row(12, 1), row(22, 1),  // omgang 4
      ]
      // A side = 14, B side = 15 → A eliminated
      expect(buildEliminatedThrowerId({ roundData, p1: parA, p2: parB })).toBe(1)
    })

    it('falls back to the rep scorePoints when a side has no omgang rows', () => {
      const roundData = [row(21, 6), row(22, 6)]
      const res = buildEliminatedThrowerId({
        roundData,
        p1: { ...parA, scorePoints: 21 },
        p2: parB,
      })
      // A side = 21 (fallback), B side = 12 → B eliminated
      expect(res).toBe(3)
    })
  })
})
