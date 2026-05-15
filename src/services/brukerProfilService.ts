import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import type { Tables } from '../types'

type BrukerProfilRow = Pick<Tables<'bruker_profil'>, 'rolle' | 'kasterid' | 'kobling_status' | 'kobling_kasterid'>

export async function hentProfilForBruker(userId: string): Promise<{ data: BrukerProfilRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('rolle, kasterid, kobling_status, kobling_kasterid')
    .eq('id', userId)
    .maybeSingle()
  if (error) logError('hentProfilForBruker', error)
  return { data, error }
}

export async function sendKoblingForespørsel(brukerId: string, kasterId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ kobling_kasterid: kasterId, kobling_status: 'venter' })
    .eq('id', brukerId)
  if (error) logError('sendKoblingForespørsel', error)
  return { error }
}
