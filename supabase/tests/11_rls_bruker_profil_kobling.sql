BEGIN;

SELECT plan(11);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Pins down the bp_oppdater hardening (self-updates cannot approve their own
-- kaster link or move kasterid) and the godkjenn_kobling_med_telefon RPC
-- (auto-approval requires a confirmed phone on auth.users and a pending
-- request). handle_new_user auto-creates bruker_profil rows, hence ON CONFLICT.

INSERT INTO auth.users (id, email, phone, phone_confirmed_at, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'requester@kobling.test',  NULL,         NULL,  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000072', 'verified@kobling.test',   '4790000101', now(), 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000073', 'linked@kobling.test',     '4790000102', now(), 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000074', 'admin@kobling.test',      NULL,         NULL,  'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9970, 'Kobling Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9971, 'Linked',    'Thrower', 9970),
  (9972, 'Requested', 'Thrower', 9970),
  (9973, 'Pending',   'Thrower', 9970);

INSERT INTO public.bruker_profil (id, rolle, kasterid, kobling_status, kobling_kasterid)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'bruker', NULL, 'ingen',    NULL),
  ('00000000-0000-0000-0000-000000000072', 'bruker', NULL, 'venter',   9973),
  ('00000000-0000-0000-0000-000000000073', 'bruker', 9971, 'godkjent', NULL),
  ('00000000-0000-0000-0000-000000000074', 'admin',  NULL, 'ingen',    NULL)
ON CONFLICT (id) DO UPDATE SET
  rolle = EXCLUDED.rolle,
  kasterid = EXCLUDED.kasterid,
  kobling_status = EXCLUDED.kobling_status,
  kobling_kasterid = EXCLUDED.kobling_kasterid;

-- ── Requester (no verified phone): request OK, self-approval blocked ──────────

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

SELECT throws_ok(
  $$ SELECT public.godkjenn_kobling_med_telefon() $$,
  'P0001', 'Phone not verified',
  'RPC rejects caller without a confirmed phone'
);

RESET ROLE;

-- ── Linked user (verified phone, no pending request) ──────────────────────────

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

SELECT throws_ok(
  $$ SELECT public.godkjenn_kobling_med_telefon() $$,
  'P0001', 'No pending link request',
  'RPC rejects verified caller without a pending request'
);

RESET ROLE;

-- ── Verified user with pending request: RPC approves ──────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000072","role":"authenticated"}', true);

SELECT is(
  (SELECT public.godkjenn_kobling_med_telefon()),
  9973,
  'RPC approves pending link for verified caller and returns kasterid'
);

RESET ROLE;

SELECT is(
  (SELECT kasterid FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000072'),
  9973,
  'RPC set kasterid to the requested thrower'
);

SELECT is(
  (SELECT kobling_status FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000072'),
  'godkjent',
  'RPC set kobling_status to godkjent'
);

SELECT is(
  (SELECT kobling_kasterid FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000072'),
  NULL::integer,
  'RPC cleared kobling_kasterid'
);

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
