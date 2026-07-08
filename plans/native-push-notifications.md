# Native push notifications (stevne start + kamp created for me)

## Context

The Android app now loads the live webview (`res.hesteskokasting.no`) instead of a bundled shell. The next gap is native phone notifications so users know things happened without having the app open:

1. **"Varsle når et stevne starter"** — notify when a `stevne` transitions out of `stevne_fase = 'ikke_startet'`. Broadcast to every opted-in user (no club scoping).
2. **"Varsle når kamper for meg blir opprettet"** — notify a user when a `kamp_spelar` row links a `kamp` to their linked `kaster`.

Decisions locked in during planning:
- **Delivery: OneSignal**, not raw Firebase Admin SDK. OneSignal still rides on FCM under the hood on Android, but it owns device-token lifecycle entirely — we never store a device token ourselves. The app associates a device with a user via `OneSignal.login(supabaseUserId)`, and the send side targets that same id (`external_id` alias). **No `google-services.json` is ever needed in this repo** — verified against the actual `@onesignal/capacitor-plugin` package: FCM v1 credentials are a Firebase service-account JSON uploaded once to OneSignal's own dashboard, never touching this codebase or the Android manifest.
- **"Stevne starts" = `stevne_fase` changes away from `'ikke_startet'`** (not creation, not scheduled time) — a plain `AFTER UPDATE OF stevne_fase ... WHEN` trigger, no scheduled job needed.
- **"Kamp created for me" hooks on `kamp_spelar` INSERT**, not `kamp` INSERT — `kamp` rows have no `kasterid` to resolve a user from, and by the time `kamp_spelar` rows land the parent `kamp` row is already committed (the generation services do two separate `.insert()` calls).
- A **`notification_queue` table** sits between the DB triggers and the actual send. The triggers do all the recipient-resolution/preference-filtering/dedup work in SQL (where the joins already live) and insert one pre-resolved row per intended notification; a webhook on that table's INSERT calls a single Edge Function that just talks to OneSignal. This avoids re-deriving the same joins in Deno and gives a built-in audit trail (`status`, `error`, `sent_at`) for "why didn't I get notified" support questions.
- Settings toggles live on **`minside.ts`**, gated to `Capacitor.isNativePlatform()` only (this bundle is shared with the public website, where push does nothing).

This is a genuinely large, multi-part change (schema + Postgres triggers + a new Edge Function + native SDK wiring + UI). Per this repo's own rule on large structural changes, treat the four phases below as separately reviewable/committable steps rather than one big diff — each phase produces a working, typecheck-clean state on its own.

---

## Phase A — Database schema & triggers

New migrations in `supabase/migrations/` (timestamps are placeholders, use real `YYYYMMDDHHMMSS`):

1. **`<TS1>_add_notification_preferences_to_bruker_profil.sql`**
   ```sql
   ALTER TABLE public.bruker_profil
     ADD COLUMN varsle_stevne_start   boolean NOT NULL DEFAULT false,
     ADD COLUMN varsle_kamp_opprettet boolean NOT NULL DEFAULT false;
   ```
   No RLS change needed — existing `bp_les_eigen`/`bp_oppdater_eigen` policies (`auth.uid() = id`) already cover read/update of these columns.

2. **`<TS2>_create_notification_queue.sql`**
   ```sql
   CREATE TABLE public.notification_queue (
     id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     notification_type text NOT NULL CHECK (notification_type IN ('stevne_start', 'kamp_opprettet')),
     entity_id         integer NOT NULL,
     title             text NOT NULL,
     body              text NOT NULL,
     deep_link         text NOT NULL,
     status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
     error             text,
     created_at        timestamptz NOT NULL DEFAULT now(),
     sent_at           timestamptz,
     CONSTRAINT notification_queue_dedupe_uniq UNIQUE (user_id, notification_type, entity_id)
   );
   ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "notification_queue_admin_all" ON public.notification_queue
     FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');
   -- no user-facing policy: only SECURITY DEFINER trigger functions and the
   -- service_role-authenticated Edge Function touch this table.
   ```

