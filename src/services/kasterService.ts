import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

// Query builders used only for type inference — no HTTP calls at module load
const _aktivKasterQuery = supabase.from('kaster').select('id, fornavn, etternavn, klubb:klubbid(id)')
const _medlemQuery      = supabase.from('kaster').select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')

export type AktivKasterRow = QueryData<typeof _aktivKasterQuery>[number]
export type MedlemRow      = QueryData<typeof _medlemQuery>[number]

let _aktivKasterCache: AktivKasterRow[] | null = null
const _detaljCache = new Map<number, { data: MedlemRow[]; error: unknown }>()

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
  if (_detaljCache.has(klubbId)) return _detaljCache.get(klubbId)!
  const { data, error } = await supabase
    .from('kaster')
    .select('id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)')
    .eq('klubbid', klubbId)
    .eq('eraktiv', true)
    .order('etternavn')
    .order('fornavn')
  if (error) logError('hentMedlemmar', error)
  const entry = { data: data ?? [], error }
  _detaljCache.set(klubbId, entry)
  return entry
}
