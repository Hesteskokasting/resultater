BEGIN;

SELECT plan(8);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- trg_kamp_spelar_notify_created fans out per kasterid to every APPROVED,
-- opted-in bruker_profil. Key scenario: two accounts linked to the same
-- kasterid (the multi-account model from 20260711140000) must BOTH get a
-- queue row; opted-out and pending-link profiles must get none; re-inserting
-- the same batch must dedupe via ON CONFLICT, not duplicate.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'linked-a@notify.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000072', 'linked-b@notify.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000073', 'opted-out@notify.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000074', 'pending@notify.test',   'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9970, 'Notify Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9971, 'Dual', 'Account', 9970),
  (9972, 'Opted', 'Out', 9970),
  (9973, 'Pending', 'Link', 9970);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status, varsle_kamp_opprettet)
VALUES
  ('00000000-0000-0000-0000-000000000071', 9971, 'bruker', 'godkjent', true),
  ('00000000-0000-0000-0000-000000000072', 9971, 'bruker', 'godkjent', true),
  ('00000000-0000-0000-0000-000000000073', 9972, 'bruker', 'godkjent', false),
  ('00000000-0000-0000-0000-000000000074', 9973, 'bruker', 'venter',   true)
ON CONFLICT (id) DO UPDATE
  SET kasterid = EXCLUDED.kasterid,
      kobling_status = EXCLUDED.kobling_status,
      varsle_kamp_opprettet = EXCLUDED.varsle_kamp_opprettet;

INSERT INTO public.stevne (id, navn, dato) VALUES (9970, 'Notify Test Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9971, 'notify-test', 9970, 'innledende', 1, false);

-- One batch insert — the statement-level trigger fires once for all rows.
INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9971, 9971, 9971),
  (9972, 9971, 9972),
  (9973, 9971, 9973);

-- ── Fanout assertions ─────────────────────────────────────────────────────────

SELECT is(
  (SELECT count(*) FROM public.notification_queue
   WHERE notification_type = 'kamp_opprettet' AND entity_id = 9971
     AND user_id IN ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000072')),
  2::bigint,
  'BOTH accounts linked to the same kasterid get a notification'
);

SELECT is(
  (SELECT count(*) FROM public.notification_queue
   WHERE user_id = '00000000-0000-0000-0000-000000000073'),
  0::bigint,
  'opted-out profile (varsle_kamp_opprettet = false) gets no notification'
);

SELECT is(
  (SELECT count(*) FROM public.notification_queue
   WHERE user_id = '00000000-0000-0000-0000-000000000074'),
  0::bigint,
  'pending link (kobling_status = venter) gets no notification'
);

-- ── Dedup: re-firing the trigger for the same kamp must not duplicate ─────────

DELETE FROM public.kamp_spelar WHERE kampid = 9971;

SELECT lives_ok(
  $$ INSERT INTO public.kamp_spelar (id, kampid, kasterid)
     OVERRIDING SYSTEM VALUE
     VALUES (9974, 9971, 9971), (9975, 9971, 9972) $$,
  're-inserting kamp_spelar for the same kamp succeeds (ON CONFLICT DO NOTHING)'
);

SELECT is(
  (SELECT count(*) FROM public.notification_queue
   WHERE notification_type = 'kamp_opprettet' AND entity_id = 9971),
  2::bigint,
  'queue still holds exactly one row per (user, kamp) after re-fire'
);

-- ── Collapse: several kamps for the same user in one statement ────────────────
-- Cascade generation inserts kamp_spelar rows for every round in one
-- statement; the trigger must queue ONE row per user with a plural body and
-- a /minside deep link, not one row per kamp.

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9972, 'notify-test-r2', 9970, 'innledende', 2, false),
  (9973, 'notify-test-r3', 9970, 'innledende', 3, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES (9976, 9972, 9971), (9977, 9973, 9971);

SELECT is(
  (SELECT count(*) FROM public.notification_queue
   WHERE user_id = '00000000-0000-0000-0000-000000000071' AND entity_id IN (9972, 9973)),
  1::bigint,
  'multi-kamp batch collapses to one queue row per user'
);

SELECT is(
  (SELECT body FROM public.notification_queue
   WHERE user_id = '00000000-0000-0000-0000-000000000071' AND entity_id = 9972),
  'Du har fått 2 nye kampar i Notify Test Stevne',
  'multi-kamp body counts the kamps'
);

SELECT is(
  (SELECT deep_link FROM public.notification_queue
   WHERE user_id = '00000000-0000-0000-0000-000000000071' AND entity_id = 9972),
  '/minside',
  'multi-kamp notification deep-links to minside'
);

SELECT finish();
ROLLBACK;