3. **`<TS3>_trigger_notify_stevne_fase_start.sql`** — row-level, fires only when `stevne_fase` is actually in the `SET` list *and* transitions out of `'ikke_startet'`:
   ```sql
   CREATE OR REPLACE FUNCTION public.trg_stevne_fase_start_notify()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   BEGIN
     INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
     SELECT bp.id, 'stevne_start', NEW.id,
            'Stevne starta', format('%s har starta', NEW.navn), '/stevne/' || NEW.id
     FROM public.bruker_profil bp
     WHERE bp.varsle_stevne_start = true
     ON CONFLICT (user_id, notification_type, entity_id) DO NOTHING;
     RETURN NEW;
   END;
   $$;

   CREATE TRIGGER stevne_fase_start_notify
   AFTER UPDATE OF stevne_fase ON public.stevne
   FOR EACH ROW
   WHEN (OLD.stevne_fase = 'ikke_startet' AND NEW.stevne_fase IS DISTINCT FROM 'ikke_startet')
   EXECUTE FUNCTION public.trg_stevne_fase_start_notify();
   ```

4. **`<TS4>_trigger_notify_kamp_spelar_created.sql`** — **statement-level** with a transition table, so a batch insert of several `kamp_spelar` rows (pairs, multiple matches per round) fires once, not once per row:
   ```sql
   CREATE OR REPLACE FUNCTION public.trg_kamp_spelar_notify_created()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   BEGIN
     INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
     SELECT DISTINCT bp.id, 'kamp_opprettet', k.id,
            'Ny kamp', format('Du har fått ny kamp i %s', s.navn), '/kamp/' || k.id
     FROM new_table nt
     JOIN public.kamp k           ON k.id = nt.kampid
     JOIN public.stevne s         ON s.id = k.stevneid
     JOIN public.bruker_profil bp ON bp.kasterid = nt.kasterid
                                  AND bp.kobling_status = 'godkjent'
                                  AND bp.varsle_kamp_opprettet = true
     ON CONFLICT (user_id, notification_type, entity_id) DO NOTHING;
     RETURN NULL;
   END;
   $$;

   CREATE TRIGGER kamp_spelar_notify_created
   AFTER INSERT ON public.kamp_spelar
   REFERENCING NEW TABLE AS new_table
   FOR EACH STATEMENT
   EXECUTE FUNCTION public.trg_kamp_spelar_notify_created();
   ```
   The inner join to `bruker_profil` naturally skips kastere with no approved link and folds the preference check into the same query — no separate "is this user opted in" branch needed.

