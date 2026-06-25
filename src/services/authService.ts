import { supabase } from '@/supabase'
import type { AuthUser, Profil, Rolle } from '@/types'
import { hentProfilForBruker } from '@/services/brukerProfilService'
import { hentKlubbadminKlubbarForBruker } from '@/services/adminService'

const ROLLER = ['admin', 'klubbadmin', 'bruker'] as const

function isRolle(value: unknown): value is Rolle {
  return typeof value === 'string' && (ROLLER as readonly string[]).includes(value)
}

function isProfil(obj: unknown): obj is Profil {
  return obj !== null && typeof obj === 'object' && isRolle((obj as Record<string, unknown>).rolle)
}

// Cache per sesjon. Tømt ved SIGNED_OUT / ny innlogging.
let _cache: AuthUser | null = null
let _inflight: Promise<AuthUser | null> | null = null
let _intentionalSignOut = false

async function _fetchUser(): Promise<AuthUser | null> {
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

async function _hentCache(): Promise<AuthUser | null> {
  if (_cache) return _cache
  if (_inflight) return _inflight
  _inflight = _fetchUser().finally(() => { _inflight = null })
  return _inflight
}

export async function getUser(): Promise<AuthUser | null> {
  return _hentCache()
}

async function getRolle(): Promise<Rolle | null> {
  const auth = await _hentCache()
  return auth?.profil?.rolle ?? null
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
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    _cache = null
    _inflight = null
    // SIGNED_IN: no cache clear needed — before real login _cache is already null (cleared by loggUt());
    // for session restore on page load, the cache is valid and clearing it causes a redundant DB fetch.
  }
  const intentional = _intentionalSignOut
  if (event === 'SIGNED_OUT') {
    _intentionalSignOut = false
    if (!intentional) {
      // Log context to help diagnose unexpected sign-outs (token refresh failure, multi-tab, etc.)
      console.warn('[auth] Unexpected SIGNED_OUT event', {
        hadSession: session !== null,
        hadCache: _cache !== null,
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { event, intentional } }))
})
