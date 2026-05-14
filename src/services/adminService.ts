import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import type { Tables } from '../types'

type VentandeKoblingRow = Pick<Tables<'bruker_profil'>, 'id' | 'kobling_kasterid'>
type BrukarListeRow     = Pick<Tables<'bruker_profil'>, 'id' | 'rolle' | 'kobling_status'>
type KlubbadminTilgang  = Pick<Tables<'klubbadmin_klubber'>, 'bruker_id' | 'klubbid'>

export type EpostRad = { id: string; epost: string }

export async function hentVentandeKoblingar(): Promise<{ data: VentandeKoblingRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id, kobling_kasterid')
    .eq('kobling_status', 'venter')
  if (error) logError('hentVentandeKoblingar', error)
  return { data: data ?? [], error }
}

export async function hentBrukarEpost(ids: string[]): Promise<{ data: EpostRad[]; error: unknown }> {
  const { data, error } = await supabase.rpc('hent_bruker_epost', { bruker_ids: ids })
  if (error) logError('hentBrukarEpost', error)
  return { data: data ?? [], error }
}

export async function oppdaterKoblingStatus(
  brukerId: string,
  kasterid: number | null,
  status: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ kobling_status: status, kasterid })
    .eq('id', brukerId)
  if (error) logError('oppdaterKoblingStatus', error)
  return { error }
}

export async function hentAlleBrukarar(): Promise<{ data: BrukarListeRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id, rolle, kobling_status')
    .order('opprettet_at', { ascending: false })
  if (error) logError('hentAlleBrukarar', error)
  return { data: data ?? [], error }
}

export async function oppdaterBrukarRolle(
  brukerId: string,
  rolle: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ rolle })
    .eq('id', brukerId)
  if (error) logError('oppdaterBrukarRolle', error)
  return { error }
}

export async function hentKlubbadminBrukarar(): Promise<{ data: { id: string }[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id')
    .eq('rolle', 'klubbadmin')
  if (error) logError('hentKlubbadminBrukarar', error)
  return { data: data ?? [], error }
}

export async function hentKlubbadminTildelte(): Promise<{ data: KlubbadminTilgang[]; error: unknown }> {
  const { data, error } = await supabase
    .from('klubbadmin_klubber')
    .select('bruker_id, klubbid')
  if (error) logError('hentKlubbadminTildelte', error)
  return { data: data ?? [], error }
}

export async function leggTilKlubbadminTilgang(
  brukerId: string,
  klubbid: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('klubbadmin_klubber')
    .insert({ bruker_id: brukerId, klubbid })
  if (error) logError('leggTilKlubbadminTilgang', error)
  return { error }
}

export async function fjernKlubbadminTilgang(
  brukerId: string,
  klubbid: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('klubbadmin_klubber')
    .delete()
    .eq('bruker_id', brukerId)
    .eq('klubbid', klubbid)
  if (error) logError('fjernKlubbadminTilgang', error)
  return { error }
}