5. **`<TS5>_webhook_notification_queue_to_edge_function.sql`** — kept as its own migration since it embeds a URL/secret literal that may need touching independently later. **Actual implementation uses `pg_net` directly, not `supabase_functions.http_request`** — confirmed on this project that `supabase_functions` schema doesn't exist (`select * from pg_namespace where nspname = 'supabase_functions';` returned nothing), so the fallback described below was used instead of the Studio-generated wrapper:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;

   CREATE OR REPLACE FUNCTION public.trg_notification_queue_send_webhook()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   BEGIN
     PERFORM net.http_post(
       url := 'https://urtvpewjlevhlevtnvkf.supabase.co/functions/v1/send-push-notification',
       body := jsonb_build_object('record', to_jsonb(NEW)),
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-webhook-secret', '<value of PUSH_WEBHOOK_SECRET>'
       ),
       timeout_milliseconds := 5000
     );
     RETURN NEW;
   END;
   $$;

   CREATE TRIGGER notification_queue_send_webhook
   AFTER INSERT ON public.notification_queue
   FOR EACH ROW
   EXECUTE FUNCTION public.trg_notification_queue_send_webhook();
   ```
   `jsonb_build_object('record', to_jsonb(NEW))` reproduces the same `{ record: {...} }` payload shape the Edge Function (Phase B) expects, so no Edge Function code change was needed for this fallback. Use a dedicated `PUSH_WEBHOOK_SECRET`, **not** the `service_role` key, in this literal — it's readable via `pg_proc` by anyone with SQL-editor access, so scope the blast radius to "can hit this one endpoint."

After migrations 1–2 land: regenerate types —
```
npx supabase gen types typescript --project-id urtvpewjlevhlevtnvkf > src/types/database.types.ts
```

---

## Phase B — Edge Function (the actual sender)

New: `supabase/functions/send-push-notification/index.ts` (Deno, first Edge Function in this repo — no existing pattern to match, this establishes the convention).

- Verifies `x-webhook-secret` header against `PUSH_WEBHOOK_SECRET`.
- Reads the `notification_queue` row from the webhook payload.
- Calls OneSignal's Create Notification REST API (`POST https://api.onesignal.com/notifications`), targeting `include_aliases: { external_id: [row.user_id] }`, with `data.route` set to `row.deep_link` so the client can route on tap. **The `data` key must be named `route`** — it has to match the key the Phase C click handler reads (`event.notification.additionalData.route`) exactly, or tapping a notification silently goes nowhere.
- **Deliberately does not set a `url` field.** Tested and confirmed: setting `url` makes OneSignal's Android SDK default to opening it via a system browser intent on tap, which overrides the app's own `click` listener entirely (notification opened in the browser instead of navigating in-app, and pointed at whatever fixed URL was baked into the Edge Function regardless of which environment — dev/prod — was actually being tested). Since the client already handles navigation itself via `data.route`, no `url` is needed, and this also removes any need for a `SITE_URL` secret.
- Updates the queue row to `status = 'sent'` or `'failed'` (+ `error`) afterward.
- **Flag before shipping literally:** OneSignal's alias-targeting request shape (`include_aliases`/`target_channel` vs the older `include_external_user_ids`) has moved across API versions — re-check `https://documentation.onesignal.com` for the current exact shape at implementation time.

Secrets (`supabase secrets set ...`, never committed): `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `PUSH_WEBHOOK_SECRET`. `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are auto-injected — don't set manually. Deploy with `supabase functions deploy send-push-notification`.

---

## Phase C — Native client integration

1. `npm install @onesignal/capacitor-plugin` (verified current package — not the older `onesignal-cordova-plugin` that search results/some doc pages still surface), then `npm run build && npx cap sync android` to register the plugin's native module. **No `capacitor.config.ts` plugin block, no `AndroidManifest.xml` edit, no `google-services.json`** — confirmed by inspecting the plugin's actual Gradle/manifest sources: `POST_NOTIFICATIONS` and everything else merges in automatically from the transitive `com.onesignal:core`/`notifications` AARs.

2. New `src/services/pushNotificationService.ts` — native-only (guards on `Capacitor.isNativePlatform()`, dynamic-imports the plugin, mirroring how `authService.ts` already dynamic-imports `@capgo/capacitor-social-login` for its native-only Google sign-in path):
   - `initPushNotifications()` — calls `OneSignal.initialize(appId)` once and registers the notification-click listener (`location.hash = event.notification.additionalData.route`). Capacitor's bridge retains a cold-start click event until a listener is registered, so no separate "launched from notification" cold-start path is needed.
   - `syncPushLogin(userId)` / `syncPushLogout()` — call `OneSignal.login(userId)` / `OneSignal.logout()`.
   - `ensurePushPermission()` — calls `OneSignal.Notifications.requestPermission(true)`. Deliberately **not** called at app startup — deferred until a user actively flips one of the two toggles on, so the OS permission prompt is contextual instead of a blind cold-start prompt (Android only gives one clean shot at this).

3. `src/app.ts` — call `initPushNotifications()` once in the existing `DOMContentLoaded` handler, alongside `updateAuthMenu()`/`navigate()`.

4. `src/services/authService.ts` — in the existing `supabase.auth.onAuthStateChange` handler, call `syncPushLogin(session.user.id)` on `SIGNED_IN`/`INITIAL_SESSION`/`TOKEN_REFRESHED`/`USER_UPDATED`, and `syncPushLogout()` on `SIGNED_OUT`.

