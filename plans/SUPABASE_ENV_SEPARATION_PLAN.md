# Supabase Dev/Prod Separation + GitHub Actions CI/CD

> **Verified 2026-07-09** against the actual repo state. Corrections and new findings are called out inline as `> **Verify note:**` blocks — the numbered steps below are otherwise unchanged from the original plan.

## Context

Currently there is a single Supabase project used for both development and production traffic for the hesteskokasting.no results system. We need to split this into two separate, fixed Supabase projects:

- **dev** — existing project (`urtvpewjlevhlevtnvkf`), continues to be used for local development and testing.
- **prod** — brand new Supabase project, created fresh, used exclusively for production traffic (hesteskokasting.no / res.hesteskokasting.no).

This is a permanent two-project setup (not Supabase branching — single developer, free-tier friendly, migration files as source of truth). Do not reuse the existing project as prod; it becomes dev.

Frontend is Vite + vanilla TypeScript, deployed via GitHub Pages + GitHub Actions. We want GitHub Actions to also own the CI/CD for Supabase (migrations + edge functions), not manual CLI pushes from a local machine, going forward.

## Goals

1. Two cleanly separated Supabase projects (dev, prod) with no shared data or credentials.
2. Migration files in `supabase/migrations/` remain the single source of truth, applied to dev first, then prod.
3. GitHub Actions handles:
   - Applying migrations to prod on merge to `main` (or on tag/release — decide as part of this work).
   - Deploying edge functions to prod.
   - Building the frontend with prod env vars for the production deploy, and dev env vars for any preview/staging build if one exists.
4. No secrets (DB passwords, service role keys, access tokens) committed to the repo — everything via GitHub Actions secrets.
5. Rollback / recovery path documented in case a prod migration goes wrong.

## Non-goals

- Supabase branching (explicitly rejected — not worth the Pro-tier cost/complexity for a solo developer).
- Automatic migration on every push to every branch — only controlled deploys to prod.
- Zero-downtime blue/green DB migration strategies — out of scope unless a specific migration needs it.

## Proposed steps

### 1. Create the new prod Supabase project

- Create a new project in the Supabase dashboard (region: same as current, `eu-west-1`, unless there's a reason to change).
- Decide whether prod needs Pro tier immediately or can start on free tier and be upgraded later (recall: free tier pauses after ~1 week inactivity — prod should not be on free tier long-term, but the initial setup can happen before upgrading).
- Record the new project ref/ID somewhere durable (not just chat history) — e.g. in a `docs/` note in the repo (ref/ID only, no keys).

### 2. Bring prod schema up to date with dev

- Ensure dev's migration history is clean and fully represented in `supabase/migrations/` (there's been at least one prior CLI/dashboard migration mismatch — worth a `supabase migration list` sanity check on dev before treating it as the template).
  > **Verify note:** Ran `supabase migration list` against dev on 2026-07-09 — local and remote are in perfect sync (37/37 migrations match). No mismatch currently exists; this concern is resolved, no cleanup needed before treating dev as the template.
