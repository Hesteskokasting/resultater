BEGIN;

SELECT plan(4);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Player A and Player B are two different auth accounts both approved-linked
-- to the same kasterid (9901) — the multi-account scenario this policy set
-- must support: either account can manage the shared thrower's registration.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000011', 'player-a@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000012', 'player-b@rls.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9911, 'RLS Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES (9911, 'Player', 'AB', 9911);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000011', 9911, 'bruker', 'godkjent'),
  ('00000000-0000-0000-0000-000000000012', 9911, 'bruker', 'godkjent')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, kobling_status = EXCLUDED.kobling_status;

INSERT INTO public.stevne (id, navn) VALUES (9911, 'RLS Test Stevne');

-- ── Case 1: player A registers their linked kasterid ──────────────────────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000011","role":"authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid) VALUES (9911, 9911) $$,
  'player A can register their own approved-linked kasterid'
);

-- ── Case 2: player B (same kasterid, different account) cannot duplicate it ───
-- Guards the (stevneid, kasterid) unique constraint added alongside this policy set.
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000012","role":"authenticated"}', true);

SELECT throws_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid) VALUES (9911, 9911) $$,
  '23505', NULL,
  'player B cannot insert a duplicate registration for the shared kasterid'
);

-- ── Case 3: player B can update the registration player A created ────────────
-- This is the multi-account scenario the old bruker_id-based policy broke:
-- ownership must follow the shared kasterid link, not the creating account.
SELECT lives_ok(
  $$ UPDATE public.pamelding SET er_bekreftet = true WHERE stevneid = 9911 AND kasterid = 9911 $$,
  'player B can update the registration player A created for their shared kasterid'
);

-- ── Case 4: player B can delete (unregister) the registration player A created
SELECT lives_ok(
  $$ DELETE FROM public.pamelding WHERE stevneid = 9911 AND kasterid = 9911 $$,
  'player B can delete the registration player A created for their shared kasterid'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
