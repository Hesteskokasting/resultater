import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { beregnKampPoeng, getMatchSides } from '@/utils/kamp'
import { logError } from '@/utils/logError'

// ── Types ─────────────────────────────────────────────────────────────────────

const _testKampQuery = supabase
  .from('kamp')
  .select('id, er_walkover, spelarar:kamp_spelar(id, kasterid)')

type TestKampRow = QueryData<typeof _testKampQuery>[number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function tilfeldigScore(): [number, number] {
  const s1 = Math.floor(Math.random() * 27)
  const s2 = Math.floor(Math.random() * 27)
  if (s1 < 21 && s2 < 21) {
    if (Math.random() < 0.5) return [Math.floor(Math.random() * 6) + 21, s2]
    return [s1, Math.floor(Math.random() * 6) + 21]
  }
  return [s1, s2]
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function autoFullforInnledendeKamper(stevneid: number): Promise<void> {
  const { data: kamper, error } = await supabase
    .from('kamp')
    .select('id, er_walkover, spelarar:kamp_spelar(id, kasterid)')
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .eq('er_bekreftet', false)

  if (error) { logError('autoFullforInnledendeKamper', error); return }
  if (!kamper?.length) return

  // Side grouping via startnummer so Par matches (4 kamp_spelar rows) get the
  // side total on the rep and 0 on the partner — not random per-row scores.
  const { data: resultat, error: resErr } = await supabase
    .from('resultat')
    .select('kasterid, startnummer')
    .eq('stevneid', stevneid)
  if (resErr) { logError('autoFullforInnledendeKamper:resultat', resErr); return }
  const startnrMap: Record<number, number> = Object.fromEntries(
    (resultat ?? [])
      .filter((r): r is typeof r & { kasterid: number; startnummer: number } => r.kasterid != null && r.startnummer != null)
      .map(r => [r.kasterid, r.startnummer]),
  )

  for (const kamp of kamper as TestKampRow[]) {
    const spelarar = (kamp.spelarar ?? []).filter(
      (s): s is typeof s & { kasterid: number } => s.kasterid != null,
    )
    const [side1, side2] = getMatchSides(spelarar, startnrMap)
    const [s1, s2] = kamp.er_walkover ? [21, 0] : tilfeldigScore()
    const [kp1, kp2] = beregnKampPoeng(s1, s2)

    try {
      const updates: PromiseLike<unknown>[] = [
        supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id),
      ]
      for (const side of [side1, side2]) {
        if (!side) continue
        const [score, kampPoeng] = side === side1 ? [s1, kp1] : [s2, kp2]
        for (const m of side.members) {
          const erRep = m === side.rep
          updates.push(supabase.from('kamp_spelar').update({ score_poeng: erRep ? score : 0, kamp_poeng: kampPoeng }).eq('id', m.id))
        }
      }
      await Promise.all(updates)
    } catch (e) {
      logError('autoFullforInnledendeKamper:update', e)
    }
  }
}

export async function slettKamperForFase(stevneid: number, fase: string): Promise<void> {
  const { data: kamper, error: kampErr } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneid)
    .eq('fase', fase)

  if (kampErr) { logError('slettKamperForFase:kamp', kampErr); return }

  const kampids = (kamper ?? []).map(k => k.id)
  if (!kampids.length) return

  const { data: spelarar, error: spelarErr } = await supabase
    .from('kamp_spelar')
    .select('id')
    .in('kampid', kampids)

  if (spelarErr) { logError('slettKamperForFase:spelar', spelarErr); return }

  const spelarids = (spelarar ?? []).map(s => s.id)

  if (spelarids.length) {
    const { error: omgErr } = await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarids)
    if (omgErr) { logError('slettKamperForFase:omgang', omgErr); return }
    const { error: spDelErr } = await supabase.from('kamp_spelar').delete().in('kampid', kampids)
    if (spDelErr) { logError('slettKamperForFase:spelarDel', spDelErr); return }
  }

  const { error: kampDelErr } = await supabase.from('kamp').delete().in('id', kampids)
  if (kampDelErr) logError('slettKamperForFase:kampDel', kampDelErr)
}

export async function nullstillStevne(stevneid: number): Promise<void> {
  await slettKamperForFase(stevneid, 'avsluttende')
  await slettKamperForFase(stevneid, 'innledende')

  const { error: resErr } = await supabase.from('resultat').delete().eq('stevneid', stevneid)
  if (resErr) { logError('nullstillStevne:resultat', resErr); return }

  const { error: stevneErr } = await supabase
    .from('stevne')
    .update({ stevne_fase: 'ikke_startet', runde1_format: null })
    .eq('id', stevneid)
  if (stevneErr) logError('nullstillStevne:stevne', stevneErr)
}
