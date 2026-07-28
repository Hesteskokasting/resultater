import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { verifyRowsAffected } from '@/utils/verifiedWrite'
import type { Tables, Json, Round1FormatTyped } from '@/types'

// ── Admin-typar ───────────────────────────────────────────────────────────────

export type TournamentAdminRow = Pick<Tables<'stevne'>,
  'id' | 'navn' | 'sted' | 'dato' | 'tid' | 'klubbid' | 'stevnetypeid' |
  'innledendekastemetodeid' | 'avsluttendekastemetodeid' | 'kategoriid' |
  'ernm' | 'ernorgesranking' | 'erfullfort' | 'erekskludertfrarekorder' |
  'resultaturl'
>
export type TournamentAdminPayload = Omit<TournamentAdminRow, 'id' | 'erfullfort'>

export type TournamentTypeRow  = Pick<Tables<'stevnetype'>,  'id' | 'navn'>
export type ThrowingMethodRow = Pick<Tables<'kastemetode'>, 'id' | 'navn'>
export type CategoryRow    = Pick<Tables<'kategori'>,    'id' | 'navn'>

// ── Info-tab typar ────────────────────────────────────────────────────────────

const _infoStevneQuery = supabase
  .from('stevne')
  .select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid, tilgjengelige_baner,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
    kategori:kategoriid(erlagbasert, navn)
  `)

export type InfoTournamentRow = QueryData<typeof _infoStevneQuery>[number]

export type LatestResultRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>
export type LiveTournamentRow     = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'stevne_fase' | 'erfullfort'>
export type UpcomingTournamentRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'stevne_fase' | 'erfullfort'>
const _pameldingStevneQuery = supabase
  .from('stevne')
  .select('id, navn, dato, tid, sted, erfullfort, klubbid, kategori:kategoriid(navn)')

export type RegistrationTournamentRow = QueryData<typeof _pameldingStevneQuery>[number]
export type RelatedTournamentRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>

export async function getLatestResults(): Promise<{ data: LatestResultRow[]; error: unknown }> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .lte('dato', today)
    .eq('erfullfort', true)
    .order('dato', { ascending: false })
    .limit(5)
  if (error) logError('getLatestResults', error)
  return { data: data ?? [], error }
}

export async function getLiveTournaments(): Promise<{ data: LiveTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, stevne_fase, erfullfort')
    .in('stevne_fase', ['innledende', 'avsluttende'])
    .order('dato', { ascending: true })
  if (error) logError('getLiveTournaments', error)
  return { data: data ?? [], error }
}

export async function getUpcomingTournaments(): Promise<{ data: UpcomingTournamentRow[]; error: unknown }> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, stevne_fase, erfullfort')
    .gte('dato', today)
    .or('stevne_fase.is.null,stevne_fase.eq.ikke_startet')
    .order('dato', { ascending: true })
    .limit(5)
  if (error) logError('getUpcomingTournaments', error)
  return { data: data ?? [], error }
}

export async function getTournamentForRegistration(id: number): Promise<{ data: RegistrationTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, tid, sted, erfullfort, klubbid, kategori:kategoriid(navn)')
    .eq('id', id)
    .maybeSingle()
  if (error) logError('getTournamentForRegistration', error)
  return { data, error }
}

export async function getRelatedTournaments(
  klubbId: number,
  fromDate: string,
  toDate: string,
  excludeId: number,
): Promise<{ data: RelatedTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .eq('klubbid', klubbId)
    .eq('erfullfort', false)
    .neq('id', excludeId)
    .gte('dato', fromDate)
    .lte('dato', toDate)
    .order('dato')
  if (error) logError('getRelatedTournaments', error)
  return { data: data ?? [], error }
}

export async function getInfoTournament(id: number): Promise<{ data: InfoTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid, tilgjengelige_baner,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
      kategori:kategoriid(erlagbasert, navn)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('getInfoTournament', error)
  return { data, error }
}

export async function updateTournamentPhase(id: number, phase: string): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').update({ stevne_fase: phase }).eq('id', id)
  if (error) logError('updateTournamentPhase', error)
  return { error }
}

// ── Oppslag for admin-skjema ──────────────────────────────────────────────────

export async function getTournamentTypes(): Promise<{ data: TournamentTypeRow[]; error: unknown }> {
  const { data, error } = await supabase.from('stevnetype').select('id, navn').eq('eraktiv', true).order('navn')
  if (error) logError('getTournamentTypes', error)
  return { data: data ?? [], error }
}

export async function getInitialThrowingMethods(): Promise<{ data: ThrowingMethodRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kastemetode').select('id, navn').eq('er_innledende', true).eq('eraktiv', true).order('navn')
  if (error) logError('getInitialThrowingMethods', error)
  return { data: data ?? [], error }
}

export async function getFinalThrowingMethods(): Promise<{ data: ThrowingMethodRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kastemetode').select('id, navn').eq('er_avsluttende', true).eq('eraktiv', true).order('navn')
  if (error) logError('getFinalThrowingMethods', error)
  return { data: data ?? [], error }
}

export async function getCategories(): Promise<{ data: CategoryRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kategori').select('id, navn').order('navn')
  if (error) logError('getCategories', error)
  return { data: data ?? [], error }
}

// ── Stevne-admin CRUD ─────────────────────────────────────────────────────────

export async function getTournamentForAdmin(id: number): Promise<{ data: TournamentAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, resultaturl')
    .eq('id', id)
    .single()
  if (error) logError('getTournamentForAdmin', error)
  return { data, error }
}

export async function createTournament(
  payload: TournamentAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('stevne').insert(payload).select('id').single()
  if (error) logError('createTournament', error)
  return { data, error }
}

export async function updateTournament(
  id: number,
  payload: TournamentAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('stevne').update(payload).eq('id', id).select('id').single()
  if (error) logError('updateTournament', error)
  return { data, error }
}

export async function deleteTournament(id: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').delete().eq('id', id)
  if (error) logError('deleteTournament', error)
  return { error }
}

// ── Terminliste ───────────────────────────────────────────────────────────────

export type ClubRow =Pick<Tables<'klubb'>, 'id' | 'navn'>

export interface FilterOptions {
  stevnetyper: TournamentTypeRow[]
  kastemetoder: ThrowingMethodRow[]
  klubber: ClubRow[]
  kategorier: CategoryRow[]
}

const _terminlisteStevneQuery = supabase
  .from('stevne')
  .select(`
    id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, resultaturl,
    klubb:klubbid(id, navn),
    stevnetype:stevnetypeid(id, navn),
    innledende:kastemetode!innledendekastemetodeid(id, navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
    kategori:kategoriid(id, navn)
  `)

export type ScheduleTournamentRow = QueryData<typeof _terminlisteStevneQuery>[number]

export async function getScheduleTournaments(ar: number): Promise<{ data: ScheduleTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `)
    .gte('dato', `${ar}-01-01`)
    .lte('dato', `${ar}-12-31`)
    .order('dato')
  if (error) logError('getScheduleTournaments', error)
  return { data: data ?? [], error }
}

