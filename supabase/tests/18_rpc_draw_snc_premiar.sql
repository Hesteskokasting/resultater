BEGIN;

SELECT plan(24);

-- draw_snc_premiar / clear_snc_premiar (20260813120000, revised by
-- 20260813120100): random prizes for a
-- consolidated SNC round. The percentage counts every placed participant, is
-- rounded down, and is clamped to who may be drawn — never the top three. An
-- exact number can be given instead of a percentage, but never both. A round
-- is drawn once: a second draw is refused so nobody can pull until they like the
-- outcome, and clearing is the only way back. The write reaches resultat rows on
-- stevner that are fullført, so the test also pins that the lock this opens stays
-- narrow — erpremie only.

-- ── Seed (postgres superuser — bypasses RLS) ─────────────────────────────────
-- One X-kast-only round: umbrella 9950 over locals 9951/9952, ten placed
-- throwers plus one row with no kaster, which consolidation leaves unplaced.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000009950', 'admin@premie.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000009951', 'bruker@premie.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000009950', 'admin',  'ingen'),
  ('00000000-0000-0000-0000-000000009951', 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.klubb (id, navn) VALUES (9950, 'NHF Premie'), (9951, 'Førde P'), (9952, 'Bergen P');
INSERT INTO public.stevnetype (id, navn) VALUES (9950, 'SNC');
INSERT INTO public.kategori (id, navn) VALUES (9950, 'Singel');
INSERT INTO public.kastemetode (id, navn, er_innledende, er_avsluttende, antall_omganger)
VALUES (9950, 'Minimatch X-kast', true, false, 15);

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9950, 'Premie Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid)
SELECT 9950 + n, 'Kastar', n::text, 9950, CASE WHEN n % 2 = 0 THEN 9951 ELSE 9952 END
FROM generate_series(1, 10) AS n;

INSERT INTO public.stevne (id, navn, dato, stevnetypeid, kategoriid, klubbid,
  er_snc_hovudstevne, innledendekastemetodeid)
VALUES (9950, 'SNC Premierunde', '2026-08-01', 9950, 9950, 9950, true, 9950);

INSERT INTO public.stevne (id, navn, dato, stevnetypeid, kategoriid, klubbid, snc_hovudstevne_id)
VALUES
  (9951, 'SNC Premierunde – Førde',  '2026-07-25', 9950, 9950, 9951, 9950),
  (9952, 'SNC Premierunde – Bergen', '2026-07-26', 9950, 9950, 9952, 9950);

-- Distinct X-kast points, so the merged placement is exactly 1..10 by points
-- desc: kastar 1 has the most, kastar 10 the fewest.
INSERT INTO public.resultat (id, stevneid, kasterid, klubbid, plassering, hcp,
  poeng_xkast, antall_ring_xkast)
SELECT 9950 + n,
       CASE WHEN n % 2 = 0 THEN 9951 ELSE 9952 END,
       9950 + n,
       CASE WHEN n % 2 = 0 THEN 9951 ELSE 9952 END,
       n, 0,
       210 - n * 10, 20 - n
FROM generate_series(1, 10) AS n;

-- No kasterid, so consolidation never places it — and the draw must ignore it.
INSERT INTO public.resultat (id, stevneid, klubbid, hcp) VALUES (9970, 9951, 9951, 0);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009950","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9951) $$,
  'det første lokalstevnet kan fullførast'
);
SELECT lives_ok(
  $$ SELECT public.complete_stevne(9952) $$,
  'det andre lokalstevnet kan fullførast'
);

-- ── Case 1: refusals before the round is consolidated ────────────────────────

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 10) $$,
  'P0001', NULL,
  'kan ikkje trekkje premiar før runden er konsolidert'
);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9951, 10) $$,
  'P0001', NULL,
  'eit lokalstevne er ikkje eit SNC-hovudstevne'
);

