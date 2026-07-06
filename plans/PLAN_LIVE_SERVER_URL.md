# Plan: Switch Android app to live `server.url` (continuous deploy)

## Context

The Capacitor Android app (`no.hesteskokasting.app`) currently bundles a static
`dist/` build inside the native app. This was an intentional earlier decision,
made for offline resilience during tournaments (no reliable wifi at venues).

Priorities have changed. We no longer need offline functionality in the app.
The new priority is: ship changes to hesteskokasting.no continuously, without
needing a native rebuild + Play Store review for every web app change.

## Decision

Switch the Capacitor app from bundling `dist/` to loading the site live via
`server.url`, pointing at the production GitHub Pages deployment
(`https://res.hesteskokasting.no` or the current production domain — verify
exact domain in `capacitor.config.ts` / DNS before assuming).

Offline support is explicitly out of scope. Do not build offline caching,
service workers for offline use, or OTA bundle-caching. Keep this simple.

## Tasks for Claude Code

1. **Audit current setup before changing anything:**
   - Read `capacitor.config.ts` and confirm current config (bundled `dist/`,
     any existing `server` block, `webDir`, `cleartext`, etc.)
   - Read the GitHub Pages deploy workflow (likely `.github/workflows/*.yml`)
     and report: what branch/folder is published, what domain it's served on,
     whether it uses a custom domain / CNAME, and whether HTTPS is enforced.
   - Report whether the production site currently has any CSP, CORS, or
     referrer-policy headers that could break when loaded from a Capacitor
     WebView (different origin behavior than a normal browser tab) — GitHub
     Pages doesn't let us set custom headers, so flag if anything depends on
     headers we can't control there.
   - Check whether Google Sign-In / OAuth (PKCE) flow currently assumes it's
     running from a bundled local asset origin (`capacitor://localhost` /
     `https://localhost`) vs. a remote origin. This may affect the OAuth
     redirect URI configuration in Google Cloud Console and in Supabase Auth
     settings. Flag any changes needed there.

2. **Propose the exact `capacitor.config.ts` diff** to move from bundled
   `webDir` to `server.url`, including:
   - `server.url` pointing at the confirmed production domain
   - `cleartext: false`
   - Whether `androidScheme` needs to change
   - Whether `webDir` can be removed entirely or should stay as a fallback
     asset location Capacitor requires at build time

3. **Handle the "no network at startup" case** (not offline support — just
   graceful degradation):
   - When the WebView fails to load because there's no connectivity, show a
     simple native error screen ("No internet connection, try again") instead
     of a browser error page or blank white screen.
   - Suggest the smallest reasonable implementation given this is a
     Capacitor/Android app (e.g. checking `NetworkInformation`/Capacitor
     Network plugin before load, or handling the WebView load-error callback).

4. **Google Play "minimum functionality" policy check:**
   - List what native functionality the app currently has beyond displaying
     the website (e.g. native Google Sign-In flow, any native plugins in use).
   - Give an honest assessment of whether this is likely sufficient to avoid
     Google Play's minimum-functionality / "webview wrapper" rejection risk,
     or whether something should be added (e.g. a native share sheet, a
     native settings screen, push notifications) to strengthen the case.
   - Do not assume it's fine — actually look at the current plugin list and
     native code before concluding.

5. **Versioning implications:**
   - Confirm that `package.json` version / native version code still only
     needs to bump for actual native shell changes (permissions, plugins,
     icons, this server.url migration itself) — not for ordinary web app
     changes, since those will now deploy independently via GitHub Pages.
   - Update any versioning documentation/checklist (e.g. pre-tournament
     rebuild checklist) to reflect that web changes no longer require a
     native rebuild.

6. **Test plan before merging:**
   - Build and run locally against production GitHub Pages URL via USB
     debugging.
   - Test app cold start with wifi off (confirm graceful error screen, not
     crash/blank screen).
   - Test app cold start with wifi on, confirm it loads current production
     site content (not a cached/stale bundle).
   - Test Google Sign-In flow end-to-end against the live-loaded origin.

## Explicitly out of scope

- Any offline bundle caching or OTA update mechanism for the web content.
- Any change to how GitHub Pages itself deploys (this plan assumes current
  GitHub Pages workflow stays as-is; Claude Code should only flag concerns
  found during the audit in step 1, not restructure the deploy pipeline
  unless something is actually broken/incompatible).

## Deliverable

Present the audit findings (step 1) and the proposed config diff (step 2)
for review before touching OAuth config or writing the native error-screen
code. Do not proceed past the audit without confirmation, since OAuth
redirect URI changes can lock out sign-in if misconfigured.
