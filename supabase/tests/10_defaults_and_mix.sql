BEGIN;

SELECT plan(10);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Two smaller integrity areas:
-- 1. registrert_av audit defaults: kamp_omgang (20260711130000) and pamelding
--    (20260711140000) both default to auth.uid() — inserts that omit the
--    column must stamp the calling account.
-- 2. validate_mix_pamelding: in a Mix-category stevne, posisjon 1 must be a
--    woman and posisjon 2 a man; non-Mix stevner and non-pair rows are exempt.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000081', 'defaults@mix.test', 'authenticated', 'authenticated', '', now(), now());

-- Trigger reads UPPER(LEFT(kjonn.navn, 1)): 'Kvinner' → K, 'Menn' → M.
INSERT INTO public.kjonn (id, navn, kortform) VALUES
  (9981, 'Kvinner', 'K'),
  (9982, 'Menn', 'M');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9981, 'Kvinne', 'A', 9981),
  (9982, 'Mann',   'B', 9982),
  (9983, 'Mann',   'C', 9982),
  (9984, 'Kvinne', 'D', 9981);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES ('00000000-0000-0000-0000-000000000081', 9981, 'bruker', 'godkjent')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, kobling_status = EXCLUDED.kobling_status;

INSERT INTO public.kategori (id, navn) VALUES
  (9981, 'Mix'),
  (9982, 'Par');

INSERT INTO public.stevne (id, navn, dato, kategoriid) VALUES
  (9981, 'Mix Stevne',   '2026-01-01', 9981),
  (9982, 'Vanleg Stevne', '2026-01-02', 9982);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9981, 'defaults-test', 9982, 'innledende', 1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES (9981, 9981, 9981);

-- ── registrert_av defaults stamp the calling account ──────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000081","role":"authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, antall_ringer)
     VALUES (9981, 1, 4, 1) $$,
  'participant inserts kamp_omgang without registrert_av'
);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid) VALUES (9982, 9981) $$,
  'linked user registers without registrert_av'
);

RESET ROLE;

SELECT is(
  (SELECT registrert_av FROM public.kamp_omgang WHERE kamp_spelar_id = 9981 AND omgang = 1),
  '00000000-0000-0000-0000-000000000081'::uuid,
  'kamp_omgang.registrert_av defaults to the calling auth.uid()'
);

SELECT is(
  (SELECT registrert_av FROM public.pamelding WHERE stevneid = 9982 AND kasterid = 9981),
  '00000000-0000-0000-0000-000000000081'::uuid,
  'pamelding.registrert_av defaults to the calling auth.uid()'
);

-- ── Mix gender rule (run as superuser — the trigger fires regardless) ─────────

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, lag_id, posisjon)
     VALUES (9981, 9981, 1, 1) $$,
  'Mix: woman on posisjon 1 is allowed'
);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, lag_id, posisjon)
     VALUES (9981, 9982, 1, 2) $$,
  'Mix: man on posisjon 2 is allowed'
);

SELECT throws_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, lag_id, posisjon)
     VALUES (9981, 9983, 2, 1) $$,
  'P0001', NULL,
  'Mix: man on posisjon 1 is rejected'
);

SELECT throws_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, lag_id, posisjon)
     VALUES (9981, 9984, 2, 2) $$,
  'P0001', NULL,
  'Mix: woman on posisjon 2 is rejected'
);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, lag_id, posisjon)
     VALUES (9982, 9983, 1, 1) $$,
  'non-Mix stevne: same-gender pair positions are not gender-checked'
);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid)
     VALUES (9981, 9983) $$,
  'Mix: row without lag_id/posisjon is exempt from the gender rule'
);

SELECT finish();
ROLLBACK;
