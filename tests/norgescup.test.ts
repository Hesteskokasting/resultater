import { byggSingelListe, byggLagListe } from '@/utils/norgescup'
import type { ResultatMedRelasjonar, StevneForNc } from '@/utils/norgescup'
import type { Tables } from '@/types'

type Regler = Tables<'antallTellendeNc'>

// ── Factories ─────────────────────────────────────────────────────────────────

const NO_CAP = 9999

let nextId = 1

function mkRes(
  kasterid: number,
  stevneid: number,
  ncPoeng: number,
  klasse: 'Klasse 1' | 'Klasse 2' = 'Klasse 1',
  klubbid = 10,
  klubbNavn = 'Klubb A'
): ResultatMedRelasjonar {
  return {
    id: nextId++,
    kasterid,
    stevneid,
    nc_poeng: ncPoeng,
    plassering: null,
    klubbid,
    klasseid: 1,
    kaster: { id: kasterid, fornavn: `F${kasterid}`, etternavn: `E${kasterid}` },
    klubb: { id: klubbid, navn: klubbNavn },
    klasse: { id: 1, navn: klasse },
  } as ResultatMedRelasjonar
}

function mkStevne(id: number, typeNavn: 'NC' | 'SNC' | 'DNC'): StevneForNc {
  return {
    id,
    navn: `Stevne ${id}`,
    dato: `2025-01-${String(id).padStart(2, '0')}`,
    stevnetype: { id, navn: typeNavn },
  } as StevneForNc
}

function mkRegler(overrides: Partial<Regler> = {}): Regler {
  return {
    id: 1,
    year: 2025,
    max_nc_total: NO_CAP,
    max_snc_total: NO_CAP,
    max_dnc_total: NO_CAP,
    maxtotal: NO_CAP,
    max_snc: NO_CAP,
    max_dnc: NO_CAP,
    ...overrides,
  }
}

// stevner shared across many tests
const ncStevne1 = mkStevne(1, 'NC')
const ncStevne2 = mkStevne(2, 'NC')
const ncStevne3 = mkStevne(3, 'NC')
const sncStevne1 = mkStevne(4, 'SNC')
const sncStevne2 = mkStevne(5, 'SNC')
const dncStevne1 = mkStevne(6, 'DNC')
const dncStevne2 = mkStevne(7, 'DNC')
const allStevner = [ncStevne1, ncStevne2, ncStevne3, sncStevne1, sncStevne2, dncStevne1, dncStevne2]

// ── byggSingelListe ───────────────────────────────────────────────────────────

