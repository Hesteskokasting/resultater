BEGIN;

SELECT plan(11);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Pins down slett_brukarkonto's authorization after admin deletion was added:
-- self and admin may delete, nobody else may; the last admin is undeletable;
-- and the thrower profile behind an account always survives the deletion.
-- handle_new_user auto-creates bruker_profil rows, hence ON CONFLICT.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000081', 'bruker@slett.test',   'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000082', 'annan@slett.test',    'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000083', 'admin1@slett.test',   'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000084', 'admin2@slett.test',   'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000085', 'sjolvsagt@slett.test','authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9980, 'Slett Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES (9981, 'Kobla', 'Utøvar', 9980);

-- A completed stevne where account 81 registered throws on both scoring models.
-- The lock triggers freeze that data, so deleting the account has to be able to
-- clear registrert_av through the lock — it could not before 20260922171116.
INSERT INTO public.stevne (id, navn, dato, erfullfort) VALUES (9982, 'Slett Test Stevne', '2026-01-01', false);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer)
OVERRIDING SYSTEM VALUE VALUES (9982, 'slett-test', 9982, 'innledende', 1);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE VALUES (9982, 9982, 9981);

INSERT INTO public.kamp_omgang (id, kamp_spelar_id, omgang, score, antall_ringer, registrert_av)
OVERRIDING SYSTEM VALUE VALUES (9982, 9982, 1, 4, 1, '00000000-0000-0000-0000-000000000081');

INSERT INTO public.xkast_kongelag (id, stevneid, fase, pulje, bane_nummer)
OVERRIDING SYSTEM VALUE VALUES (9982, 9982, 'innledende', 1, 1);

INSERT INTO public.xkast_kongelag_deltaker (id, xkast_kongelag_id, kasterid)
OVERRIDING SYSTEM VALUE VALUES (9982, 9982, 9981);

INSERT INTO public.xkast_kongelag_omgang (id, xkast_kongelag_deltaker_id, omgang, poeng, antall_ringer, registrert_av)
OVERRIDING SYSTEM VALUE VALUES (9982, 9982, 1, 12, 2, '00000000-0000-0000-0000-000000000081');

UPDATE public.stevne SET erfullfort = true WHERE id = 9982;

-- Any pre-existing admin would defeat the last-admin test; this suite owns the
-- whole role table for the length of the transaction.
DELETE FROM public.bruker_profil WHERE rolle = 'admin';

INSERT INTO public.bruker_profil (id, rolle, kasterid, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000081', 'bruker', 9981, 'godkjent'),
  ('00000000-0000-0000-0000-000000000082', 'bruker', NULL, 'ingen'),
  ('00000000-0000-0000-0000-000000000083', 'admin',  NULL, 'ingen'),
  ('00000000-0000-0000-0000-000000000084', 'admin',  NULL, 'ingen'),
  ('00000000-0000-0000-0000-000000000085', 'bruker', NULL, 'ingen')
ON CONFLICT (id) DO UPDATE SET
  rolle = EXCLUDED.rolle,
  kasterid = EXCLUDED.kasterid,
  kobling_status = EXCLUDED.kobling_status;

-- ── A plain user may not delete somebody else ─────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000082","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.slett_brukarkonto('00000000-0000-0000-0000-000000000081') $$,
  'Not authorized to delete this account',
  'a non-admin cannot delete another account'
);

SELECT lives_ok(
  $$ SELECT public.slett_brukarkonto('00000000-0000-0000-0000-000000000082') $$,
  'a user can still delete their own account'
);

RESET ROLE;

SELECT is(
  (SELECT count(*)::int FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000082'),
  0,
  'self-deletion removes the profile'
);

-- ── An admin may delete any account, and the thrower survives ─────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000083","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.slett_brukarkonto('00000000-0000-0000-0000-000000000081') $$,
  'an admin can delete another user''s account'
);

RESET ROLE;

SELECT is(
  (SELECT count(*)::int FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000081'),
  0,
  'the deleted account is gone from bruker_profil'
);

SELECT is(
  (SELECT count(*)::int FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000081'),
  0,
  'the deleted account is gone from auth.users'
);

SELECT is(
  (SELECT count(*)::int FROM public.kaster WHERE id = 9981),
  1,
  'the thrower profile behind the account is untouched'
);

SELECT is(
  (SELECT registrert_av FROM public.kamp_omgang WHERE id = 9982),
  NULL,
  'kamp_omgang in a completed stevne lost its pointer to the deleted account'
);

SELECT is(
  (SELECT registrert_av FROM public.xkast_kongelag_omgang WHERE id = 9982),
  NULL,
  'xkast_kongelag_omgang in a completed stevne lost its pointer too'
);

-- ── The last admin cannot be deleted ──────────────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000083","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.slett_brukarkonto('00000000-0000-0000-0000-000000000084') $$,
  'an admin can delete another admin while more than one remains'
);

SELECT throws_ok(
  $$ SELECT public.slett_brukarkonto('00000000-0000-0000-0000-000000000083') $$,
  'Cannot delete the last admin account',
  'the last admin cannot delete itself'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
