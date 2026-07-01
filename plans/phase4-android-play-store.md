# Phase 4 (Android-only): Google Play preparation & release

Scope: get the app onto Google Play. iOS/App Store is explicitly out of scope for this plan — revisit separately when there's Mac access.

This replaces the generic "Phase 4" section in `plans/capacitator-integration.md` with an Android-specific, ordered checklist. Each step below should be executed and confirmed separately — not all at once.

---

## Blockers found before any store work can start

1. ~~**No app icon source exists anywhere in the repo.**~~ **RESOLVED 2026-07-01.** A 1024×1024 upscaled PNG + SVG source was added at `src/assets/NHF_logo_original_oppskalert_1024x1024.png`. Copied to `resources/icon.png` (the convention `@capacitor/assets` expects) and ran `npx capacitor-assets generate --android` — regenerated all `mipmap-*` icon densities (legacy + adaptive foreground/background + round) and all splash screen densities (light + dark/night, portrait + landscape) in `android/app/src/main/res/`. Synced with `npx cap sync android`. Verified visually: icon and splash render correctly, no cropping on the "NHF" text.
   Note: the source is an *upscaled* image (original was 141×153px), not a true high-res original — acceptable per your call, but worth swapping for a true vector/high-res original later if one ever surfaces (e.g. from the club's print materials).
2. ~~**The release build currently signs with `signingConfigs.debug`.**~~ **RESOLVED 2026-07-01.** Real release keystore generated (`android/app/keystore/hesteskokasting-release.keystore`, alias `hesteskokasting`), backed up outside git (Google Drive for the keystore file, password manager for the password). `build.gradle` now reads `android/app/keystore.properties` (gitignored) and falls back to debug signing only when that file is absent, e.g. on a machine without the secret.
3. **Privacy policy required.** The app stores personal data (thrower names, results, possibly user accounts/emails via Supabase auth). Play Console's Data Safety form and app listing both require a hosted, publicly reachable privacy policy URL. Needs a page somewhere (could be a static page on hesteskokasting.no) — content and hosting decision is yours, not something to draft silently into the codebase.

---

## Ordered checklist

### 1. Google Play Console account
- Pay the one-time $25 registration fee, complete identity verification (can take a few days for new accounts — plan around this, don't leave it to the last minute).
- **Note (2026 Play policy):** new personal developer accounts must run a **closed testing track with ≥12 testers for 14 continuous days** before they're allowed to publish to production. Budget ~2+ weeks of lead time for this, not just the review turnaround.

### 2. Generate the release keystore — DONE
- See blocker #2 above. Restore steps for a new machine are documented in `README.md` under "Android (Capacitor) → Release-signering".

### 3. App icon & splash assets — DONE
- Generated via `@capacitor/assets` from `resources/icon.png`. See blocker #1 above for details.
- Still open: the standalone favicon 404 on the *web* app (unrelated to the Android store submission, but same source image could fix it in `src/index.html` whenever convenient).

### 4. Store listing content
- App title, short description (80 chars), full description, category (Sports).
- Screenshots: at least one phone + one tablet set (you already have both devices — easy to capture from the release build you're running now).
- Feature graphic (1024×500).
- Content rating questionnaire (Play Console's own form).
- Data Safety form — declare what's collected (auth email, thrower personal data) and whether it's shared with third parties (Supabase as processor).

### 5. Versioning — DONE
- `package.json` is the single source of truth for versioning across web + Android:
  - `"version"` (e.g. `"0.8.7"`) → injected into `src/index.html`'s header badge at build/dev time via a `transformIndexHtml` Vite plugin, and read as Android's `versionName` in `build.gradle`.
  - `"buildNumber"` (currently `1`) → read as Android's `versionCode` in `build.gradle`.
- **Still manual, by design:** bump `"buildNumber"` by 1 in `package.json` before every single Play Console upload (internal, closed, or production track — Play rejects any upload that doesn't strictly increase this). Bump `"version"` when you make a meaningful release. These are independent actions — not everything that changes `buildNumber` needs a `version` bump.

### 6. Build & upload
- ~~`Build → Generate Signed Bundle/APK`, choose **Android App Bundle (.aab)**~~ — **DONE 2026-07-02.** Signed release AAB built locally with the real keystore, verified working. Sitting ready for upload once the Play Console account clears verification.
- Still open: enroll in **Play App Signing** when prompted on first upload (Google re-signs your upload key with a Google-managed app signing key — recommended, required for some newer Play features).
- Still open: upload to the **closed/internal testing track first**, not production.

### 7. Testing track rollout
- Internal testing (fast, no review) → invite yourself/a few club admins.
- Closed testing (≥12 testers, 14 days, per step 1's account requirement) → this is likely the real gating step timeline-wise.
- Production release once testing requirements are satisfied and you're confident.

---

## What I will NOT do without you first providing/deciding

- Cannot generate a real app icon — need the source image from you.
- Cannot create the Play Console account or pay the fee — that's your action.
- Cannot draft/host the privacy policy content — need your decision on hosting location; I can draft the text if you want.
- Will not touch signing until you've generated the keystore and told me where it lives locally (I'll wire the gitignored properties file, not generate secrets myself).

## What I *can* execute directly once you give the go-ahead per step

- Wiring the release signing config to read from a local `keystore.properties` (gitignored).
- Running `@capacitor/assets` once a source icon exists.
- Adjusting `versionCode`/`versionName`.
- Drafting privacy policy / store listing copy text for your review.
