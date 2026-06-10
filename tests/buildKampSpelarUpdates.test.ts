import { buildKampSpelarUpdates, type OmgRow, type SideBekreft } from '@/services/kampService'

const P1_ID = 101
const P2_ID = 202

function row(spelarId: number, score: number | null, rings: number | null): OmgRow {
  return { kamp_spelar_id: spelarId, score, antall_ringer: rings }
}

const side1: SideBekreft = { spelarIds: [P1_ID], baseScore: 0 }
const side2: SideBekreft = { spelarIds: [P2_ID], baseScore: 0 }
const NO_HCP = { hcp1: 0, hcp2: 0 }

describe('buildKampSpelarUpdates — Singel', () => {
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
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: false })
      expect(res.get(P1_ID)?.score_poeng).toBe(16)   // 6 + 4 + 6
      expect(res.get(P1_ID)?.antall_ringer).toBe(5)  // 2 + 1 + 2
      expect(res.get(P2_ID)?.score_poeng).toBe(9)    // 3 + 4 + 2
      expect(res.get(P2_ID)?.antall_ringer).toBe(2)  // 1 + 1 + 0
    })

    it('treats null score and null antall_ringer as 0, not NaN', () => {
      const omgData = [row(P1_ID, null, null), row(P2_ID, null, null)]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: false })
      expect(res.get(P1_ID)?.score_poeng).toBe(0)
      expect(res.get(P1_ID)?.antall_ringer).toBe(0)
      expect(Number.isNaN(res.get(P1_ID)?.score_poeng)).toBe(false)
      expect(Number.isNaN(res.get(P1_ID)?.antall_ringer)).toBe(false)
    })

    it('falls back to baseScore when omgData is empty', () => {
      const res = buildKampSpelarUpdates({
        omgData: [],
        side1: { spelarIds: [P1_ID], baseScore: 15 },
        side2: { spelarIds: [P2_ID], baseScore: 10 },
        ...NO_HCP,
        erWalkover: false,
      })
      expect(res.get(P1_ID)?.score_poeng).toBe(15)
      expect(res.get(P2_ID)?.score_poeng).toBe(10)
      expect(res.get(P1_ID)?.antall_ringer).toBe(0)
      expect(res.get(P2_ID)?.antall_ringer).toBe(0)
    })

    it('does NOT add HCP to a directly-entered baseScore — baseScore is already the final value', () => {
      // Regression: HCP was previously added unconditionally, causing double-counting
      // when a score was set directly (no scoreboard rounds).
      const res = buildKampSpelarUpdates({
        omgData: [],
        side1: { spelarIds: [P1_ID], baseScore: 23 },
        side2: { spelarIds: [P2_ID], baseScore: 10 },
        hcp1: 8, hcp2: 0, erWalkover: false,
      })
      expect(res.get(P1_ID)?.score_poeng).toBe(23)  // NOT 31
      expect(res.get(P2_ID)?.score_poeng).toBe(10)
    })
  })

  describe('HCP', () => {
    it('HCP adds to score_poeng but not antall_ringer', () => {
      const omgData = [row(P1_ID, 6, 2), row(P2_ID, 4, 1)]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, hcp1: 3, hcp2: 5, erWalkover: false })
      expect(res.get(P1_ID)?.score_poeng).toBe(9)    // 6 + 3
      expect(res.get(P1_ID)?.antall_ringer).toBe(2)  // unchanged
      expect(res.get(P2_ID)?.score_poeng).toBe(9)    // 4 + 5
      expect(res.get(P2_ID)?.antall_ringer).toBe(1)  // unchanged
    })

    it('HCP-boosted score determines kamp_poeng — lower raw score can still win', () => {
      // Without HCP: p1=4, p2=6 → p2 leads. With HCP: p1=4+5=9 → p1 wins.
      const omgData = [row(P1_ID, 4, 1), row(P2_ID, 6, 2)]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, hcp1: 5, hcp2: 0, erWalkover: false })
      expect(res.get(P1_ID)?.score_poeng).toBe(9)
      expect(res.get(P1_ID)?.kamp_poeng).toBe(2)
      expect(res.get(P2_ID)?.score_poeng).toBe(6)
      expect(res.get(P2_ID)?.kamp_poeng).toBe(0) // t2=6 < 11 → 0 pts
    })
  })

  describe('walkover', () => {
    it('p1 gets score_poeng=21 kamp_poeng=2 antall_ringer=0', () => {
      const res = buildKampSpelarUpdates({ omgData: [], side1, side2, ...NO_HCP, erWalkover: true })
      expect(res.get(P1_ID)).toEqual({ score_poeng: 21, kamp_poeng: 2, antall_ringer: 0 })
    })

    it('p2 gets score_poeng=0 kamp_poeng=0 antall_ringer=0', () => {
      const res = buildKampSpelarUpdates({ omgData: [], side1, side2, ...NO_HCP, erWalkover: true })
      expect(res.get(P2_ID)).toEqual({ score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
    })

    it('ignores omgData when erWalkover is true', () => {
      const omgData = [row(P1_ID, 3, 1), row(P2_ID, 4, 1)]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: true })
      expect(res.get(P1_ID)?.score_poeng).toBe(21)
      expect(res.get(P2_ID)?.score_poeng).toBe(0)
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
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: false })
      expect(res.get(P1_ID)?.kamp_poeng).toBe(2)
      expect(res.get(P2_ID)?.kamp_poeng).toBe(1)
    })

    it('p1 wins: [2, 0] when loser score < 11', () => {
      // p1: 6+6=12, p2: 4+4=8 (8 < 11 → p2 gets 0 pts)
      const omgData = [
        row(P1_ID, 6, 2), row(P2_ID, 4, 1),
        row(P1_ID, 6, 2), row(P2_ID, 4, 1),
      ]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: false })
      expect(res.get(P1_ID)?.kamp_poeng).toBe(2)
      expect(res.get(P2_ID)?.kamp_poeng).toBe(0)
    })

    it('tie: both get kamp_poeng=1.5', () => {
      // p1: 6+6=12, p2: 6+6=12
      const omgData = [
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
        row(P1_ID, 6, 2), row(P2_ID, 6, 2),
      ]
      const res = buildKampSpelarUpdates({ omgData, side1, side2, ...NO_HCP, erWalkover: false })
      expect(res.get(P1_ID)?.kamp_poeng).toBe(1.5)
      expect(res.get(P2_ID)?.kamp_poeng).toBe(1.5)
    })
  })

  describe('null side', () => {
    it('produces no entries for the null side, entries for the other', () => {
      const res = buildKampSpelarUpdates({ omgData: [], side1, side2: null, ...NO_HCP, erWalkover: false })
      expect(res.has(P2_ID)).toBe(false)
      expect(res.get(P1_ID)).not.toBeUndefined()
    })
  })
})

