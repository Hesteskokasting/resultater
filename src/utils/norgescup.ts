import type { Tables } from '../types'
import type { Kaster, Klubb } from '../types'
import { kasterNavn } from './kaster'
import type { ResultatMedRelasjonar, StevneForNc } from '../services/norgescupService'

export type { ResultatMedRelasjonar, StevneForNc }

// ── Private typar ─────────────────────────────────────────────────────────────

type Regler = Tables<'antallTellendeNc'>

interface StevneMetadata {
  navn: string
  dato: string | null
  typeNavn: string
}

type StevnerMap = Map<number, StevneMetadata>

// ── Eksporterte typar ─────────────────────────────────────────────────────────

export interface SingelListeRad {
  navn: string
  klubb: string
  totalPoeng: number
  detaljRader: (ResultatMedRelasjonar & { _stevne?: StevneMetadata })[]
  plassering: number
}

export interface LagListeRad {
  klubb: Klubb
  lagTotal: number
  plassering: number
  bidragsytere: { kaster: Kaster; klubbId: number; sum: number }[]
}

type BeregnFn = (
  rader: ResultatMedRelasjonar[],
  regler: Regler,
  stevnerMap: StevnerMap
) => ResultatMedRelasjonar[]

// ── Eksporterte hjelpefunksjonar ──────────────────────────────────────────────

