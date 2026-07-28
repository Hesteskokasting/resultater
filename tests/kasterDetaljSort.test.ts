import { sortResults, type ResultSort } from '@/utils/kasterDetaljLogikk'

// Minimal rows matching the shape sortResults needs (ResultDetailRow satisfies it too).
function row(plassering: number | null, dato: string | null) {
  return { plassering, stevne: dato === null ? null : { dato } }
}

function placements(rows: ReturnType<typeof row>[], sort: ResultSort): (number | null)[] {
  return sortResults(rows, sort).map(r => r.plassering)
}

function dates(rows: ReturnType<typeof row>[], sort: ResultSort): (string | null)[] {
  return sortResults(rows, sort).map(r => r.stevne?.dato ?? null)
}

describe('sortResults', () => {
  describe('dato', () => {
    const rows = [
      row(1, '2024-05-10'),
      row(2, '2026-06-28'),
      row(3, '2025-09-07'),
    ]

    it('sorts descending (newest first) — the default', () => {
      expect(dates(rows, { column: 'dato', direction: 'desc' }))
        .toEqual(['2026-06-28', '2025-09-07', '2024-05-10'])
    })

    it('sorts ascending (oldest first)', () => {
      expect(dates(rows, { column: 'dato', direction: 'asc' }))
        .toEqual(['2024-05-10', '2025-09-07', '2026-06-28'])
    })
  })

  describe('plassering', () => {
    it('ascending puts best (1) first', () => {
      const rows = [row(35, '2025-05-30'), row(9, '2025-06-21'), row(24, '2025-06-22')]
      expect(placements(rows, { column: 'plassering', direction: 'asc' }))
        .toEqual([9, 24, 35])
    })

    it('descending puts worst first', () => {
      const rows = [row(35, '2025-05-30'), row(9, '2025-06-21'), row(24, '2025-06-22')]
      expect(placements(rows, { column: 'plassering', direction: 'desc' }))
        .toEqual([35, 24, 9])
    })

    it('sinks missing placement to the bottom when ascending', () => {
      const rows = [row(null, '2026-06-26'), row(28, '2026-06-28'), row(52, '2026-06-27')]
      expect(placements(rows, { column: 'plassering', direction: 'asc' }))
        .toEqual([28, 52, null])
    })

    it('sinks missing placement to the bottom when descending too', () => {
      const rows = [row(null, '2026-06-26'), row(28, '2026-06-28'), row(52, '2026-06-27')]
      expect(placements(rows, { column: 'plassering', direction: 'desc' }))
        .toEqual([52, 28, null])
    })

    it('keeps multiple missing placements at the bottom', () => {
      const rows = [row(null, '2026-06-03'), row(36, '2026-05-31'), row(null, '2026-05-09')]
      expect(placements(rows, { column: 'plassering', direction: 'asc' }))
        .toEqual([36, null, null])
    })
  })

  it('does not mutate the input array', () => {
    const rows = [row(3, '2024-01-01'), row(1, '2025-01-01')]
    const before = [...rows]
    sortResults(rows, { column: 'plassering', direction: 'asc' })
    expect(rows).toEqual(before)
  })
})
