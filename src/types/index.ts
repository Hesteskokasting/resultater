import type { User } from '@supabase/supabase-js'
import type { Tables } from './database.types'

export type { Json, Tables } from './database.types'

// --- String literals ---

export type Role = 'admin' | 'klubbadmin' | 'bruker'
export type LinkStatus = 'ingen' | 'venter' | 'godkjent' | 'avvist'

// --- Basis-entitetar (delsett av DB-rader) ---

export type Kaster = Pick<Tables<'kaster'>, 'id' | 'fornavn' | 'etternavn'>
export type Klubb = Pick<Tables<'klubb'>, 'id' | 'navn'>

// --- Businesslogikk-typar (kastemetoder-logikk) ---

export interface RoundSetup {
  walkovers: number
  c3: number
  c2: number
}

export interface Round1FormatTyped {
  A?: RoundSetup | null
  B?: RoundSetup | null
  nA?: number | null
}

export interface CupRound {
  runde: number
  players: number
  lanes: number
  threePlayers: boolean
  walkovers: number
  advancing: number
}

export interface CupPairing {
  players: (string | number)[]
  isWalkover: boolean
  isThreePlayers: boolean
}

// --- Auth ---

export interface Profile {
  role: Role
  kasterid: number | null
  kobling_status: LinkStatus | null
  kobling_kasterid: number | null
}

export interface AuthUser {
  user: User
  profil: Profile | null
  clubs: number[]
}

// --- Routing ---

export type Params = Record<string, string | number | undefined>
export type PageRenderFn = (container: HTMLElement, params: Params) => void | Promise<void>

export interface Route {
  pattern: RegExp
  page: PageRenderFn
  params: (match: RegExpMatchArray) => Params
}
