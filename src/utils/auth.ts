import { supabase } from '../supabase.js'
import type { AuthUser, Profil, Rolle } from '../types'

const ROLLER = ['admin', 'klubbadmin', 'bruker'] as const

export function isRolle(value: unknown): value is Rolle {
  return typeof value === 'string' && (ROLLER as readonly string[]).includes(value)
}

export function isProfil(obj: unknown): obj is Profil {
  return obj !== null && typeof obj === 'object' && isRolle((obj as Record<string, unknown>).rolle)
}

// Cache per sesjon. Tømt ved SIGNED_OUT / ny innlogging.
let _cache: AuthUser | null = null

async function _hentCache(): Promise<AuthUser | null> {
  if (_cache) return _cache

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profil } = await supabase
    .from('bruker_profil')
    .select('rolle, kasterid, kobling_status, kobling_kasterid')
    .eq('id', session.user.id)
    .maybeSingle()

  let klubber: number[] = []
  if (profil?.rolle === 'klubbadmin') {
    const { data } = await supabase
      .from('klubbadmin_klubber')
      .select('klubbid')
      .eq('bruker_id', session.user.id)
    klubber = (data ?? []).map(r => r.klubbid)
  }

  _cache = { user: session.user, profil: isProfil(profil) ? profil : null, klubber }
  return _cache
}

export async function getUser(): Promise<AuthUser | null> {
  return _hentCache()
}

export async function getRolle(): Promise<Rolle | null> {
  const auth = await _hentCache()
  return auth?.profil?.rolle ?? null
}

export async function erInnlogget(): Promise<boolean> {
  return (await _hentCache()) !== null
}

export async function erAdmin(): Promise<boolean> {
  return (await getRolle()) === 'admin'
}

export async function erKlubbadmin(klubbId: number | string | null = null): Promise<boolean> {
  const auth = await _hentCache()
  if (!auth || auth.profil?.rolle !== 'klubbadmin') return false
  if (klubbId === null) return true
  return auth.klubber.includes(Number(klubbId))
}

export async function loggUt(): Promise<void> {
  _cache = null
  await supabase.auth.signOut()
}

// Abonner på auth-endringar. Tømer cache og sender DOM-event.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    _cache = null
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    _cache = null // tving re-henting med ny sesjon
  }
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: event }))
})
