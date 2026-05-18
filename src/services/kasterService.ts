import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import type { Tables } from '@/types'

// Query builders used only for type inference — no HTTP calls at module load
const _medlemQuery          = supabase.from('kaster').select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')
const _kasterListeQuery     = supabase.from('kaster').select('id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)')
const _kasterDetaljQuery    = supabase.from('kaster').select('id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)')
const _kasterForKoblingQuery = supabase.from('kaster').select('id, fornavn, etternavn, klubb:klubbid(navn)')
const _resultatDetaljQuery  = supabase.from('resultat').select(`
  id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
  klubb:klubbid(id, navn),
  stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
`)

export type MedlemRow            = QueryData<typeof _medlemQuery>[number]
export type KasterListeRow       = QueryData<typeof _kasterListeQuery>[number]
export type KasterDetaljRow      = QueryData<typeof _kasterDetaljQuery>[number]
export type KasterForKoblingRow  = QueryData<typeof _kasterForKoblingQuery>[number]
export type ResultatDetaljRow    = QueryData<typeof _resultatDetaljQuery>[number]

// ── Caches ────────────────────────────────────────────────────────────────────

let _kasterListeAktivCache: KasterListeRow[] | null = null
let _kasterListeAlleCache:  KasterListeRow[] | null = null

const _klubbDetaljCache    = new Map<number, { data: MedlemRow[];            error: unknown }>()
const _kasterDetaljCache   = new Map<number, { kaster: KasterDetaljRow | null; resultater: ResultatDetaljRow[]; error: unknown }>()
const _kasterKoblingCache  = new Map<number, { data: KasterForKoblingRow | null; error: unknown }>()

// ── Eksporterte funksjonar ────────────────────────────────────────────────────

export async function hentKlubbMedlemmar(klubbId: number): Promise<{ data: MedlemRow[]; error: unknown }> {
  if (_klubbDetaljCache.has(klubbId)) return _klubbDetaljCache.get(klubbId)!
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')
    .eq('klubbid', klubbId)
    .eq('eraktiv', true)
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentKlubbMedlemmar', error)
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

export async function hentKastereForKlubbar(klubbIds: number[]): Promise<{ data: KasterListeRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)')
    .in('klubbid', klubbIds)
    .eq('eraktiv', true)
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentKastereForKlubbar', error)
  return { data: data ?? [], error }
}

export async function hentKasterForKobling(id: number): Promise<{ data: KasterForKoblingRow | null; error: unknown }> {
  if (_kasterKoblingCache.has(id)) return _kasterKoblingCache.get(id)!
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, klubb:klubbid(navn)')
    .eq('id', id)
    .single()
  if (error) logError('hentKasterForKobling', error)
  const entry = { data, error }
  _kasterKoblingCache.set(id, entry)
  return entry
}

// ── Admin-funksjonar ──────────────────────────────────────────────────────────

export type KlasseRow = Pick<Tables<'klasse'>, 'id' | 'navn'>
export type KjonnRow  = Pick<Tables<'kjonn'>,  'id' | 'navn'>

export type KasterAdminRow = Pick<Tables<'kaster'>,
  'id' | 'fornavn' | 'etternavn' | 'kjonnid' | 'klasseid' | 'klubbid' |
  'epost' | 'telefon' | 'medlemsnummer' | 'eraktiv'
>
export type KasterAdminPayload = Omit<KasterAdminRow, 'id'>

export async function hentKlassar(): Promise<{ data: KlasseRow[]; error: unknown }> {
  const { data, error } = await supabase.from('klasse').select('id, navn').order('navn')
  if (error) logError('hentKlassar', error)
  return { data: data ?? [], error }
}

export async function hentKjonn(): Promise<{ data: KjonnRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kjonn').select('id, navn').order('id')
  if (error) logError('hentKjonn', error)
  return { data: data ?? [], error }
}

export async function hentKastereByIds(ids: number[]): Promise<{ data: KasterForKoblingRow[]; error: unknown }> {
  if (!ids.length) return { data: [], error: null }
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, klubb:klubbid(navn)')
    .in('id', ids)
  if (error) logError('hentKastereByIds', error)
  return { data: data ?? [], error }
}

export async function hentKasterForAdmin(id: number): Promise<{ data: KasterAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, kjonnid, klasseid, klubbid, epost, telefon, medlemsnummer, eraktiv')
    .eq('id', id)
    .single()
  if (error) logError('hentKasterForAdmin', error)
  return { data, error }
}

export async function opprettKaster(
  payload: KasterAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('kaster').insert(payload).select('id').single()
  if (error) logError('opprettKaster', error)
  return { data, error }
}

export async function oppdaterKaster(
  id: number,
  payload: KasterAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('kaster').update(payload).eq('id', id).select('id').single()
  if (error) logError('oppdaterKaster', error)
  return { data, error }
}

export async function slettKaster(id: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('kaster').delete().eq('id', id)
  if (error) logError('slettKaster', error)
  return { error }
}
