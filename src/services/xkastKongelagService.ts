import type { QueryData, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'
import { getKongelagSeedingRows } from '@/services/resultatService'
import { getEnrolledPlayers } from '@/services/pameldingService'
import { orderKongelagSeeding, buildKongelagCourts } from '@/utils/kongelagSeeding'

// ── Court reads ───────────────────────────────────────────────────────────────

const _courtsQuery = supabase.from('xkast_kongelag').select(`
  id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
  deltakarar:xkast_kongelag_deltaker(
    id, kasterid, poeng, antall_ringer,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
  )
`)

export type CourtRow = QueryData<typeof _courtsQuery>[number]
export type CourtParticipantRow = CourtRow['deltakarar'][number]
export type CourtOmgangRow = CourtParticipantRow['omgangar'][number]

export type CourtFase = 'innledende' | 'avsluttende'

export async function getCourts(
  stevneid: number,
  fase: CourtFase,
): Promise<{ data: CourtRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('xkast_kongelag')
    .select(`
      id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
      deltakarar:xkast_kongelag_deltaker(
        id, kasterid, poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
      )
    `)
    .eq('stevneid', stevneid)
    .eq('fase', fase)
    .order('pulje')
    .order('bane_nummer')
  if (error) logError('getCourts', error)
  return { data: data ?? [], error }
}

// ── Stevne config ─────────────────────────────────────────────────────────────

/** Shared config for the X-kast/Kongelag court views (see @/organizer/xkastKongelagView). */
export interface CourtPhaseConfig {
  antallOmganger: number | null
  tilgjengeligeBaner: number | null
  stevneFase: string | null
  erfullfort: boolean
  hasInitialPhase: boolean
  hasFinalPhase: boolean
}

export async function getXkastConfig(
  stevneid: number,
): Promise<{ data: CourtPhaseConfig | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      tilgjengelige_baner, stevne_fase, erfullfort, innledendekastemetodeid, avsluttendekastemetodeid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(antall_omganger)
    `)
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('getXkastConfig', error)
  return {
    data: data
      ? {
          antallOmganger: data.kastemetodeInnl?.antall_omganger ?? null,
          tilgjengeligeBaner: data.tilgjengelige_baner,
          stevneFase: data.stevne_fase,
          erfullfort: data.erfullfort ?? false,
          hasInitialPhase: data.innledendekastemetodeid != null,
          hasFinalPhase: data.avsluttendekastemetodeid != null,
        }
      : null,
    error,
  }
}

export async function getKongelagConfig(
  stevneid: number,
): Promise<{ data: CourtPhaseConfig | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      tilgjengelige_baner, stevne_fase, erfullfort, innledendekastemetodeid, avsluttendekastemetodeid,
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(antall_omganger)
    `)
    .eq('id', stevneid)
    .maybeSingle()
  if (error) logError('getKongelagConfig', error)
  return {
    data: data
      ? {
          antallOmganger: data.kastemetodeAvsl?.antall_omganger ?? null,
          tilgjengeligeBaner: data.tilgjengelige_baner,
          stevneFase: data.stevne_fase,
          erfullfort: data.erfullfort ?? false,
          hasInitialPhase: data.innledendekastemetodeid != null,
          hasFinalPhase: data.avsluttendekastemetodeid != null,
        }
      : null,
    error,
  }
}

// ── Innledende completion (gate for starting Kongelag) ────────────────────────

/**
 * True when the innledende phase has content and everything is confirmed —
 * covers both kamp-based innledende (Gloppen/NHM) and X-kast courts.
 */
export async function isInnledendeComplete(
  stevneid: number,
): Promise<{ data: boolean; error: unknown }> {
  try {
    const [kampTotal, kampOpen, courtTotal, courtOpen] = await Promise.all([
      supabase.from('kamp').select('id', { count: 'exact', head: true })
        .eq('stevneid', stevneid).eq('fase', 'innledende'),
      supabase.from('kamp').select('id', { count: 'exact', head: true })
        .eq('stevneid', stevneid).eq('fase', 'innledende').eq('er_bekreftet', false).eq('er_walkover', false),
      supabase.from('xkast_kongelag').select('id', { count: 'exact', head: true })
        .eq('stevneid', stevneid).eq('fase', 'innledende'),
      supabase.from('xkast_kongelag').select('id', { count: 'exact', head: true })
        .eq('stevneid', stevneid).eq('fase', 'innledende').eq('er_bekreftet', false),
    ])
    const error = kampTotal.error ?? kampOpen.error ?? courtTotal.error ?? courtOpen.error
    if (error) {
      logError('isInnledendeComplete', error)
      return { data: false, error }
    }
    const total = (kampTotal.count ?? 0) + (courtTotal.count ?? 0)
    const open = (kampOpen.count ?? 0) + (courtOpen.count ?? 0)
    return { data: total > 0 && open === 0, error: null }
  } catch (e) {
    logError('isInnledendeComplete', e)
    return { data: false, error: e }
  }
}

// ── Kongelag court generation ─────────────────────────────────────────────────

/**
 * Standalone Kongelag (no innledende metode): draws a random start order from
 * enrollment and creates the resultat rows the confirm RPC writes to.
 * Returns kasterids in drawn order.
 */
