import { Capacitor } from '@capacitor/core'
import { supabase } from '@/supabase'
import type { AuthUser, Profile, Role } from '@/types'
import { getProfileForUser } from '@/services/brukerProfilService'
import { getClubAdminClubsForUser } from '@/services/adminService'
import { generateNonce } from '@/utils/nonce'
import { syncPushLogin, syncPushLogout } from '@/services/pushNotificationService'

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

  const { data: profilRow } = await getProfileForUser(session.user.id)

  let clubs: number[] = []
  if (profilRow?.rolle === 'klubbadmin') {
    const { data: clubIds } = await getClubAdminClubsForUser(session.user.id)
    clubs = clubIds
  }

  _lastKnownEmail = session.user.email ?? _lastKnownEmail
  _cache = { user: session.user, profil: mapToProfile(profilRow), clubs }
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

/** Drop the cached user so the next getUser() refetches the profile (e.g. after kobling_status changes). */
export function invalidateUserCache(): void {
  _cache = null
}

async function getRole(): Promise<Role | null> {
  const auth = await _fetchCache()
  return auth?.profil?.role ?? null
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function isClubAdmin(clubId: number | string | null = null): Promise<boolean> {
  const auth = await _fetchCache()
  if (!auth || auth.profil?.role !== 'klubbadmin') return false
  if (clubId === null) return true
  return auth.clubs.includes(Number(clubId))
}

export async function signOut(): Promise<void> {
  _intentionalSignOut = true
  _cache = null
  await supabase.auth.signOut()
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export const GOOGLE_SIGN_IN_PENDING_KEY = 'googleSignInPending'

// Google blocks its OAuth consent screen from loading inside a WebView (error
// "disallowed_useragent"), so the Capacitor app can't use the browser-redirect
// flow below. It signs in via the OS account picker (Credential Manager) instead,
// which resolves synchronously with a session — no redirect, so callers must
// navigate themselves on success rather than relying on GOOGLE_SIGN_IN_PENDING_KEY.
async function signInWithGoogleNative(): Promise<{ error: { message: string } | null }> {
  // Everything lives inside the try: initialize() throws on missing/invalid client
  // config, and an unhandled rejection here would leave the login button silently
  // disabled with no toast.
  try {
    const { SocialLogin } = await import('@capgo/capacitor-social-login')
    const { rawNonce, nonceDigest } = await generateNonce()

    await SocialLogin.initialize({
      google: {
        webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
        iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
        mode: 'online',
      },
    })

    const response = await SocialLogin.login({
      provider: 'google',
      // 'bottom' (GetGoogleIdOption) avoids a known Android Credential Manager race
      // where the default 'standard' full-screen chooser spuriously throws
      // GetCredentialCancellationException right after the user taps an account.
      options: { style: 'bottom', scopes: ['email', 'profile'], nonce: nonceDigest },
    })

    if (response.result.responseType !== 'online' || !response.result.idToken) {
      return { error: { message: 'Fekk ikkje innloggingstoken frå Google.' } }
    }

    return supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.result.idToken,
      nonce: rawNonce,
    })
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'USER_CANCELLED') return { error: null }
    return { error: { message: err instanceof Error ? err.message : 'Google-innlogging feila.' } }
  }
}

export async function signInWithGoogle(redirect?: string) {
  if (Capacitor.isNativePlatform()) return signInWithGoogleNative()

  const target = `${window.location.origin}${window.location.pathname}#/logginn${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`
  sessionStorage.setItem(GOOGLE_SIGN_IN_PENDING_KEY, '1')
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: target } })
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword })
}

// Abonner på auth-endringar. Tømer cache og sender DOM-event.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    _cache = null
    _inflight = null
    // SIGNED_IN: no cache clear needed — before real login _cache is already null (cleared by signOut());
    // for session restore on page load, the cache is valid and clearing it causes a redundant DB fetch.
    syncPushLogout()
  }
  if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
    _hasActiveSession = true
    syncPushLogin(session.user.id)
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
