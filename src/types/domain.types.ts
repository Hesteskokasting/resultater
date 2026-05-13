import type { Tables } from './database.types'

// --- String literals ---

export type Rolle = 'admin' | 'klubbadmin' | 'bruker'
export type KoblingStatus = 'ingen' | 'venter' | 'godkjent' | 'avvist'
export type StevneFase = 'innledende' | 'avsluttende'
export type KampFase = 'innledende' | 'avsluttende'

// --- Basis-entitetar (delsett av DB-rader) ---

export type Kaster = Pick<Tables<'kaster'>, 'id' | 'fornavn' | 'etternavn'>
export type KasterFull = Tables<'kaster'> & {
  kjonn?: Tables<'kjonn'>
  klubb?: Klubb
  klasse?: Klasse
}

export type Klubb = Pick<Tables<'klubb'>, 'id' | 'navn'>
export type Klasse = Pick<Tables<'klasse'>, 'id' | 'navn'>
export type Kastemetode = Pick<Tables<'kastemetode'>, 'id' | 'navn'>
export type Stevnetype = Pick<Tables<'stevnetype'>, 'id' | 'navn'>
export type Kategori = Pick<Tables<'kategori'>, 'id' | 'navn'>

// --- Join-typar (Supabase selects med nøstede relasjonar) ---

export type StevneMedRelasjonar = Tables<'stevne'> & {
  klubb: Klubb | null
  stevnetype: Stevnetype | null
  innledende: Kastemetode | null
  avsluttende: Kastemetode | null
  kategori: Kategori | null
}

export type ResultatMedRelasjonar = Tables<'resultat'> & {
  kaster: Kaster
  klubb: Klubb
  klasse: Klasse
}

export type KampMedSpelararOgOmgangar = Tables<'kamp'> & {
  kamp_spelar: KampSpelarMedOmgangar[]
}

export type KampSpelarMedOmgangar = Tables<'kamp_spelar'> & {
  omgangar: Tables<'kamp_omgang'>[]
  kaster?: Kaster
}

// --- Businesslogikk-typar (kastemetoder-logikk) ---

export interface RundeOppsett {
  walkovers: number
  c3: number
  c2: number
}

export interface CupRunde {
  runde: number
  spelarar: number
  baner: number
  treSpelarar: boolean
  walkovers: number
  vidare: number
}

export interface CupParing {
  spelarar: (string | number)[]
  erWalkover: boolean
  erTreSpelarar: boolean
}

// --- Norgescup-typar ---

export interface SingelListeRad {
  navn: string
  klubb: string
  totalPoeng: number
  detaljRader: (ResultatMedRelasjonar & { _stevne?: { navn: string; dato: string | null; typeNavn: string } })[]
  plassering: number
}

export interface LagListeRad {
  klubb: Klubb
  lagTotal: number
  plassering: number
  bidragsytere: { kaster: Kaster; klubbId: number; sum: number }[]
}

// --- Auth ---

export interface Profil {
  rolle: Rolle
  kasterid: number | null
  kobling_status: KoblingStatus | null
  kobling_kasterid: number | null
}