export function formaterPoeng(p: number | null | undefined): string {
  if (p == null) return '–'
  const n = Number(p)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

// ── Private hjelpefunksjonar ──────────────────────────────────────────────────

function lagStevnerMap(stevner: StevneForNc[]): StevnerMap {
  const m: StevnerMap = new Map()
  for (const s of stevner) {
    m.set(s.id, { navn: s.navn, dato: s.dato, typeNavn: s.stevnetype?.navn ?? '' })
  }
  return m
}

function sorterDesc(arr: ResultatMedRelasjonar[]): ResultatMedRelasjonar[] {
  return [...arr].sort((a, b) => (b.nc_poeng ?? 0) - (a.nc_poeng ?? 0))
}

function beregnNcPoeng(rader: ResultatMedRelasjonar[], regler: Regler, stevnerMap: StevnerMap): ResultatMedRelasjonar[] {
  const nc: ResultatMedRelasjonar[] = [], snc: ResultatMedRelasjonar[] = [], dnc: ResultatMedRelasjonar[] = []
  for (const r of rader) {
    const t = stevnerMap.get(r.stevneid ?? -1)?.typeNavn ?? ''
    if (t === 'NC') nc.push(r)
    else if (t === 'SNC') snc.push(r)
    else if (t === 'DNC') dnc.push(r)
  }
  const tellNc = sorterDesc(nc).slice(0, regler.max_nc_total)
  const tellSnc = sorterDesc(snc).slice(0, regler.max_snc_total)
  const maxDnc = regler.max_dnc_total > 0 ? regler.max_dnc_total : Infinity
  const tellDnc = sorterDesc(dnc).slice(0, maxDnc)
  return sorterDesc([...tellNc, ...tellSnc, ...tellDnc]).slice(0, regler.maxtotal)
}

function beregnSncPoeng(rader: ResultatMedRelasjonar[], regler: Regler, stevnerMap: StevnerMap): ResultatMedRelasjonar[] {
  const snc = rader.filter(r => stevnerMap.get(r.stevneid ?? -1)?.typeNavn === 'SNC')
  return sorterDesc(snc).slice(0, regler.max_snc)
}

function beregnDncPoeng(rader: ResultatMedRelasjonar[], regler: Regler, stevnerMap: StevnerMap): ResultatMedRelasjonar[] {
  const dnc = rader.filter(r => stevnerMap.get(r.stevneid ?? -1)?.typeNavn === 'DNC')
  return sorterDesc(dnc).slice(0, regler.max_dnc)
}

export function velgBeregnFunksjon(cupType: string): BeregnFn {
  if (cupType === 'SNC') return beregnSncPoeng
  if (cupType === 'DNC') return beregnDncPoeng
  return beregnNcPoeng
}

function tildelPlassering<T extends { plassering: number }>(liste: T[], getPoeng: (item: T) => number): void {
  let pl = 1
  for (let i = 0; i < liste.length; i++) {
    if (i > 0 && getPoeng(liste[i]) < getPoeng(liste[i - 1])) pl = i + 1
    liste[i].plassering = pl
  }
}

// ── Eksporterte listebyggarar ─────────────────────────────────────────────────

export function byggSingelListe(
  resultater: ResultatMedRelasjonar[],
  stevner: StevneForNc[],
  regler: Regler,
  cupType: string,
  klasse: number
): SingelListeRad[] {
  const stevnerMap = lagStevnerMap(stevner)
  const beregn = velgBeregnFunksjon(cupType)
  const klasseNavn = klasse === 1 ? 'Klasse 1' : 'Klasse 2'

  const filtrert = resultater.filter(r => r.klasse?.navn === klasseNavn)

  const kasterMap = new Map<number, { kaster: Kaster; rader: ResultatMedRelasjonar[] }>()
  for (const r of filtrert) {
    if (r.kasterid == null || r.kaster == null) continue
    if (!kasterMap.has(r.kasterid)) kasterMap.set(r.kasterid, { kaster: r.kaster, rader: [] })
    kasterMap.get(r.kasterid)!.rader.push(r)
  }

  const liste: SingelListeRad[] = []
  for (const [, entry] of kasterMap) {
    const tellendeRader = beregn(entry.rader, regler, stevnerMap)
    const totalPoeng = tellendeRader.reduce((s, r) => s + (r.nc_poeng ?? 0), 0)
    const klubber = [...new Set(tellendeRader.map(r => r.klubb?.navn).filter((n): n is string => n != null))]
    const detaljRader = tellendeRader
      .map(r => ({ ...r, _stevne: stevnerMap.get(r.stevneid ?? -1) }))
      .sort((a, b) => (a._stevne?.dato ?? '').localeCompare(b._stevne?.dato ?? ''))
    liste.push({ navn: kasterNavn(entry.kaster), klubb: klubber.join(' / '), totalPoeng, detaljRader, plassering: 0 })
  }

  liste.sort((a, b) => b.totalPoeng - a.totalPoeng || a.navn.localeCompare(b.navn))
  tildelPlassering(liste, r => r.totalPoeng)
  return liste
}

export function byggLagListe(
  resultater: ResultatMedRelasjonar[],
  stevner: StevneForNc[],
  regler: Regler
): LagListeRad[] {
  const stevnerMap = lagStevnerMap(stevner)
  const filtrert = resultater.filter(r => r.klasse?.navn === 'Klasse 1')

  const kasterMap = new Map<number, { kaster: Kaster; rader: ResultatMedRelasjonar[] }>()
  for (const r of filtrert) {
    if (r.kasterid == null || r.kaster == null) continue
    if (!kasterMap.has(r.kasterid)) kasterMap.set(r.kasterid, { kaster: r.kaster, rader: [] })
    kasterMap.get(r.kasterid)!.rader.push(r)
  }

  const bidragMap = new Map<string, { kaster: Kaster; klubbId: number; sum: number }>()
  const klubbInfoMap = new Map<number, Klubb>()

  for (const [, entry] of kasterMap) {
    const tellendeRader = beregnNcPoeng(entry.rader, regler, stevnerMap)
    const perKlubb = new Map<number, number>()
    for (const r of tellendeRader) {
      const klubb = r.klubb
      if (klubb && r.klubbid != null && !klubbInfoMap.has(r.klubbid)) klubbInfoMap.set(r.klubbid, klubb)
      if (r.klubbid != null) perKlubb.set(r.klubbid, (perKlubb.get(r.klubbid) ?? 0) + (r.nc_poeng ?? 0))
    }
    for (const [klubbId, sum] of perKlubb) {
      bidragMap.set(`${entry.kaster.id}_${klubbId}`, { kaster: entry.kaster, klubbId, sum })
    }
  }

  const klubbMap = new Map<number, { klubb: Klubb; bidragsytere: { kaster: Kaster; klubbId: number; sum: number }[] }>()
  for (const [, b] of bidragMap) {
    if (!klubbMap.has(b.klubbId)) klubbMap.set(b.klubbId, { klubb: klubbInfoMap.get(b.klubbId)!, bidragsytere: [] })
    klubbMap.get(b.klubbId)!.bidragsytere.push(b)
  }

  const lagListe: LagListeRad[] = []
  for (const [, entry] of klubbMap) {
    entry.bidragsytere.sort((a, b) => b.sum - a.sum)
    const topp4 = entry.bidragsytere.slice(0, 4)
    lagListe.push({ klubb: entry.klubb, lagTotal: topp4.reduce((s, b) => s + b.sum, 0), bidragsytere: topp4, plassering: 0 })
  }

  lagListe.sort((a, b) => b.lagTotal - a.lagTotal)
  tildelPlassering(lagListe, r => r.lagTotal)
  return lagListe
}
