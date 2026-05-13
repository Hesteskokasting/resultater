import { supabase } from '../supabase.js'
import type { Stevnetype, Kastemetode, Klubb, Kategori } from '../types'

export async function hentStevner(ar: number) {
  return supabase
    .from('stevne')
    .select(`
      id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `)
    .gte('dato', `${ar}-01-01`)
    .lte('dato', `${ar}-12-31`)
    .order('dato')
}

export interface Filtervalg {
  stevnetyper: Stevnetype[]
  kastemetoder: Kastemetode[]
  klubber: Klubb[]
  kategorier: Kategori[]
}

export async function hentFiltervalg(): Promise<Filtervalg> {
  const [stevnetyper, kastemetoder, klubber, kategorier] = await Promise.all([
    supabase.from('stevnetype').select('id, navn').order('navn'),
    supabase.from('kastemetode').select('id, navn').order('navn'),
    supabase.from('klubb').select('id, navn').order('navn'),
    supabase.from('kategori').select('id, navn').order('navn'),
  ])
  return {
    stevnetyper: stevnetyper.data ?? [],
    kastemetoder: kastemetoder.data ?? [],
    klubber: klubber.data ?? [],
    kategorier: kategorier.data ?? [],
  }
}

export async function hentPameldte(userId: string): Promise<Set<number>> {
  const { data } = await supabase
    .from('pamelding')
    .select('stevneid')
    .eq('bruker_id', userId)
  return new Set((data ?? []).map(r => r.stevneid))
}
