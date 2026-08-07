BEGIN;

SELECT plan(7);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- One player account and one admin account. Two stevne: one far in the future
-- (window closed) and one starting within the hour (window open).

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000031', 'oppmote-player@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000032', 'oppmote-admin@rls.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9931, 'Oppmote Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES (9931, 'Oppmote', 'Spelar', 9931);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000031', 9931, 'bruker', 'godkjent'),
  ('00000000-0000-0000-0000-000000000032', NULL, 'admin', 'godkjent')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, rolle = EXCLUDED.rolle, kobling_status = EXCLUDED.kobling_status;

-- Locked: a month out, so "now" is never within two hours of the start.
INSERT INTO public.stevne (id, navn, dato, tid)
VALUES (9931, 'Oppmote Laast', (current_date + 30), '12:00');

-- Open: starts an hour from now in Norwegian local time.
INSERT INTO public.stevne (id, navn, dato, tid)
VALUES (
  9932,
  'Oppmote Opent',
  (now() AT TIME ZONE 'Europe/Oslo')::date,
  ((now() AT TIME ZONE 'Europe/Oslo') + interval '1 hour')::time
);

INSERT INTO public.pamelding (stevneid, kasterid) VALUES (9931, 9931), (9932, 9931);

-- ── Case 1: the window is shut more than two hours before start ───────────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}', true);

SELECT throws_ok(
  $$ UPDATE public.pamelding SET er_bekreftet = true WHERE stevneid = 9931 AND kasterid = 9931 $$,
  '23514', NULL,
  'player cannot confirm attendance more than two hours before start'
);

-- ── Case 2: inside the window the same update succeeds ────────────────────────
SELECT lives_ok(
  $$ UPDATE public.pamelding SET er_bekreftet = true WHERE stevneid = 9932 AND kasterid = 9931 $$,
  'player can confirm attendance within two hours of start'
);

-- ── Case 3: the trigger stamps bekreftet_at from the database clock ───────────
SELECT ok(
  (SELECT bekreftet_at IS NOT NULL FROM public.pamelding WHERE stevneid = 9932 AND kasterid = 9931),
  'confirming stamps bekreftet_at'
);

-- ── Case 4: an unrelated update must not disturb the stamp ────────────────────
SELECT lives_ok(
  $$ UPDATE public.pamelding SET posisjon = 1 WHERE stevneid = 9932 AND kasterid = 9931 $$,
  'an update that leaves er_bekreftet alone is allowed'
);

SELECT ok(
  (SELECT bekreftet_at IS NOT NULL FROM public.pamelding WHERE stevneid = 9932 AND kasterid = 9931),
  'an unrelated update keeps bekreftet_at'
);

-- ── Case 5: withdrawing is never gated, and clears the stamp ──────────────────
SELECT lives_ok(
  $$ UPDATE public.pamelding SET er_bekreftet = false WHERE stevneid = 9932 AND kasterid = 9931 $$,
  'player can withdraw their own confirmation'
);

-- ── Case 6: organisers check players in at the venue, window or not ───────────
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000032","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.pamelding SET er_bekreftet = true WHERE stevneid = 9931 AND kasterid = 9931 $$,
  'admin can confirm attendance outside the two-hour window'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
