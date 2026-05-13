import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import type { Tables } from '../types'

type SisteResultatRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>
type LiveStevneRow     = Pick<Tables<'stevne'>, 'id' | 'navn' | 'stevne_fase'>
type KommendeStevneRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'innbydelseurl'>

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
