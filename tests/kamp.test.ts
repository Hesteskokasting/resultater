import { calcMatchPoints, scoreForPlayer, ringsForPlayer, calcRingCount } from '@/utils/kamp'

describe('calcMatchPoints', () => {
  describe('tie', () => {
    it('returns [1.5, 1.5] when scores are equal', () => {
      expect(calcMatchPoints(21, 21)).toEqual([1.5, 1.5])
    })

    it('returns [1.5, 1.5] when both scores are equal and above 21', () => {
      expect(calcMatchPoints(23, 23)).toEqual([1.5, 1.5])
    })
  })

  describe('s1 wins', () => {
    it('gives loser 1 point when loser score is exactly 11', () => {
      expect(calcMatchPoints(21, 11)).toEqual([2, 1])
    })

    it('gives loser 1 point when loser score is above 11', () => {
      expect(calcMatchPoints(25, 15)).toEqual([2, 1])
    })

    it('gives loser 0 points when loser score is exactly 10', () => {
      expect(calcMatchPoints(21, 10)).toEqual([2, 0])
    })

    it('gives loser 0 points when loser score is below 11', () => {
      expect(calcMatchPoints(21, 5)).toEqual([2, 0])
    })

    it('gives loser 0 points when loser score is 0', () => {
      expect(calcMatchPoints(21, 0)).toEqual([2, 0])
    })
  })

  describe('s2 wins', () => {
    it('gives loser 1 point when loser score is exactly 11', () => {
      expect(calcMatchPoints(11, 21)).toEqual([1, 2])
    })

    it('gives loser 1 point when loser score is above 11', () => {
      expect(calcMatchPoints(15, 25)).toEqual([1, 2])
    })

    it('gives loser 0 points when loser score is exactly 10', () => {
      expect(calcMatchPoints(10, 21)).toEqual([0, 2])
    })

    it('gives loser 0 points when loser score is below 11', () => {
      expect(calcMatchPoints(5, 21)).toEqual([0, 2])
    })

    it('gives loser 0 points when loser score is 0', () => {
      expect(calcMatchPoints(0, 21)).toEqual([0, 2])
    })
  })
})

describe('scoreForPlayer', () => {
  it('returns 0 for null', () => {
    expect(scoreForPlayer(null)).toBe(0)
  })

  it('returns 0 for undefined', () => {
    expect(scoreForPlayer(undefined)).toBe(0)
  })

  it('returns score_poeng when no omgangar', () => {
    expect(scoreForPlayer({ score_poeng: 21 })).toBe(21)
  })

  it('returns 0 when score_poeng is null and no omgangar', () => {
    expect(scoreForPlayer({ score_poeng: null })).toBe(0)
  })

  it('sums omgangar scores when omgangar is present', () => {
    expect(scoreForPlayer({ omgangar: [{ score: 6 }, { score: 4 }, { score: 3 }] })).toBe(13)
  })

  it('treats null omgang score as 0', () => {
    expect(scoreForPlayer({ omgangar: [{ score: 6 }, { score: null }] })).toBe(6)
  })

  it('prefers omgangar over score_poeng when both are present', () => {
    expect(scoreForPlayer({ score_poeng: 99, omgangar: [{ score: 6 }, { score: 4 }] })).toBe(10)
  })

  it('falls back to score_poeng when omgangar is an empty array', () => {
    expect(scoreForPlayer({ score_poeng: 21, omgangar: [] })).toBe(21)
  })
})

describe('ringsForPlayer', () => {
  it('returns 0 for null', () => {
    expect(ringsForPlayer(null)).toBe(0)
  })

  it('returns 0 for undefined', () => {
    expect(ringsForPlayer(undefined)).toBe(0)
  })

  it('returns antall_ringer when no omgangar', () => {
    expect(ringsForPlayer({ antall_ringer: 3 })).toBe(3)
  })

  it('returns 0 when antall_ringer is null and no omgangar', () => {
    expect(ringsForPlayer({ antall_ringer: null })).toBe(0)
  })

  it('sums omgangar rings when omgangar is present', () => {
    expect(ringsForPlayer({ omgangar: [{ antall_ringer: 2 }, { antall_ringer: 1 }] })).toBe(3)
  })

  it('treats null omgang ring count as 0', () => {
    expect(ringsForPlayer({ omgangar: [{ antall_ringer: 2 }, { antall_ringer: null }] })).toBe(2)
  })

  it('prefers omgangar over antall_ringer when both are present', () => {
    expect(ringsForPlayer({ antall_ringer: 99, omgangar: [{ antall_ringer: 1 }, { antall_ringer: 2 }] })).toBe(3)
  })

  it('falls back to antall_ringer when omgangar is an empty array', () => {
    expect(ringsForPlayer({ antall_ringer: 3, omgangar: [] })).toBe(3)
  })
})

describe('calcRingCount', () => {
  it('returns 2 rings for score 6', () => {
    expect(calcRingCount(6)).toBe(2)
  })

  it('returns 1 ring for score 4', () => {
    expect(calcRingCount(4)).toBe(1)
  })

  it('returns 1 ring for score 3', () => {
    expect(calcRingCount(3)).toBe(1)
  })

  it('returns 0 rings for score 2', () => {
    expect(calcRingCount(2)).toBe(0)
  })

  it('returns 0 rings for score 1', () => {
    expect(calcRingCount(1)).toBe(0)
  })

  it('returns 0 rings for score 0', () => {
    expect(calcRingCount(0)).toBe(0)
  })
})
