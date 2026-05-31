import type { User } from '@supabase/supabase-js'
import type { Profil } from './domain.types'

export type Params = Record<string, string | number | undefined>
export type PageRenderFn = (container: HTMLElement, params: Params) => void | Promise<void>

export interface Rute {
  pattern: RegExp
  side: PageRenderFn
  params: (match: RegExpMatchArray) => Params
}

export interface AuthUser {
  user: User
  profil: Profil | null
  klubber: number[]
}
