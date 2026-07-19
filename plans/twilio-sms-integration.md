# Twilio SMS Phone Verification — Implementation Plan

## Context

The app needs phone verification via SMS (Twilio, nonprofit account, alphanumeric sender ID already created):

1. **Admins and klubbadmins** must verify a phone number once before using their elevated access (phone 2FA comes later — design must not preclude it).
2. **Regular users** may optionally verify a phone; any verified phone **auto-approves** their pending kaster-link request (user's explicit decision — phone ownership is sufficient accountability for this community; `kaster.telefon` will be deleted later, out of scope). Users without a verified phone keep today's admin-approval flow.
3. Phone lives in Supabase auth (`auth.users.phone` / `phone_confirmed_at`) via the built-in **phone_change OTP flow** — no custom column.
4. Provider: **Twilio Programmable Messaging** (`twilio`), OTPs sent from the alphanumeric sender via a Messaging Service.
5. Test locally with `[auth.sms.test_otp]` fixed codes first, then enable on prod project `urtvpewjlevhlevtnvkf` via dashboard.

**Security hole found during planning (fix included):** the live `bruker_profil` UPDATE policy `bp_oppdater` (consolidated in `20260710111529`, last touched in `20260710173000_fix_bruker_profil_kamp_spelar_rls_recursion.sql`) only freezes `rolle` — a user can currently PATCH their own `kobling_status='godkjent'` + `kasterid` and bypass admin approval entirely. The hardening migration ships regardless of SMS.

---

## Phase 0 — Twilio console (manual, no code)

1. Messaging → Services → **Create Messaging Service** (e.g. "Hesteskokasting OTP", use case "Verify users").
2. Add the existing **alphanumeric sender ID** to its Sender Pool (alphanumeric works one-way to Norway, no registration needed).
3. Note **Account SID** (`AC…`), **Auth Token**, **Messaging Service SID** (`MG…`).
4. Anti-fraud (SMS pumping is the #1 OTP cost risk): Messaging Geo Permissions → **allow Norway only**; set a spend/usage alert trigger.

## Phase 1 — Local Supabase config + spike (commit 1)

File: `supabase/config.toml`

- `[auth.sms]`: keep `enable_signup = false`, set `template = "Din kode er {{ .Code }}"`, keep `max_frequency = "5s"`.
- Add `[auth.sms.test_otp]` block (keys are E.164 without `+`): `4790000001 = "123456"`, `4790000002 = "123456"`.
- Keep `[auth.sms.twilio] enabled = false` locally — test_otp bypasses the provider for mapped numbers. If GoTrue demands an enabled provider for phone_change, flip to `true` with a dummy `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` in the shell env running `supabase start` (env() substitution reads the CLI process env).

**Spike before writing app code** (browser console against local stack): `supabase.auth.updateUser({ phone: '+4790000001' })` → `verifyOtp({ phone, token: '123456', type: 'phone_change' })` → confirm `phone_confirmed_at` set. Confirms phone_change works with `enable_signup = false` (expected — it's an update path, not signup).

## Phase 2 — Migration 1: RLS hardening (commit 2)

`npx supabase migration new harden_bruker_profil_kobling_rls` (always via CLI — never hand-pick timestamps).

- New SECURITY DEFINER helper `public.min_kobling_original()` returning the caller's current `(kasterid, kobling_status)` — needed because a direct self-subquery in the policy re-introduces the 42P17 RLS recursion fixed in `20260710173000`. REVOKE from PUBLIC, GRANT to authenticated.
- `ALTER POLICY bp_oppdater` WITH CHECK: admin branch unchanged; self branch additionally requires `kasterid IS NOT DISTINCT FROM` original AND (`kobling_status` unchanged OR in `('ingen','venter')`).

New pgTAP test `supabase/tests/11_rls_bruker_profil_kobling.sql` (model on `08_rls_immutability.sql`'s `SET LOCAL ROLE authenticated` + `set_config('request.jwt.claims', …)` pattern):
- Still allowed: `sendProfileLinkRequest`-style self-update to `'venter'` + `kobling_kasterid`; notification-pref updates by a linked user (unchanged kobling columns); admin approve/reject.
- Blocked (42501): self-set `kobling_status='godkjent'`; self-change `kasterid`.
- Memory caveat: CLI ≥2.109 local stack may lack client-role DML grants after `db reset` — if `lives_ok` cases fail with permission (not policy) errors, add ad-hoc GRANTs in the test seed, don't write a grant migration.

## Phase 3 — Migration 2: auto-approve RPC (commit 3)

`npx supabase migration new rpc_godkjenn_kobling_med_telefon` — modeled on `slett_brukarkonto` (`20260711170000_rpc_kontoadministrasjon.sql`):

`public.godkjenn_kobling_med_telefon()` — SECURITY DEFINER, `SET search_path = public`:
1. Require `auth.uid()`; require `auth.users.phone_confirmed_at IS NOT NULL AND phone IS NOT NULL` for caller.
2. `SELECT kobling_kasterid … WHERE kobling_status='venter' AND kobling_kasterid IS NOT NULL FOR UPDATE`; exception if none.
3. `UPDATE bruker_profil SET kasterid = pending, kobling_status='godkjent', kobling_kasterid=NULL`; return kasterid.
4. REVOKE from PUBLIC + anon, GRANT EXECUTE to authenticated.

pgTAP: unverified caller → exception; verified without pending request → exception; verified + pending → approved, `kobling_kasterid` NULL.

Then: `supabase db reset` + `npm run test:db`, and regenerate types:
`npx supabase gen types typescript --project-id urtvpewjlevhlevtnvkf > src/types/database.types.ts` (strip trailing non-TS lines; never hand-edit). Note: regenerate from remote only **after** prod push (Phase 10), or from local (`--local`) during development.

## Phase 4 — Phone util (commit 4)

- `src/utils/phone.ts` (pure): `normalizePhoneE164(input: string): string | null` — strip spaces/dots/hyphens/parens, `00…` → `+…`, bare 8 digits → `+47` prefix, validate `^\+[1-9]\d{7,14}$`.
- `tests/phone.test.ts` (Vitest): `'912 34 567'` → `'+4791234567'`, `'+47 912 34 567'`, `'004791234567'`, rejects letters / too-short / empty.

## Phase 5 — Services (commit 5)

- `src/services/authService.ts`: add `updatePhone(phone)` → `supabase.auth.updateUser({ phone })`; `verifyPhoneChange(phone, token)` → `supabase.auth.verifyOtp({ phone, token, type: 'phone_change' })`; `hasVerifiedPhone()` reading the cached `getUser()` user's `phone_confirmed_at`. Callers `invalidateUserCache()` after verify (the `USER_UPDATED` event does not clear the cache; verifyOtp persists the refreshed user into the stored session, so invalidate-then-refetch suffices).
- `src/services/brukerProfilService.ts`: `approveLinkWithPhone()` → `supabase.rpc('godkjenn_kobling_med_telefon')`, errors via `logError()`.

## Phase 6 — Reusable component (commit 6)

`src/components/PhoneVerification.ts` — `createPhoneVerification(props)` factory (English identifiers, Norwegian UI text), typed Props `{ heading?, description?, onVerified: () => void }`:
- Step 1: tel input (`autocomplete="tel"`) → `normalizePhoneE164` (inline "Ugyldig telefonnummer." on null) → `updatePhone()`.
- Step 2: 6-digit input (`inputmode="numeric"`, `autocomplete="one-time-code"` for iOS/Android OTP autofill) → `verifyPhoneChange()` → `invalidateUserCache()` + `showToast()` + `onVerified()`.
- "Send ny kode" with 60 s countdown; "Endre nummer" back-link. Map `over_sms_send_rate_limit` / wrong-or-expired-code errors to Norwegian copy.
- CSS in the existing global stylesheet with `var(--*)` tokens, semantic class names (`.phone-verify__…`). No inline styles.

## Phase 7 — Admin gate (commit 7)

`src/app.ts` `authGuard` ([app.ts:28-45](src/app.ts#L28-L45)) — after the existing role checks pass, for `requiredRole === 'admin' || 'klubbadmin'`:
if `!auth.user.phone_confirmed_at` → `cont.replaceChildren(createPhoneVerification({ description: 'Som administrator må du verifisere telefonnummeret ditt før du får tilgang.', onVerified: () => renderFn(cont, params) }))` and return. One-time per account; gates only elevated routes. (Client-side gate now; server-side enforcement staged later — see Phase 10 step 6.)

## Phase 8 — Minside integration (commit 8)

- `src/pages/minside/_linkState.ts`:
  - After `sendProfileLinkRequest` succeeds: if `ctx.user.phone_confirmed_at` → `approveLinkWithPhone()` → `invalidateUserCache()` + `runRefetch()` (instant approval); on RPC error fall back to pending + toast.
  - The `'venter'` branch (`pendingHtml()`) becomes DOM-built so unverified users see the pending alert **plus** the verification component: "Verifiser telefonnummeret ditt for å koble kontoen med ein gong — elles ventar du på godkjenning frå ein administrator." `onVerified` → RPC → refetch.
- `src/pages/minside/minside-konto.ts`: new "Telefonnummer" card — verified: show `ctx.user.phone` + "Verifisert" badge + "Endre nummer" (re-runs same flow); unverified: the component.
- `src/admin/admin.ts`: **no change** — auto-approved links never reach the pending list. (Optional later: phone-verified badge on pending rows.)

## Phase 9 — Testing

- Per commit: `npm run typecheck && npm run typecheck:test && npm run test:run`; `npm run test:db` after migrations.
- Local e2e (`supabase start`, test_otp numbers):
  1. Admin gate on `#/admin` and `#/stevne/ny` with `+47 900 00 001` / `123456`; no re-prompt after reload.
  2. User flow A: request link → verify phone → instantly `godkjent`, `kobling_kasterid` cleared (check Studio).
  3. User flow B: verify in Konto first → request link → instant approval.
  4. Negatives: unverified user stays `venter` and appears in admin pending list; direct REST PATCH of `kobling_status='godkjent'` → 42501.
  5. Resend cooldown + wrong-code error copy.

## Phase 10 — Production rollout (order matters)

1. `npx supabase db push` — migrations first (hardening closes the hole immediately; the RPC just can't succeed until SMS exists). Regenerate `database.types.ts` from remote afterwards.
2. Supabase **dashboard** (project `urtvpewjlevhlevtnvkf`) — never `supabase config push` (would ship test_otp): Auth → Providers → Phone → Twilio; enter Account SID, Auth Token, Messaging Service SID; template `Din kode er {{ .Code }}`; keep phone signups off (per spike outcome); SMS rate limit ~30/hr.
3. Deploy app: merge to `main` → GitHub Actions approval gate → Pages.
4. Smoke test with a real number: admin gate → real SMS from the alphanumeric sender → verify; then a test user link auto-approval. Check Twilio Messaging logs.
5. All existing admins/klubbadmins verify on their next elevated-page visit.
6. Follow-up PRs (out of scope, in order): server-side role enforcement (deny elevated `min_rolle()` without confirmed phone — only after step 5, lockout risk); phone 2FA via `[auth.mfa.phone]` (paid Supabase add-on; the same verified `auth.users.phone` becomes the factor, nothing here precludes it); delete `kaster.telefon`.

---

## Future SMS use-case ideas (not in scope — user asked for suggestions)

- Verify phone number to be able to edit other accounts that are linked to the kasterprofil
- Match-start SMS fallback for users without the app/push ("Kampen din på bane 3 startar no").
- Stevne-reminder SMS the day before to registered kastere.
- Reminders to unregistered users that the registration is closing soon
- SMS to klubbadmins when a new link request lands in their queue.
- Result-summary SMS when a stevne completes.
- Emergency broadcast to all participants of a live stevne — the existing `notification_queue` → pg_net → edge-function pattern extends naturally to a Twilio-sending function.

## Key files

- `supabase/config.toml` — SMS/test_otp config
- `supabase/migrations/` — 2 new migrations (RLS hardening, RPC) + `supabase/tests/11_rls_bruker_profil_kobling.sql`
- `src/utils/phone.ts` + `tests/phone.test.ts` — new
- `src/services/authService.ts`, `src/services/brukerProfilService.ts`
- `src/components/PhoneVerification.ts` — new
- `src/app.ts` (authGuard), `src/pages/minside/_linkState.ts`, `src/pages/minside/minside-konto.ts`
- `src/types/database.types.ts` — regenerated, never hand-edited
