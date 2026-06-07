import { buildEliminertKasterid } from '@/services/kampService'

// NOTE: the 3-player case (orderedKasterids[2]) bypasses this function entirely.
// buildEliminertKasterid is only called for 2-player avsluttende matches.

// NOTE: a tie is impossible by game rules — a player must win by 2+ score_poeng.
// The `t1 >= t2` fallback (which would eliminate p2) is therefore unreachable
// in valid game flow and is not tested here.

const P1_ID = 101
const P2_KASTERID = 201
const P2_ID = 202
const P1_KASTERID = 101

const p1 = { spelarId: P1_ID, kasterid: P1_KASTERID, scorePoeng: 0 }
const p2 = { spelarId: P2_ID, kasterid: P2_KASTERID, scorePoeng: 0 }

function row(spelarId: number, score: number | null) {
  return { kamp_spelar_id: spelarId, score }
}

describe('buildEliminertKasterid', () => {
  describe('winner/loser from omgang scores', () => {
    it('returns p2.kasterid when p1 has the higher total', () => {
      // p1: 6+6+4=16, p2: 6+4=10 → p2 eliminated
      const omgData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 6), row(P2_ID, 4),
        row(P1_ID, 4),
      ]
      expect(buildEliminertKasterid({ omgData, p1, p2 })).toBe(P2_KASTERID)
    })

    it('returns p1.kasterid when p2 has the higher total', () => {
      // p1: 6+4=10, p2: 6+6+6=18 → p1 eliminated
      const omgData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 4), row(P2_ID, 6),
                       row(P2_ID, 6),
      ]
      expect(buildEliminertKasterid({ omgData, p1, p2 })).toBe(P1_KASTERID)
    })

    it('sums multiple omgang rows per player correctly', () => {
      const omgData = [
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 6), row(P2_ID, 6),
        row(P1_ID, 4), row(P2_ID, 6),
      ]
      // p1 total = 16, p2 total = 18 → p1 eliminated
      expect(buildEliminertKasterid({ omgData, p1, p2 })).toBe(P1_KASTERID)
    })

    it('treats null score values as 0', () => {
      const omgData = [row(P1_ID, null), row(P2_ID, 6)]
      // p1 = 0, p2 = 6 → p1 eliminated
      expect(buildEliminertKasterid({ omgData, p1, p2 })).toBe(P1_KASTERID)
    })
  })

  describe('scorePoeng fallback', () => {
    it('uses scorePoeng when omgData is empty', () => {
      const res = buildEliminertKasterid({
        omgData: [],
        p1: { ...p1, scorePoeng: 20 },
        p2: { ...p2, scorePoeng: 14 },
      })
      // p1=20 > p2=14 → p2 eliminated
      expect(res).toBe(P2_KASTERID)
    })

    it('uses scorePoeng as fallback per player when that player has no omgang rows', () => {
      // p2 has no rows → falls back to p2.scorePoeng=5; p1 has row score=6
      const omgData = [row(P1_ID, 6)]
      const res = buildEliminertKasterid({
        omgData,
        p1: { ...p1, scorePoeng: 0 },
        p2: { ...p2, scorePoeng: 5 },
      })
      // p1=6 > p2=5 → p2 eliminated
      expect(res).toBe(P2_KASTERID)
    })
  })

  describe('null player', () => {
    it('returns null when both players are null', () => {
      expect(buildEliminertKasterid({ omgData: [], p1: null, p2: null })).toBeNull()
    })
  })
})
