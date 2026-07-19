BEGIN;

SELECT plan(5);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Pins down the bp_oppdater hardening: self-updates can request a kaster link
-- (kobling_status 'venter'/'ingen') but can never approve their own link or
-- move kasterid — approval flows only through the admin branch or SECURITY
-- DEFINER RPCs. handle_new_user auto-creates bruker_profil rows, hence
-- ON CONFLICT.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'requester@kobling.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000073', 'linked@kobling.test',    'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000074', 'admin@kobling.test',     'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9970, 'Kobling Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9971, 'Linked',    'Thrower', 9970),
  (9972, 'Requested', 'Thrower', 9970);

INSERT INTO public.bruker_profil (id, rolle, kasterid, kobling_status, kobling_kasterid)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'bruker', NULL, 'ingen',    NULL),
  ('00000000-0000-0000-0000-000000000073', 'bruker', 9971, 'godkjent', NULL),
  ('00000000-0000-0000-0000-000000000074', 'admin',  NULL, 'ingen',    NULL)
ON CONFLICT (id) DO UPDATE SET
  rolle = EXCLUDED.rolle,
  kasterid = EXCLUDED.kasterid,
  kobling_status = EXCLUDED.kobling_status,
  kobling_kasterid = EXCLUDED.kobling_kasterid;

-- ── Requester: request OK, self-approval blocked ──────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000071","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil
     SET kobling_kasterid = 9972, kobling_status = 'venter'
     WHERE id = '00000000-0000-0000-0000-000000000071' $$,
  'user can send a link request (venter + kobling_kasterid)'
);

SELECT throws_ok(
  $$ UPDATE public.bruker_profil
     SET kobling_status = 'godkjent', kasterid = 9972
     WHERE id = '00000000-0000-0000-0000-000000000071' $$,
  '42501', NULL,
  'user cannot self-approve a link (godkjent + kasterid)'
);

RESET ROLE;

-- ── Linked user: kasterid frozen, unrelated columns still writable ────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000073","role":"authenticated"}', true);

SELECT throws_ok(
  $$ UPDATE public.bruker_profil
     SET kasterid = 9972
     WHERE id = '00000000-0000-0000-0000-000000000073' $$,
  '42501', NULL,
  'linked user cannot re-point kasterid to another thrower'
);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil
     SET varsle_stevne_start = true
     WHERE id = '00000000-0000-0000-0000-000000000073' $$,
  'linked user can still update unrelated columns (notification prefs)'
);

RESET ROLE;

-- ── Admin approval path still works (admin branch of bp_oppdater) ─────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000074","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil
     SET kasterid = 9972, kobling_status = 'godkjent', kobling_kasterid = NULL
     WHERE id = '00000000-0000-0000-0000-000000000071' $$,
  'admin can approve another user''s link request'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
