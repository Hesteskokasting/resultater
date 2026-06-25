import type { QueryData, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import type { Tables, Json, Runde1FormatTyped } from '@/types'

// ── Admin-typar ───────────────────────────────────────────────────────────────

export type StevneAdminRow = Pick<Tables<'stevne'>,
  'id' | 'navn' | 'sted' | 'dato' | 'tid' | 'klubbid' | 'stevnetypeid' |
  'innledendekastemetodeid' | 'avsluttendekastemetodeid' | 'kategoriid' |
  'ernm' | 'ernorgesranking' | 'erfullfort' | 'erekskludertfrarekorder' |
  'innbydelseurl' | 'resultaturl'
>
export type StevneAdminPayload = Omit<StevneAdminRow, 'id'>

export type StevnetypeRow  = Pick<Tables<'stevnetype'>,  'id' | 'navn'>
export type KastemetodeRow = Pick<Tables<'kastemetode'>, 'id' | 'navn'>
export type KategoriRow    = Pick<Tables<'kategori'>,    'id' | 'navn'>

// ── Info-tab typar ────────────────────────────────────────────────────────────

const _infoStevneQuery = supabase
  .from('stevne')
  .select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
    kategori:kategoriid(erlagbasert)
  `)

export type InfoStevneRow = QueryData<typeof _infoStevneQuery>[number]

export type SisteResultatRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>
export type LiveStevneRow     = Pick<Tables<'stevne'>, 'id' | 'navn' | 'stevne_fase' | 'erfullfort'>
export type KommendeStevneRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'innbydelseurl' | 'stevne_fase' | 'erfullfort'>
export type PameldingStevneRow = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato' | 'sted' | 'erfullfort' | 'klubbid'>
export type RelatertStevneRow  = Pick<Tables<'stevne'>, 'id' | 'navn' | 'dato'>

export async function hentSisteResultater(): Promise<{ data: SisteResultatRow[]; error: unknown }> {
  const dagsdato = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .lt('dato', dagsdato)
    .eq('erfullfort', true)
    .order('dato', { ascending: false })
    .limit(5)
  if (error) logError('hentSisteResultater', error)
  return { data: data ?? [], error }
}

export async function hentLiveStevner(): Promise<{ data: LiveStevneRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, erfullfort')
    .in('stevne_fase', ['innledende', 'avsluttende'])
    .order('dato', { ascending: true })
  if (error) logError('hentLiveStevner', error)
  return { data: data ?? [], error }
}

export async function hentKommendeStevner(): Promise<{ data: KommendeStevneRow[]; error: unknown }> {
  const dagsdato = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, innbydelseurl, stevne_fase, erfullfort')
    .gte('dato', dagsdato)
    .order('dato', { ascending: true })
    .limit(5)
  if (error) logError('hentKommendeStevner', error)
  return { data: data ?? [], error }
}

export async function hentStevneForPamelding(id: number): Promise<{ data: PameldingStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato, sted, erfullfort, klubbid')
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentStevneForPamelding', error)
  return { data, error }
}

export async function hentRelaterteStevner(
  klubbId: number,
  fraDato: string,
  tilDato: string,
  unntaId: number,
): Promise<{ data: RelatertStevneRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, dato')
    .eq('klubbid', klubbId)
    .eq('erfullfort', false)
    .neq('id', unntaId)
    .gte('dato', fraDato)
    .lte('dato', tilDato)
    .order('dato')
  if (error) logError('hentRelaterteStevner', error)
  return { data: data ?? [], error }
}

export async function hentInfoStevne(id: number): Promise<{ data: InfoStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
      kategori:kategoriid(erlagbasert)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentInfoStevne', error)
  return { data, error }
}

export async function oppdaterStevneFase(id: number, fase: string): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').update({ stevne_fase: fase }).eq('id', id)
  if (error) logError('oppdaterStevneFase', error)
  return { error }
}

// ── Oppslag for admin-skjema ──────────────────────────────────────────────────

export async function hentStevnetypar(): Promise<{ data: StevnetypeRow[]; error: unknown }> {
  const { data, error } = await supabase.from('stevnetype').select('id, navn').eq('eraktiv', true).order('navn')
  if (error) logError('hentStevnetypar', error)
  return { data: data ?? [], error }
}

export async function hentInnleiendeKastemetodar(): Promise<{ data: KastemetodeRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kastemetode').select('id, navn').eq('er_innledende', true).eq('eraktiv', true).order('navn')
  if (error) logError('hentInnleiendeKastemetodar', error)
  return { data: data ?? [], error }
}

export async function hentAvsluttendeKastemetodar(): Promise<{ data: KastemetodeRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kastemetode').select('id, navn').eq('er_avsluttende', true).eq('eraktiv', true).order('navn')
  if (error) logError('hentAvsluttendeKastemetodar', error)
  return { data: data ?? [], error }
}

export async function hentKategoriar(): Promise<{ data: KategoriRow[]; error: unknown }> {
  const { data, error } = await supabase.from('kategori').select('id, navn').order('navn')
  if (error) logError('hentKategoriar', error)
  return { data: data ?? [], error }
}

// ── Stevne-admin CRUD ─────────────────────────────────────────────────────────

export async function hentStevneForAdmin(id: number): Promise<{ data: StevneAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, innbydelseurl, resultaturl')
    .eq('id', id)
    .single()
  if (error) logError('hentStevneForAdmin', error)
  return { data, error }
}

export async function opprettStevne(
  payload: StevneAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('stevne').insert(payload).select('id').single()
  if (error) logError('opprettStevne', error)
  return { data, error }
}

export async function oppdaterStevne(
  id: number,
  payload: StevneAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from('stevne').update(payload).eq('id', id).select('id').single()
  if (error) logError('oppdaterStevne', error)
  return { data, error }
}

export async function slettStevne(id: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').delete().eq('id', id)
  if (error) logError('slettStevne', error)
  return { error }
}

// ── Terminliste ───────────────────────────────────────────────────────────────

export type KlubbRow = Pick<Tables<'klubb'>, 'id' | 'navn'>

export interface Filtervalg {
  stevnetyper: StevnetypeRow[]
  kastemetoder: KastemetodeRow[]
  klubber: KlubbRow[]
  kategorier: KategoriRow[]
}

const _terminlisteStevneQuery = supabase
  .from('stevne')
  .select(`
    id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, innbydelseurl, resultaturl,
    klubb:klubbid(id, navn),
    stevnetype:stevnetypeid(id, navn),
    innledende:kastemetode!innledendekastemetodeid(id, navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
    kategori:kategoriid(id, navn)
  `)

export type TerminlisteStevneRow = QueryData<typeof _terminlisteStevneQuery>[number]

export async function hentTerminlisteStevner(ar: number): Promise<{ data: TerminlisteStevneRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, innbydelseurl, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `)
    .gte('dato', `${ar}-01-01`)
    .lte('dato', `${ar}-12-31`)
    .order('dato')
  if (error) logError('hentTerminlisteStevner', error)
  return { data: data ?? [], error }
}

