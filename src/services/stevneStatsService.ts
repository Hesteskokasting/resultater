import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

const _statsQuery = supabase.from('kamp').select(`
  id,
  er_walkover,
  er_tre_spelarar,
  spelarar:kamp_spelar(
    id,
    kasterid,
    score_poeng,
    omgangar:kamp_omgang(score, antall_ringer),
    kaster:kasterid(id, fornavn, etternavn)
  )
`)

export type StatsKampRow = QueryData<typeof _statsQuery>[number]

export async function hentKamperForStats(
  stevneId: number,
): Promise<{ data: StatsKampRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id,
      er_walkover,
      er_tre_spelarar,
      spelarar:kamp_spelar(
        id,
        kasterid,
        score_poeng,
        omgangar:kamp_omgang(score, antall_ringer),
        kaster:kasterid(id, fornavn, etternavn)
      )
    `)
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', true)
    .eq('er_walkover', false)
  if (error) logError('hentKamperForStats', error)
  return { data: data ?? [], error }
}