- Link CLI to the new prod project (`supabase link --project-ref <prod-ref>`).
- Run `supabase db push` against prod to apply the full migration history in one go.
  > **Verify note — blocker:** [`20260706120400_webhook_notification_queue_to_edge_function.sql`](../supabase/migrations/20260706120400_webhook_notification_queue_to_edge_function.sql) and [`20260708130000_vault_push_webhook_secret.sql`](../supabase/migrations/20260708130000_vault_push_webhook_secret.sql) both hardcode `https://urtvpewjlevhlevtnvkf.supabase.co/functions/v1/send-push-notification` (dev's project URL) inside the `trg_notification_queue_send_webhook()` function body. Replaying migration history verbatim on prod will leave prod's `notification_queue` trigger calling **dev's** edge function, not its own. This needs a follow-up migration — written before the prod cutover — that makes the URL resolve to whichever project it's running on (e.g. via a `current_setting`/vault-stored value) instead of a literal string. Do not `db push` to prod and consider this step done without addressing this.
- Verify schema parity: `supabase db diff` or a manual table/RLS policy comparison between dev and prod.

### 3. Recreate non-schema config on prod

These do not come along automatically when you push migrations:

- RLS policies and `SECURITY DEFINER` functions — confirm they applied correctly via `db push`, then re-run the non-admin pgTAP tests against prod directly (not just dev) to catch the kind of silent RLS failure seen before.
  > **Verify note:** `supabase/tests/00_smoke.sql` through `04_lock_completed_stevne.sql` already exist and cover RLS + RPC behavior — these are the tests to re-run against prod, no new tests need writing for this step.
- Auth providers (Google Sign-In / OAuth) — reconfigure provider settings, redirect URLs, and "Authorized Client IDs" on the new prod project. This is a common miss.
  > **Verify note:** Confirmed the client-side Google client ID is already env-driven (`VITE_GOOGLE_WEB_CLIENT_ID`, no hardcoded ID in `capacitor.config.ts` or Android resources), so this is purely a dashboard/provider-config task on the new prod project — no code changes needed.
- Storage buckets, if any, and their policies.
- Edge functions — not part of `db push`; deployed separately (see step 5).
- Vault secrets — `push_webhook_secret` currently lives only in dev's Supabase Vault, created out-of-band via `select vault.create_secret(...)` (per the comment in `20260708130000_vault_push_webhook_secret.sql`). Vault entries are project-local and are **not** carried by `db push` or by any migration — they must be recreated manually on prod with the same secret name, and the corresponding Edge Function secret (`PUSH_WEBHOOK_SECRET`) set via `supabase secrets set` on the prod project too.
- Any project-level settings (email templates, rate limits, etc.) that were manually configured on the old project.

### 4. Set up GitHub Actions secrets

> **Verify note:** `.github/workflows/deploy-prod.yml` and `deploy-dev.yml` already exist and already do frontend build+deploy with dev/prod separation — see step 5 below for what's actually there. This changes what step 4 needs to do: the frontend secret pattern below is already correct in shape and just needs its values updated once the prod project exists. Don't rename secrets or restructure workflows to match the original `SUPABASE_PROD_URL`/`SUPABASE_DEV_URL` naming below — it would be pure churn.

In the GitHub repo settings, add (as encrypted secrets, scoped to an environment if using GitHub Environments — recommended so prod secrets require the `production` environment):

- `SUPABASE_ACCESS_TOKEN` (personal access token for CLI, or scoped as needed) — **new, needed for the Supabase CI/CD piece (migrations + edge functions), which doesn't exist yet.**
- `SUPABASE_PROD_PROJECT_REF` — **new**, same reason.
- `SUPABASE_PROD_DB_PASSWORD` (if needed for direct `db push` auth) — **new**, same reason.
- ~~`SUPABASE_PROD_URL` / `SUPABASE_PROD_ANON_KEY` (for the frontend build)~~ — **not needed as new secret names.** The frontend already reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from whichever GitHub Environment is active (`github-pages` for prod, `dev` for dev — see step 5). Once the prod project exists, just set those two secret **values** on the `github-pages` environment; the `dev` environment keeps pointing at the existing project.
- ~~Keep dev equivalents separate — `SUPABASE_DEV_URL` / `SUPABASE_DEV_ANON_KEY`~~ — already true today via the `dev` environment, no new secret names needed.

Recommend using a GitHub **Environment** named `production` with required reviewers, so a merge to `main` doesn't silently push to prod without at least one manual approval step — worth deciding whether this is wanted given it's a solo project, but it's cheap insurance against a bad migration going out unattended.

> **Verify note:** This already exists under the name `prod-godkjenning` (see `deploy-prod.yml`'s `godkjenn` job) — a manual-approval gate in front of the prod deploy. No new environment needed; just add required reviewers to `prod-godkjenning` if that isn't already configured, and reuse it as the gate in front of the new Supabase migration/function-deploy job too.

### 5. GitHub Actions workflow(s)

> **Verify note — this section is stale.** `deploy-prod.yml` (triggered on push to `main`, gated by the `prod-godkjenning` environment, then builds+deploys the frontend to GitHub Pages under `environment: github-pages`) and `deploy-dev.yml` (triggered on push to `dev`, deploys under `/dev/`) already exist and already work. **What's actually missing is only the Supabase half** — neither workflow has any `supabase link` / `db push` / `functions deploy` step. Rewrite this step as: add a Supabase job to the existing `deploy-prod.yml` (after the `godkjenn` approval gate, before or parallel to `build-and-deploy`) rather than authoring two new workflows from scratch.

Add a Supabase job to the existing `deploy-prod.yml`, gated behind the existing `godkjenn` (`prod-godkjenning`) approval step:
- Checkout, install Supabase CLI.
- `supabase link --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_REF }}`
- `supabase db push` (applies any new migrations not yet on prod) — **only after the hardcoded-URL migration fix from step 2 is in place.**
- `supabase functions deploy <name>` for each edge function (or deploy all).
- The frontend `build-and-deploy` job in `deploy-prod.yml` needs no structural change — it already builds with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from the `github-pages` environment; just update those secret values once the prod project exists.

`deploy-dev.yml` needs no Supabase job added — dev migrations continue to be applied via local CLI (`supabase db push` from a developer machine) unless/until that's also automated. Confirm it explicitly resolves to the dev project ref via its own environment secrets (it does — `environment: dev`), so there's no risk of it accidentally deploying to prod.

### 6. Verification checklist before going live on prod

- [ ] Schema diff between dev and prod is empty.
- [ ] RLS/SECURITY DEFINER pgTAP tests pass against prod directly.
- [ ] Auth (Google Sign-In) works end-to-end against prod project.
- [ ] Edge functions respond correctly on prod.
- [ ] `notification_queue` webhook trigger calls **prod's own** edge function URL, not dev's (see step 2 blocker — verify the follow-up migration landed before `db push`).
- [ ] `push_webhook_secret` exists in prod's Vault and `PUSH_WEBHOOK_SECRET` is set as a prod Edge Function secret; a real notification round-trips end-to-end on prod.
- [ ] Frontend build deployed to hesteskokasting.no is confirmed to be pointed at the new prod project (check network requests / Supabase URL in the deployed site).
- [ ] Old project confirmed to still be safe to use as dev (no production traffic left pointing at it).
- [ ] Rollback plan noted: if a prod migration fails, what's the recovery step (e.g. `supabase migration repair`, restore from backup)?

### 7. Data migration (if needed)

If prod needs to start with real data from the current single project (rather than an empty schema):
- Use `pg_dump`/`pg_restore` or Supabase's project backup/restore tooling to copy data from the current project into the new prod project, after schema is in place.
- Do this as a separate, deliberate step — not bundled into the CI/CD setup — since it's a one-time cutover event, not a repeatable pipeline step.

## Open questions to resolve before implementation

1. ~~Should `deploy-prod.yml` trigger on push to `main`, or only on a manual `workflow_dispatch` / release tag?~~ — **Already resolved in the existing workflow:** triggers on push to `main`, gated by the `prod-godkjenning` manual-approval environment. Decide only whether the *new* Supabase migration/function-deploy job should sit behind that same gate (recommended: yes, same gate) or need its own.
2. Does the current single project become "dev" as-is, or do we want a fresh dev project too and treat the current one as a to-be-decommissioned legacy? (Recommended: reuse current project as dev — no reason to churn it.)
3. Timing — is there a maintenance window needed for the cutover, or can it happen without user-facing downtime (likely yes, since prod is new and old project keeps serving until DNS/env switch)?
4. **New:** Who/what fixes the hardcoded dev URL in the notification-webhook trigger (step 2 blocker) — a dedicated migration before prod is stood up, or is the push-notification feature acceptable to leave broken on prod temporarily post-cutover? Recommend fixing it before the first `db push` to prod, since it's a one-line SQL change and cheap to do now.
