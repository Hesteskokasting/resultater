BEGIN;

SELECT plan(9);

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
