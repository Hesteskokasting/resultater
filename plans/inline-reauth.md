# Inline re-auth on unexpected session loss

## Problem

When the Supabase session is revoked mid-use (refresh-token reuse detection / lost
refresh response on flaky venue wifi), the operator is logged out. Today they get a
toast and, on the next navigation, `authGuard` bounces them to `#/logginn` — losing
their place mid-competition.

We cannot fully *prevent* the revocation (it's server-side), so the robust fix is to
make it **survivable**: re-authenticate in place, without navigating away or losing the
current page's DOM/form state.

## Approach

A singleton re-auth modal, built on the existing `ModalBase` (same pattern as
`ConfirmDialog`/`PromptDialog`). On an unexpected `SIGNED_OUT`, open it over the current
page. The route is **not** changed, so the underlying page (e.g. live scoring form)
stays mounted. On successful sign-in the modal closes and the operator resumes.

## Steps

### 1. `authService.ts` — expose last-known email
- Capture `session.user.email` into a module var in `_fetchUser()` (so the modal can
  pre-fill it).
- Add `export function getLastKnownEmail(): string | null`.
- Keep the existing `hadSession` gate and `_intentionalSignOut` logic as-is.

### 2. New component `src/components/ReauthModal.ts`
- Singleton `showReauthModal(): void`; no-op if already open (idempotent against
  multiple `SIGNED_OUT` events).
- Built via `createModalEl({ role: 'dialog', labelledBy: 'reauth-title' })` +
  `createModalLifecycle()`.
- Content: title "Sesjonen din er utløpt", short explanation, **email** (pre-filled from
  `getLastKnownEmail()`, editable), **password**, error alert, primary "Logg inn".
- Secondary "Hald fram utan innlogging" + Escape → dismiss (so a casual logged-out
  viewer isn't trapped; operators use the primary action).
- Submit → `signIn(email, password)`:
  - Success: supabase emits `SIGNED_IN` (repopulates cache); close modal; `showToast`
    success.
  - Failure: show message in the modal (reuse logginn's "Invalid login credentials"
    → "Feil e-post eller passord." mapping), re-enable button.
- Reuse `escHtml` for any interpolated string; no inline styles (Bootstrap classes only).

### 3. `app.ts` — trigger the modal instead of just toasting
- In the `authStateChanged` listener, on `event === 'SIGNED_OUT' && !intentional &&
  hadSession`, call `showReauthModal()` (replaces the bare toast for this case).
- Keep the once-per-load guard; reset on `SIGNED_IN`.

## Explicitly out of scope (v1)
- **Re-subscribing realtime channels** after re-auth. Data already on screen is
  preserved; live updates may need a manual refresh in rare cases. Note as a known
  limitation; revisit if it bites.
- Buffering/replaying writes attempted *during* the dead window — the modal is a
  blocking overlay, so the operator re-auths before submitting.

## Prevention levers (config/infra — your side, not code)
- Confirm production Auth → Sessions (dashboard, not config.toml): timebox/inactivity
  off, rotation on.
- HTTPS is on ✓ — Web Locks should already serialize same-browser tabs. The remaining
  race is likely embedded webviews/old browsers where Web Locks no-ops, or separate
  devices. Inline re-auth covers all of these.
- Optional: raise `jwt_expiry` (1h → 3–4h) to reduce refresh frequency (mitigation).
- Optional, security trade-off: `enable_refresh_token_rotation = false` removes
  reuse-detection logouts entirely.

## Testing
- `ReauthModal` is DOM/side-effect code (not a pure function) → no unit test per project
  rules. Run `npm run typecheck && npm run typecheck:test && npm run test:run`.
- Manual: log in, delete the `sb-*-auth-token` localStorage key in DevTools, trigger any
  query/refresh → modal appears → re-login → resume without navigation.