5. CI/CD: since the native shell loads the **live deployed site**, not a locally synced bundle, `VITE_ONESIGNAL_APP_ID` must reach the GitHub Actions builds, not just local `.env`. Add it as a repo secret (same scope as the existing `VITE_GOOGLE_WEB_CLIENT_ID`, confirmed present in both `.github/workflows/deploy-dev.yml:25` and `deploy-prod.yml:31`), reference it in both workflows' `env:` blocks the same way, add it to `.env.example`/`.env.local`, and add `readonly VITE_ONESIGNAL_APP_ID: string` to `src/vite-env.d.ts`.

---

## Phase D — Settings UI (`src/pages/minside.ts`)

- New `src/services/notificationPreferencesService.ts` (English identifiers, mirrors `brukerProfilService.ts`'s `{data,error}` + `logError()` pattern):
  ```ts
  export async function getNotificationPreferences(userId: string):
    Promise<{ data: Pick<Tables<'bruker_profil'>, 'varsle_stevne_start' | 'varsle_kamp_opprettet'> | null; error: unknown }>

  export async function updateNotificationPreference(
    userId: string,
    field: 'varsle_stevne_start' | 'varsle_kamp_opprettet',
    value: boolean,
  ): Promise<{ error: unknown }>
  ```
- New card in `minside.ts`, gated on `Capacitor.isNativePlatform()` (this page's bundle is also served on the public website, where push is a no-op) — two Bootstrap `.form-switch` toggles (this codebase has never used `.form-switch` before; it needs zero custom CSS, Bootstrap 5.3 already themes it via `data-bs-theme`).
- Toggle `change` handler: optimistic UI update, calls `ensurePushPermission()` before persisting an "on" flip, saves via `updateNotificationPreference`, reverts the checkbox + `showToast('...', 'error')` on failure — same convention as the optimistic-update pattern already used in `PameldingKnapp.ts`.
- Fetch prefs once during `render()` and bind the toggle listeners in **both** places `minside.ts` currently finishes rendering (the `'godkjent'` branch early-returns before the shared bottom-of-function `container.innerHTML = html`, so both paths need the bind call).

---

## External setup (manual, outside this repo — for you to do, not code)

1. Create a OneSignal account + app; add the Android (FCM) platform to it.
2. Create a Firebase project (only to produce credentials for step 3 — nothing from it is ever committed here).
3. In that Firebase project, enable "Firebase Cloud Messaging API (V1)" and generate a service-account JSON key; upload it to OneSignal's dashboard under Settings → Push & In-App → Platforms → Google Android (FCM).
4. Copy the OneSignal **App ID** → set as `VITE_ONESIGNAL_APP_ID` (GitHub secret + local `.env.local`).
5. Copy the OneSignal **REST API key** → `supabase secrets set ONESIGNAL_REST_API_KEY=...` (server-side only, never in client env vars).
6. Pick a `PUSH_WEBHOOK_SECRET` value, set it as a Supabase secret (`supabase secrets set PUSH_WEBHOOK_SECRET=...`), and store the same value in Vault (`select vault.create_secret('<value>', 'push_webhook_secret');`, run directly against the project — never as a migration or a literal in the trigger function).

---

## Known gaps (deliberate scope decisions for v1, not oversights)

- **No retry on failed sends.** If the Edge Function times out (5s) or OneSignal is briefly unavailable, the `notification_queue` row is left at `status = 'failed'` permanently — nothing re-attempts it. Acceptable for v1 given the low volume/low stakes (a missed "new match" push isn't critical — the data is still visible in-app), but this is an explicit scope cut, not an accident. If it becomes a problem, revisit with either a scheduled sweep of `status = 'failed' AND created_at > now() - interval '1 day'` re-invoking the Edge Function, or a bounded retry count column.
- ~~Webhook secret is plaintext in the migration's trigger literal.~~ **Resolved 2026-07-08** after the original value leaked via a committed migration file. `PUSH_WEBHOOK_SECRET` now lives in Supabase Vault (`vault.create_secret(...)`, run directly against the project — never as a migration) and `trg_notification_queue_send_webhook` reads it at call time via `vault.decrypted_secrets` (see `20260708130000_vault_push_webhook_secret.sql`). Rotating it going forward means calling `vault.update_secret(...)` directly against the project plus `supabase secrets set` for the Edge Function side — no migration, no literal ever committed again.

---

## Verification

`npm run typecheck && npm run typecheck:test && npm run test:run` after each phase. Beyond that, testing this feature for real needs an actual device/emulator and a live OneSignal app, so it's a manual end-to-end pass rather than something the automated suite covers. Path below goes from cheapest/no-device checks up to the full native flow.

### 1. Sanity-check the pipeline without touching the app

Confirms secrets and the trigger → Edge Function → OneSignal call all work, before involving a device:

```sql
insert into notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
values ('<a real auth.users.id from your project>', 'stevne_start', 1, 'Test', 'Testvarsel', '/minside');
```

Then a few seconds later:
```sql
select status, error from notification_queue order by id desc limit 1;
```
`status = 'sent'` means the whole chain (pg_net → Edge Function → OneSignal API) worked. If it's `failed`, check `error`; if it's stuck on `pending`, tail live logs:
```
npx supabase functions logs send-push-notification
```
Note: this only proves OneSignal *accepted* the request — with no device subscribed to that `user_id` yet, nothing lands on a phone. That's expected at this stage.

### 2. Get a real device subscribed

Build and run on an emulator or physical device against the local dev server (fastest iteration, no deploy needed):
```
npm run build
npm run android:sync:local   # emulator; see README for the adb reverse variant on a physical device
npx cap open android
```
Run it from Android Studio (▶). **Use an emulator image with Google Play Services**, not bare AOSP — push relies on FCM under the hood and won't work on a Play-Services-less image.

Then:
1. Log in with a real test account.
2. Go to **Min side** — confirm the "Varslingar" card appears (proves `Capacitor.isNativePlatform()` + the UI wiring works).
3. Toggle both switches on. Accept the Android notification permission prompt when it appears.
4. In the OneSignal dashboard: **Audience → Subscriptions** — find the device, confirm it shows the test user's Supabase `auth.users.id` as its External ID and is subscribed. If it's missing, `syncPushLogin` didn't fire — check `authService.ts`'s `onAuthStateChange` wiring and device logs (Android Studio Logcat filtered on "OneSignal").

### 3. Trigger both notification types for real

Fastest way — skip the full organizer UI flow and fire the triggers directly via SQL:

**Stevne start:**
```sql
update stevne set stevne_fase = 'innledende' where id = <a test stevne id> and stevne_fase = 'ikke_startet';
```

**Kamp created for me** — needs a `kamp_spelar` row whose `kasterid` matches the test user's linked kaster (`bruker_profil.kasterid` for that user, with `kobling_status = 'godkjent'`):
```sql
insert into kamp_spelar (kampid, kasterid) values (<an existing kamp id>, <the linked kasterid>);
```

Check `notification_queue` again for a new row and `status = 'sent'`.

### 4. Confirm the phone actually gets it

- Background the app (don't force-close yet) and re-run one of the triggers above — the notification should appear in the system tray within a few seconds.
- Tap it — the app should come to foreground and navigate to the deep link (`/stevne/<id>` or `/kamp/<id>`).
- **Cold-start test**: force-stop the app entirely (Android Settings → Apps → your app → Force stop), trigger another notification, tap it from the tray, and confirm it launches the app *and* still navigates correctly — this exercises the `retainUntilConsumed` buffering the OneSignal plugin relies on for cold starts.

### 5. Edge cases worth checking while you're at it

- Toggle a preference **off**, re-trigger — confirm no new notification arrives (the trigger's join on `bp.varsle_* = true` should exclude them).
- Re-run the *same* stevne update or kamp_spelar insert twice — confirm no duplicate row in `notification_queue` (the `UNIQUE (user_id, notification_type, entity_id)` + `ON CONFLICT DO NOTHING` dedup).

If anything gets stuck, `npx supabase functions logs send-push-notification --follow` while triggering is the quickest way to see exactly where it's failing.
