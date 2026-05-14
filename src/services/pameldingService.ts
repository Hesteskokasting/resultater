import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

const _pameldingQuery = supabase.from('pamelding').select('id, stevne:stevneid(id, navn, dato)')

export type PameldingRow = QueryData<typeof _pameldingQuery>[number]

export async function hentMinePameldingar(brukerId: string): Promise<{ data: PameldingRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevne:stevneid(id, navn, dato)')
    .eq('bruker_id', brukerId)
    .limit(50)
  if (error) logError('hentMinePameldingar', error)
  return { data: data ?? [], error }
}
