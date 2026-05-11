import { supabase } from '../supabase.js'
import { beregnKampPoeng } from './kamp.js'

function tilfeldigScore() {
  const s1 = Math.floor(Math.random() * 27)
  const s2 = Math.floor(Math.random() * 27)
  if (s1 < 21 && s2 < 21) {
    if (Math.random() < 0.5) return [Math.floor(Math.random() * 6) + 21, s2]
    return [s1, Math.floor(Math.random() * 6) + 21]
  }
  return [s1, s2]
}

export async function autoFullforInnledendeKamper(stevneid) {
  const { data: kamper } = await supabase
    .from('kamp')
    .select('id, er_walkover, spelarar:kamp_spelar(id, kasterid)')
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .eq('er_bekreftet', false)

  if (!kamper?.length) return

  const alleKasterids = new Set()

  for (const kamp of kamper) {
    const spelarar = kamp.spelarar ?? []

    if (kamp.er_walkover) {
      await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)
      for (const sp of spelarar) {
        if (sp.kasterid) alleKasterids.add(sp.kasterid)
      }
    } else {
      const [sp1, sp2] = spelarar
      const [s1, s2] = tilfeldigScore()
      const [kp1, kp2] = beregnKampPoeng(s1, s2)

      const updates = [supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)]
      if (sp1) {
        updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1, kamp_poeng: kp1 }).eq('id', sp1.id))
        if (sp1.kasterid) alleKasterids.add(sp1.kasterid)
      }
      if (sp2) {
        updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2, kamp_poeng: kp2 }).eq('id', sp2.id))
        if (sp2.kasterid) alleKasterids.add(sp2.kasterid)
      }
      await Promise.all(updates)
    }
  }

}

export async function slettKamperForFase(stevneid, fase) {
  const { data: kamper } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneid)
    .eq('fase', fase)

  const kampids = (kamper ?? []).map(k => k.id)
  if (!kampids.length) return

  const { data: spelarar } = await supabase
    .from('kamp_spelar')
    .select('id')
    .in('kampid', kampids)

  const spelarids = (spelarar ?? []).map(s => s.id)

  if (spelarids.length) {
    await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarids)
    await supabase.from('kamp_spelar').delete().in('kampid', kampids)
  }
  await supabase.from('kamp').delete().in('id', kampids)
}

export async function nullstillStevne(stevneid) {
  await slettKamperForFase(stevneid, 'avsluttende')
  await slettKamperForFase(stevneid, 'innledende')
  await supabase.from('resultat').delete().eq('stevneid', stevneid)
  await supabase.from('stevne')
    .update({ stevne_fase: 'ikke_startet', runde1_format: null })
    .eq('id', stevneid)
}