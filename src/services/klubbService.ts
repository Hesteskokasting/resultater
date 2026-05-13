import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import type { Tables } from '../types'

export type KlubbListeRow = Pick<Tables<'klubb'>, 'id' | 'navn' | 'logourl'>

let _klubbCache: { data: KlubbListeRow[]; error: unknown } | null = null

export async function hentKlubbar(): Promise<{ data: KlubbListeRow[]; error: unknown }> {
  if (_klubbCache) return _klubbCache
  const { data, error } = await supabase
    .from('klubb')
    .select('id, navn, logourl')
    .eq('eraktiv', true)
    .order('navn')
  if (error) logError('hentKlubbar', error)
  _klubbCache = { data: data ?? [], error }
  return _klubbCache
}

export async function hentKlubbById(id: number): Promise<{ data: KlubbListeRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('klubb')
    .select('id, navn, logourl')
    .eq('id', id)
    .single()
  if (error) logError('hentKlubbById', error)
  return { data, error }
}
