import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { getUser } from './authService'

const _pameldingQuery = supabase.from('pamelding').select('id, stevne:stevneid(id, navn, dato)')
const _pameldingMedKasterQuery = supabase
  .from('pamelding')
  .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
const _pameldingStatusQuery = supabase.from('pamelding').select('id, kasterid, er_bekreftet')

export type PameldingRow = QueryData<typeof _pameldingQuery>[number]
export type PameldingMedKasterRow = QueryData<typeof _pameldingMedKasterQuery>[number]
export type PameldingStatusRow = QueryData<typeof _pameldingStatusQuery>[number]

// ── Par/Mix pair types ────────────────────────────────────────────────────────
// Manually typed until migration 20260610100000 is applied and types regenerated.
// After: npx supabase gen types typescript --project-id urtvpewjlevhlevtnvkf > src/types/database.types.ts

export interface PameldingParMember {
  id: number
  kasterid: number
  lag_id: number
  posisjon: number
  kaster: {
    id: number
    fornavn: string | null
    etternavn: string | null
    kjonnid: number | null
  } | null
}

export interface PameldingPar {
  lag_id: number
  sideA: PameldingParMember  // posisjon 1
  sideB: PameldingParMember  // posisjon 2
}

export async function hentMinePameldingar(brukerId: string): Promise<{ data: PameldingRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevne:stevneid(id, navn, dato)')
    .eq('bruker_id', brukerId)
    .limit(50)
  if (error) logError('hentMinePameldingar', error)
  return { data: data ?? [], error }
}

export async function hentPameldingarForStevne(stevneId: number): Promise<{ data: PameldingMedKasterRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('hentPameldingarForStevne', error)
  return { data: data ?? [], error }
}

export async function meldPaStevne(
  stevneId: number,
  kasterid: number,
  brukerId: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('pamelding').insert({ stevneid: stevneId, kasterid, bruker_id: brukerId })
  if (error) logError('meldPaStevne', error)
  return { error }
}

export async function fjernPamelding(pameldingId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('pamelding').delete().eq('id', pameldingId)
  if (error) logError('fjernPamelding', error)
  return { error }
}

export async function hentAntallPameldingar(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
  if (error) logError('hentAntallPameldingar', error)
  return count ?? 0
}

export async function hentAntallUbekrefta(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', false)
  if (error) logError('hentAntallUbekrefta', error)
  return count ?? 0
}

export async function hentPameldingStatusForStevne(stevneId: number): Promise<{ data: PameldingStatusRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, er_bekreftet')
    .eq('stevneid', stevneId)
    .order('id')
  if (error) logError('hentPameldingStatusForStevne', error)
  return { data: data ?? [], error }
}

export async function leggTilPameldingAdmin(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const auth = await getUser()
  const { error } = await supabase.from('pamelding').insert({
    stevneid: stevneId,
    kasterid,
    ...(auth?.user ? { bruker_id: auth.user.id } : {}),
  })
  if (error) logError('leggTilPameldingAdmin', error)
  return { error }
}

export async function bekreftPameldingForKaster(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .update({ er_bekreftet: true })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('bekreftPameldingForKaster', error)
  return { error }
}

export async function fjernPameldingForKaster(stevneId: number, kasterid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .delete()
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterid)
  if (error) logError('fjernPameldingForKaster', error)
  return { error }
}

// ── Par/Mix functions ─────────────────────────────────────────────────────────

export async function hentParForStevne(stevneId: number): Promise<{ data: PameldingPar[]; error: unknown }> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, kasterid, lag_id, posisjon, kaster:kasterid(id, fornavn, etternavn, kjonnid)')
    .eq('stevneid', stevneId)
    .not('lag_id', 'is', null)
    .order('lag_id')
    .order('posisjon')

  if (error) {
    logError('hentParForStevne', error)
    return { data: [], error }
  }

  const rows = (data ?? []) as unknown as PameldingParMember[]
  const parMap = new Map<number, Partial<PameldingPar>>()

  for (const row of rows) {
    if (!parMap.has(row.lag_id)) parMap.set(row.lag_id, { lag_id: row.lag_id })
    const par = parMap.get(row.lag_id)!
    if (row.posisjon === 1) par.sideA = row
    else if (row.posisjon === 2) par.sideB = row
  }

  const pairs = Array.from(parMap.values()).filter(
    (p): p is PameldingPar => p.sideA != null && p.sideB != null,
  )

  return { data: pairs, error: null }
}

export async function opprettPar(
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
    logError('opprettPar.hentMaxLagId', fetchError)
    return { error: fetchError }
  }

  const nyLagId = ((maxRow as { lag_id: number } | null)?.lag_id ?? 0) + 1

  // Sequential, not Promise.all: the Mix gender trigger validates each row,
  // and parallel transactions would race past cross-checks. On a second-step
  // failure the first write is rolled back so no half-pair is left behind.
  const res1 = await supabase
    .from('pamelding')
    .update({ lag_id: nyLagId, posisjon: 1 })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterAId)
  if (res1.error) {
    logError('opprettPar', res1.error)
    return { error: res1.error }
  }

  const res2 = await supabase
    .from('pamelding')
    .update({ lag_id: nyLagId, posisjon: 2 })
    .eq('stevneid', stevneId)
    .eq('kasterid', kasterBId)
  if (res2.error) {
    logError('opprettPar', res2.error)
    const { error: angreErr } = await supabase
      .from('pamelding')
      .update({ lag_id: null, posisjon: null })
      .eq('stevneid', stevneId)
      .eq('kasterid', kasterAId)
    if (angreErr) logError('opprettPar.angre', angreErr)
    return { error: res2.error }
  }

  return { error: null }
}

export async function slettPar(stevneId: number, lagId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('pamelding')
    .update({ lag_id: null, posisjon: null })
    .eq('stevneid', stevneId)
    .eq('lag_id', lagId)
  if (error) logError('slettPar', error)
  return { error }
}