export async function getFilterOptions(): Promise<{ data: FilterOptions; error: unknown }> {
  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from('stevnetype').select('id, navn').order('navn'),
    supabase.from('kastemetode').select('id, navn').order('navn'),
    supabase.from('klubb').select('id, navn').order('navn'),
    supabase.from('kategori').select('id, navn').order('navn'),
  ])
  const firstError = r1.error ?? r2.error ?? r3.error ?? r4.error ?? null
  if (firstError) logError('getFilterOptions', firstError)
  return {
    data: {
      stevnetyper: r1.data ?? [],
      kastemetoder: r2.data ?? [],
      klubber: r3.data ?? [],
      kategorier: r4.data ?? [],
    },
    error: firstError,
  }
}

// ── Stevne-side header ────────────────────────────────────────────────────────

const _stevneHeaderQuery = supabase
  .from('stevne')
  .select('id, navn, stevne_fase, erfullfort, avsluttendekastemetodeid, kategori:kategoriid(id, navn, erlagbasert)')

export type TournamentHeaderRow = QueryData<typeof _stevneHeaderQuery>[number]

export async function getTournamentHeader(id: number): Promise<{ data: TournamentHeaderRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, erfullfort, avsluttendekastemetodeid, kategori:kategoriid(id, navn, erlagbasert)')
    .eq('id', id)
    .single()
  if (error) logError('getTournamentHeader', error)
  return { data, error }
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslStevneQuery = supabase
  .from('stevne')
  .select('id, navn, stevne_fase, erfullfort, runde1_format, kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn), kategori:kategoriid(erlagbasert)')

export type FinalPhaseTournamentRow = QueryData<typeof _avslStevneQuery>[number]

export async function getFinalPhaseTournament(stevneid: number): Promise<{ data: FinalPhaseTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, erfullfort, runde1_format, kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn), kategori:kategoriid(erlagbasert)')
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('getFinalPhaseTournament', error)
  return { data, error }
}

