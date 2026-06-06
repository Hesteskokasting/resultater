import { sorterStilling, type StillingRad, type KampForSortering } from '@/organizer/org-shared'

function p(kasterid: number, overrides: Partial<StillingRad> = {}): StillingRad {
  return { kasterid, ...overrides }
}

function confirmedMatch(spelarar: { kasterid: number; kamp_poeng: number; score_poeng?: number }[]): KampForSortering {
  return { er_bekreftet: true, spelarar }
}

function unconfirmedMatch(spelarar: { kasterid: number; kamp_poeng: number; score_poeng?: number }[]): KampForSortering {
  return { er_bekreftet: false, spelarar }
}

function ids(stilling: StillingRad[]): number[] {
  return stilling.map(s => s.kasterid)
}

describe('sorterStilling', () => {
  describe('final plassering', () => {
    it('puts player with plassering before player without', () => {
      const a = p(1, { plassering: 1 })
      const b = p(2)
      expect(ids(sorterStilling([b, a], []))).toEqual([1, 2])
    })

    it('sorts multiple placed players by plassering ascending', () => {
      const a = p(1, { plassering: 3 })
      const b = p(2, { plassering: 1 })
      const c = p(3, { plassering: 2 })
      expect(ids(sorterStilling([a, b, c], []))).toEqual([2, 3, 1])
    })
  })

  describe('active vs eliminated', () => {
    it('puts active player (runde_eliminert null) before eliminated', () => {
      const active    = p(1, { kamp_poeng: 0 })
      const eliminated = p(2, { kamp_poeng: 6, runde_eliminert: 3 })
      expect(ids(sorterStilling([eliminated, active], []))).toEqual([1, 2])
    })

    it('puts player eliminated in later round before one eliminated earlier', () => {
      const lateOut  = p(1, { runde_eliminert: 3 })
      const earlyOut = p(2, { runde_eliminert: 1 })
      expect(ids(sorterStilling([earlyOut, lateOut], []))).toEqual([1, 2])
    })
  })

  describe('kamp_poeng tiebreak', () => {
    it('puts player with more kamp_poeng first', () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 80 })
      const b = p(2, { kamp_poeng: 6, score_poeng: 60 })
      expect(ids(sorterStilling([a, b], []))).toEqual([2, 1])
    })
  })

  describe('score_poeng tiebreak', () => {
    it('puts player with more score_poeng first when kamp_poeng is equal', () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 60 })
      const b = p(2, { kamp_poeng: 4, score_poeng: 80 })
      expect(ids(sorterStilling([a, b], []))).toEqual([2, 1])
    })
  })

  describe('head-to-head tiebreak', () => {
    it('puts h2h winner first when overall kamp_poeng and score_poeng are equal', () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50 })
      const b = p(2, { kamp_poeng: 4, score_poeng: 50 })
      const h2h = confirmedMatch([
        { kasterid: 1, kamp_poeng: 2, score_poeng: 21 },
        { kasterid: 2, kamp_poeng: 0, score_poeng: 10 },
      ])
      expect(ids(sorterStilling([b, a], [h2h]))).toEqual([1, 2])
    })

    it('ignores unconfirmed matches', () => {
      // b would win h2h if the match were confirmed, but it isn't
      const a = p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 })
      const b = p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 2 })
      const unconfirmed = unconfirmedMatch([
        { kasterid: 1, kamp_poeng: 0, score_poeng: 10 },
        { kasterid: 2, kamp_poeng: 2, score_poeng: 21 },
      ])
      // falls through to start number → a (startnummer 1) wins
      expect(ids(sorterStilling([b, a], [unconfirmed]))).toEqual([1, 2])
    })
  })

  describe('max single-match score tiebreak', () => {
    it('puts player with higher best match score first after h2h tie', () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50 })
      const b = p(2, { kamp_poeng: 4, score_poeng: 50 })
      // h2h tied
      const h2h = confirmedMatch([
        { kasterid: 1, kamp_poeng: 1.5, score_poeng: 21 },
        { kasterid: 2, kamp_poeng: 1.5, score_poeng: 21 },
      ])
      // a has a better individual match score elsewhere
      const matchA = confirmedMatch([{ kasterid: 1, kamp_poeng: 2, score_poeng: 25 }])
      const matchB = confirmedMatch([{ kasterid: 2, kamp_poeng: 2, score_poeng: 20 }])
      expect(ids(sorterStilling([b, a], [h2h, matchA, matchB]))).toEqual([1, 2])
    })
  })

  describe('start number tiebreak', () => {
    it('puts player with lower start number first when everything else is equal', () => {
      const a = p(1, { kamp_poeng: 4, score_poeng: 50, startnummer: 3 })
      const b = p(2, { kamp_poeng: 4, score_poeng: 50, startnummer: 1 })
      expect(ids(sorterStilling([a, b], []))).toEqual([2, 1])
    })
  })

  describe('does not mutate input', () => {
    it('returns a new array without modifying the original', () => {
      const a = p(1, { kamp_poeng: 2 })
      const b = p(2, { kamp_poeng: 6 })
      const original = [a, b]
      sorterStilling(original, [])
      expect(original).toEqual([a, b])
    })
  })
})
