BEGIN;

SELECT plan(19);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Klubbadmin …271 runs klubb 9271. Stevne 9271 is theirs, 9272 belongs to
-- another club. …272 has a leftover klubbadmin_klubber row but is a brukar.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000271', 'klubbadmin@arrangor.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000272', 'degradert@arrangor.test',  'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000271', 'klubbadmin', 'ingen'),
  ('00000000-0000-0000-0000-000000000272', 'bruker',     'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle, kasterid = NULL, kobling_status = 'ingen';

INSERT INTO public.klubb (id, navn) VALUES (9271, 'Eigen Klubb'), (9272, 'Annan Klubb');

INSERT INTO public.klubbadmin_klubber (bruker_id, klubbid) VALUES
  ('00000000-0000-0000-0000-000000000271', 9271),
  ('00000000-0000-0000-0000-000000000272', 9271);

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9271, 'Arrangør Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9271, 'Eigen', 'A', 9271, 9271),
  (9272, 'Eigen', 'B', 9271, 9271),
  (9273, 'Annan', 'C', 9271, 9272);

INSERT INTO public.stevne (id, navn, dato, klubbid) VALUES
  (9271, 'Eige stevne',  '2026-01-01', 9271),
  (9272, 'Anna stevne',  '2026-01-01', 9272);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9271, 'arrangor-eigen', 9271, 'innledende', 1, false),
  (9272, 'arrangor-annan', 9272, 'innledende', 1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES (9271, 9271, 9271), (9272, 9272, 9273);

INSERT INTO public.xkast_kongelag (id, stevneid, fase, pulje, bane_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9271, 9271, 'innledende', 1, 1, false), (9272, 9272, 'innledende', 1, 1, false);

INSERT INTO public.xkast_kongelag_deltaker (id, xkast_kongelag_id, kasterid)
OVERRIDING SYSTEM VALUE
VALUES (9271, 9271, 9272), (9272, 9272, 9273);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000271","role":"authenticated"}', true);

-- ── Matches ───────────────────────────────────────────────────────────────────

SELECT lives_ok(
  $$ INSERT INTO public.kamp (match_id, stevneid, fase, runde_nummer)
     VALUES ('arrangor-ny', 9271, 'innledende', 2) $$,
  'a klubbadmin can create a match in their own club''s stevne'
);

SELECT throws_ok(
  $$ INSERT INTO public.kamp (match_id, stevneid, fase, runde_nummer)
     VALUES ('arrangor-framand', 9272, 'innledende', 2) $$,
  '42501', NULL,
  'a klubbadmin cannot create a match in another club''s stevne'
);

SELECT lives_ok(
  $$ INSERT INTO public.kamp_spelar (kampid, kasterid) VALUES (9271, 9272) $$,
  'a klubbadmin can seat a player in their own stevne''s match'
);

SELECT throws_ok(
  $$ INSERT INTO public.kamp_spelar (kampid, kasterid) VALUES (9272, 9272) $$,
  '42501', NULL,
  'a klubbadmin cannot seat a player in another club''s match'
);

SELECT lives_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, antall_ringer)
     VALUES (9271, 1, 4, 1) $$,
  'a klubbadmin can enter a round in their own stevne'
);

SELECT throws_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, antall_ringer)
     VALUES (9272, 1, 4, 1) $$,
  '42501', NULL,
  'a klubbadmin cannot enter a round in another club''s stevne'
);

SELECT is(
  public.bekreft_innledende_kamp(9271, '[]'::jsonb),
  true,
  'a klubbadmin can confirm a match in their own stevne'
);

SELECT throws_ok(
  $$ SELECT public.bekreft_innledende_kamp(9272, '[]'::jsonb) $$,
  'P0001', NULL,
  'a klubbadmin cannot confirm a match in another club''s stevne'
);

-- ── resultat ──────────────────────────────────────────────────────────────────

SELECT lives_ok(
  $$ INSERT INTO public.resultat (stevneid, kasterid, hcp) VALUES (9271, 9271, 0) $$,
  'a klubbadmin can write resultat for their own stevne'
);

SELECT throws_ok(
  $$ INSERT INTO public.resultat (stevneid, kasterid, hcp) VALUES (9272, 9273, 0) $$,
  '42501', NULL,
  'a klubbadmin cannot write resultat for another club''s stevne'
);

-- ── xkast / kongelag ──────────────────────────────────────────────────────────

SELECT lives_ok(
  $$ SELECT public.edit_xkast_kongelag_omgang(9271, 1, 12, 2) $$,
  'a klubbadmin can edit an xkast round in their own stevne'
);

SELECT throws_ok(
  $$ SELECT public.edit_xkast_kongelag_omgang(9272, 1, 12, 2) $$,
  'P0001', NULL,
  'a klubbadmin cannot edit an xkast round in another club''s stevne'
);

SELECT throws_ok(
  $$ INSERT INTO public.xkast_kongelag (stevneid, fase, pulje, bane_nummer)
     VALUES (9272, 'innledende', 1, 2) $$,
  '42501', NULL,
  'a klubbadmin cannot create a court in another club''s stevne'
);

-- ── Throwers: release, never hand over ───────────────────────────────────────

SELECT lives_ok(
  $$ UPDATE public.kaster SET klubbid = NULL WHERE id = 9272 $$,
  'a klubbadmin can remove a thrower from their club'
);

SELECT throws_ok(
  $$ UPDATE public.kaster SET klubbid = 9272 WHERE id = 9271 $$,
  '42501', NULL,
  'a klubbadmin cannot move a thrower to another club'
);

-- ── A demoted klubbadmin keeps no organizer rights ───────────────────────────

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000272","role":"authenticated"}', true);

SELECT throws_ok(
  $$ INSERT INTO public.kamp (match_id, stevneid, fase, runde_nummer)
     VALUES ('arrangor-degradert', 9271, 'innledende', 3) $$,
  '42501', NULL,
  'a brukar with a leftover klubbadmin_klubber row cannot organize'
);

RESET ROLE;

SELECT is(
  (SELECT klubbid FROM public.kaster WHERE id = 9272),
  NULL,
  'the released thrower has no club'
);

-- ── One club per klubbadmin ──────────────────────────────────────────────────

SELECT throws_ok(
  $$ INSERT INTO public.klubbadmin_klubber (bruker_id, klubbid)
     VALUES ('00000000-0000-0000-0000-000000000271', 9272) $$,
  '23505', NULL,
  'a klubbadmin cannot be given a second club'
);

SELECT is(
  (SELECT count(*)::int FROM public.kamp WHERE stevneid = 9272),
  1,
  'no match was written into the other club''s stevne'
);

SELECT * FROM finish();
ROLLBACK;
