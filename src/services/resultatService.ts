import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { verifyRowsAffected } from '@/utils/verifiedWrite'
import type { KongelagSeedingRow } from '@/utils/kongelagSeeding'

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

export async function getGroups(groupNames: string[]): Promise<{ data: { id: number; navn: string }[]; error: unknown }> {
  const { data, error } = await supabase.from('gruppe').select('id, navn').in('navn', groupNames)
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
      verifyRowsAffected(
        supabase.from('resultat').update({ gruppeid: u.gruppeid }).eq('stevneid', stevneid).eq('kasterid', u.kasterid).select('id'),
      ),
    ),
  )
  const err = results.find(r => r.error)?.error ?? null
  if (err) logError('setGroupAssignment', err)
  return { error: err }
}

export async function writePlacements(
  stevneid: number,
  placements: { kasterid: number }[],
): Promise<{ error: unknown }> {
  if (!placements.length) return { error: null }
  const results = await Promise.all(
    placements.map((r, i) =>
      supabase.from('resultat').update({ plassering: i + 1 }).eq('stevneid', stevneid).eq('kasterid', r.kasterid),
    ),
  )
  const err = results.find(r => r.error)?.error ?? null
  if (err) logError('writePlacements', err)
  return { error: err }
}

/**
 * Innledende results used to seed Kongelag courts (see @/utils/kongelagSeeding).
 * X-kast totals come from resultat (written by the confirm RPC); kamp totals
 * come from the innledende_kamp_poeng view — resultat.kamp_poeng_innl has
 * been unwritten since the sync triggers were dropped (20260521120000).
 */
export async function getKongelagSeedingRows(
  stevneid: number,
): Promise<{ data: KongelagSeedingRow[]; error: unknown }> {
  try {
    const [resultatRes, kampRes] = await Promise.all([
      supabase
        .from('resultat')
        .select('kasterid, poeng_xkast, antall_ring_xkast')
        .eq('stevneid', stevneid)
        .not('kasterid', 'is', null),
      supabase
        .from('innledende_kamp_poeng')
        .select('kasterid, kamp_poeng_innl, score_poeng_innl')
        .eq('stevneid', stevneid),
    ])
    const error = resultatRes.error ?? kampRes.error
    if (error) {
      logError('getKongelagSeedingRows', error)
      return { data: [], error }
    }

    const kampByKasterid = new Map(
      (kampRes.data ?? [])
        .filter((r): r is typeof r & { kasterid: number } => r.kasterid != null)
        .map(r => [r.kasterid, r]),
    )
    const rows = (resultatRes.data ?? [])
      .filter((r): r is typeof r & { kasterid: number } => r.kasterid != null)
      .map(r => ({
        kasterid: r.kasterid,
        poeng_xkast: r.poeng_xkast,
        antall_ring_xkast: r.antall_ring_xkast,
        kamp_poeng_innl: kampByKasterid.get(r.kasterid)?.kamp_poeng_innl ?? null,
        score_poeng_innl: kampByKasterid.get(r.kasterid)?.score_poeng_innl ?? null,
      }))
    return { data: rows, error: null }
  } catch (e) {
    logError('getKongelagSeedingRows', e)
    return { data: [], error: e }
  }
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
