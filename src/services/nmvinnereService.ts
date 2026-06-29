import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

// ── Typar ─────────────────────────────────────────────────────────────────────

export interface NMCategoryConfig {
  id: number
  navn: string
  kjonnFilter: 'historisk' | 'alltid' | false
  fraaAr: number
  aapentFraAr?: number
  merknad?: string
}

export type NMGender = 'open' | 'alle' | 'herrer' | 'damer'

const _nmResultatQuery = supabase
  .from('resultat')
  .select('id, klasseid, kaster:kasterid(id, fornavn, etternavn), klubb:klubbid(id, navn), stevne:stevneid(id, dato)')

export type NMResultRow = QueryData<typeof _nmResultatQuery>[number]

// ── Caches ────────────────────────────────────────────────────────────────────

const _dataCache = new Map<string, { data: NMResultRow[]; error: unknown }>()
let _kjonnCache: { id: number; navn: string }[] | null = null

// ── Private helpers ───────────────────────────────────────────────────────────

const ALLE_GYLDIGE_KLASSAR = [1, 3, 4, 13, 16, 21, 23, 24, 27, 29, 32]

async function hentKjonnIder(): Promise<{ id: number; navn: string }[]> {
  if (_kjonnCache) return _kjonnCache
  const { data, error } = await supabase.from('kjonn').select('id, navn')
  if (error) logError('hentKjonnIder', error)
  _kjonnCache = data ?? []
  return _kjonnCache
}

function finnKjonnId(kjonnListe: { id: number; navn: string }[], kjonn: NMGender): number | undefined {
  const needle = kjonn === 'damer' ? 'dame' : 'herre'
  return kjonnListe.find(k => k.navn.toLowerCase().includes(needle))?.id
}

// ── Eksportert funksjon ───────────────────────────────────────────────────────

export async function getNMData(
  kategori: NMCategoryConfig,
  kjonn: NMGender,
): Promise<{ data: NMResultRow[]; error: unknown }> {
  const cacheKey = `${kategori.id}-${kjonn}`
  if (_dataCache.has(cacheKey)) return _dataCache.get(cacheKey)!

  let stevneQuery = supabase
    .from('stevne')
    .select('id, dato')
    .eq('ernm', true)
    .eq('kategoriid', kategori.id)

  if (kategori.kjonnFilter === 'historisk' && kategori.aapentFraAr != null) {
    if (kjonn === 'open') {
      stevneQuery = stevneQuery.gte('dato', `${kategori.aapentFraAr}-01-01`)
    } else {
      stevneQuery = stevneQuery.lt('dato', `${kategori.aapentFraAr}-01-01`)
    }
  }

  const { data: stevner, error: e1 } = await stevneQuery
  if (e1) {
    logError('getNMData.stevner', e1)
    return { data: [], error: e1 }
  }

  const ids = (stevner ?? []).map(s => s.id)
  if (!ids.length) {
    const empty = { data: [] as NMResultRow[], error: null }
    _dataCache.set(cacheKey, empty)
    return empty
  }

  const filtrertPaaKjonn = (kategori.kjonnFilter === 'historisk' && kjonn !== 'open') ||
                           (kategori.kjonnFilter === 'alltid' && kjonn !== 'alle')

  const kasterJoin = filtrertPaaKjonn
    ? 'kaster:kasterid!inner(id, fornavn, etternavn)'
    : 'kaster:kasterid(id, fornavn, etternavn)'

  let resultatQuery = supabase
    .from('resultat')
    .select(`id, klasseid, ${kasterJoin}, klubb:klubbid(id, navn), stevne:stevneid(id, dato)`)
    .eq('plassering', 1)
    .in('stevneid', ids)
    .in('klasseid', ALLE_GYLDIGE_KLASSAR)
    .or('gruppeid.is.null,gruppeid.neq.2')

  if (filtrertPaaKjonn) {
    const kjonnListe = await hentKjonnIder()
    const kjonnId = finnKjonnId(kjonnListe, kjonn)
    if (kjonnId) resultatQuery = resultatQuery.eq('kaster.kjonnid', kjonnId)
  }

  if (kategori.kjonnFilter === 'historisk' && kjonn === 'open') {
    resultatQuery = resultatQuery.eq('klasseid', 1)
  }

  const { data: rader, error: e2 } = await resultatQuery
  if (e2) {
    logError('getNMData.resultater', e2)
    return { data: [], error: e2 }
  }

  const entry = { data: (rader ?? []) as NMResultRow[], error: null }
  _dataCache.set(cacheKey, entry)
  return entry
}
