BEGIN;

SELECT plan(4);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000011', 'del-a@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000012', 'del-b@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000013', 'del-c@rls.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9911, 'RLS Del Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9911, 'Del', 'A', 9911),
  (9912, 'Del', 'B', 9911),
  (9913, 'Del', 'C', 9911);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000011', 9911, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000012', 9912, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000013', 9913, 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid;

INSERT INTO public.stevne (id, navn, dato) VALUES (9911, 'RLS Del Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9911, 'rls-omgang-delete', 9911, 'innledende', 1, false);

-- Players A and B are in the match; C is not.
INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9911, 9911, 9911),
  (9912, 9911, 9912);

INSERT INTO public.kamp_omgang (id, kamp_spelar_id, omgang, score, antall_ringer, registrert_av)
OVERRIDING SYSTEM VALUE
VALUES
  (9911, 9911, 1, 4, 1, '00000000-0000-0000-0000-000000000011'),
  (9912, 9912, 1, 6, 2, '00000000-0000-0000-0000-000000000011'),
  (9913, 9911, 2, 6, 2, '00000000-0000-0000-0000-000000000011'),
  (9914, 9912, 2, 3, 1, '00000000-0000-0000-0000-000000000011');

-- ── Case 1: player C (not in match) cannot delete ─────────────────────────────
-- DELETE filtered by RLS deletes nothing rather than raising, so assert the row survives.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000013","role":"authenticated"}', true);

DELETE FROM public.kamp_omgang WHERE id = 9913;

SELECT is(
  (SELECT count(*)::int FROM public.kamp_omgang WHERE id = 9913),
  1,
  'player C (not in match) cannot delete an omgang'
);

-- ── Case 2: player B deletes the last omgang for both sides ───────────────────
-- This is what the scoreboard undo does: any participant clears the whole round.
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000012","role":"authenticated"}', true);

DELETE FROM public.kamp_omgang WHERE kamp_spelar_id IN (9911, 9912) AND omgang = 2;

SELECT is(
  (SELECT count(*)::int FROM public.kamp_omgang WHERE kamp_spelar_id IN (9911, 9912) AND omgang = 2),
  0,
  'participant can delete the last omgang for both sides'
);

-- ── Case 3: earlier omgangar are untouched ────────────────────────────────────
SELECT is(
  (SELECT count(*)::int FROM public.kamp_omgang WHERE kamp_spelar_id IN (9911, 9912) AND omgang = 1),
  2,
  'the omgang before the deleted one survives'
);

-- ── Case 4: no delete once the kamp is confirmed ──────────────────────────────
RESET ROLE;
UPDATE public.kamp SET er_bekreftet = true WHERE id = 9911;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000011","role":"authenticated"}', true);

DELETE FROM public.kamp_omgang WHERE kamp_spelar_id IN (9911, 9912) AND omgang = 1;

SELECT is(
  (SELECT count(*)::int FROM public.kamp_omgang WHERE kamp_spelar_id IN (9911, 9912) AND omgang = 1),
  2,
  'participant cannot delete an omgang after the kamp is confirmed'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
