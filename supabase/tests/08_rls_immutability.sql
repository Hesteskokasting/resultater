BEGIN;

SELECT plan(8);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Pins down the WITH CHECK hardening that 01/02 don't touch: participants can
-- edit their own scores but cannot re-point kamp_spelar rows at another kamp
-- or kaster (kamp_spelar_original identity check), cannot update kamp without
-- confirming it (WITH CHECK forces er_bekreftet = true), and cannot write
-- resultat at all — placements flow only through SECURITY DEFINER RPCs.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000061', 'participant@imm.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000063', 'outsider@imm.test',    'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9960, 'Imm Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9961, 'Part', 'Icipant', 9960),
  (9962, 'Opp', 'Onent', 9960),
  (9963, 'Out', 'Sider', 9960);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000061', 9961, 'bruker', 'godkjent'),
  ('00000000-0000-0000-0000-000000000063', 9963, 'bruker', 'godkjent')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, kobling_status = EXCLUDED.kobling_status;

INSERT INTO public.stevne (id, navn, dato) VALUES (9960, 'Imm Test Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9961, 'imm-test',        9960, 'innledende', 1, false),
  (9962, 'imm-test-target', 9960, 'innledende', 1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9961, 9961, 9961),
  (9962, 9961, 9962);

INSERT INTO public.kamp_omgang (id, kamp_spelar_id, omgang, score, antall_ringer)
OVERRIDING SYSTEM VALUE
VALUES (9961, 9961, 1, 4, 1);

INSERT INTO public.resultat (id, stevneid, kasterid, plassering, hcp)
VALUES (9961, 9960, 9961, 1, 0);

-- ── Participant: score edits OK, identity columns locked ─────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000061","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.kamp_spelar SET score_poeng = 21 WHERE id = 9961 $$,
  'participant can update own score (baseline)'
);

SELECT throws_ok(
  $$ UPDATE public.kamp_spelar SET kasterid = 9963 WHERE id = 9961 $$,
  '42501', NULL,
  'participant cannot re-point kamp_spelar at another kaster'
);

SELECT throws_ok(
  $$ UPDATE public.kamp_spelar SET kampid = 9962 WHERE id = 9961 $$,
  '42501', NULL,
  'participant cannot move kamp_spelar to another kamp'
);

-- kamp UPDATE WITH CHECK is (admin OR er_bekreftet = true): a participant
-- update that leaves the kamp unconfirmed must be rejected, not applied.
SELECT throws_ok(
  $$ UPDATE public.kamp SET bane_nummer = 2 WHERE id = 9961 $$,
  '42501', NULL,
  'participant cannot update kamp fields without confirming it'
);

-- ── Participant: resultat is completely closed for direct writes ─────────────

-- UPDATE/DELETE: admin-only USING hides every row — silent no-op, so assert
-- on the data, not the statement.
UPDATE public.resultat SET plassering = 99 WHERE id = 9961;

SELECT throws_ok(
  $$ INSERT INTO public.resultat (stevneid, kasterid, hcp) VALUES (9960, 9963, 0) $$,
  '42501', NULL,
  'participant cannot insert resultat rows'
);

DELETE FROM public.resultat WHERE id = 9961;

RESET ROLE;

SELECT is(
  (SELECT plassering FROM public.resultat WHERE id = 9961),
  1,
  'participant UPDATE of resultat is a silent no-op — plassering unchanged'
);

SELECT is(
  (SELECT count(*) FROM public.resultat WHERE id = 9961),
  1::bigint,
  'participant DELETE of resultat is a silent no-op — row still exists'
);

-- ── Non-participant: kamp_omgang update is a silent no-op ─────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000063","role":"authenticated"}', true);

UPDATE public.kamp_omgang SET score = 6 WHERE id = 9961;

RESET ROLE;

SELECT is(
  (SELECT score FROM public.kamp_omgang WHERE id = 9961),
  4,
  'non-participant UPDATE of kamp_omgang is a silent no-op — score unchanged'
);

SELECT finish();
ROLLBACK;
