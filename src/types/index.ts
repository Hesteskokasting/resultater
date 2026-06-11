import type { User } from '@supabase/supabase-js'
import type { Tables } from './database.types'

export type { Json, Tables } from './database.types'

// --- String literals ---

export type Rolle = 'admin' | 'klubbadmin' | 'bruker'
export type KoblingStatus = 'ingen' | 'venter' | 'godkjent' | 'avvist'

// --- Basis-entitetar (delsett av DB-rader) ---

export type Kaster = Pick<Tables<'kaster'>, 'id' | 'fornavn' | 'etternavn'>
export type Klubb = Pick<Tables<'klubb'>, 'id' | 'navn'>

// --- Businesslogikk-typar (kastemetoder-logikk) ---

export interface RundeOppsett {
  walkovers: number
  c3: number
  c2: number
}

export interface Runde1FormatTyped {
  A?: RundeOppsett | null
  B?: RundeOppsett | null
  nA?: number | null
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

// --- Auth ---

export interface Profil {
  rolle: Rolle
  kasterid: number | null
  kobling_status: KoblingStatus | null
  kobling_kasterid: number | null
}

export interface AuthUser {
  user: User
  profil: Profil | null
  klubber: number[]
}

// --- Routing ---

export type Params = Record<string, string | number | undefined>
export type PageRenderFn = (container: HTMLElement, params: Params) => void | Promise<void>

export interface Rute {
  pattern: RegExp
  side: PageRenderFn
  params: (match: RegExpMatchArray) => Params
}
