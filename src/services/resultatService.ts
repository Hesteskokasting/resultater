import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

// ── Typar ─────────────────────────────────────────────────────────────────────

const _stevneDetaljerQuery = supabase
  .from('stevne')
  .select(`
    id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
    stevnetype:stevnetypeid(navn),
    kategori:kategoriid(navn, erlagbasert),
    kontakt:kontaktkasterid(fornavn, etternavn),
    innledende:kastemetode!innledendekastemetodeid(navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(navn)
  `)

export type TournamentDetailsRow = QueryData<typeof _stevneDetaljerQuery>[number]

const _resultatRadQuery = supabase
  .from('resultat')
  .select(`
    plassering, nc_poeng, startnummer, kamp_poeng_innl, score_poeng_innl,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(navn),
    klasse:klasseid(navn),
    gruppe:gruppeid(navn)
  `)

export type ResultRow = QueryData<typeof _resultatRadQuery>[number]

// ── Funksjonar ────────────────────────────────────────────────────────────────

export async function getTournamentWithDetails(id: number): Promise<{ data: TournamentDetailsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn, erlagbasert),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:kastemetode!innledendekastemetodeid(navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(navn)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('getTournamentWithDetails', error)
  return { data, error }
}

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlResultatQuery = supabase.from('resultat').select('kasterid, startnummer, hcp, posisjon')
export type InitialResultRow = QueryData<typeof _innlResultatQuery>[number]

export async function getResultsForInitialRound(stevneid: number): Promise<{ data: InitialResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, startnummer, hcp, posisjon')
    .eq('stevneid', stevneid)
  if (error) logError('getResultsForInitialRound', error)
  return { data: data ?? [], error }
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslResultatQuery = supabase.from('resultat').select(`
  kasterid, startnummer, posisjon, plassering, runde_eliminert,
  gruppe:gruppeid(id, navn)
`)
export type FinalResultRow = QueryData<typeof _avslResultatQuery>[number]

export async function getResultsForFinalRound(stevneid: number): Promise<{ data: FinalResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('resultat')
    .select(`
      kasterid, startnummer, posisjon, plassering, runde_eliminert,
      gruppe:gruppeid(id, navn)
    `)
    .eq('stevneid', stevneid)
  if (error) logError('getResultsForFinalRound', error)
  return { data: data ?? [], error }
}

export async function getGroups(gruppeNamn: string[]): Promise<{ data: { id: number; navn: string }[]; error: unknown }> {
  const { data, error } = await supabase.from('gruppe').select('id, navn').in('navn', gruppeNamn)
  if (error) logError('getGroups', error)
  return { data: data ?? [], error }
}

export async function setGroupAssignment(
  stevneid: number,
  updates: { kasterid: number; gruppeid: number | null }[],
): Promise<{ error: unknown }> {
  if (!updates.length) return { error: null }
  const results = await Promise.all(
    updates.map(u =>
      supabase.from('resultat').update({ gruppeid: u.gruppeid }).eq('stevneid', stevneid).eq('kasterid', u.kasterid),
    ),
  )
  const err = results.find(r => r.error)?.error ?? null
  if (err) logError('setGroupAssignment', err)
  return { error: err }
}

export async function writePlacements(
  stevneid: number,
  stilling: { kasterid: number }[],
): Promise<{ error: unknown }> {
  if (!stilling.length) return { error: null }
  const results = await Promise.all(
    stilling.map((r, i) =>
      supabase.from('resultat').update({ plassering: i + 1 }).eq('stevneid', stevneid).eq('kasterid', r.kasterid),
    ),
  )
  const err = results.find(r => r.error)?.error ?? null
  if (err) logError('writePlacements', err)
  return { error: err }
}

export async function clearGroupAssignment(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('resultat').update({ gruppeid: null }).eq('stevneid', stevneid)
  if (error) logError('clearGroupAssignment', error)
  return { error }
}

// ── Resultat-side ─────────────────────────────────────────────────────────────

export async function getResultsForTournament(stevneId: number): Promise<{ data: ResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('resultat')
    .select(`
      plassering, nc_poeng, startnummer, kamp_poeng_innl, score_poeng_innl,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `)
    .eq('stevneid', stevneId)
    .order('plassering')
  if (error) logError('getResultsForTournament', error)
  return { data: data ?? [], error }
}
