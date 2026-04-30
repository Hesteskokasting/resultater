import { supabase } from '../supabase.js'

export function beregnKampPoeng(s1, s2) {
  if (s1 === s2) return [1.5, 1.5]
  if (s1 > s2) return [2, s2 >= 11 ? 1 : 0]
  return [s1 >= 11 ? 1 : 0, 2]
}

export function hentP1P2(spelarar, startnrMap) {
  const sp = spelarar ?? []
  if (sp.some(s => s.posisjon != null)) {
    return [sp.find(s => s.posisjon === 1) ?? null, sp.find(s => s.posisjon === 2) ?? null]
  }
  const sorted = [...sp].sort(
    (a, b) => (startnrMap[a.kasterid] ?? Infinity) - (startnrMap[b.kasterid] ?? Infinity)
  )
  return [sorted[0] ?? null, sorted[1] ?? null]
}

export function scoreForSp(sp) {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.score ?? 0), 0)
  return sp?.score_poeng ?? 0
}

export function ringerForSp(sp) {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0)
  return sp?.antall_ringer ?? 0
}

export async function oppdaterResultatInnl(stevneid, kasterids, fase) {
  const { data: kamper } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneid)
    .eq('er_bekreftet', true)
    .eq('fase', fase)

  const kampids = (kamper ?? []).map(k => k.id)
  if (!kampids.length) return

  for (const kasterid of kasterids) {
    const { data } = await supabase
      .from('kamp_spelar')
      .select('score_poeng, kamp_poeng')
      .eq('kasterid', kasterid)
      .in('kampid', kampids)

    const scoreInnl = (data ?? []).reduce((s, r) => s + r.score_poeng, 0)
    const kampInnl = (data ?? []).reduce((s, r) => s + r.kamp_poeng, 0)

    await supabase.from('resultat')
      .update({ score_poeng_innl: scoreInnl, kamp_poeng_innl: kampInnl })
      .eq('stevneid', stevneid)
      .eq('kasterid', kasterid)
  }
}
