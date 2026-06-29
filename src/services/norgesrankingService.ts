import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

const _rankingStevneQuery = supabase
  .from('stevne')
  .select('id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)')

export type RankingTournamentRow = QueryData<typeof _rankingStevneQuery>[number]

const _rankingResultatQuery = supabase
  .from('resultat')
  .select(`
    id, kasterid, klubbid, stevneid,
    antall_ring_xkast, antall_ring_kongelag,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn)
  `)

export type RankingResultRow = QueryData<typeof _rankingResultatQuery>[number]

export async function getTournamentsAndResults(ar: number): Promise<{
  stevner: RankingTournamentRow[]
  resultater: RankingResultRow[]
  error: unknown
}> {
  const { data: allStevner, error: e1 } = await supabase
    .from('stevne')
    .select('id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)')
    .eq('ernorgesranking', true)
    .gte('dato', `${ar}-01-01`)
    .lte('dato', `${ar}-12-31`)

  if (e1) {
    logError('getTournamentsAndResults.stevner', e1)
    return { stevner: [], resultater: [], error: e1 }
  }

  const stevner = allStevner ?? []
  const ids = stevner.map(s => s.id)

  if (ids.length === 0) return { stevner, resultater: [], error: null }

  const { data: rader, error: e2 } = await supabase
    .from('resultat')
    .select(`
      id, kasterid, klubbid, stevneid,
      antall_ring_xkast, antall_ring_kongelag,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn)
    `)
    .in('stevneid', ids)

  if (e2) {
    logError('getTournamentsAndResults.resultater', e2)
    return { stevner, resultater: [], error: e2 }
  }

  const resultater = (rader ?? []).filter(r =>
    r.antall_ring_xkast != null || r.antall_ring_kongelag != null
  )

  return { stevner, resultater, error: null }
}
