import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

const _kampSpelarQuery = supabase.from('kamp_spelar').select(`
  id, kasterid, posisjon,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid, posisjon,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`)

export type KampSpelarRow = QueryData<typeof _kampSpelarQuery>[number]

export async function hentMineKampar(kasterid: number): Promise<{ data: KampSpelarRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp_spelar')
    .select(`
      id, kasterid, posisjon,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid, posisjon,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `)
    .eq('kasterid', kasterid)
  if (error) logError('hentMineKampar', error)
  return { data: data ?? [], error }
}
