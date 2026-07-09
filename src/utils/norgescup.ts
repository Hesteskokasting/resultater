import type { Tables, Kaster, Klubb } from '@/types'
import { throwerName } from './kaster'
import { assignPlacements } from './tildelPlassering'
import type { ResultWithRelations, TournamentForNC } from '@/services/norgescupService'

export type { ResultWithRelations, TournamentForNC }

// ── Private types ─────────────────────────────────────────────────────────────

type Regler = Tables<'antallTellendeNc'>

interface EventMetadata {
  navn: string
  dato: string | null
  typeNavn: string
}

type EventsMap = Map<number, EventMetadata>

// ── Exported types ────────────────────────────────────────────────────────────

export interface SingleListRow {
  navn: string
  klubb: string
  totalPoeng: number
  detaljRader: (ResultWithRelations & { _stevne?: EventMetadata })[]
  plassering: number
}

export interface TeamListRow {
  klubb: Klubb
  lagTotal: number
  plassering: number
  bidragsytere: { kaster: Kaster; klubbId: number; sum: number }[]
}

type CalcFn = (
  rader: ResultWithRelations[],
  regler: Regler,
  eventsMap: EventsMap
) => ResultWithRelations[]

// ── Exported helpers ──────────────────────────────────────────────────────────

export function formaterPoeng(p: number | null | undefined): string {
  if (p == null) return '–'
  const n = Number(p)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

// ── Private helpers ───────────────────────────────────────────────────────────

function buildEventsMap(stevner: TournamentForNC[]): EventsMap {
  const m: EventsMap = new Map()
  for (const s of stevner) {
    m.set(s.id, { navn: s.navn, dato: s.dato, typeNavn: s.stevnetype?.navn ?? '' })
  }
  return m
}

function sorterDesc(arr: ResultWithRelations[]): ResultWithRelations[] {
  return [...arr].sort((a, b) => (b.nc_poeng ?? 0) - (a.nc_poeng ?? 0))
}

function beregnNcPoeng(rader: ResultWithRelations[], regler: Regler, eventsMap: EventsMap): ResultWithRelations[] {
  const nc: ResultWithRelations[] = [], snc: ResultWithRelations[] = [], dnc: ResultWithRelations[] = []
  for (const r of rader) {
    const t = eventsMap.get(r.stevneid ?? -1)?.typeNavn ?? ''
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

function beregnSncPoeng(rader: ResultWithRelations[], regler: Regler, eventsMap: EventsMap): ResultWithRelations[] {
  const snc = rader.filter(r => eventsMap.get(r.stevneid ?? -1)?.typeNavn === 'SNC')
  return sorterDesc(snc).slice(0, regler.max_snc)
}

function beregnDncPoeng(rader: ResultWithRelations[], regler: Regler, eventsMap: EventsMap): ResultWithRelations[] {
  const dnc = rader.filter(r => eventsMap.get(r.stevneid ?? -1)?.typeNavn === 'DNC')
  return sorterDesc(dnc).slice(0, regler.max_dnc)
}

function velgBeregnFunksjon(cupType: string): CalcFn {
  if (cupType === 'SNC') return beregnSncPoeng
  if (cupType === 'DNC') return beregnDncPoeng
  return beregnNcPoeng
}

/** Groups result rows per kaster, dropping rows without a known kaster. */
function groupByThrower(rader: ResultWithRelations[]): Map<number, { kaster: Kaster; rader: ResultWithRelations[] }> {
  const kasterMap = new Map<number, { kaster: Kaster; rader: ResultWithRelations[] }>()
  for (const r of rader) {
    if (r.kasterid == null || r.kaster == null) continue
    if (!kasterMap.has(r.kasterid)) kasterMap.set(r.kasterid, { kaster: r.kaster, rader: [] })
    kasterMap.get(r.kasterid)!.rader.push(r)
  }
  return kasterMap
}

// ── Exported list builders ────────────────────────────────────────────────────

export function buildSingleList(
  resultater: ResultWithRelations[],
  stevner: TournamentForNC[],
  regler: Regler,
  cupType: string,
  klasse: number,
  isBefore2026: boolean
): SingleListRow[] {
  const eventsMap = buildEventsMap(stevner)
  const beregn = velgBeregnFunksjon(cupType)
  const klasseNavn = klasse === 1 ? 'Klasse 1' : 'Klasse 2'

  const rader = isBefore2026 ? resultater.filter(r => r.klasse?.navn === klasseNavn) : resultater
  const kasterMap = groupByThrower(rader)

  const liste: SingleListRow[] = []
  for (const [, entry] of kasterMap) {
    const tellendeRader = beregn(entry.rader, regler, eventsMap)
    const totalPoeng = tellendeRader.reduce((s, r) => s + (r.nc_poeng ?? 0), 0)
    const klubber = [...new Set(tellendeRader.map(r => r.klubb?.navn).filter((n): n is string => n != null))]
    const detaljRader = tellendeRader
      .map(r => ({ ...r, _stevne: eventsMap.get(r.stevneid ?? -1) }))
      .sort((a, b) => (a._stevne?.dato ?? '').localeCompare(b._stevne?.dato ?? ''))
    liste.push({ navn: throwerName(entry.kaster), klubb: klubber.join(' / '), totalPoeng, detaljRader, plassering: 0 })
  }

  liste.sort((a, b) => b.totalPoeng - a.totalPoeng || a.navn.localeCompare(b.navn))
  assignPlacements(liste, r => r.totalPoeng)
  return liste
}

export function buildTeamList(
  resultater: ResultWithRelations[],
  stevner: TournamentForNC[],
  regler: Regler,
  isBefore2026: boolean
): TeamListRow[] {
  const eventsMap = buildEventsMap(stevner)
  const rader = isBefore2026 ? resultater.filter(r => r.klasse?.navn === 'Klasse 1') : resultater
  const kasterMap = groupByThrower(rader)

  const bidragMap = new Map<string, { kaster: Kaster; klubbId: number; sum: number }>()
  const klubbInfoMap = new Map<number, Klubb>()

  for (const [, entry] of kasterMap) {
    const tellendeRader = beregnNcPoeng(entry.rader, regler, eventsMap)
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

  const teamList: TeamListRow[] = []
  for (const [, entry] of klubbMap) {
    entry.bidragsytere.sort((a, b) => b.sum - a.sum)
    const topp4 = entry.bidragsytere.slice(0, 4)
    teamList.push({ klubb: entry.klubb, lagTotal: topp4.reduce((s, b) => s + b.sum, 0), bidragsytere: topp4, plassering: 0 })
  }

  teamList.sort((a, b) => b.lagTotal - a.lagTotal)
  assignPlacements(teamList, r => r.lagTotal)
  return teamList
}