// ── Par/Mix: members alternate omgangar — per-player scores, side-level kamp_poeng ──

describe('buildKampSpelarUpdates — Par/Mix', () => {
  // posisjon 1 throws odd omgangar, posisjon 2 even
  const A1 = 101, A2 = 102  // pair A: posisjon 1, posisjon 2
  const B1 = 201, B2 = 202  // pair B
  const parA: SideBekreft = { spelarIds: [A1, A2], baseScore: 0 }
  const parB: SideBekreft = { spelarIds: [B1, B2], baseScore: 0 }

  // Side A total: 6+3+4+6+2+1 = 22, side B total: 4+6+2+1+6+2 = 21
  const omgData = [
    row(A1, 6, 2), row(B1, 4, 1),  // omgang 1 (posisjon 1)
    row(A2, 3, 1), row(B2, 6, 2),  // omgang 2 (posisjon 2)
    row(A1, 4, 1), row(B1, 2, 0),  // omgang 3
    row(A2, 6, 2), row(B2, 1, 0),  // omgang 4
    row(A1, 2, 0), row(B1, 6, 2),  // omgang 5
    row(A2, 1, 0), row(B2, 2, 0),  // omgang 6
  ]

  it('each player gets score_poeng and antall_ringer from their OWN omgangar only', () => {
    const res = buildKampSpelarUpdates({ omgData, side1: parA, side2: parB, ...NO_HCP, erWalkover: false })
    expect(res.get(A1)?.score_poeng).toBe(12)   // 6 + 4 + 2
    expect(res.get(A1)?.antall_ringer).toBe(3)  // 2 + 1 + 0
    expect(res.get(A2)?.score_poeng).toBe(10)   // 3 + 6 + 1
    expect(res.get(A2)?.antall_ringer).toBe(3)  // 1 + 2 + 0
    expect(res.get(B1)?.score_poeng).toBe(12)   // 4 + 2 + 6
    expect(res.get(B1)?.antall_ringer).toBe(3)  // 1 + 0 + 2
    expect(res.get(B2)?.score_poeng).toBe(9)    // 6 + 1 + 2
    expect(res.get(B2)?.antall_ringer).toBe(2)  // 2 + 0 + 0
  })

  it('kamp_poeng comes from SIDE totals and is identical for both members', () => {
    // 22 vs 21 → [2, 1] (loser >= 11)
    const res = buildKampSpelarUpdates({ omgData, side1: parA, side2: parB, ...NO_HCP, erWalkover: false })
    expect(res.get(A1)?.kamp_poeng).toBe(2)
    expect(res.get(A2)?.kamp_poeng).toBe(2)
    expect(res.get(B1)?.kamp_poeng).toBe(1)
    expect(res.get(B2)?.kamp_poeng).toBe(1)
  })

  it('side HCP lands on the rep only, so the side sum counts it exactly once', () => {
    const res = buildKampSpelarUpdates({ omgData, side1: parA, side2: parB, hcp1: 3, hcp2: 0, erWalkover: false })
    expect(res.get(A1)?.score_poeng).toBe(15)  // 12 + 3
    expect(res.get(A2)?.score_poeng).toBe(10)  // unchanged
  })

  it('walkover: rep gets 21, partner 0, both get kamp_poeng=2', () => {
    const res = buildKampSpelarUpdates({ omgData: [], side1: parA, side2: null, ...NO_HCP, erWalkover: true })
    expect(res.get(A1)).toEqual({ score_poeng: 21, kamp_poeng: 2, antall_ringer: 0 })
    expect(res.get(A2)).toEqual({ score_poeng: 0, kamp_poeng: 2, antall_ringer: 0 })
  })

  it('quick-score fallback: side total on the rep, partner 0, kamp_poeng for all', () => {
    const res = buildKampSpelarUpdates({
      omgData: [],
      side1: { spelarIds: [A1, A2], baseScore: 23 },
      side2: { spelarIds: [B1, B2], baseScore: 12 },
      ...NO_HCP,
      erWalkover: false,
    })
    expect(res.get(A1)?.score_poeng).toBe(23)
    expect(res.get(A2)?.score_poeng).toBe(0)
    expect(res.get(B1)?.score_poeng).toBe(12)
    expect(res.get(B2)?.score_poeng).toBe(0)
    expect(res.get(A1)?.kamp_poeng).toBe(2)   // 23 vs 12
    expect(res.get(A2)?.kamp_poeng).toBe(2)
    expect(res.get(B1)?.kamp_poeng).toBe(1)   // 12 >= 11
    expect(res.get(B2)?.kamp_poeng).toBe(1)
  })

  it('a Par side draws against a Singel side on equal side totals', () => {
    // Mixed shape is not a real tournament case but proves side-total logic:
    // pair 6+6=12 vs single 6+6=12 → 1.5 each
    const S1 = 301
    const data = [
      row(A1, 6, 2), row(S1, 6, 2),
      row(A2, 6, 2), row(S1, 6, 2),
    ]
    const res = buildKampSpelarUpdates({ omgData: data, side1: parA, side2: { spelarIds: [S1], baseScore: 0 }, ...NO_HCP, erWalkover: false })
    expect(res.get(A1)?.kamp_poeng).toBe(1.5)
    expect(res.get(A2)?.kamp_poeng).toBe(1.5)
    expect(res.get(S1)?.kamp_poeng).toBe(1.5)
    expect(res.get(S1)?.score_poeng).toBe(12)
  })
})
