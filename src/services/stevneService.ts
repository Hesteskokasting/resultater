import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import type { Tables } from '../types'

// ── Info-tab typar ────────────────────────────────────────────────────────────

const _infoStevneQuery = supabase
  .from('stevne')
  .select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
  `)

export type InfoStevneRow = QueryData<typeof _infoStevneQuery>[number]

type SisteResultatRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>
type LiveStevneRow     = Pick<Tables<'stevne'>, 'id' | 'navn' | 'stevne_fase'>
type KommendeStevneRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'innbydelseurl'>
export type PameldingStevneRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'sted' | 'erfullfort' | 'klubbid'>
export type RelatertStevneRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>

export async function hentSisteResultater(): Promise<{ data: SisteResultatRow[]; error: unknown }> {
  const dagsdato = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .lt('dato', dagsdato)
    .order('dato', { ascending: false })
    .limit(5)
  if (error) logError('hentSisteResultater', error)
  return { data: data ?? [], error }
}

export async function hentLiveStevner(): Promise<{ data: LiveStevneRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase')
    .in('stevne_fase', ['innledende', 'avsluttende'])
    .order('dato', { ascending: true })
  if (error) logError('hentLiveStevner', error)
  return { data: data ?? [], error }
}

export async function hentKommendeStevner(): Promise<{ data: KommendeStevneRow[]; error: unknown }> {
  const dagsdato = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, innbydelseurl')
    .gte('dato', dagsdato)
    .order('dato', { ascending: true })
    .limit(5)
  if (error) logError('hentKommendeStevner', error)
  return { data: data ?? [], error }
}

export async function hentStevneForPamelding(id: number): Promise<{ data: PameldingStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, sted, erfullfort, klubbid')
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentStevneForPamelding', error)
  return { data, error }
}

export async function hentRelaterteStevner(
  klubbId: number,
  fraDato: string,
  tilDato: string,
  unntaId: number,
): Promise<{ data: RelatertStevneRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .eq('klubbid', klubbId)
    .eq('erfullfort', false)
    .neq('id', unntaId)
    .gte('dato', fraDato)
    .lte('dato', tilDato)
    .order('dato')
  if (error) logError('hentRelaterteStevner', error)
  return { data: data ?? [], error }
}

export async function hentInfoStevne(id: number): Promise<{ data: InfoStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentInfoStevne', error)
  return { data, error }
}

export async function oppdaterStevneFase(id: number, fase: string): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').update({ stevne_fase: fase }).eq('id', id)
  if (error) logError('oppdaterStevneFase', error)
  return { error }
}
