BEGIN;

SELECT plan(18);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'admin@lock.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'bruker@lock.test', 'authenticated', 'authenticated', '', now(), now());

-- handle_new_user trigger creates bruker_profil rows on auth.users INSERT;
-- ON CONFLICT handles the case where the trigger fires before we get here.
INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'admin',  'ingen'),
  ('00000000-0000-0000-0000-000000000102', 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9910, 'Lock Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES (9910, 'Lock', 'Tester', 9910);

-- Stevne 9910: the one we lock/reopen. Not completed yet.
INSERT INTO public.stevne (id, navn, erfullfort) VALUES (9910, 'Lock Test Stevne', false);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9910, 'lock-test', 9910, 'innledende', 1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES (9910, 9910, 9910);

INSERT INTO public.kamp_omgang (id, kamp_spelar_id, omgang, score)
OVERRIDING SYSTEM VALUE
VALUES (9910, 9910, 1, 4);

INSERT INTO public.resultat (id, stevneid, kasterid, plassering)
VALUES (9910, 9910, 9910, 1);

-- ── Case 1: writes to all 4 tables succeed while stevne is not completed ─────

SELECT lives_ok(
  $$ UPDATE public.kamp SET bane_nummer = 1 WHERE id = 9910 $$,
  'kamp update succeeds before completion'
);

SELECT lives_ok(
  $$ UPDATE public.kamp_spelar SET score_poeng = 5 WHERE id = 9910 $$,
  'kamp_spelar update succeeds before completion'
);

SELECT lives_ok(
  $$ UPDATE public.kamp_omgang SET score = 6 WHERE id = 9910 $$,
  'kamp_omgang update succeeds before completion'
);

SELECT lives_ok(
  $$ UPDATE public.resultat SET plassering = 2 WHERE id = 9910 $$,
  'resultat update succeeds before completion'
);

-- ── Complete the stevne directly (proves the trigger checks live state,
--    not who/how erfullfort was set) ──────────────────────────────────────────

UPDATE public.stevne SET erfullfort = true WHERE id = 9910;

-- ── Case 2: writes to all 4 tables are blocked once completed ───────────────
-- Run as postgres superuser (bypasses RLS entirely) to prove it's the
-- trigger, not RLS, doing the blocking.

SELECT throws_ok(
  $$ UPDATE public.kamp SET bane_nummer = 2 WHERE id = 9910 $$,
  'P0001', NULL,
  'kamp update blocked after completion'
);

SELECT throws_ok(
  $$ UPDATE public.kamp_spelar SET score_poeng = 9 WHERE id = 9910 $$,
  'P0001', NULL,
  'kamp_spelar update blocked after completion'
);

SELECT throws_ok(
  $$ UPDATE public.kamp_omgang SET score = 9 WHERE id = 9910 $$,
  'P0001', NULL,
  'kamp_omgang update blocked after completion'
);

SELECT throws_ok(
  $$ UPDATE public.resultat SET plassering = 9 WHERE id = 9910 $$,
  'P0001', NULL,
  'resultat update blocked after completion'
);

SELECT throws_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score) VALUES (9910, 99, 1) $$,
  'P0001', NULL,
  'kamp_omgang insert blocked after completion'
);

SELECT throws_ok(
  $$ DELETE FROM public.resultat WHERE id = 9910 $$,
  'P0001', NULL,
  'resultat delete blocked after completion'
);

SELECT throws_ok(
  $$ INSERT INTO public.kamp (match_id, stevneid, fase, runde_nummer) VALUES ('lock-test-2', 9910, 'innledende', 1) $$,
  'P0001', NULL,
  'kamp insert blocked after completion'
);

-- ── Case 3: complete_stevne() still works end-to-end (regression check) ─────

INSERT INTO public.stevnetype (id, navn) VALUES (9910, 'NC');
INSERT INTO public.norgescuppoeng (id, plassering, poengnc, poengdnc, gjelderfraaar) VALUES (9910, 1, 100, 75, 2020);
INSERT INTO public.stevne (id, navn, dato, stevnetypeid, erfullfort) VALUES (9920, 'Complete Test Stevne', '2026-01-01', 9910, false);
INSERT INTO public.resultat (id, stevneid, kasterid, plassering) VALUES (9911, 9920, 9910, 1);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9920) $$,
  'complete_stevne still works after adding the lock triggers'
);

SELECT is(
  (SELECT erfullfort FROM public.stevne WHERE id = 9920),
  true,
  'complete_stevne sets erfullfort = true'
);

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9911),
  100::real,
  'complete_stevne still recomputes nc_poeng before locking'
);

-- ── Case 4: reopen_stevne() authorization ────────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000102","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.reopen_stevne(9910) $$,
  'P0001', NULL,
  'non-admin/klubbadmin cannot reopen a stevne'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.reopen_stevne(9910) $$,
  'admin can reopen a stevne'
);

RESET ROLE;

SELECT is(
  (SELECT erfullfort FROM public.stevne WHERE id = 9910),
  false,
  'reopen_stevne sets erfullfort = false'
);

-- ── Case 5: writes are unblocked again after reopening ───────────────────────

SELECT lives_ok(
  $$ UPDATE public.resultat SET plassering = 3 WHERE id = 9910 $$,
  'resultat update succeeds again after reopening'
);

SELECT finish();
ROLLBACK;
