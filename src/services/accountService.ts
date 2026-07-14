import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

export interface LinkedAccountRow {
  id: string
  epost: string
  opprettet_at: string
}

/** Login accounts linked (godkjent) to the caller's kasterid, including the caller. */
export async function getLinkedAccounts(): Promise<{ data: LinkedAccountRow[]; error: unknown }> {
  const { data, error } = await supabase.rpc('hent_kobla_kontoar')
  if (error) logError('getLinkedAccounts', error)
  return { data: data ?? [], error }
}

/** Deletes the caller's own login account (targetId must be the caller's id). Thrower data is untouched. */
export async function deleteUserAccount(targetId: string): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc('slett_brukarkonto', { target_id: targetId })
  if (error) logError('deleteUserAccount', error)
  return { error }
}
