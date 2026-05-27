import { supabase } from '@/supabase'
import type { AuthUser, Profil, Rolle } from '@/types'
import { hentProfilForBruker } from '@/services/brukerProfilService'
import { hentKlubbadminKlubbarForBruker } from '@/services/adminService'

const ROLLER = ['admin', 'klubbadmin', 'bruker'] as const

export function isRolle(value: unknown): value is Rolle {
  return typeof value === 'string' && (ROLLER as readonly string[]).includes(value)
}

export function isProfil(obj: unknown): obj is Profil {
  return obj !== null && typeof obj === 'object' && isRolle((obj as Record<string, unknown>).rolle)
}

// Cache per sesjon. Tømt ved SIGNED_OUT / ny innlogging.
let _cache: AuthUser | null = null
let _intentionalSignOut = false

async function _hentCache(): Promise<AuthUser | null> {
  if (_cache) return _cache

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profil } = await hentProfilForBruker(session.user.id)

  let klubber: number[] = []
  if (profil?.rolle === 'klubbadmin') {
    const { data: klubbIds } = await hentKlubbadminKlubbarForBruker(session.user.id)
    klubber = klubbIds
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
  _intentionalSignOut = true
  _cache = null
  await supabase.auth.signOut()
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

// Abonner på auth-endringar. Tømer cache og sender DOM-event.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    _cache = null
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    _cache = null // tving re-henting med ny sesjon
  }
  const intentional = _intentionalSignOut
  if (event === 'SIGNED_OUT') _intentionalSignOut = false
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { event, intentional } }))
})
