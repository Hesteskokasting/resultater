import type { QueryData, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

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
