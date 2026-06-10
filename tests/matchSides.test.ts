import { getMatchSides, groupStandingsByPair } from '@/utils/kamp'

// ── getMatchSides ─────────────────────────────────────────────────────────────

describe('getMatchSides', () => {
  describe('Singel', () => {
    it('orders the two sides by startnummer, one member each', () => {
      const spelarar = [{ kasterid: 10 }, { kasterid: 20 }]
      const [side1, side2] = getMatchSides(spelarar, { 10: 2, 20: 1 })
      expect(side1?.rep.kasterid).toBe(20)
      expect(side2?.rep.kasterid).toBe(10)
      expect(side1?.members).toHaveLength(1)
      expect(side2?.members).toHaveLength(1)
    })

    it('returns [side, null] for a walkover with one player', () => {
      const [side1, side2] = getMatchSides([{ kasterid: 7 }], { 7: 3 })
      expect(side1?.rep.kasterid).toBe(7)
      expect(side2).toBeNull()
    })

    it('returns [null, null] for empty or missing spelarar', () => {
      expect(getMatchSides([], {})).toEqual([null, null])
      expect(getMatchSides(null, {})).toEqual([null, null])
    })

    it('keeps original order for players without startnummer', () => {
      const spelarar = [{ kasterid: 5 }, { kasterid: 3 }]
      const [side1, side2] = getMatchSides(spelarar, {})
      expect(side1?.rep.kasterid).toBe(5)
      expect(side2?.rep.kasterid).toBe(3)
    })
  })

  describe('Par/Mix', () => {
    const spelarar = [{ kasterid: 4 }, { kasterid: 1 }, { kasterid: 3 }, { kasterid: 2 }]
    const startnrMap = { 1: 1, 2: 1, 3: 2, 4: 2 }

    it('groups four players into two sides by shared startnummer', () => {
      const [side1, side2] = getMatchSides(spelarar, startnrMap)
      expect(side1?.members.map(m => m.kasterid)).toEqual([1, 2])
      expect(side2?.members.map(m => m.kasterid)).toEqual([3, 4])
    })

    it('orders members by posisjon and picks posisjon 1 as rep', () => {
      const posisjonMap = { 1: 2, 2: 1, 3: 2, 4: 1 }
      const [side1, side2] = getMatchSides(spelarar, startnrMap, posisjonMap)
      expect(side1?.members.map(m => m.kasterid)).toEqual([2, 1])
      expect(side1?.rep.kasterid).toBe(2)
      expect(side2?.rep.kasterid).toBe(4)
    })

    it('falls back to kasterid order when posisjon is missing', () => {
      const [side1] = getMatchSides(spelarar, startnrMap)
      expect(side1?.rep.kasterid).toBe(1)
    })

    it('returns the bye pair as one side in a Par walkover', () => {
      const [side1, side2] = getMatchSides(
        [{ kasterid: 1 }, { kasterid: 2 }],
        { 1: 1, 2: 1 },
      )
      expect(side1?.members.map(m => m.kasterid)).toEqual([1, 2])
      expect(side2).toBeNull()
    })
  })
})

// ── groupStandingsByPair ──────────────────────────────────────────────────────

describe('groupStandingsByPair', () => {
  it('passes Singel rows through unchanged', () => {
    const rows = [
      { kasterid: 1, navn: 'Anna B', startnummer: 1, kamp_poeng: 2 },
      { kasterid: 2, navn: 'Ola N', startnummer: 2, kamp_poeng: 0 },
    ]
    expect(groupStandingsByPair(rows)).toEqual(rows)
  })

  it('collapses pair members into one row with joined names', () => {
    const rows = [
      { kasterid: 1, navn: 'Anna B', startnummer: 1, kamp_poeng: 2, score_poeng: 21 },
      { kasterid: 2, navn: 'Ola N', startnummer: 1, kamp_poeng: 2, score_poeng: 21 },
      { kasterid: 3, navn: 'Kari S', startnummer: 2, kamp_poeng: 0, score_poeng: 9 },
      { kasterid: 4, navn: 'Per H', startnummer: 2, kamp_poeng: 0, score_poeng: 9 },
    ]
    const grouped = groupStandingsByPair(rows, { 1: 1, 2: 2, 3: 1, 4: 2 })
    expect(grouped).toHaveLength(2)
    expect(grouped[0]).toMatchObject({ kasterid: 1, navn: 'Anna B / Ola N', kamp_poeng: 2, score_poeng: 21 })
    expect(grouped[1]).toMatchObject({ kasterid: 3, navn: 'Kari S / Per H' })
  })

  it('keeps the posisjon-1 member as the row identity', () => {
    const rows = [
      { kasterid: 1, navn: 'Anna B', startnummer: 1 },
      { kasterid: 2, navn: 'Ola N', startnummer: 1 },
    ]
    const grouped = groupStandingsByPair(rows, { 1: 2, 2: 1 })
    expect(grouped[0].kasterid).toBe(2)
    expect(grouped[0].navn).toBe('Ola N / Anna B')
  })

  it('keeps rows without startnummer as their own rows', () => {
    const rows = [
      { kasterid: 1, navn: 'Anna B', startnummer: null },
      { kasterid: 2, navn: 'Ola N', startnummer: null },
    ]
    expect(groupStandingsByPair(rows)).toHaveLength(2)
  })
})
