import { formatDate } from '@/utils/shared'
import type { ResultDetailRow } from '@/services/kasterService'

// ── Constants ─────────────────────────────────────────────────────────────────

export const FIRST_RING_YEAR = 2017
const MAX_RING = { kongelag: 40, minimatch: 60, halvmatch: 100, heilmatch: 200 } as const
export type MethodName = keyof typeof MAX_RING

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getYear(datoStr: string | null | undefined): number | null {
  return datoStr ? parseInt(datoStr.substring(0, 4)) : null
}

function average(vals: number[]): number | null {
  if (!vals.length) return null
  return Math.round(vals.reduce((s, t) => s + t, 0) / vals.length)
}

// ── Statistics ────────────────────────────────────────────────────────────────

function hasMethod(r: ResultDetailRow, metode: string): boolean {
  const innled = (r.stevne?.innledendekastemetode?.navn ?? '').toLowerCase()
  const avsl   = (r.stevne?.avsluttendekastemetode?.navn ?? '').toLowerCase()
  return innled === metode || avsl === metode
}

export function calcStatistics(resultater: ResultDetailRow[]) {
  const categories = [
    {
      label:   'Kongelag',
      rader:   resultater.filter(r => r.poeng_kongelag != null),
      poengFn: (r: ResultDetailRow) => r.poeng_kongelag as number,
      ringFn:  (r: ResultDetailRow) => r.antall_ring_kongelag,
      maxRing: MAX_RING.kongelag,
    },
    {
      label:   'Minimatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && hasMethod(r, 'minimatch')),
      poengFn: (r: ResultDetailRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultDetailRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.minimatch,
    },
    {
      label:   'Halvmatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && hasMethod(r, 'halvmatch')),
      poengFn: (r: ResultDetailRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultDetailRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.halvmatch,
    },
    {
      label:   'Heilmatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && hasMethod(r, 'heilmatch')),
      poengFn: (r: ResultDetailRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultDetailRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.heilmatch,
    },
  ]

  return categories.map(({ label, rader, poengFn, ringFn, maxRing }) => {
    const record    = rader.length ? Math.max(...rader.map(r => poengFn(r))) : null
    const avgPoints = average(rader.map(r => poengFn(r)))

    const ringFrom2017 = rader.filter(
      r => ringFn(r) != null && (getYear(r.stevne?.dato) ?? 0) >= FIRST_RING_YEAR
    )
    const avgPercent = ringFrom2017.length
      ? Math.round(ringFrom2017.reduce((s, r) => s + (ringFn(r) as number) / maxRing * 100, 0) / ringFrom2017.length * 100) / 100
      : null

    return { label, rekord: record, snittPoeng: avgPoints, snittProsent: avgPercent }
  })
}

export function getPreviousClubs(resultater: ResultDetailRow[], currentClubId: number | null): string[] {
  const seen = new Map<number, string>()
  for (const r of resultater) {
    if (r.klubb?.id && r.klubb.id !== currentClubId) {
      seen.set(r.klubb.id, r.klubb.navn)
    }
  }
  return [...seen.values()]
}

// ── Chart data ────────────────────────────────────────────────────────────────

function calcChartValue(r: ResultDetailRow, metric: string, method: MethodName): number | null {
  if (metric === 'plassering') return r.plassering ?? null
  if (method === 'kongelag') {
    return r.antall_ring_kongelag != null
      ? Math.round(r.antall_ring_kongelag / MAX_RING.kongelag * 10000) / 100
      : null
  }
  if (!hasMethod(r, method)) return null
  return r.antall_ring_xkast != null
    ? Math.round(r.antall_ring_xkast / MAX_RING[method] * 10000) / 100
    : null
}

export function buildChartData(
  resultater: ResultDetailRow[],
  metric: string,
  method: MethodName,
  fra: number | null,
  til: number | null,
) {
  const filtered = [...resultater]
    .filter(r => {
      const year = getYear(r.stevne?.dato)
      if (fra && (year ?? 0) < fra) return false
      if (til && (year ?? 0) > til) return false
      return calcChartValue(r, metric, method) != null
    })
    .sort((a, b) => (a.stevne?.dato ?? '').localeCompare(b.stevne?.dato ?? ''))

  return {
    labels:     filtered.map(r => formatDate(r.stevne?.dato)),
    stevneNamn: filtered.map(r => r.stevne?.navn ?? ''),
    verdiar:    filtered.map(r => calcChartValue(r, metric, method)),
  }
}
