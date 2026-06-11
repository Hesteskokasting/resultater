import { formaterDato } from '@/utils/shared'
import type { ResultatDetaljRow } from '@/services/kasterService'

// ── Konstanter ────────────────────────────────────────────────────────────────

export const FOERSTE_RING_AR = 2017
const MAX_RING = { kongelag: 40, minimatch: 60, halvmatch: 100, heilmatch: 200 } as const
export type MetodeNamn = keyof typeof MAX_RING

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

export function hentAr(datoStr: string | null | undefined): number | null {
  return datoStr ? parseInt(datoStr.substring(0, 4)) : null
}

function snitt(tal: number[]): number | null {
  if (!tal.length) return null
  return Math.round(tal.reduce((s, t) => s + t, 0) / tal.length)
}

// ── Statistikk-reknereglar ────────────────────────────────────────────────────

function harMetode(r: ResultatDetaljRow, metode: string): boolean {
  const innled = (r.stevne?.innledendekastemetode?.navn ?? '').toLowerCase()
  const avsl   = (r.stevne?.avsluttendekastemetode?.navn ?? '').toLowerCase()
  return innled === metode || avsl === metode
}

export function beregnStatistikk(resultater: ResultatDetaljRow[]) {
  const kategoriar = [
    {
      label:   'Kongelag',
      rader:   resultater.filter(r => r.poeng_kongelag != null),
      poengFn: (r: ResultatDetaljRow) => r.poeng_kongelag as number,
      ringFn:  (r: ResultatDetaljRow) => r.antall_ring_kongelag,
      maxRing: MAX_RING.kongelag,
    },
    {
      label:   'Minimatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && harMetode(r, 'minimatch')),
      poengFn: (r: ResultatDetaljRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultatDetaljRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.minimatch,
    },
    {
      label:   'Halvmatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && harMetode(r, 'halvmatch')),
      poengFn: (r: ResultatDetaljRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultatDetaljRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.halvmatch,
    },
    {
      label:   'Heilmatch',
      rader:   resultater.filter(r => r.poeng_xkast != null && harMetode(r, 'heilmatch')),
      poengFn: (r: ResultatDetaljRow) => r.poeng_xkast as number,
      ringFn:  (r: ResultatDetaljRow) => r.antall_ring_xkast,
      maxRing: MAX_RING.heilmatch,
    },
  ]

  return kategoriar.map(({ label, rader, poengFn, ringFn, maxRing }) => {
    const rekord     = rader.length ? Math.max(...rader.map(r => poengFn(r))) : null
    const snittPoeng = snitt(rader.map(r => poengFn(r)))

    const ringFra2017 = rader.filter(
      r => ringFn(r) != null && (hentAr(r.stevne?.dato) ?? 0) >= FOERSTE_RING_AR
    )
    const snittProsent = ringFra2017.length
      ? Math.round(ringFra2017.reduce((s, r) => s + (ringFn(r) as number) / maxRing * 100, 0) / ringFra2017.length * 100) / 100
      : null

    return { label, rekord, snittPoeng, snittProsent }
  })
}

export function hentTidlegareKlubbar(resultater: ResultatDetaljRow[], noverandeKlubbId: number | null): string[] {
  const sett = new Map<number, string>()
  for (const r of resultater) {
    if (r.klubb?.id && r.klubb.id !== noverandeKlubbId) {
      sett.set(r.klubb.id, r.klubb.navn)
    }
  }
  return [...sett.values()]
}

// ── Graf-databygging ──────────────────────────────────────────────────────────

function beregnGrafVerdi(r: ResultatDetaljRow, metrikk: string, metode: MetodeNamn): number | null {
  if (metrikk === 'plassering') return r.plassering ?? null
  if (metode === 'kongelag') {
    return r.antall_ring_kongelag != null
      ? Math.round(r.antall_ring_kongelag / MAX_RING.kongelag * 10000) / 100
      : null
  }
  if (!harMetode(r, metode)) return null
  return r.antall_ring_xkast != null
    ? Math.round(r.antall_ring_xkast / MAX_RING[metode] * 10000) / 100
    : null
}

export function byggGrafData(
  resultater: ResultatDetaljRow[],
  metrikk: string,
  metode: MetodeNamn,
  fra: number | null,
  til: number | null,
) {
  const filtrert = [...resultater]
    .filter(r => {
      const ar = hentAr(r.stevne?.dato)
      if (fra && (ar ?? 0) < fra) return false
      if (til && (ar ?? 0) > til) return false
      return beregnGrafVerdi(r, metrikk, metode) != null
    })
    .sort((a, b) => (a.stevne?.dato ?? '').localeCompare(b.stevne?.dato ?? ''))

  return {
    labels:     filtrert.map(r => formaterDato(r.stevne?.dato)),
    stevneNamn: filtrert.map(r => r.stevne?.navn ?? ''),
    verdiar:    filtrert.map(r => beregnGrafVerdi(r, metrikk, metode)),
  }
}
