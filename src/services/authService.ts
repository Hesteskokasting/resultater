import { Capacitor } from "@capacitor/core";
import { supabase } from "@/supabase";
import type { AuthUser, Profile, Role } from "@/types";
import { getProfileForUser } from "@/services/brukerProfilService";
import { getClubAdminClubForUser } from "@/services/adminService";
import { generateNonce } from "@/utils/nonce";
import { syncPushLogin, syncPushLogout } from "@/services/pushNotificationService";
import { isRole } from "@/utils/roles";

function mapToProfile(obj: unknown): Profile | null {
  if (obj === null || typeof obj !== "object") return null;
  const raw = obj as Record<string, unknown>;
  if (!isRole(raw.rolle)) return null;
  return {
    role: raw.rolle,
    kasterid: typeof raw.kasterid === "number" ? raw.kasterid : null,
    kobling_status:
      typeof raw.kobling_status === "string"
        ? (raw.kobling_status as Profile["kobling_status"])
        : null,
    kobling_kasterid: typeof raw.kobling_kasterid === "number" ? raw.kobling_kasterid : null,
  };
}

// Cache per sesjon. Tømt ved SIGNED_OUT / ny innlogging.
let _cache: AuthUser | null = null;
let _inflight: Promise<AuthUser | null> | null = null;
let _intentionalSignOut = false;
// Track whether an authenticated session is currently active, so the UI can tell
// "session expired" (auth → unauth) apart from restoring a dead token on load.
let _hasActiveSession = false;
// Survives cache clearing on SIGNED_OUT so the re-auth modal can pre-fill the email.
let _lastKnownEmail: string | null = null;

async function _fetchUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profilRow } = await getProfileForUser(session.user.id);

  const club =
    profilRow?.rolle === "klubbadmin"
      ? (await getClubAdminClubForUser(session.user.id)).data
      : null;

  _lastKnownEmail = session.user.email ?? _lastKnownEmail;
  _cache = { user: session.user, profil: mapToProfile(profilRow), club };
  return _cache;
}

export function getLastKnownEmail(): string | null {
  return _lastKnownEmail;
}

async function _fetchCache(): Promise<AuthUser | null> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = _fetchUser().finally(() => {
    _inflight = null;
  });
  return _inflight;
}

export async function getUser(): Promise<AuthUser | null> {
  return _fetchCache();
}

/** Drop the cached user so the next getUser() refetches the profile (e.g. after kobling_status changes). */
export function invalidateUserCache(): void {
  _cache = null;
}

async function getRole(): Promise<Role | null> {
  const auth = await _fetchCache();
  return auth?.profil?.role ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === "admin";
}

export async function isClubAdmin(): Promise<boolean> {
  return (await getRole()) === "klubbadmin";
}

export async function signOut(): Promise<void> {
  _intentionalSignOut = true;
  _cache = null;
  await supabase.auth.signOut();
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Supabase reports a wrong email and a wrong password as the same opaque English
 * string — deliberately, so a failed attempt says nothing about which half was
 * right. Anything else is already a sentence worth showing.
 */
export function signInErrorMessage(error: { message: string }): string {
  return error.message === "Invalid login credentials"
    ? "Feil e-post eller passord."
    : error.message;
}

export const OAUTH_SIGN_IN_PENDING_KEY = "oauthSignInPending";

// Google blocks its OAuth consent screen from loading inside a WebView (error
// "disallowed_useragent"), so the Capacitor app can't use the browser-redirect
// flow below. Native sign-in goes through the OS account sheet instead and
// resolves a session directly — no redirect, so callers must navigate themselves
// on success rather than relying on OAUTH_SIGN_IN_PENDING_KEY.
async function signInWithProviderNative(
  provider: "google" | "apple",
): Promise<{ error: { message: string } | null }> {
  // Everything lives inside the try: initialize() throws on missing/invalid client
  // config, and an unhandled rejection here would leave the login button silently
  // disabled with no toast.
  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");
    const { rawNonce, nonceDigest } = await generateNonce();

    await SocialLogin.initialize({
      google: {
        webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
        iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
        mode: "online",
      },
      // Only iOS: on Android the plugin's Apple provider is a Custom Tabs web flow
      // that rejects initialize() outright unless it gets a Services ID and a
      // redirect URL — which would break the Google button too, since one
      // initialize() call covers every provider.
      ...(Capacitor.getPlatform() === "ios" ? { apple: {} } : {}),
    });

    let idToken: string | null;
    if (provider === "google") {
      const response = await SocialLogin.login({
        provider: "google",
        // 'bottom' (GetGoogleIdOption) avoids a known Android Credential Manager race
        // where the default 'standard' full-screen chooser spuriously throws
        // GetCredentialCancellationException right after the user taps an account.
        options: { style: "bottom", scopes: ["email", "profile"], nonce: nonceDigest },
      });
      idToken =
        response.result.responseType === "online" ? (response.result.idToken ?? null) : null;
    } else {
      const response = await SocialLogin.login({
        provider: "apple",
        options: { scopes: ["email", "name"], nonce: nonceDigest },
      });
      idToken = response.result.idToken ?? null;
    }

    if (!idToken) {
      return {
        error: {
          message: `Fekk ikkje innloggingstoken frå ${provider === "google" ? "Google" : "Apple"}.`,
        },
      };
    }

    return supabase.auth.signInWithIdToken({ provider, token: idToken, nonce: rawNonce });
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "USER_CANCELLED")
      return { error: null };
    return { error: { message: err instanceof Error ? err.message : "Innlogginga feila." } };
  }
}

