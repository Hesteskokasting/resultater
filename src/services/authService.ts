import { supabase } from '@/supabase'
import type { AuthUser, Profile, Role } from '@/types'
import { hentProfilForBruker } from '@/services/brukerProfilService'
import { getClubAdminClubsForUser } from '@/services/adminService'

const ROLES = ['admin', 'klubbadmin', 'bruker'] as const

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

function mapToProfile(obj: unknown): Profile | null {
  if (obj === null || typeof obj !== 'object') return null
  const raw = obj as Record<string, unknown>
  if (!isRole(raw.rolle)) return null
  return {
    role: raw.rolle,
    kasterid: typeof raw.kasterid === 'number' ? raw.kasterid : null,
    kobling_status: typeof raw.kobling_status === 'string' ? raw.kobling_status as Profile['kobling_status'] : null,
    kobling_kasterid: typeof raw.kobling_kasterid === 'number' ? raw.kobling_kasterid : null,
  }
}

// Cache per sesjon. Tømt ved SIGNED_OUT / ny innlogging.
let _cache: AuthUser | null = null
let _inflight: Promise<AuthUser | null> | null = null
let _intentionalSignOut = false
// Track whether an authenticated session is currently active, so the UI can tell
// "session expired" (auth → unauth) apart from restoring a dead token on load.
let _hasActiveSession = false
// Survives cache clearing on SIGNED_OUT so the re-auth modal can pre-fill the email.
let _lastKnownEmail: string | null = null

async function _fetchUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profilRow } = await hentProfilForBruker(session.user.id)

  let klubber: number[] = []
  if (profilRow?.rolle === 'klubbadmin') {
    const { data: klubbIds } = await getClubAdminClubsForUser(session.user.id)
    klubber = klubbIds
  }

  _lastKnownEmail = session.user.email ?? _lastKnownEmail
  _cache = { user: session.user, profil: mapToProfile(profilRow), klubber }
  return _cache
}

export function getLastKnownEmail(): string | null {
  return _lastKnownEmail
}

async function _fetchCache(): Promise<AuthUser | null> {
  if (_cache) return _cache
  if (_inflight) return _inflight
  _inflight = _fetchUser().finally(() => { _inflight = null })
  return _inflight
}

export async function getUser(): Promise<AuthUser | null> {
  return _fetchCache()
}

async function getRole(): Promise<Role | null> {
  const auth = await _fetchCache()
  return auth?.profil?.role ?? null
}

export async function erAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function erKlubbadmin(klubbId: number | string | null = null): Promise<boolean> {
  const auth = await _fetchCache()
  if (!auth || auth.profil?.role !== 'klubbadmin') return false
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
  if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
    _hasActiveSession = true
  }
  const intentional = _intentionalSignOut
  // Captured before reset: true only when an authenticated session was actually live.
  // On a SIGNED_OUT this also de-dupes — the reset means a second failed-refresh
  // SIGNED_OUT reports hadSession=false, so the "session expired" toast fires once.
  const hadSession = _hasActiveSession
  if (event === 'SIGNED_OUT') {
    _intentionalSignOut = false
    _hasActiveSession = false
    if (!intentional && hadSession) {
      // Log context to help diagnose unexpected sign-outs (token refresh failure, multi-tab, etc.)
      console.warn('[auth] Unexpected SIGNED_OUT event', {
        hadSession: session !== null,
        hadCache: _cache !== null,
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { event, intentional, hadSession } }))
})
