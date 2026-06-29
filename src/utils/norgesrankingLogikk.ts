import { throwerName } from '@/utils/kaster'
import { assignPlacements } from '@/utils/tildelPlassering'
import type { RankingTournamentRow, RankingResultRow } from '@/services/norgesrankingService'

export const MIN_STEVNER = 5

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EventInfo {
  navn: string | null
  dato: string | null
  typeNamn: string
  innledMetode: string | null
  avslMetode: string | null
}

export interface RingInfo {
  prosent: number
  metodeNamn: string
  antallRing: number
  _stevne: EventInfo | undefined
}

export interface RankingItem {
  navn: string
  klubb: string
  antallStevner: number
  snittProsent: number
  erGyldig: boolean
  plassering?: number
  detaljRader: RingInfo[]
}

// ── Ranking algorithm ─────────────────────────────────────────────────────────

export function buildEventsMap(stevner: RankingTournamentRow[]): Map<number, EventInfo> {
  const m = new Map<number, EventInfo>()
  for (const s of stevner) {
    m.set(s.id, {
      navn: s.navn,
      dato: s.dato,
      typeNamn: s.stevnetype?.navn ?? '',
      innledMetode: s.innledendekastemetode?.navn ?? null,
      avslMetode: s.avsluttendekastemetode?.navn ?? null,
    })
  }
  return m
}

export function calcRingInfo(r: RankingResultRow, eventInfo: EventInfo | undefined): RingInfo[] {
  const innled = (eventInfo?.innledMetode ?? '').toLowerCase()
  const avsl = (eventInfo?.avslMetode ?? '').toLowerCase()
  const finn = (m: string) => innled === m || avsl === m
  const base = { _stevne: eventInfo }
  const liste: RingInfo[] = []

  if (r.antall_ring_xkast != null) {
    if (finn('minimatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast / 60 * 100, metodeNamn: 'Minimatch', antallRing: r.antall_ring_xkast })
    else if (finn('halvmatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast, metodeNamn: 'Halvmatch', antallRing: r.antall_ring_xkast })
    else if (finn('heilmatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast / 200 * 100, metodeNamn: 'Heilmatch', antallRing: r.antall_ring_xkast })
  }
  if (r.antall_ring_kongelag != null)
    liste.push({ ...base, prosent: r.antall_ring_kongelag / 40 * 100, metodeNamn: 'Kongelag', antallRing: r.antall_ring_kongelag })

  return liste
}

export function buildRankingList(resultater: RankingResultRow[], eventsMap: Map<number, EventInfo>): RankingItem[] {
  const kasterMap = new Map<number, { kaster: RankingResultRow['kaster']; klubb: RankingResultRow['klubb']; rader: RingInfo[] }>()

  for (const r of resultater) {
    if (r.kasterid == null) continue
    const ringInfoList = calcRingInfo(r, r.stevneid != null ? eventsMap.get(r.stevneid) : undefined)
    if (!ringInfoList.length) continue
    if (!kasterMap.has(r.kasterid)) {
      kasterMap.set(r.kasterid, { kaster: r.kaster, klubb: r.klubb, rader: [] })
    }
    for (const ringInfo of ringInfoList) {
      kasterMap.get(r.kasterid)!.rader.push(ringInfo)
    }
  }

  const valid: RankingItem[] = []
  const invalid: RankingItem[] = []

  for (const [, entry] of kasterMap) {
    const { rader } = entry
    const sorted = [...rader].sort((a, b) => b.prosent - a.prosent)
    const top5 = sorted.slice(0, MIN_STEVNER)
    const snittProsent = Math.round(top5.reduce((s, r) => s + r.prosent, 0) / top5.length * 100) / 100
    const antallStevner = rader.length
    const erGyldig = antallStevner >= MIN_STEVNER

    const item: RankingItem = {
      navn: throwerName(entry.kaster),
      klubb: entry.klubb?.navn ?? '–',
      antallStevner,
      snittProsent,
      erGyldig,
      detaljRader: sorted,
    }

    if (erGyldig) valid.push(item)
    else invalid.push(item)
  }

  valid.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  invalid.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  assignPlacements(valid, r => r.snittProsent)

  return [...valid, ...invalid]
}
