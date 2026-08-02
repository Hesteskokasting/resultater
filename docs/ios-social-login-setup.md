# iOS social login (Google + Apple) — manual setup checklist

Code-side fixes are done: the native sign-in flow now surfaces init errors as a toast
(previously `initialize()` threw outside the try/catch → unhandled rejection → the button
just went dead), passes `iOSClientId` to the SocialLogin plugin, the TestFlight workflow
injects the Google URL scheme into Info.plist at build time, and Sign in with Apple is
added as an iOS-only button (native flow — no rotating client secret needed; App Store
guideline 4.8 requires it once Google login is offered).

The steps below are the external config that makes it actually work. Work top to bottom.

## 1. Google Cloud Console — create an iOS OAuth client

- [ ] Open [Credentials](https://console.cloud.google.com/apis/credentials) in the **same
      project** that owns the existing web client ID (`VITE_GOOGLE_WEB_CLIENT_ID`).
- [ ] **Create credentials → OAuth client ID → iOS**: - Bundle ID: `no.hesteskokasting.app` - App Store ID / Team ID: optional, can be added later.
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

## 4. Apple Developer portal — Sign in with Apple capability

The entitlement (`com.apple.developer.applesignin`) is already in `App.entitlements`;
the App ID must have the matching capability or signing fails.

- [ ] [Identifiers](https://developer.apple.com/account/resources/identifiers/list) →
      `no.hesteskokasting.app` → enable **Sign In with Apple** (as primary App ID). Save.

## 5. Supabase — enable the Apple provider

- [ ] Supabase Dashboard → **Authentication → Sign In / Providers → Apple** → enable.
- [ ] Add `no.hesteskokasting.app` (the bundle ID) to **Authorized Client IDs**.
      Leave the OAuth secret fields empty — they're only for the web/Android redirect
      flow, which is deliberately not used (the secret expires every 6 months).

**Heads-up on duplicate accounts:** a user who previously signed in with Google and now
uses Apple with "Hide My Email" gets a _new_ Supabase user (the private-relay address
doesn't match their Gmail). Supabase only auto-links identities with the same verified
email. Not fixable in config — just good to know when a user reports a "missing" profile.

## 6. Build & test

- [ ] Run the **iOS TestFlight** workflow, install the build.
- [ ] "Logg inn med Google": Google account sheet opens → pick account → back in the
      app, logged in, navigated past the login page.
- [ ] " Logg inn med Apple": Apple sheet opens (Face ID/passcode) → logged in. Test
      both "Share My Email" and "Hide My Email" variants.
- [ ] Any failure now shows a toast instead of a dead button — the toast text says which
      layer failed (plugin init, provider, or Supabase).
- [ ] Verify Min side → Konto shows the password-creation hint for both provider types.

**If the toast mentions a nonce error:** the plugin may not forward the nonce to the iOS
Google SDK the way it does on Android. Fallback: enable "Skip nonce checks" for the Google
provider in Supabase, or skip sending the nonce on iOS only (`Capacitor.getPlatform() ===
'ios'`) in `signInWithGoogleNative`.