export async function setRound1Format(stevneid: number, format: Round1FormatTyped | null): Promise<{ error: unknown }> {
  // Round1FormatTyped serialises cleanly to JSON; cast is justified at this DB boundary
  const { error } = await verifyRowsAffected(
    supabase.from('stevne').update({ runde1_format: format as unknown as Json }).eq('id', stevneid).select('id'),
  )
  if (error) logError('setRound1Format', error)
  return { error }
}

export async function getTournamentRegistrationCount(stevneid: number): Promise<{ count: number; error: unknown }> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneid)
  if (error) logError('getTournamentRegistrationCount', error)
  return { count: count ?? 0, error }
}

// ── Innstillingar-tab ─────────────────────────────────────────────────────────

export type TournamentSettingsRow = Pick<Tables<'stevne'>,
  'id' | 'stevne_fase' | 'antall_runder_innl' | 'innledendekastemetodeid' | 'avsluttendekastemetodeid' | 'tilgjengelige_baner'
>
export type ActiveThrowingMethodRow = Pick<Tables<'kastemetode'>, 'id' | 'navn' | 'er_innledende' | 'er_avsluttende'>
export type TournamentSettingsUpdatePayload = Pick<Tables<'stevne'>,
  'innledendekastemetodeid' | 'avsluttendekastemetodeid' | 'antall_runder_innl' | 'tilgjengelige_baner'
>

export async function getTournamentSettings(id: number): Promise<{ data: TournamentSettingsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid, tilgjengelige_baner')
    .eq('id', id)
    .single()
  if (error) logError('getTournamentSettings', error)
  return { data, error }
}

export async function getActiveThrowingMethods(): Promise<{ data: ActiveThrowingMethodRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kastemetode')
    .select('id, navn, er_innledende, er_avsluttende')
    .eq('eraktiv', true)
    .order('navn')
  if (error) logError('getActiveThrowingMethods', error)
  return { data: data ?? [], error }
}

export async function updateTournamentSettings(
  id: number,
  payload: TournamentSettingsUpdatePayload,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase.from('stevne').update(payload).eq('id', id).select('id'),
  )
  if (error) logError('updateTournamentSettings', error)
  return { error }
}

export async function getRegistrationsForThrower(kasterid: number): Promise<Map<number, number>> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevneid')
    .eq('kasterid', kasterid)
  if (error) logError('getRegistrationsForThrower', error)
  const map = new Map<number, number>()
  for (const row of data ?? []) {
    if (row.stevneid != null) map.set(row.stevneid, row.id)
  }
  return map
}

// ── Dispatcher-hjelparar ──────────────────────────────────────────────────────

export async function getInitialMethodName(stevneid: number): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('m:kastemetode!stevne_innledendekastemetodeid_fkey(navn)')
    .eq('id', stevneid)
    .single()
  if (error) logError('getInitialMethodName', error)
  const rel = data?.m
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? ''
  return { navn: navn.toLowerCase(), error }
}

export async function getFinalMethodName(stevneid: number): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('m:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)')
    .eq('id', stevneid)
    .single()
  if (error) logError('getFinalMethodName', error)
  const rel = data?.m
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? ''
  return { navn: navn.toLowerCase(), error }
}

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlStevneQuery = supabase
  .from('stevne')
  .select('id, navn, erfullfort, stevne_fase, antall_runder_innl, avsluttendekastemetodeid, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')

export type InitialPhaseTournamentRow = QueryData<typeof _innlStevneQuery>[number]

export async function getInitialPhaseTournament(stevneid: number): Promise<{ data: InitialPhaseTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, erfullfort, stevne_fase, antall_runder_innl, avsluttendekastemetodeid, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('getInitialPhaseTournament', error)
  return { data, error }
}

export async function setTournamentCompleted(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc('complete_stevne', { p_stevneid: stevneid })
  if (error) logError('setTournamentCompleted', error)
  return { error }
}

export async function reopenTournament(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc('reopen_stevne', { p_stevneid: stevneid })
  if (error) logError('reopenTournament', error)
  return { error }
}

