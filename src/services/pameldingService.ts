import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { getUser } from './authService'

const _pameldingQuery = supabase.from('pamelding').select('id, stevne:stevneid(id, navn, dato)')
const _pameldingMedKasterQuery = supabase
  .from('pamelding')
  .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
const _pameldingStatusQuery = supabase.from('pamelding').select('id, kasterid, er_bekreftet, lag_id')

export type RegistrationRow = QueryData<typeof _pameldingQuery>[number]
export type RegistrationWithThrowerRow = QueryData<typeof _pameldingMedKasterQuery>[number]
export type RegistrationStatusRow = QueryData<typeof _pameldingStatusQuery>[number]

// ── Par/Mix pair types ────────────────────────────────────────────────────────
// Manually typed until migration 20260610100000 is applied and types regenerated.
// After: npx supabase gen types typescript --project-id urtvpewjlevhlevtnvkf > src/types/database.types.ts

export interface RegistrationPairMember {
  id: number
  kasterid: number
  lag_id: number
  posisjon: number
  kaster: {
    id: number
    fornavn: string | null
    etternavn: string | null
    kjonnid: number | null
    klubb: { navn: string } | null
  } | null
}

export interface RegistrationPair {
  lag_id: number
  sideA: RegistrationPairMember  // posisjon 1
  sideB: RegistrationPairMember  // posisjon 2
}

export async function getMyRegistrations(userId: string): Promise<{ data: RegistrationRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevne:stevneid(id, navn, dato)')
    .eq('bruker_id', userId)
    .limit(50)
  if (error) logError('getMyRegistrations', error)
  return { data: data ?? [], error }
}

export async function getRegistrationsForTournament(stevneId: number): Promise<{ data: RegistrationWithThrowerRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('getRegistrationsForTournament', error)
  return { data: data ?? [], error }
}

export async function getMyRegistrationForTournament(
  stevneId: number,
  kasterid: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id')
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
    .maybeSingle()
  if (error) logError('getMyRegistrationForTournament', error)
  return { data, error }
}

export async function registerForTournament(
  stevneId: number,
  kasterid: number,
  userId: string,
): Promise<{ error: unknown; id: number | null }> {
  const { data, error } = await supabase
    .from('pamelding')
    .insert({ stevneid: stevneId, kasterid, bruker_id: userId })
    .select('id')
    .single()
  if (error) logError('registerForTournament', error)
  return { error, id: data?.id ?? null }
}

export async function removeRegistration(pameldingId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('pamelding').delete().eq('id', pameldingId)
  if (error) logError('removeRegistration', error)
  return { error }
}

export async function getRegistrationCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
  if (error) logError('getRegistrationCount', error)
  return count ?? 0
}

export async function getPairCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
    .not('lag_id', 'is', null)
  if (error) logError('getPairCount', error)
  return Math.floor((count ?? 0) / 2)
}

export async function getUnconfirmedCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', false)
  if (error) logError('getUnconfirmedCount', error)
  return count ?? 0
}

export async function getRegistrationStatusForTournament(stevneId: number): Promise<{ data: RegistrationStatusRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, er_bekreftet, lag_id')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('getRegistrationStatusForTournament', error)
  return { data: data ?? [], error }
}

export async function addRegistrationAdmin(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const auth = await getUser()
  const { error } = await supabase.from('pamelding').insert({
    stevneid: stevneId,
    kasterid,
    ...(auth?.user ? { bruker_id: auth.user.id } : {}),
  })
  if (error) logError('addRegistrationAdmin', error)
  return { error }
}

export async function confirmRegistrationForThrower(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .update({ er_bekreftet: true })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('confirmRegistrationForThrower', error)
  return { error }
}

export async function removeRegistrationForThrower(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .delete()
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('removeRegistrationForThrower', error)
  return { error }
}

// ── Par/Mix functions ─────────────────────────────────────────────────────────

export async function getPairsForTournament(stevneId: number): Promise<{ data: RegistrationPair[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, lag_id, posisjon, kaster:kasterid(id, fornavn, etternavn, kjonnid, klubb:klubbid(navn))')
    .eq('stevneid', stevneId)
    .not('lag_id', 'is', null)
    .order('lag_id')
    .order('posisjon')

  if (error) {
    logError('getPairsForTournament', error)
    return { data: [], error }
  }

  const rows = (data ?? []) as unknown as RegistrationPairMember[]
  const parMap = new Map<number, Partial<RegistrationPair>>()

  for (const row of rows) {
    if (!parMap.has(row.lag_id)) parMap.set(row.lag_id, { lag_id: row.lag_id })
    const par = parMap.get(row.lag_id)!
    if (row.posisjon === 1) par.sideA = row
    else if (row.posisjon === 2) par.sideB = row
  }

  const pairs = Array.from(parMap.values()).filter(
    (p): p is RegistrationPair => p.sideA != null && p.sideB != null,
  )

  return { data: pairs, error: null }
}

export async function createPair(
  stevneId: number,
  kasterAId: number,
  kasterBId: number,
): Promise<{ error: unknown }> {
  // Find current max lag_id for this stevne to assign a unique team ID
  const { data: maxRow, error: fetchError } = await supabase
    .from('pamelding')
    .select('lag_id')
    .eq('stevneid', stevneId)
    .not('lag_id', 'is', null)
    .order('lag_id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    logError('createPair.hentMaxLagId', fetchError)
    return { error: fetchError }
  }

  const newTeamId = ((maxRow as { lag_id: number } | null)?.lag_id ?? 0) + 1

  // Sequential, not Promise.all: the Mix gender trigger validates each row,
  // and parallel transactions would race past cross-checks. On a second-step
  // failure the first write is rolled back so no half-pair is left behind.
  const res1 = await supabase
    .from('pamelding')
    .update({ lag_id: newTeamId, posisjon: 1 })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterAId)
  if (res1.error) {
    logError('createPair', res1.error)
    return { error: res1.error }
  }

  const res2 = await supabase
    .from('pamelding')
    .update({ lag_id: newTeamId, posisjon: 2 })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterBId)
  if (res2.error) {
    logError('createPair', res2.error)
    const { error: rollbackErr } = await supabase
      .from('pamelding')
      .update({ lag_id: null, posisjon: null })
      .eq('stevneid', stevneId)
      .eq('kasterid', kasterAId)
    if (rollbackErr) logError('createPair.angre', rollbackErr)
    return { error: res2.error }
  }

  return { error: null }
}

export async function deletePair(stevneId: number, teamId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .update({ lag_id: null, posisjon: null })
    .eq('stevneid', stevneId)
    .eq('lag_id', teamId)
  if (error) logError('deletePair', error)
  return { error }
}
