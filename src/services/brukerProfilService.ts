import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import type { Tables } from '@/types'

type UserProfileRow = Pick<Tables<'bruker_profil'>, 'rolle' | 'kasterid' | 'kobling_status' | 'kobling_kasterid'>

export async function getProfileForUser(userId: string): Promise<{ data: UserProfileRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('rolle, kasterid, kobling_status, kobling_kasterid')
    .eq('id', userId)
    .maybeSingle()
  if (error) logError('getProfileForUser', error)
  return { data, error }
}

export async function sendProfileLinkRequest(userId: string, kasterId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ kobling_kasterid: kasterId, kobling_status: 'venter' })
    .eq('id', userId)
  if (error) logError('sendProfileLinkRequest', error)
  return { error }
}
