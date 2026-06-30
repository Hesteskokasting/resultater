import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/supabase'
import { logError } from '@/utils/logError'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NMCategoryConfig {
  id: number
  name: string
  genderFilter: 'historical' | 'always' | false
  fromYear: number
  openFromYear?: number
  note?: string
}

export type NMGender = 'open' | 'all' | 'men' | 'women'

const _nmResultatQuery = supabase
  .from('resultat')
  .select('id, klasseid, kaster:kasterid(id, fornavn, etternavn), klubb:klubbid(id, navn), stevne:stevneid(id, dato)')

export type NMResultRow = QueryData<typeof _nmResultatQuery>[number]

// ── Caches ────────────────────────────────────────────────────────────────────

const _dataCache = new Map<string, { data: NMResultRow[]; error: unknown }>()
let _genderCache: { id: number; navn: string }[] | null = null

// ── Private helpers ───────────────────────────────────────────────────────────

const ALL_VALID_CLASSES = [1, 3, 4, 13, 16, 21, 23, 24, 27, 29, 32]

async function getGenderIds(): Promise<{ id: number; navn: string }[]> {
  if (_genderCache) return _genderCache
  const { data, error } = await supabase.from('kjonn').select('id, navn')
  if (error) logError('getGenderIds', error)
  _genderCache = data ?? []
  return _genderCache
}

function findGenderId(genderList: { id: number; navn: string }[], gender: NMGender): number | undefined {
  const needle = gender === 'women' ? 'dame' : 'herre'
  return genderList.find(k => k.navn.toLowerCase().includes(needle))?.id
}

// ── Exported function ─────────────────────────────────────────────────────────

export async function getNMData(
  category: NMCategoryConfig,
  gender: NMGender,
): Promise<{ data: NMResultRow[]; error: unknown }> {
  const cacheKey = `${category.id}-${gender}`
  if (_dataCache.has(cacheKey)) return _dataCache.get(cacheKey)!

  let stevneQuery = supabase
    .from('stevne')
    .select('id, dato')
    .eq('ernm', true)
    .eq('kategoriid', category.id)

  if (category.genderFilter === 'historical' && category.openFromYear != null) {
    if (gender === 'open') {
      stevneQuery = stevneQuery.gte('dato', `${category.openFromYear}-01-01`)
    } else {
      stevneQuery = stevneQuery.lt('dato', `${category.openFromYear}-01-01`)
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

  const filterByGender = (category.genderFilter === 'historical' && gender !== 'open') ||
                         (category.genderFilter === 'always' && gender !== 'all')

  const kasterJoin = filterByGender
    ? 'kaster:kasterid!inner(id, fornavn, etternavn)'
    : 'kaster:kasterid(id, fornavn, etternavn)'

  let resultatQuery = supabase
    .from('resultat')
    .select(`id, klasseid, ${kasterJoin}, klubb:klubbid(id, navn), stevne:stevneid(id, dato)`)
    .eq('plassering', 1)
    .in('stevneid', ids)
    .in('klasseid', ALL_VALID_CLASSES)
    .or('gruppeid.is.null,gruppeid.neq.2')

  if (filterByGender) {
    const genderList = await getGenderIds()
    const genderId = findGenderId(genderList, gender)
    if (genderId) resultatQuery = resultatQuery.eq('kaster.kjonnid', genderId)
  }

  if (category.genderFilter === 'historical' && gender === 'open') {
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
