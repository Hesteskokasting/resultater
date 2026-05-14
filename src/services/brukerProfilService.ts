import { supabase } from '../supabase'
import { logError } from '../utils/logError'

export async function sendKoblingForespørsel(brukerId: string, kasterId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ kobling_kasterid: kasterId, kobling_status: 'venter' })
    .eq('id', brukerId)
  if (error) logError('sendKoblingForespørsel', error)
  return { error }
}
