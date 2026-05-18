import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

// ── Type-inferens-buildarar ───────────────────────────────────────────────────

const _resultaterQuery = supabase
  .from('resultat')
  .select(`
    id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `)

export type ResultatMedRelasjonar = QueryData<typeof _resultaterQuery>[number]

const _stevneNcQuery = supabase
  .from('stevne')
  .select('id, navn, dato, stevnetype:stevnetypeid(id, navn)')

export type StevneForNc = QueryData<typeof _stevneNcQuery>[number]

// ── Private ───────────────────────────────────────────────────────────────────

const NC_TYPER = ['NC', 'SNC', 'DNC']

// ── Eksporterte funksjonar ────────────────────────────────────────────────────

export async function hentRegler(ar: number) {
  const { data, error } = await supabase
    .from('antallTellendeNc')
    .select('id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc')
    .eq('year', ar)
    .maybeSingle()
  if (error) logError('hentRegler', error)
  return { data, error }
}

export async function hentStevnerOgResultater(ar: number) {
  const { data: allStevner, error: e1 } = await supabase
    .from('stevne')
    .select('id, navn, dato, stevnetype:stevnetypeid(id, navn)')
    .gte('dato', `${ar}-01-01`)
    .lte('dato', `${ar}-12-31`)

  if (e1) {
    logError('hentStevnerOgResultater.stevner', e1)
    return { stevner: [] as StevneForNc[], resultater: [] as ResultatMedRelasjonar[], error: e1 }
  }

  const ncStevner = (allStevner ?? []).filter(s => NC_TYPER.includes(s.stevnetype?.navn ?? ''))
  const ids = ncStevner.map(s => s.id)

  if (ids.length === 0) return { stevner: ncStevner, resultater: [] as ResultatMedRelasjonar[], error: null }

  const { data: resultater, error: e2 } = await supabase
    .from('resultat')
    .select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn)
    `)
    .in('stevneid', ids)
    .not('nc_poeng', 'is', null)
    .gt('nc_poeng', 0)

  if (e2) logError('hentStevnerOgResultater.resultater', e2)
  return { stevner: ncStevner, resultater: resultater ?? [], error: e2 }
}
