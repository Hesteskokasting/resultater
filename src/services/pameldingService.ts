import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import { getUser } from '../utils/auth'

const _pameldingQuery = supabase.from('pamelding').select('id, stevne:stevneid(id, navn, dato)')
const _pameldingMedKasterQuery = supabase
  .from('pamelding')
  .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
const _pameldingStatusQuery = supabase.from('pamelding').select('id, kasterid, er_bekreftet')

export type PameldingRow = QueryData<typeof _pameldingQuery>[number]
export type PameldingMedKasterRow = QueryData<typeof _pameldingMedKasterQuery>[number]
export type PameldingStatusRow = QueryData<typeof _pameldingStatusQuery>[number]

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

export async function hentAntallPameldingar(stevneId: number): Promise<number> {
  const { count } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
  return count ?? 0
}

export async function hentAntallUbekrefta(stevneId: number): Promise<number> {
  const { count } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', false)
  return count ?? 0
}

export async function hentPameldingStatusForStevne(stevneId: number): Promise<{ data: PameldingStatusRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, er_bekreftet')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('hentPameldingStatusForStevne', error)
  return { data: data ?? [], error }
}

export async function leggTilPameldingAdmin(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const auth = await getUser()
  const { error } = await supabase.from('pamelding').insert({
    stevneid: stevneId,
    kasterid,
    ...(auth?.user ? { bruker_id: auth.user.id } : {}),
  })
  if (error) logError('leggTilPameldingAdmin', error)
  return { error }
}

export async function bekreftPameldingForKaster(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .update({ er_bekreftet: true })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('bekreftPameldingForKaster', error)
  return { error }
}

export async function fjernPameldingForKaster(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .delete()
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('fjernPameldingForKaster', error)
  return { error }
}