describe('byggSingelListe', () => {
  describe('NC event capping (max_nc_total)', () => {
    it('counts only the best N NC events when player has more than max_nc_total', () => {
      // 3 NC results: 100, 80, 60. With max_nc_total=2, only 100+80=180 should count.
      const resultater = [
        mkRes(1, 1, 100),
        mkRes(1, 2, 80),
        mkRes(1, 3, 60),
      ]
      const regler = mkRegler({ max_nc_total: 2, maxtotal: 99 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste[0].totalPoeng).toBe(180)
    })
  })

  describe('SNC event capping (max_snc_total)', () => {
    it('counts only the best N SNC events when player has more than max_snc_total', () => {
      const resultater = [
        mkRes(1, 4, 100),
        mkRes(1, 5, 60),
      ]
      const regler = mkRegler({ max_snc_total: 1, maxtotal: 99 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste[0].totalPoeng).toBe(100)
    })
  })

  describe('DNC event capping (max_dnc_total)', () => {
    it('counts only the best N DNC events when player has more than max_dnc_total', () => {
      const resultater = [
        mkRes(1, 6, 100),
        mkRes(1, 7, 60),
      ]
      const regler = mkRegler({ max_dnc_total: 1, maxtotal: 99 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste[0].totalPoeng).toBe(100)
    })
  })

  describe('maxtotal cap', () => {
    it('caps the number of counting results across all event types at maxtotal', () => {
      // 2 NC events (50+40) + 2 SNC events (30+20) = 140 uncapped.
      // With maxtotal=3, only top 3 count: 50+40+30=120.
      const resultater = [
        mkRes(1, 1, 50),
        mkRes(1, 2, 40),
        mkRes(1, 4, 30),
        mkRes(1, 5, 20),
      ]
      const regler = mkRegler({ max_nc_total: 99, max_snc_total: 99, maxtotal: 3 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste[0].totalPoeng).toBe(120)
    })
  })

  describe('class filtering', () => {
    it('only includes results from the requested class', () => {
      const resultater = [
        mkRes(1, 1, 100, 'Klasse 1'),
        mkRes(1, 2, 80, 'Klasse 2'),
      ]
      const regler = mkRegler()
      const listeK1 = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(listeK1[0].totalPoeng).toBe(100)

      const listeK2 = byggSingelListe(resultater, allStevner, regler, 'NC', 2)
      expect(listeK2[0].totalPoeng).toBe(80)
    })
  })

  describe('sorting', () => {
    it('returns players sorted by totalPoeng descending', () => {
      const resultater = [
        mkRes(1, 1, 50),
        mkRes(2, 2, 80),
        mkRes(3, 3, 30),
      ]
      const regler = mkRegler()
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste.map(r => r.totalPoeng)).toEqual([80, 50, 30])
    })
  })

  describe('tie placement', () => {
    it('assigns the same plassering to players with equal totalPoeng', () => {
      const resultater = [
        mkRes(1, 1, 100),
        mkRes(2, 2, 100),
        mkRes(3, 3, 80),
      ]
      const regler = mkRegler()
      const liste = byggSingelListe(resultater, allStevner, regler, 'NC', 1)
      expect(liste[0].plassering).toBe(1)
      expect(liste[1].plassering).toBe(1)
      expect(liste[2].plassering).toBe(3)
    })
  })

  describe('SNC cup type', () => {
    it('only counts SNC events when cupType is SNC', () => {
      const resultater = [
        mkRes(1, 1, 200),  // NC event — should be ignored
        mkRes(1, 4, 50),   // SNC event — should count
      ]
      const regler = mkRegler({ max_snc: 99 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'SNC', 1)
      expect(liste[0].totalPoeng).toBe(50)
    })
  })

  describe('DNC cup type', () => {
    it('only counts DNC events when cupType is DNC', () => {
      const resultater = [
        mkRes(1, 1, 200),  // NC event — should be ignored
        mkRes(1, 6, 70),   // DNC event — should count
      ]
      const regler = mkRegler({ max_dnc: 99 })
      const liste = byggSingelListe(resultater, allStevner, regler, 'DNC', 1)
      expect(liste[0].totalPoeng).toBe(70)
    })
  })
})

// ── byggLagListe ──────────────────────────────────────────────────────────────

describe('byggLagListe', () => {
  describe('top-4 contributor cap', () => {
    it('only counts the top 4 contributors when a club has more than 4 kasters', () => {
      // Club A has 5 kasters: 100, 80, 60, 40, 20. Top 4 = 280.
      const resultater = [1, 2, 3, 4, 5].map((kid, i) =>
        mkRes(kid, 1, [100, 80, 60, 40, 20][i], 'Klasse 1', 10, 'Klubb A')
      )
      const regler = mkRegler({ max_nc_total: 99, maxtotal: 99 })
      const liste = byggLagListe(resultater, [ncStevne1], regler)
      expect(liste[0].lagTotal).toBe(280)
      expect(liste[0].bidragsytere).toHaveLength(4)
    })
  })

  describe('sorting', () => {
    it('returns clubs sorted by lagTotal descending', () => {
      const resultater = [
        mkRes(1, 1, 100, 'Klasse 1', 10, 'Klubb A'),
        mkRes(2, 1, 200, 'Klasse 1', 20, 'Klubb B'),
      ]
      const regler = mkRegler()
      const liste = byggLagListe(resultater, [ncStevne1], regler)
      expect(liste[0].klubb.navn).toBe('Klubb B')
      expect(liste[1].klubb.navn).toBe('Klubb A')
    })
  })

  describe('tie placement', () => {
    it('assigns the same plassering to teams with equal lagTotal', () => {
      const resultater = [
        mkRes(1, 1, 100, 'Klasse 1', 10, 'Klubb A'),
        mkRes(2, 1, 100, 'Klasse 1', 20, 'Klubb B'),
        mkRes(3, 1, 60, 'Klasse 1', 30, 'Klubb C'),
      ]
      const regler = mkRegler()
      const liste = byggLagListe(resultater, [ncStevne1], regler)
      expect(liste[0].plassering).toBe(1)
      expect(liste[1].plassering).toBe(1)
      expect(liste[2].plassering).toBe(3)
    })
  })

  describe('class filtering', () => {
    it('only includes Klasse 1 results in team rankings', () => {
      // Klasse 2 result has higher points but should be ignored
      const resultater = [
        mkRes(1, 1, 50, 'Klasse 1', 10, 'Klubb A'),
        mkRes(2, 1, 200, 'Klasse 2', 10, 'Klubb A'),
      ]
      const regler = mkRegler()
      const liste = byggLagListe(resultater, [ncStevne1], regler)
      expect(liste[0].lagTotal).toBe(50)
    })
  })
})