export async function hentFiltervalg(): Promise<{ data: Filtervalg; error: unknown }> {
  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from('stevnetype').select('id, navn').order('navn'),
    supabase.from('kastemetode').select('id, navn').order('navn'),
    supabase.from('klubb').select('id, navn').order('navn'),
    supabase.from('kategori').select('id, navn').order('navn'),
  ])
  const firstError = r1.error ?? r2.error ?? r3.error ?? r4.error ?? null
  if (firstError) logError('hentFiltervalg', firstError)
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
  .select('id, navn, stevne_fase, avsluttendekastemetodeid, kategori:kategoriid(id, navn, erlagbasert)')

export type StevneHeaderRow = QueryData<typeof _stevneHeaderQuery>[number]

export async function hentStevneHeader(id: number): Promise<{ data: StevneHeaderRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, avsluttendekastemetodeid, kategori:kategoriid(id, navn, erlagbasert)')
    .eq('id', id)
    .single()
  if (error) logError('hentStevneHeader', error)
  return { data, error }
}

export function subscribeToStevneFase(
  id: number,
  onUpdate: (fase: string | undefined) => void,
): RealtimeChannel {
  return supabase
    .channel(`stevne-fase-${id}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'stevne', filter: `id=eq.${id}` },
      payload => onUpdate((payload.new as { stevne_fase?: string }).stevne_fase),
    )
    .subscribe()
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslStevneQuery = supabase
  .from('stevne')
  .select('id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')

export type AvslStevneRow = QueryData<typeof _avslStevneQuery>[number]

export async function hentAvsluttendeStevne(stevneid: number): Promise<{ data: AvslStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('hentAvsluttendeStevne', error)
  return { data, error }
}

export async function setRunde1Format(stevneid: number, format: Runde1FormatTyped | null): Promise<{ error: unknown }> {
  // Runde1FormatTyped serialises cleanly to JSON; cast is justified at this DB boundary
  const { error } = await supabase
    .from('stevne')
    .update({ runde1_format: format as unknown as Json })
    .eq('id', stevneid)
  if (error) logError('setRunde1Format', error)
  return { error }
}

export async function hentPameldingCount(stevneid: number): Promise<{ count: number; error: unknown }> {
  const { count, error } = await supabase
    .from('pamelding')
    .select('id', { count: 'exact', head: true })
    .eq('stevneid', stevneid)
  if (error) logError('hentPameldingCount', error)
  return { count: count ?? 0, error }
}

// ── Innstillingar-tab ─────────────────────────────────────────────────────────

export type InnstillingarStevneRow = Pick<Tables<'stevne'>,
  'id' | 'stevne_fase' | 'antall_runder_innl' | 'innledendekastemetodeid' | 'avsluttendekastemetodeid'
>
export type AktivKastemetodeRow = Pick<Tables<'kastemetode'>, 'id' | 'navn' | 'er_innledende' | 'er_avsluttende'>
export type InnstillingarUpdatePayload = Pick<Tables<'stevne'>,
  'innledendekastemetodeid' | 'avsluttendekastemetodeid' | 'antall_runder_innl'
>

export async function hentStevneInnstillingar(id: number): Promise<{ data: InnstillingarStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid')
    .eq('id', id)
    .single()
  if (error) logError('hentStevneInnstillingar', error)
  return { data, error }
}

export async function hentAktiveKastemetodar(): Promise<{ data: AktivKastemetodeRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kastemetode')
    .select('id, navn, er_innledende, er_avsluttende')
    .eq('eraktiv', true)
    .order('navn')
  if (error) logError('hentAktiveKastemetodar', error)
  return { data: data ?? [], error }
}

export async function oppdaterStevneInnstillingar(
  id: number,
  payload: InnstillingarUpdatePayload,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').update(payload).eq('id', id)
  if (error) logError('oppdaterStevneInnstillingar', error)
  return { error }
}

export async function hentPameldteForBruker(kasterid: number): Promise<Map<number, number>> {
  const { data, error } = await supabase
    .from('pamelding')
    .select('id, stevneid')
    .eq('kasterid', kasterid)
  if (error) logError('hentPameldteForBruker', error)
  const map = new Map<number, number>()
  for (const row of data ?? []) {
    if (row.stevneid != null) map.set(row.stevneid, row.id)
  }
  return map
}

// ── Dispatcher-hjelparar ──────────────────────────────────────────────────────

export async function hentInnledendeMetodeNamn(stevneid: number): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('m:kastemetode!stevne_innledendekastemetodeid_fkey(navn)')
    .eq('id', stevneid)
    .single()
  if (error) logError('hentInnledendeMetodeNamn', error)
  const rel = data?.m
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? ''
  return { navn: navn.toLowerCase(), error }
}

export async function hentAvsluttendeMetodeNamn(stevneid: number): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('m:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)')
    .eq('id', stevneid)
    .single()
  if (error) logError('hentAvsluttendeMetodeNamn', error)
  const rel = data?.m
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? ''
  return { navn: navn.toLowerCase(), error }
}

// ── Innledande fase ───────────────────────────────────────────────────────────

const _innlStevneQuery = supabase
  .from('stevne')
  .select('id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')

export type InnlStevneRow = QueryData<typeof _innlStevneQuery>[number]

export async function hentInnledendeStevne(stevneid: number): Promise<{ data: InnlStevneRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select('id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)')
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('hentInnledendeStevne', error)
  return { data, error }
}

export async function setStevneErfullfort(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
  if (error) logError('setStevneErfullfort', error)
  return { error }
}

