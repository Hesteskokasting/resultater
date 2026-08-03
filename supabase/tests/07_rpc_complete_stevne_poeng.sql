BEGIN;

SELECT plan(12);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Covers the complete_stevne branches 04 leaves untested: DNC and SNC point
-- columns (incl. SNC's CEIL rounding), placements with no valid point row → 0,
-- the gjelderfraaar/gjeldertilaar year window, non-NC stevner left untouched,
-- and klubbadmin authorization (owning club vs other club).

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'admin@poeng.test',      'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000202', 'ka-eigar@poeng.test',   'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000203', 'ka-annan@poeng.test',   'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'admin',      'ingen'),
  ('00000000-0000-0000-0000-000000000202', 'klubbadmin', 'ingen'),
  ('00000000-0000-0000-0000-000000000203', 'klubbadmin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.klubb (id, navn) VALUES
  (9950, 'Poeng Test Klubb'),
  (9951, 'Annan Klubb');

INSERT INTO public.klubbadmin_klubber (bruker_id, klubbid) VALUES
  ('00000000-0000-0000-0000-000000000202', 9950),
  ('00000000-0000-0000-0000-000000000203', 9951);

INSERT INTO public.stevnetype (id, navn) VALUES
  (9950, 'NC'),
  (9951, 'DNC'),
  (9952, 'SNC'),
  (9953, 'Trening');

-- Valid window (2020 → open-ended) for plassering 1 and 2; plassering 3 only
-- has a row in an expired window (2000–2010) so it must not apply in 2026.
-- pgTAP runs inside a rolled-back transaction, so the test can clear point
-- rows that would otherwise compete with its own: without this, whatever
-- seed data happens to be present decides what a placement is worth.
DELETE FROM public.norgescuppoeng
WHERE gjelderfraaar <= 2026 AND (gjeldertilaar IS NULL OR gjeldertilaar >= 2026);

INSERT INTO public.norgescuppoeng (id, plassering, poengnc, poengdnc, gjelderfraaar, gjeldertilaar) VALUES
  (9950, 1, 100, 75, 2020, NULL),
  (9951, 2,  85, 60, 2020, NULL),
  (9952, 3, 999, 999, 2000, 2010);

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9950, 'Poeng Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9951, 'Poeng', 'A', 9950),
  (9952, 'Poeng', 'B', 9950),
  (9953, 'Poeng', 'C', 9950);

INSERT INTO public.stevne (id, navn, dato, stevnetypeid, klubbid, erfullfort) VALUES
  (9950, 'DNC Stevne',     '2026-06-01', 9951, 9950, false),
  (9951, 'SNC Stevne',     '2026-06-02', 9952, 9950, false),
  (9952, 'NC Null Stevne', '2026-06-03', 9950, 9950, false),
  (9953, 'Treningsstevne', '2026-06-04', 9953, 9950, false);

INSERT INTO public.resultat (id, stevneid, kasterid, plassering, hcp) VALUES
  (9950, 9950, 9951,  1, 0),   -- DNC: expect poengdnc = 75
  (9951, 9951, 9951,  1, 0),   -- SNC: CEIL(100 * 0.75) = 75
  (9952, 9951, 9952,  2, 0),   -- SNC: CEIL(85 * 0.75) = CEIL(63.75) = 64
  (9953, 9952, 9951,  3, 0),   -- NC: only expired-window point row → 0
  (9954, 9952, 9952, 99, 0),   -- NC: no point row at all → 0
  (9955, 9953, 9953,  1, 0);   -- non-NC: nc_poeng must stay NULL

-- ── Case 1: klubbadmin of a DIFFERENT club cannot complete ────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000203","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.complete_stevne(9950) $$,
  'P0001', NULL,
  'klubbadmin of another club cannot complete the stevne'
);

-- ── Case 2: klubbadmin of the OWNING club completes — DNC points ─────────────

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000202","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9950) $$,
  'owning klubbadmin can complete the stevne'
);

RESET ROLE;

SELECT is(
  (SELECT erfullfort FROM public.stevne WHERE id = 9950),
  true,
  'stevne is marked completed'
);

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9950),
  75::real,
  'DNC stevne uses poengdnc column'
);

-- ── Case 3: SNC points — CEIL(poengnc * 0.75) ─────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9951) $$,
  'admin completes SNC stevne'
);

RESET ROLE;

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9951),
  75::real,
  'SNC plassering 1: CEIL(100 * 0.75) = 75'
);

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9952),
  64::real,
  'SNC plassering 2: CEIL(63.75) rounds UP to 64'
);

-- ── Case 4: placements without a valid point row score 0, not NULL ────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9952) $$,
  'admin completes NC stevne with no valid point rows'
);

RESET ROLE;

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9953),
  0::real,
  'point row outside gjelderfraaar/gjeldertilaar window does not apply — scores 0'
);

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9954),
  0::real,
  'plassering with no point row at all scores 0'
);

-- ── Case 5: non-NC stevnetype leaves nc_poeng untouched ───────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9953) $$,
  'admin completes non-NC stevne'
);

RESET ROLE;

SELECT is(
  (SELECT nc_poeng FROM public.resultat WHERE id = 9955),
  NULL::real,
  'non-NC stevne: nc_poeng stays NULL'
);

SELECT finish();
ROLLBACK;
