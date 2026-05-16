import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'

// ── Typar ─────────────────────────────────────────────────────────────────────

const _stevneDetaljerQuery = supabase
  .from('stevne')
  .select(`
    id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
    stevnetype:stevnetypeid(navn),
    kategori:kategoriid(navn),
    kontakt:kontaktkasterid(fornavn, etternavn),
    innledende:innledendekastemetodeid(navn),
    avsluttende:avsluttendekastemetodeid(navn)
  `)

export type StevneDetaljerRow = QueryData<typeof _stevneDetaljerQuery>[number]

const _resultatRadQuery = supabase
  .from('resultat')
  .select(`
    plassering, nc_poeng,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(navn),
    klasse:klasseid(navn),
    gruppe:gruppeid(navn)
  `)

export type ResultatRad = QueryData<typeof _resultatRadQuery>[number]

// ── Funksjonar ────────────────────────────────────────────────────────────────

export async function hentStevneMedDetaljer(id: number): Promise<{ data: StevneDetaljerRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('stevne')
    .select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:innledendekastemetodeid(navn),
      avsluttende:avsluttendekastemetodeid(navn)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentStevneMedDetaljer', error)
  return { data, error }
}

// ── Innledande fase ───────────────────────────────────────────────────────────

const _innlResultatQuery = supabase.from('resultat').select('kasterid, startnummer, hcp')
export type InnlResultatRow = QueryData<typeof _innlResultatQuery>[number]

export async function hentResultatForInnledende(stevneid: number): Promise<{ data: InnlResultatRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, startnummer, hcp')
    .eq('stevneid', stevneid)
  if (error) logError('hentResultatForInnledende', error)
  return { data: data ?? [], error }
}

export async function oppdaterResultatHcp(stevneid: number, kasterid: number, hcp: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from('resultat').update({ hcp }).eq('stevneid', stevneid).eq('kasterid', kasterid)
  if (error) logError('oppdaterResultatHcp', error)
  return { error }
}

// ── Resultat-side ─────────────────────────────────────────────────────────────

export async function hentResultaterForStevne(stevneId: number): Promise<{ data: ResultatRad[]; error: unknown }> {
  const { data, error } = await supabase
    .from('resultat')
    .select(`
      plassering, nc_poeng,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `)
    .eq('stevneid', stevneId)
    .order('plassering')
  if (error) logError('hentResultaterForStevne', error)
  return { data: data ?? [], error }
}