export async function signInWithGoogle(redirect?: string) {
  if (Capacitor.isNativePlatform()) return signInWithProviderNative("google");

  const target = `${window.location.origin}${window.location.pathname}#/logginn${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;
  sessionStorage.setItem(OAUTH_SIGN_IN_PENDING_KEY, "1");
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: target } });
}

// Web redirect flow on every platform: unlike Google, Facebook's consent screen
// loads fine in the Capacitor WebView, so no native plugin provider is needed.
export async function signInWithFacebook(redirect?: string) {
  const target = `${window.location.origin}${window.location.pathname}#/logginn${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;
  sessionStorage.setItem(OAUTH_SIGN_IN_PENDING_KEY, "1");
  return supabase.auth.signInWithOAuth({ provider: "facebook", options: { redirectTo: target } });
}

// iOS-native only (App Store guideline 4.8 requires Apple sign-in alongside
// Google). No web/Android fallback: that would need an Apple Services ID with a
// client secret that expires every 6 months, so the login page only renders the
// Apple button on iOS.
export async function signInWithApple(): Promise<{ error: { message: string } | null }> {
  return signInWithProviderNative("apple");
}

/**
 * Adds Google as a login method to the account the caller is ALREADY signed in as.
 * The invite mail signs the user in before they have any credential, so this is
 * how they leave that page with a way back in without picking a password.
 *
 * Not signInWithGoogle: that starts a fresh sign-in, which lands on the invited
 * account only when Supabase's automatic linking happens to match the verified
 * address — and creates a second account, or fails outright against the closed
 * sign-up, when it does not. Needs "Manual linking" enabled on the project.
 */
export async function linkGoogleIdentity() {
  const target = `${window.location.origin}${window.location.pathname}#/minside`;
  return supabase.auth.linkIdentity({ provider: "google", options: { redirectTo: target } });
}

/**
 * Mirrors "Allow new users to sign up" being off on the Supabase project: the
 * backend already refuses, so this only keeps the UI from offering a dead end.
 * Flip back to true when sign-up opens again.
 */
export const SIGNUP_ENABLED = false;

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

/** Where the recovery mail sends the user back to. Same origin+pathname shape as the OAuth target. */
function passwordResetTarget(): string {
  return `${window.location.origin}${window.location.pathname}#/nytt-passord`;
}

/**
 * Never reports whether the address has an account — Supabase answers the same
 * either way on purpose, so the caller must not phrase its message as a lookup.
 */
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: passwordResetTarget() });
}

/**
 * Turns the token from a recovery or invite mail into a session, so the
 * new-password form can call updatePassword. Only needed for a {{ .TokenHash }}
 * link; a {{ .ConfirmationURL }} link instead goes through /auth/v1/verify, which
 * hands the tokens back in the URL fragment — and that fragment overwrites the
 * hash route, so the mail templates must use {{ .TokenHash }}.
 */
export async function verifyEmailToken(tokenHash: string, type: "recovery" | "invite") {
  return supabase.auth.verifyOtp({ token_hash: tokenHash, type });
}

/**
 * Subscribes to auth changes: clears the cache and re-broadcasts as an
 * `authStateChanged` DOM event. Called once from app.ts, after the listener for
 * that event is in place — importing this module must not start it, or nothing
 * that merely reads from here can be loaded without a live Supabase client.
 */
export function initAuthListener(): void {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      _cache = null;
      _inflight = null;
      // SIGNED_IN: no cache clear needed — before real login _cache is already null (cleared by signOut());
      // for session restore on page load, the cache is valid and clearing it causes a redundant DB fetch.
      void syncPushLogout();
    }
    if (
      session &&
      (event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION" ||
        event === "USER_UPDATED")
    ) {
      _hasActiveSession = true;
      void syncPushLogin(session.user.id);
    }
    const intentional = _intentionalSignOut;
    // Captured before reset: true only when an authenticated session was actually live.
    // On a SIGNED_OUT this also de-dupes — the reset means a second failed-refresh
    // SIGNED_OUT reports hadSession=false, so the "session expired" toast fires once.
    const hadSession = _hasActiveSession;
    if (event === "SIGNED_OUT") {
      _intentionalSignOut = false;
      _hasActiveSession = false;
      if (!intentional && hadSession) {
        // Log context to help diagnose unexpected sign-outs (token refresh failure, multi-tab, etc.)
        console.warn("[auth] Unexpected SIGNED_OUT event", {
          hadSession: session !== null,
          hadCache: _cache !== null,
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      }
    }
    document.dispatchEvent(
      new CustomEvent("authStateChanged", { detail: { event, intentional, hadSession } }),
    );
  });
}
