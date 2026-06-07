import { buildKampSpelarUpdates, type OmgRow } from '@/services/kampService'

const P1_ID = 101
const P2_ID = 202

function row(spelarId: number, score: number | null, rings: number | null): OmgRow {
  return { kamp_spelar_id: spelarId, score, antall_ringer: rings }
}

const p1 = { spelarId: P1_ID, baseScore: 0 }
const p2 = { spelarId: P2_ID, baseScore: 0 }
const NO_HCP = { hcp1: 0, hcp2: 0 }

describe('buildKampSpelarUpdates', () => {
  describe('omgang row accumulation', () => {
    it('sums score and antall_ringer across all rows for each player', () => {
      const omgData = [
        row(P1_ID, 6, 2),
        row(P2_ID, 3, 1),
        row(P1_ID, 4, 1),
        row(P2_ID, 4, 1),
        row(P1_ID, 6, 2),
        row(P2_ID, 2, 0),
      ]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: false })
      expect(res.p1?.score_poeng).toBe(16)   // 6 + 4 + 6
      expect(res.p1?.antall_ringer).toBe(5)  // 2 + 1 + 2
      expect(res.p2?.score_poeng).toBe(9)    // 3 + 4 + 2
      expect(res.p2?.antall_ringer).toBe(2)  // 1 + 1 + 0
    })

    it('treats null score and null antall_ringer as 0, not NaN', () => {
      const omgData = [row(P1_ID, null, null), row(P2_ID, null, null)]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: false })
      expect(res.p1?.score_poeng).toBe(0)
      expect(res.p1?.antall_ringer).toBe(0)
      expect(Number.isNaN(res.p1?.score_poeng)).toBe(false)
      expect(Number.isNaN(res.p1?.antall_ringer)).toBe(false)
    })

    it('falls back to baseScore when omgData is empty', () => {
      const res = buildKampSpelarUpdates({
        omgData: [],
        p1: { spelarId: P1_ID, baseScore: 15 },
        p2: { spelarId: P2_ID, baseScore: 10 },
        ...NO_HCP,
        erWalkover: false,
      })
      expect(res.p1?.score_poeng).toBe(15)
      expect(res.p2?.score_poeng).toBe(10)
      expect(res.p1?.antall_ringer).toBe(0)
      expect(res.p2?.antall_ringer).toBe(0)
    })

    it('does NOT add HCP to a directly-entered baseScore — baseScore is already the final value', () => {
      // Regression: HCP was previously added unconditionally, causing double-counting
      // when a score was set directly (no scoreboard rounds).
      const res = buildKampSpelarUpdates({
        omgData: [],
        p1: { spelarId: P1_ID, baseScore: 23 },
        p2: { spelarId: P2_ID, baseScore: 10 },
        hcp1: 8, hcp2: 0, erWalkover: false,
      })
      expect(res.p1?.score_poeng).toBe(23)  // NOT 31
      expect(res.p2?.score_poeng).toBe(10)
    })
  })

  describe('HCP', () => {
    it('HCP adds to score_poeng but not antall_ringer', () => {
      const omgData = [row(P1_ID, 6, 2), row(P2_ID, 4, 1)]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, hcp1: 3, hcp2: 5, erWalkover: false })
      expect(res.p1?.score_poeng).toBe(9)    // 6 + 3
      expect(res.p1?.antall_ringer).toBe(2)  // unchanged
      expect(res.p2?.score_poeng).toBe(9)    // 4 + 5
      expect(res.p2?.antall_ringer).toBe(1)  // unchanged
    })

    it('HCP-boosted score determines kamp_poeng — lower raw score can still win', () => {
      // Without HCP: p1=4, p2=6 → p2 leads. With HCP: p1=4+5=9 → p1 wins.
      const omgData = [row(P1_ID, 4, 1), row(P2_ID, 6, 2)]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, hcp1: 5, hcp2: 0, erWalkover: false })
      expect(res.p1?.score_poeng).toBe(9)
      expect(res.p1?.kamp_poeng).toBe(2)
      expect(res.p2?.score_poeng).toBe(6)
      expect(res.p2?.kamp_poeng).toBe(0) // t2=6 < 11 → 0 pts
    })
  })

  describe('walkover', () => {
    it('p1 gets score_poeng=21 kamp_poeng=2 antall_ringer=0', () => {
      const res = buildKampSpelarUpdates({ omgData: [], p1, p2, ...NO_HCP, erWalkover: true })
      expect(res.p1).toEqual({ score_poeng: 21, kamp_poeng: 2, antall_ringer: 0 })
    })

    it('p2 gets score_poeng=0 kamp_poeng=0 antall_ringer=0', () => {
      const res = buildKampSpelarUpdates({ omgData: [], p1, p2, ...NO_HCP, erWalkover: true })
      expect(res.p2).toEqual({ score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    })

    it('ignores omgData when erWalkover is true', () => {
      const omgData = [row(P1_ID, 3, 1), row(P2_ID, 4, 1)]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: true })
      expect(res.p1?.score_poeng).toBe(21)
      expect(res.p2?.score_poeng).toBe(0)
    })
  })

  describe('kamp_poeng outcomes', () => {
    it('p1 wins: [2, 1] when loser score >= 11', () => {
      // p1: 6+6+4=16, p2: 6+6=12 (12 >= 11 → p2 gets 1 pt)
      const omgData = [
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
        row(P1_ID, 4, 1),
      ]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: false })
      expect(res.p1?.kamp_poeng).toBe(2)
      expect(res.p2?.kamp_poeng).toBe(1)
    })

    it('p1 wins: [2, 0] when loser score < 11', () => {
      // p1: 6+6=12, p2: 4+4=8 (8 < 11 → p2 gets 0 pts)
      const omgData = [
        row(P1_ID, 6, 2), row(P2_ID, 4, 1),
        row(P1_ID, 6, 2), row(P2_ID, 4, 1),
      ]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: false })
      expect(res.p1?.kamp_poeng).toBe(2)
      expect(res.p2?.kamp_poeng).toBe(0)
    })

    it('tie: both get kamp_poeng=1.5', () => {
      // p1: 6+6=12, p2: 6+6=12
      const omgData = [
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
      ]
      const res = buildKampSpelarUpdates({ omgData, p1, p2, ...NO_HCP, erWalkover: false })
      expect(res.p1?.kamp_poeng).toBe(1.5)
      expect(res.p2?.kamp_poeng).toBe(1.5)
    })
  })

  describe('null player', () => {
    it('returns null for the null player, non-null for the other', () => {
      const res = buildKampSpelarUpdates({ omgData: [], p1, p2: null, ...NO_HCP, erWalkover: false })
      expect(res.p2).toBeNull()
      expect(res.p1).not.toBeNull()
    })
  })
})