SELECT lives_ok(
  $$ SELECT public.complete_snc_hovudstevne(9950) $$,
  'admin kan konsolidere runden'
);

-- ── Case 2: input and authorization ──────────────────────────────────────────

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 0) $$,
  'P0001', NULL,
  '0 prosent blir avvist'
);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 150) $$,
  'P0001', NULL,
  'over 100 prosent blir avvist'
);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950) $$,
  'P0001', NULL,
  'korkje prosent eller tal blir avvist'
);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 10, 4) $$,
  'P0001', NULL,
  'både prosent og tal samtidig blir avvist'
);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, NULL, 0) $$,
  'P0001', NULL,
  '0 premiar blir avvist'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009951","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 10) $$,
  'P0001', NULL,
  'ein vanleg brukar kan ikkje trekkje premiar'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009950","role":"authenticated"}', true);

-- ── Case 3: the count — 10 placed, rounded down ──────────────────────────────
-- The row without a kaster is unplaced, so the base is 10: 15 % is floor(1,5) = 1.

SELECT is(
  (SELECT public.draw_snc_premiar(9950, 15)),
  1,
  '15 % av 10 plasserte blir runda ned frå 1,5 til 1'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.resultat WHERE stevneid IN (9951, 9952) AND erpremie),
  1,
  'nøyaktig den eine trekte har premie'
);

-- ── Case 4: a round is drawn once, and clearing is the way back ──────────────
-- Repeating a draw would let an admin pull until they liked the outcome.

SELECT throws_ok(
  $$ SELECT public.draw_snc_premiar(9950, 15) $$,
  'P0001', NULL,
  'ein ny trekning blir avvist når runden alt er trekt'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.resultat WHERE stevneid IN (9951, 9952) AND erpremie),
  1,
  'den avviste trekninga endra ingenting'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009951","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.clear_snc_premiar(9950) $$,
  'P0001', NULL,
  'ein vanleg brukar kan ikkje nullstille trekninga'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009950","role":"authenticated"}', true);

SELECT is(
  (SELECT public.clear_snc_premiar(9950)),
  1,
  'nullstilling fjernar premien'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.resultat WHERE stevneid IN (9951, 9952) AND erpremie),
  0,
  'ingen har premie etter nullstilling'
);

-- ── Case 5: an exact number instead of a percentage ──────────────────────────

SELECT is(
  (SELECT public.draw_snc_premiar(9950, NULL, 4)),
  4,
  'eit eksakt tal trekkjer nøyaktig så mange'
);

SELECT is(
  (SELECT public.clear_snc_premiar(9950)),
  4,
  'nullstilling fjernar dei 4 premiane'
);

-- ── Case 6: the top three are never drawn ────────────────────────────────────
-- 100 % asks for all 10, but only the 7 outside the podium may be drawn.

SELECT is(
  (SELECT public.draw_snc_premiar(9950, 100)),
  7,
  '100 % blir klamra til dei 7 som kan trekkjast'
);

-- ── Case 7: who ended up with a prize ───────────────────────────────────────

SELECT results_eq(
  $$ SELECT snc_plassering FROM public.resultat
     WHERE stevneid IN (9951, 9952) AND erpremie ORDER BY snc_plassering $$,
  $$ VALUES (4), (5), (6), (7), (8), (9), (10) $$,
  'dei tre fremste blir aldri trekte, resten av dei plasserte blir det'
);

SELECT is(
  (SELECT erpremie FROM public.resultat WHERE id = 9970),
  NULL,
  'ei rad utan kastar og utan plassering blir ikkje trekt'
);

-- ── Case 8: the lock this opens stays narrow ─────────────────────────────────
-- erpremie is the only column the exception lets through on a fullført stevne.

SELECT throws_ok(
  $$ UPDATE public.resultat SET nc_poeng = 99 WHERE id = 9951 $$,
  'P0001', NULL,
  'andre kolonnar er framleis låste når stevnet er fullført'
);

SELECT finish();
ROLLBACK;
