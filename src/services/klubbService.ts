import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { verifyRowsAffected } from '@/utils/verifiedWrite'
import type { Tables } from '@/types'

export type ClubListRow = Pick<Tables<'klubb'>, 'id' | 'navn' | 'logourl'>

let _clubCache: { data: ClubListRow[]; error: unknown } | null = null

export async function getClubs(): Promise<{ data: ClubListRow[]; error: unknown }> {
  if (_clubCache) return _clubCache
  const { data, error } = await supabase
    .from('klubb')
    .select('id, navn, logourl')
    .eq('eraktiv', true)
    .order('navn')
  if (error) logError('getClubs', error)
  _clubCache = { data: data ?? [], error }
  return _clubCache
}

export async function getClubById(id: number): Promise<{ data: ClubListRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('klubb')
    .select('id, navn, logourl')
    .eq('id', id)
    .single()
  if (error) logError('getClubById', error)
  return { data, error }
}

// ── Admin-funksjonar ──────────────────────────────────────────────────────────

export type ClubAdminRow = Pick<Tables<'klubb'>, 'id' | 'navn' | 'kortnavn' | 'logourl' | 'eraktiv'>
export type ClubAdminPayload = Omit<ClubAdminRow, 'id'>

export async function getClubForAdmin(id: number): Promise<{ data: ClubAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('klubb')
    .select('id, navn, kortnavn, logourl, eraktiv')
    .eq('id', id)
    .single()
  if (error) logError('getClubForAdmin', error)
  return { data, error }
}

export async function updateClub(
  id: number,
  payload: ClubAdminPayload,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase.from('klubb').update(payload).eq('id', id).select('id'),
  )
  if (error) logError('updateClub', error)
  return { error }
}
