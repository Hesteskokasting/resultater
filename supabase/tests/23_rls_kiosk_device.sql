BEGIN;

SELECT plan(4);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000009301', 'kiosk-club@kiosk.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000009302', 'kiosk-user@kiosk.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000009303', 'kiosk-admin@kiosk.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000009301', 'klubbadmin', 'ingen'),
  ('00000000-0000-0000-0000-000000009302', 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000009303', 'admin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.kiosk_device (name, key_hash, user_id)
VALUES ('Court A', 'hash-court-a', '00000000-0000-0000-0000-000000009301');

-- ── Case 1: an ordinary logged-in user sees nothing ───────────────────────────
-- The whole point of the table: a device key hash must never reach a client.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009302","role":"authenticated"}', true);

SELECT is(
  (SELECT count(*) FROM public.kiosk_device),
  0::bigint,
  'an ordinary user cannot read kiosk devices'
);

-- ── Case 2: the club account the device logs in as sees nothing either ────────
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009301","role":"authenticated"}', true);

SELECT is(
  (SELECT count(*) FROM public.kiosk_device),
  0::bigint,
  'the club account cannot read its own device rows'
);

-- ── Case 3: anon sees nothing ─────────────────────────────────────────────────
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);

SELECT is(
  (SELECT count(*) FROM public.kiosk_device),
  0::bigint,
  'anon cannot read kiosk devices'
);

-- ── Case 4: admin administers the allow-list ──────────────────────────────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009303","role":"authenticated"}', true);

SELECT is(
  (SELECT count(*) FROM public.kiosk_device),
  1::bigint,
  'admin can read kiosk devices'
);

SELECT * FROM finish();
ROLLBACK;
