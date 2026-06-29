import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import type { Tables } from '@/types'

type PendingLinkRow = Pick<Tables<'bruker_profil'>, 'id' | 'kobling_kasterid'>
type UserListRow     = Pick<Tables<'bruker_profil'>, 'id' | 'rolle' | 'kobling_status'>
type ClubAdminAccess  = Pick<Tables<'klubbadmin_klubber'>, 'bruker_id' | 'klubbid'>

export type EmailRow = { id: string; epost: string }

export async function getPendingLinks(): Promise<{ data: PendingLinkRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id, kobling_kasterid')
    .eq('kobling_status', 'venter')
  if (error) logError('getPendingLinks', error)
  return { data: data ?? [], error }
}

export async function getUserEmails(ids: string[]): Promise<{ data: EmailRow[]; error: unknown }> {
  const { data, error } = await supabase.rpc('hent_bruker_epost', { bruker_ids: ids })
  if (error) logError('getUserEmails', error)
  return { data: data ?? [], error }
}

export async function updateLinkStatus(
  brukerId: string,
  kasterid: number | null,
  status: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ kobling_status: status, kasterid })
    .eq('id', brukerId)
  if (error) logError('updateLinkStatus', error)
  return { error }
}

export async function getAllUsers(): Promise<{ data: UserListRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id, rolle, kobling_status')
    .order('opprettet_at', { ascending: false })
  if (error) logError('getAllUsers', error)
  return { data: data ?? [], error }
}

export async function updateUserRole(
  brukerId: string,
  rolle: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bruker_profil')
    .update({ rolle })
    .eq('id', brukerId)
  if (error) logError('updateUserRole', error)
  return { error }
}

export async function getClubAdminUsers(): Promise<{ data: { id: string }[]; error: unknown }> {
  const { data, error } = await supabase
    .from('bruker_profil')
    .select('id')
    .eq('rolle', 'klubbadmin')
  if (error) logError('getClubAdminUsers', error)
  return { data: data ?? [], error }
}

export async function getClubAdminAssignments(): Promise<{ data: ClubAdminAccess[]; error: unknown }> {
  const { data, error } = await supabase
    .from('klubbadmin_klubber')
    .select('bruker_id, klubbid')
  if (error) logError('getClubAdminAssignments', error)
  return { data: data ?? [], error }
}

export async function addClubAdminAccess(
  brukerId: string,
  klubbid: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('klubbadmin_klubber')
    .insert({ bruker_id: brukerId, klubbid })
  if (error) logError('addClubAdminAccess', error)
  return { error }
}

export async function getClubAdminClubsForUser(brukerId: string): Promise<{ data: number[]; error: unknown }> {
  const { data, error } = await supabase
    .from('klubbadmin_klubber')
    .select('klubbid')
    .eq('bruker_id', brukerId)
  if (error) logError('getClubAdminClubsForUser', error)
  return { data: (data ?? []).map(r => r.klubbid).filter((id): id is number => id != null), error }
}

export async function removeClubAdminAccess(
  brukerId: string,
  klubbid: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('klubbadmin_klubber')
    .delete()
    .eq('bruker_id', brukerId)
    .eq('klubbid', klubbid)
  if (error) logError('removeClubAdminAccess', error)
  return { error }
}
