# Manual TODO — Supabase Dev/Prod Separation

Companion checklist to [SUPABASE_ENV_SEPARATION_PLAN.md](SUPABASE_ENV_SEPARATION_PLAN.md). These are the steps that require dashboard clicks, external accounts, or human judgment calls — not something Claude can do from the repo. Work top to bottom; each section notes what it's blocked on.

---

## 1. Create the prod Supabase project

- [ ] Create new project in the Supabase dashboard — region `eu-west-1` (matches dev), name it clearly (e.g. `hesteskokasting-prod`).
- [ ] Decide free tier vs Pro tier for launch. Free tier pauses after ~1 week idle — fine for initial schema setup, but **must upgrade to Pro before real production traffic** (pausing mid-competition would be bad).
- [ ] Record the new project ref/ID in a repo note (ref/ID only — no keys). Suggest a short line in `docs/` or at the top of the plan file once known.

## 2. Fix the hardcoded dev URL (do this before step 3)

- [ ] Ask Claude to write a new migration that makes `trg_notification_queue_send_webhook()` resolve its own project's URL instead of the literal `https://urtvpewjlevhlevtnvkf.supabase.co/...` currently baked into `20260706120400_...` and `20260708130000_...`. This is a code task, not manual — flagged here only as a blocker gate: **don't run step 3's `db push` to prod until this migration exists and is merged.**

## 3. Push schema to prod (CLI, from your machine — not yet automated)

- [ ] `supabase link --project-ref <prod-ref>`
- [ ] `supabase db push`
- [ ] `supabase db diff` (or manual comparison) against dev to confirm schema parity.

## 4. Recreate non-schema config on prod (dashboard-only, nothing in git)

- [ ] **Auth provider** — reconfigure Google Sign-In on the prod project: OAuth client, authorized redirect URLs, "Authorized Client IDs" in Supabase Auth settings. (Client ID itself is already env-driven in code — this is pure dashboard config.)
- [ ] **Storage buckets** — recreate any buckets + their policies if the project uses Storage.
- [ ] **Vault secret** — run `select vault.create_secret('<value>', 'push_webhook_secret')` directly against the **prod** project (same mechanism used on dev — see comment in `20260708130000_vault_push_webhook_secret.sql`). Generate a fresh secret value for prod, don't reuse dev's.
- [ ] **Edge Function secret** — `supabase secrets set PUSH_WEBHOOK_SECRET=<same value as above>` on the prod project.
- [ ] Deploy the edge function itself: `supabase functions deploy send-push-notification` (or via CI once step 6 exists).
- [ ] Any other project-level settings you've manually tweaked on the old project over time (email templates, rate limits) — check Project Settings on dev and mirror anything non-default.
- [ ] Re-run the pgTAP tests (`supabase/tests/00_smoke.sql` → `04_lock_completed_stevne.sql`) directly against prod: `supabase test db` pointed at the linked prod project.

## 5. GitHub repo settings

- [ ] Add repo secrets (or environment-scoped secrets) for the new CI/CD pieces:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROD_PROJECT_REF`
  - `SUPABASE_PROD_DB_PASSWORD` (if needed for `db push` auth)
- [ ] Update the **existing** `github-pages` environment's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` secret values to point at the new prod project (no new secret names needed — see plan step 4).
- [ ] Confirm `prod-godkjenning` environment has required reviewers configured (it's the existing manual-approval gate in `deploy-prod.yml`) — add yourself if not already there.

## 6. Workflow change (code task, listed here only as a checkpoint)

- [ ] Ask Claude to add the Supabase migration/function-deploy job to `deploy-prod.yml`, gated behind `prod-godkjenning`, per the updated plan step 5. This is a code change — Claude can do it, just flagging it needs your review/approval before merge since it touches CI.

## 7. Go-live verification (do this live, on prod, before pointing real traffic at it)

- [ ] Walk through the full checklist in plan step 6 (schema diff, pgTAP, auth, edge functions, webhook trigger URL, frontend network requests) against prod directly.
- [ ] Confirm DNS / env switch timing — decide if this needs a maintenance window or can happen live (plan open question 3).

## 8. Data migration (separate from all of the above — do NOT bundle)

- [ ] Run your own data-transfer script/process to copy real data from the current project into prod, after schema + config above are confirmed working on an empty prod. This is explicitly out of scope for Claude to run — you said you'd handle this separately.

## 9. Decommission old project's "prod" role

- [ ] Once prod is confirmed live and serving real traffic, confirm nothing (frontend, native app builds, edge functions, webhooks) still points at the old project for anything other than dev traffic.
