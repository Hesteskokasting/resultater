import { beregnKampPoeng } from '@/utils/kamp'

describe('beregnKampPoeng', () => {
  describe('tie', () => {
    it('returns [1.5, 1.5] when scores are equal', () => {
      expect(beregnKampPoeng(21, 21)).toEqual([1.5, 1.5])
    })

  })

  describe('s1 wins', () => {
    it('gives loser 1 point when loser score is exactly 11', () => {
      expect(beregnKampPoeng(21, 11)).toEqual([2, 1])
    })

    it('gives loser 1 point when loser score is above 11', () => {
      expect(beregnKampPoeng(25, 15)).toEqual([2, 1])
    })

    it('gives loser 0 points when loser score is exactly 10', () => {
      expect(beregnKampPoeng(21, 10)).toEqual([2, 0])
    })

    it('gives loser 0 points when loser score is below 11', () => {
      expect(beregnKampPoeng(21, 5)).toEqual([2, 0])
    })

    it('gives loser 0 points when loser score is 0', () => {
      expect(beregnKampPoeng(21, 0)).toEqual([2, 0])
    })
  })

  describe('s2 wins', () => {
    it('gives loser 1 point when loser score is exactly 11', () => {
      expect(beregnKampPoeng(11, 21)).toEqual([1, 2])
    })

    it('gives loser 1 point when loser score is above 11', () => {
      expect(beregnKampPoeng(15, 25)).toEqual([1, 2])
    })

    it('gives loser 0 points when loser score is exactly 10', () => {
      expect(beregnKampPoeng(10, 21)).toEqual([0, 2])
    })

    it('gives loser 0 points when loser score is below 11', () => {
      expect(beregnKampPoeng(5, 21)).toEqual([0, 2])
    })

    it('gives loser 0 points when loser score is 0', () => {
      expect(beregnKampPoeng(0, 21)).toEqual([0, 2])
    })
  })
})
