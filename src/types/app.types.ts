import type { User } from '@supabase/supabase-js'
import type { Profil } from './domain.types'

export type PageRenderFn = (container: HTMLElement, params: Record<string, string>) => Promise<void>

export interface Rute {
  pattern: RegExp
  side: PageRenderFn
  params: (match: RegExpMatchArray) => Record<string, string>
}

export interface AuthUser {
  user: User
  profil: Profil | null
  klubber: number[]
}
