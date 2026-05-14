import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

const _pameldingQuery = supabase.from('pamelding').select('id, stevne:stevneid(id, navn, dato)')
const _pameldingMedKasterQuery = supabase
  .from('pamelding')
  .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')

export type PameldingRow = QueryData<typeof _pameldingQuery>[number]
export type PameldingMedKasterRow = QueryData<typeof _pameldingMedKasterQuery>[number]

export async function hentMinePameldingar(brukerId: string): Promise<{ data: PameldingRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevne:stevneid(id, navn, dato)')
    .eq('bruker_id', brukerId)
    .limit(50)
  if (error) logError('hentMinePameldingar', error)
  return { data: data ?? [], error }
}

export async function hentPameldingarForStevne(stevneId: number): Promise<{ data: PameldingMedKasterRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('hentPameldingarForStevne', error)
  return { data: data ?? [], error }
}

export async function meldPaStevne(
  stevneId: number,
  kasterid: number,
  brukerId: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('pamelding').insert({ stevneid: stevneId, kasterid, bruker_id: brukerId })
  if (error) logError('meldPaStevne', error)
  return { error }
}

export async function fjernPamelding(pameldingId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('pamelding').delete().eq('id', pameldingId)
  if (error) logError('fjernPamelding', error)
  return { error }
}
