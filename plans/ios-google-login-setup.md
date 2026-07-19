# iOS Google login — manual setup checklist

Code-side fixes are done: `signInWithGoogleNative` now surfaces init errors as a toast
(previously `initialize()` threw outside the try/catch → unhandled rejection → the button
just went dead), passes `iOSClientId` to the SocialLogin plugin, and the TestFlight
workflow injects the Google URL scheme into Info.plist at build time.

The steps below are the external config that makes it actually work. Work top to bottom.

## 1. Google Cloud Console — create an iOS OAuth client

- [ ] Open [Credentials](https://console.cloud.google.com/apis/credentials) in the **same
      project** that owns the existing web client ID (`VITE_GOOGLE_WEB_CLIENT_ID`).
- [ ] **Create credentials → OAuth client ID → iOS**:
      - Bundle ID: `no.hesteskokasting.app`
      - App Store ID / Team ID: optional, can be added later.
- [ ] Copy the new client ID (`<number>-<hash>.apps.googleusercontent.com`).

## 2. Supabase — authorize the iOS client ID

Without this, `signInWithIdToken` rejects the token with an "unacceptable audience" error,
because the iOS Google SDK issues ID tokens with `aud` = the iOS client ID (Android uses
the web client ID, which is already authorized).

- [ ] Supabase Dashboard → **Authentication → Sign In / Providers → Google** → add the iOS
      client ID to **Authorized Client IDs** (comma-separated, keep the existing web ID).

## 3. GitHub — add the secret

- [ ] Repo → Settings → Environments → **testflight** → add secret
      `VITE_GOOGLE_IOS_CLIENT_ID` = the iOS client ID from step 1.
      (The workflow fails fast with a clear error if it's missing.)

## 4. Build & test

- [ ] Run the **iOS TestFlight** workflow, install the build, tap "Logg inn med Google".
- [ ] Expected: Google account sheet opens → pick account → back in the app, logged in,
      navigated past the login page.
- [ ] Any failure now shows a toast instead of a dead button — the toast text says which
      layer failed (plugin init, Google, or Supabase).

**If the toast mentions a nonce error:** the plugin may not forward the nonce to the iOS
Google SDK the way it does on Android. Fallback: enable "Skip nonce checks" for the Google
provider in Supabase, or skip sending the nonce on iOS only (`Capacitor.getPlatform() ===
'ios'`) in `signInWithGoogleNative`.
