import { renderStillingTabell, type StillingRad, type OrgKamp } from '@/organizer/org-shared'

function parse(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.firstElementChild as HTMLElement
}

function player(kasterid: number, naam: string | null = null, overrides: Partial<StillingRad> = {}): StillingRad {
  return { kasterid, navn: naam ?? `Spelar ${kasterid}`, kamp_poeng: 0, score_poeng: 0, ...overrides }
}

const NO_KAMPER: OrgKamp[] = []
const NO_STARTNR: Record<number, number> = {}

describe('renderStillingTabell', () => {
  describe('wrapper and heading', () => {
    it('renders an h6 heading with "Stilling" by default', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR))
      expect(el.querySelector('h6')?.textContent).toBe('Stilling')
    })

    it('heading shows "N spelarar" when harAntallKamper is true', () => {
      const el = parse(renderStillingTabell([player(1), player(2)], NO_KAMPER, NO_STARTNR, { harAntallKamper: true }))
      expect(el.querySelector('h6')?.textContent).toBe('2 spelarar')
    })
  })

  describe('table identity', () => {
    it('table has the default id "stilling-tabell"', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR))
      expect(el.querySelector('table')?.id).toBe('stilling-tabell')
    })

    it('uses the tableId option when provided', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR, { tableId: 'my-tabell' }))
      expect(el.querySelector('table')?.id).toBe('my-tabell')
    })
  })

  describe('player rows', () => {
    it('renders one player row per stilling entry', () => {
      const el = parse(renderStillingTabell([player(1), player(2), player(3)], NO_KAMPER, NO_STARTNR))
      expect(el.querySelectorAll('tr.stilling-spelar-rad').length).toBe(3)
    })

    it('sets the correct data-kasterid on each player row', () => {
      const el = parse(renderStillingTabell([player(42), player(7)], NO_KAMPER, NO_STARTNR))
      const ids = [...el.querySelectorAll('tr.stilling-spelar-rad')].map(tr => tr.getAttribute('data-kasterid'))
      expect(ids).toEqual(['42', '7'])
    })

    it('shows the player name in the row', () => {
      const el = parse(renderStillingTabell([player(1, 'Ola Normann')], NO_KAMPER, NO_STARTNR))
      expect(el.querySelector('tr.stilling-spelar-rad')?.textContent).toContain('Ola Normann')
    })

    it('falls back to "Spelar N" when navn is null', () => {
      const el = parse(renderStillingTabell([{ kasterid: 5, navn: null }], NO_KAMPER, NO_STARTNR))
      expect(el.querySelector('tr.stilling-spelar-rad')?.textContent).toContain('Spelar 5')
    })

    it('# column shows sequential position within the group', () => {
      const el = parse(renderStillingTabell([player(1), player(2), player(3)], NO_KAMPER, NO_STARTNR))
      const positions = [...el.querySelectorAll('tr.stilling-spelar-rad')].map(tr => tr.querySelector('td')?.textContent)
      expect(positions).toEqual(['1', '2', '3'])
    })
  })

  describe('column headers', () => {
    it('always renders # NAMN KP SP headers', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR))
      const headers = [...el.querySelectorAll('thead th')].map(th => th.textContent)
      expect(headers).toContain('#')
      expect(headers).toContain('NAMN')
      expect(headers).toContain('KP')
      expect(headers).toContain('SP')
    })

    it('K header present when harAntallKamper is true', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR, { harAntallKamper: true }))
      const headers = [...el.querySelectorAll('thead th')].map(th => th.textContent)
      expect(headers).toContain('K')
    })

    it('K header absent by default', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR))
      const headers = [...el.querySelectorAll('thead th')].map(th => th.textContent)
      expect(headers).not.toContain('K')
    })

    it('HCP header present when harHcp is true', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR, { harHcp: true }))
      const headers = [...el.querySelectorAll('thead th')].map(th => th.textContent)
      expect(headers).toContain('HCP')
    })

    it('HCP header absent by default', () => {
      const el = parse(renderStillingTabell([player(1)], NO_KAMPER, NO_STARTNR))
      const headers = [...el.querySelectorAll('thead th')].map(th => th.textContent)
      expect(headers).not.toContain('HCP')
    })
  })

  describe('harEliminasjon', () => {
    it('adds avsl-elim-plass class to the # cell of eliminated players', () => {
      const stilling = [
        player(1, 'Aktiv'),
        player(2, 'Ute', { runde_eliminert: 2 }),
      ]
      const el = parse(renderStillingTabell(stilling, NO_KAMPER, NO_STARTNR, { harEliminasjon: true }))
      const rows = [...el.querySelectorAll('tr.stilling-spelar-rad')]
      expect(rows[0].querySelector('td')?.classList.contains('avsl-elim-plass')).toBe(false)
      expect(rows[1].querySelector('td')?.classList.contains('avsl-elim-plass')).toBe(true)
    })

    it('avsl-elim-plass is absent when harEliminasjon is false even for eliminated players', () => {
      const stilling = [player(1, 'Ute', { runde_eliminert: 2 })]
      const el = parse(renderStillingTabell(stilling, NO_KAMPER, NO_STARTNR, { harEliminasjon: false }))
      expect(el.querySelector('tr.stilling-spelar-rad td')?.classList.contains('avsl-elim-plass')).toBe(false)
    })
  })

  describe('harGrupper', () => {
    it('inserts a group header row for each named group', () => {
      const stilling = [
        player(1, 'P1', { gruppe: { navn: 'A' } }),
        player(2, 'P2', { gruppe: { navn: 'B' } }),
      ]
      const el = parse(renderStillingTabell(stilling, NO_KAMPER, NO_STARTNR, { harGrupper: true }))
      const groupHeaders = el.querySelectorAll('.fw-semibold')
      expect(groupHeaders.length).toBe(2)
      expect(groupHeaders[0].textContent).toBe('Gruppe A')
      expect(groupHeaders[1].textContent).toBe('Gruppe B')
    })

    it('resets position counter within each group', () => {
      const stilling = [
        player(1, 'A1', { gruppe: { navn: 'A' } }),
        player(2, 'A2', { gruppe: { navn: 'A' } }),
        player(3, 'B1', { gruppe: { navn: 'B' } }),
      ]
      const el = parse(renderStillingTabell(stilling, NO_KAMPER, NO_STARTNR, { harGrupper: true }))
      const rows = [...el.querySelectorAll('tr.stilling-spelar-rad')]
      const positions = rows.map(tr => tr.querySelector('td')?.textContent)
      expect(positions).toEqual(['1', '2', '1'])
    })
  })
})