async function _seedStandaloneKongelag(
  stevneid: number,
): Promise<{ data: number[]; error: unknown }> {
  const { data: players, error } = await getEnrolledPlayers(stevneid)
  if (error) return { data: [], error }
  if (!players.length) {
    const noPlayersError = new Error('generateKongelagCourts: no enrolled players')
    logError('generateKongelagCourts', noPlayersError)
    return { data: [], error: noPlayersError }
  }

  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j]!, players[i]!]
  }

  const { error: insertError } = await supabase.from('resultat').insert(
    players.map((p, i) => ({
      stevneid,
      kasterid: p.kasterid,
      klubbid: p.klubbid,
      startnummer: i + 1,
      posisjon: null,
    })),
  )
  if (insertError) {
    logError('generateKongelagCourts:resultat', insertError)
    return { data: [], error: insertError }
  }
  return { data: players.map(p => p.kasterid), error: null }
}

/**
 * Seeds Kongelag courts best-first (pulje 1, bane 1), puljer capped by
 * stevne.tilgjengelige_baner, one player per court. Order comes from
 * innledende results; a standalone Kongelag draws randomly from enrollment
 * (and creates the resultat rows) instead.
 */
export async function generateKongelagCourts(stevneid: number): Promise<{ error: unknown }> {
  const { data: config, error: configError } = await getKongelagConfig(stevneid)
  if (configError || !config) return { error: configError ?? new Error('Stevne ikkje funne') }

  let kasterids: number[]
  if (config.hasInitialPhase) {
    const { data: seedingRows, error: seedingError } = await getKongelagSeedingRows(stevneid)
    if (seedingError) return { error: seedingError }
    if (!seedingRows.length) {
      const error = new Error('generateKongelagCourts: no resultat rows to seed from')
      logError('generateKongelagCourts', error)
      return { error }
    }
    kasterids = orderKongelagSeeding(seedingRows)
  } else {
    const { data, error } = await _seedStandaloneKongelag(stevneid)
    if (error) return { error }
    kasterids = data
  }

  const courts = buildKongelagCourts(kasterids, config.tilgjengeligeBaner)
  return createCourts(stevneid, 'avsluttende', courts)
}

// ── Court generation (admin) ──────────────────────────────────────────────────

export interface NewCourt {
  pulje: number
  baneNummer: number
  kasterids: number[]
}

/**
 * Creates courts and their participants for one fase. Two batched inserts;
 * returned court ids are matched to input via (pulje, bane_nummer), which is
 * unique within one generation run.
 */
export async function createCourts(
  stevneid: number,
  fase: CourtFase,
  courts: NewCourt[],
): Promise<{ error: unknown }> {
  if (!courts.length) return { error: null }

  const { data: inserted, error: courtError } = await supabase
    .from('xkast_kongelag')
    .insert(courts.map(c => ({ stevneid, fase, pulje: c.pulje, bane_nummer: c.baneNummer })))
    .select('id, pulje, bane_nummer')
  if (courtError || !inserted) {
    logError('createCourts', courtError)
    return { error: courtError }
  }

  const idByKey = new Map(inserted.map(row => [`${row.pulje}-${row.bane_nummer}`, row.id]))
  const participants = courts.flatMap(c => {
    const courtId = idByKey.get(`${c.pulje}-${c.baneNummer}`)
    if (courtId === undefined) return []
    return c.kasterids.map(kasterid => ({ xkast_kongelag_id: courtId, kasterid }))
  })

  if (participants.length !== courts.reduce((n, c) => n + c.kasterids.length, 0)) {
    const error = new Error('createCourts: inserted courts could not be matched back to input')
    logError('createCourts', error)
    return { error }
  }

  const { error: participantError } = await supabase
    .from('xkast_kongelag_deltaker')
    .insert(participants)
  if (participantError) logError('createCourts', participantError)
  return { error: participantError }
}

/** Removes all courts for one fase (cascade deletes participants and omganger). */
export async function deleteCourts(
  stevneid: number,
  fase: CourtFase,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('xkast_kongelag')
    .delete()
    .eq('stevneid', stevneid)
    .eq('fase', fase)
  if (error) logError('deleteCourts', error)
  return { error }
}

// ── Omgang writes ─────────────────────────────────────────────────────────────

export async function saveOmgang(
  deltakerId: number,
  omgang: number,
  poeng: number,
  antallRinger: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('xkast_kongelag_omgang')
    .upsert(
      { xkast_kongelag_deltaker_id: deltakerId, omgang, poeng, antall_ringer: antallRinger },
      { onConflict: 'xkast_kongelag_deltaker_id,omgang' },
    )
  if (error) logError('saveOmgang', error)
  return { error }
}

// ── Confirmation ──────────────────────────────────────────────────────────────

/** Atomic confirm via RPC: aggregates omganger, writes resultat, locks the court. */
export async function confirmCourt(xkastKongelagId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc('confirm_xkast_kongelag', {
    p_xkast_kongelag_id: xkastKongelagId,
  })
  if (error) logError('confirmCourt', error)
  return { error }
}

// ── Realtime ──────────────────────────────────────────────────────────────────

/** Fires onChange for court/omgang writes in this stevne (omgang events are unfiltered — payload lacks stevneid — matching subscribeToMatchChanges). */
export function subscribeToCourtChanges(
  stevneid: number,
  channelName: string,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'xkast_kongelag_omgang' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'xkast_kongelag' }, (payload) => {
      const sid = (payload.new as { stevneid?: number })?.stevneid ?? (payload.old as { stevneid?: number })?.stevneid
      if (sid === stevneid) onChange()
    })
    .subscribe()
}
