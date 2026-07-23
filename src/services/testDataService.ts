import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { calcMatchPoints, getMatchSides } from '@/utils/kamp'
import { logError } from '@/utils/logError'
import type { CourtFase } from '@/services/xkastKongelagService'
import { SHOES_PER_OMGANG } from '@/utils/omgangValidation'

// ── Types ─────────────────────────────────────────────────────────────────────

const _testKampQuery = supabase
  .from('kamp')
  .select('id, er_walkover, spelarar:kamp_spelar(id, kasterid)')

type TestMatchRow = QueryData<typeof _testKampQuery>[number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomScore(): [number, number] {
  const s1 = Math.floor(Math.random() * 27)
  const s2 = Math.floor(Math.random() * 27)
  if (s1 < 21 && s2 < 21) {
    if (Math.random() < 0.5) return [Math.floor(Math.random() * 6) + 21, s2]
    return [s1, Math.floor(Math.random() * 6) + 21]
  }
  return [s1, s2]
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function autoCompleteInitialRoundMatches(stevneid: number): Promise<void> {
  const { data: kamper, error } = await supabase
    .from('kamp')
    .select('id, er_walkover, spelarar:kamp_spelar(id, kasterid)')
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .eq('er_bekreftet', false)

  if (error) { logError('autoCompleteInitialRoundMatches', error); return }
  if (!kamper?.length) return

  // Side grouping via startnummer so Par matches (4 kamp_spelar rows) get the
  // side total on the rep and 0 on the partner — not random per-row scores.
  const { data: resultat, error: resErr } = await supabase
    .from('resultat')
    .select('kasterid, startnummer')
    .eq('stevneid', stevneid)
  if (resErr) { logError('autoCompleteInitialRoundMatches:resultat', resErr); return }
  const startnrMap: Record<number, number> = Object.fromEntries(
    (resultat ?? [])
      .filter((r): r is typeof r & { kasterid: number; startnummer: number } => r.kasterid != null && r.startnummer != null)
      .map(r => [r.kasterid, r.startnummer]),
  )

  for (const kamp of kamper as TestMatchRow[]) {
    const spelarar = (kamp.spelarar ?? []).filter(
      (s): s is typeof s & { kasterid: number } => s.kasterid != null,
    )
    const [side1, side2] = getMatchSides(spelarar, startnrMap)
    const [s1, s2] = kamp.er_walkover ? [21, 0] : randomScore()
    const [kp1, kp2] = calcMatchPoints(s1, s2)

    try {
      const updates: PromiseLike<unknown>[] = [
        supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id),
      ]
      for (const side of [side1, side2]) {
        if (!side) continue
        const [score, kampPoeng] = side === side1 ? [s1, kp1] : [s2, kp2]
        for (const m of side.members) {
          const isRep = m === side.rep
          updates.push(supabase.from('kamp_spelar').update({ score_poeng: isRep ? score : 0, kamp_poeng: kampPoeng }).eq('id', m.id))
        }
      }
      await Promise.all(updates)
    } catch (e) {
      logError('autoCompleteInitialRoundMatches:update', e)
    }
  }
}

/** Simulates one omgang shoe by shoe so the poeng/ringer pair always satisfies the DB CHECK. */
function randomOmgangEntry(): { poeng: number; antall_ringer: number } {
  let poeng = 0
  let ringer = 0
  for (let shoe = 0; shoe < SHOES_PER_OMGANG; shoe++) {
    if (Math.random() < 0.3) { poeng += 5; ringer++ }
    else poeng += Math.floor(Math.random() * 4)
  }
  return { poeng, antall_ringer: ringer }
}

/**
 * Dev helper: fills every missing omgang on unconfirmed X-kast/Kongelag courts
 * with random valid scores, then confirms each court via the RPC (which writes
 * the resultat columns — so carry-over can be tested end to end).
 */
export async function autoCompleteCourts(
  stevneid: number,
  fase: CourtFase,
  antallOmganger: number,
): Promise<void> {
  const { data: courts, error } = await supabase
    .from('xkast_kongelag')
    .select('id, deltakarar:xkast_kongelag_deltaker(id, omgangar:xkast_kongelag_omgang(omgang))')
    .eq('stevneid', stevneid)
    .eq('fase', fase)
    .eq('er_bekreftet', false)

  if (error) { logError('autoCompleteCourts', error); return }
  if (!courts?.length) return

  const missingRows = courts.flatMap(court => court.deltakarar.flatMap(participant => {
    const recorded = new Set(participant.omgangar.map(o => o.omgang))
    const rows: { xkast_kongelag_deltaker_id: number; omgang: number; poeng: number; antall_ringer: number }[] = []
    for (let omgang = 1; omgang <= antallOmganger; omgang++) {
      if (recorded.has(omgang)) continue
      rows.push({ xkast_kongelag_deltaker_id: participant.id, omgang, ...randomOmgangEntry() })
    }
    return rows
  }))

  if (missingRows.length) {
    const { error: insertError } = await supabase.from('xkast_kongelag_omgang').insert(missingRows)
    if (insertError) { logError('autoCompleteCourts:omgang', insertError); return }
  }

  for (const court of courts) {
    const { error: confirmError } = await supabase.rpc('confirm_xkast_kongelag', { p_xkast_kongelag_id: court.id })
    if (confirmError) { logError('autoCompleteCourts:confirm', confirmError); return }
  }
}

async function deleteMatchesForPhase(stevneid: number, fase: string): Promise<void> {
  const { data: kamper, error: kampErr } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneid)
    .eq('fase', fase)

  if (kampErr) { logError('deleteMatchesForPhase:kamp', kampErr); return }

  const kampids = (kamper ?? []).map(k => k.id)
  if (!kampids.length) return

  const { data: spelarar, error: spelarErr } = await supabase
    .from('kamp_spelar')
    .select('id')
    .in('kampid', kampids)

  if (spelarErr) { logError('deleteMatchesForPhase:spelar', spelarErr); return }

  const spelarids = (spelarar ?? []).map(s => s.id)

  if (spelarids.length) {
    const { error: omgErr } = await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarids)
    if (omgErr) { logError('deleteMatchesForPhase:omgang', omgErr); return }
    const { error: spDelErr } = await supabase.from('kamp_spelar').delete().in('kampid', kampids)
    if (spDelErr) { logError('deleteMatchesForPhase:spelarDel', spDelErr); return }
  }

  const { error: kampDelErr } = await supabase.from('kamp').delete().in('id', kampids)
  if (kampDelErr) logError('deleteMatchesForPhase:kampDel', kampDelErr)
}

export async function resetTournament(stevneid: number): Promise<{ error: unknown }> {
  const { error: reopenErr } = await supabase
    .from('stevne')
    .update({ stevne_fase: 'ikke_startet', runde1_format: null, erfullfort: false })
    .eq('id', stevneid)
  if (reopenErr) { logError('resetTournament:stevne', reopenErr); return { error: reopenErr } }

  await deleteMatchesForPhase(stevneid, 'avsluttende')
  await deleteMatchesForPhase(stevneid, 'innledende')

  // X-kast/Kongelag courts: deltaker and omgang rows cascade with the court
  // (ON DELETE CASCADE), so one delete covers all three tables.
  const { error: xkErr } = await supabase.from('xkast_kongelag').delete().eq('stevneid', stevneid)
  if (xkErr) { logError('resetTournament:xkast_kongelag', xkErr); return { error: xkErr } }

  const { error: resErr } = await supabase.from('resultat').delete().eq('stevneid', stevneid)
  if (resErr) logError('resetTournament:resultat', resErr)
  return { error: resErr }
}
