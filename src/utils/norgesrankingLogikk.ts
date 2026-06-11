import { kasterNavn } from '@/utils/kaster'
import type { RankingStevneRow, RankingResultatRow } from '@/services/norgesrankingService'

export const MIN_STEVNER = 5

// ── Typar ─────────────────────────────────────────────────────────────────────

export interface StevneInfo {
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
  _stevne: StevneInfo | undefined
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

// ── Ranking-algoritme ─────────────────────────────────────────────────────────

export function lagStevnerMap(stevner: RankingStevneRow[]): Map<number, StevneInfo> {
  const m = new Map<number, StevneInfo>()
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

export function regnUtRingInfo(r: RankingResultatRow, stevneInfo: StevneInfo | undefined): RingInfo[] {
  const innled = (stevneInfo?.innledMetode ?? '').toLowerCase()
  const avsl = (stevneInfo?.avslMetode ?? '').toLowerCase()
  const finn = (m: string) => innled === m || avsl === m
  const base = { _stevne: stevneInfo }
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

function tildelPlassering(liste: RankingItem[]): void {
  let pl = 1
  for (let i = 0; i < liste.length; i++) {
    const item = liste[i]
    if (item === undefined) continue
    const forrige = liste[i - 1]
    if (forrige !== undefined && item.snittProsent < forrige.snittProsent) pl = i + 1
    item.plassering = pl
  }
}

export function byggRankingListe(resultater: RankingResultatRow[], stevnerMap: Map<number, StevneInfo>): RankingItem[] {
  const kasterMap = new Map<number, { kaster: RankingResultatRow['kaster']; klubb: RankingResultatRow['klubb']; rader: RingInfo[] }>()

  for (const r of resultater) {
    if (r.kasterid == null) continue
    const ringInfoListe = regnUtRingInfo(r, r.stevneid != null ? stevnerMap.get(r.stevneid) : undefined)
    if (!ringInfoListe.length) continue
    if (!kasterMap.has(r.kasterid)) {
      kasterMap.set(r.kasterid, { kaster: r.kaster, klubb: r.klubb, rader: [] })
    }
    for (const ringInfo of ringInfoListe) {
      kasterMap.get(r.kasterid)!.rader.push(ringInfo)
    }
  }

  const gyldig: RankingItem[] = []
  const ugyldig: RankingItem[] = []

  for (const [, entry] of kasterMap) {
    const { rader } = entry
    const sorted = [...rader].sort((a, b) => b.prosent - a.prosent)
    const top5 = sorted.slice(0, MIN_STEVNER)
    const snittProsent = Math.round(top5.reduce((s, r) => s + r.prosent, 0) / top5.length * 100) / 100
    const antallStevner = rader.length
    const erGyldig = antallStevner >= MIN_STEVNER

    const item: RankingItem = {
      navn: kasterNavn(entry.kaster),
      klubb: entry.klubb?.navn ?? '–',
      antallStevner,
      snittProsent,
      erGyldig,
      detaljRader: sorted,
    }

    if (erGyldig) gyldig.push(item)
    else ugyldig.push(item)
  }

  gyldig.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  ugyldig.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  tildelPlassering(gyldig)

  return [...gyldig, ...ugyldig]
}
