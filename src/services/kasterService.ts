import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

// Query builders used only for type inference — no HTTP calls at module load
const _aktivKasterQuery    = supabase.from('kaster').select('id, fornavn, etternavn, klubb:klubbid(id)')
const _medlemQuery         = supabase.from('kaster').select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')
const _kasterListeQuery    = supabase.from('kaster').select('id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)')
const _kasterDetaljQuery   = supabase.from('kaster').select('id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)')
const _resultatDetaljQuery = supabase.from('resultat').select(`
  id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
  klubb:klubbid(id, navn),
  stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
`)

export type AktivKasterRow    = QueryData<typeof _aktivKasterQuery>[number]
export type MedlemRow         = QueryData<typeof _medlemQuery>[number]
export type KasterListeRow    = QueryData<typeof _kasterListeQuery>[number]
export type KasterDetaljRow   = QueryData<typeof _kasterDetaljQuery>[number]
export type ResultatDetaljRow = QueryData<typeof _resultatDetaljQuery>[number]

// ── Caches ────────────────────────────────────────────────────────────────────

let _aktivKasterCache:      AktivKasterRow[] | null = null
let _kasterListeAktivCache: KasterListeRow[] | null = null
let _kasterListeAlleCache:  KasterListeRow[] | null = null

const _klubbDetaljCache  = new Map<number, { data: MedlemRow[];         error: unknown }>()
const _kasterDetaljCache = new Map<number, { kaster: KasterDetaljRow | null; resultater: ResultatDetaljRow[]; error: unknown }>()

// ── Eksporterte funksjonar ────────────────────────────────────────────────────

export async function hentAktiveKastere(): Promise<AktivKasterRow[]> {
  if (_aktivKasterCache) return _aktivKasterCache
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, klubb:klubbid(id)')
    .eq('eraktiv', true)
  if (error) logError('hentAktiveKastere', error)
  _aktivKasterCache = data ?? []
  return _aktivKasterCache
}

export async function hentMedlemmar(klubbId: number): Promise<{ data: MedlemRow[]; error: unknown }> {
  if (_klubbDetaljCache.has(klubbId)) return _klubbDetaljCache.get(klubbId)!
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')
    .eq('klubbid', klubbId)
    .eq('eraktiv', true)
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentMedlemmar', error)
  const entry = { data: data ?? [], error }
  _klubbDetaljCache.set(klubbId, entry)
  return entry
}

export async function hentKastereListeAktive(): Promise<{ data: KasterListeRow[]; error: unknown }> {
  if (_kasterListeAktivCache) return { data: _kasterListeAktivCache, error: null }
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)')
    .eq('eraktiv', true)
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentKastereListeAktive', error)
  _kasterListeAktivCache = data ?? []
  return { data: _kasterListeAktivCache, error }
}

export async function hentKastereListeAlle(): Promise<{ data: KasterListeRow[]; error: unknown }> {
  if (_kasterListeAlleCache) return { data: _kasterListeAlleCache, error: null }
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)')
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentKastereListeAlle', error)
  _kasterListeAlleCache = data ?? []
  return { data: _kasterListeAlleCache, error }
}

export async function hentKasterDetalj(id: number): Promise<{
  kaster: KasterDetaljRow | null
  resultater: ResultatDetaljRow[]
  error: unknown
}> {
  if (_kasterDetaljCache.has(id)) return _kasterDetaljCache.get(id)!

  const [kasterRes, resultatRes] = await Promise.all([
    supabase
      .from('kaster')
      .select('id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)')
      .eq('id', id)
      .single(),
    supabase
      .from('resultat')
      .select(`
        id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
        klubb:klubbid(id, navn),
        stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
      `)
      .eq('kasterid', id),
  ])

  const error = kasterRes.error || resultatRes.error
  if (error) logError('hentKasterDetalj', error)

  const resultater = (resultatRes.data ?? [])
    .filter(r => r.stevne?.dato)
    .sort((a, b) => (b.stevne?.dato ?? '').localeCompare(a.stevne?.dato ?? ''))

  const entry = { kaster: kasterRes.data, resultater, error }
  _kasterDetaljCache.set(id, entry)
  return entry
}
