BEGIN;

SELECT plan(28);

-- ── Seed (postgres superuser - bypasses RLS) ─────────────────────────────────
-- One SNC round: umbrella 9970 with two local stevner (9971 Forde, 9972
-- Bergen), X-kast (Minimatch, 15 omganger) plus Kongelag.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000301', 'admin@snc.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000302', 'bruker@snc.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000301', 'admin',  'ingen'),
  ('00000000-0000-0000-0000-000000000302', 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.klubb (id, navn) VALUES (9970, 'NHF SNC'), (9971, 'Førde'), (9972, 'Bergen');
INSERT INTO public.stevnetype (id, navn) VALUES (9970, 'SNC'), (9971, 'Trening');
INSERT INTO public.kategori (id, navn) VALUES (9970, 'Singel');
INSERT INTO public.kastemetode (id, navn, er_innledende, er_avsluttende, antall_omganger) VALUES
  (9970, 'Minimatch X-kast', true,  false, 15),
  (9971, 'Kongelag',         false, true,  10),
  (9972, 'Gloppen',          true,  false, NULL);

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9970, 'SNC Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9971, 'Ada',  'Førde',  9970, 9971),
  (9972, 'Bo',   'Førde',  9970, 9971),
  (9973, 'Cato', 'Bergen', 9970, 9972),
  (9974, 'Dina', 'Bergen', 9970, 9972);

-- pgTAP runs inside a rolled-back transaction, so the test can clear point
-- rows that would otherwise compete with its own: without this, whatever
-- seed data happens to be present decides what a placement is worth.
DELETE FROM public.norgescuppoeng
WHERE gjelderfraaar <= 2026 AND (gjeldertilaar IS NULL OR gjeldertilaar >= 2026);

INSERT INTO public.norgescuppoeng (id, plassering, poengnc, poengdnc, gjelderfraaar, gjeldertilaar) VALUES
  (9970, 1, 100, 75, 2020, NULL),
  (9971, 2,  85, 60, 2020, NULL),
  (9972, 3,  70, 50, 2020, NULL);

-- ── Case 1: umbrella invariants ──────────────────────────────────────────────

SELECT throws_ok(
  $$ INSERT INTO public.stevne (id, navn, dato, stevnetypeid, er_snc_hovudstevne,
       innledendekastemetodeid, avsluttendekastemetodeid)
     VALUES (9979, 'Feil type', '2026-07-01', 9971, true, 9970, 9971) $$,
  'P0001', NULL,
  'hovudstevne må ha stevnetype SNC'
);

SELECT throws_ok(
  $$ INSERT INTO public.stevne (id, navn, dato, stevnetypeid, er_snc_hovudstevne,
       innledendekastemetodeid)
     VALUES (9979, 'Gloppen-SNC', '2026-07-01', 9970, true, 9972) $$,
  'P0001', NULL,
  'SNC kan ikkje bruke Gloppen som innleiande kastemetode'
);

SELECT throws_ok(
  $$ INSERT INTO public.stevne (id, navn, dato, stevnetypeid, er_snc_hovudstevne)
     VALUES (9979, 'Utan metode', '2026-07-01', 9970, true) $$,
  'P0001', NULL,
  'SNC må ha X-kast, Kongelag eller begge'
);

SELECT lives_ok(
  $$ INSERT INTO public.stevne (id, navn, dato, klubbid, stevnetypeid, kategoriid,
       er_snc_hovudstevne, innledendekastemetodeid, avsluttendekastemetodeid)
     VALUES (9970, 'SNC runde 1', '2026-07-01', 9970, 9970, 9970, true, 9970, 9971) $$,
  'X-kast + Kongelag er lovleg for eit SNC-hovudstevne'
);

-- ── Case 2: a local stevne inherits the format ───────────────────────────────

INSERT INTO public.stevne (id, navn, sted, dato, klubbid, stevnetypeid, kategoriid,
  snc_hovudstevne_id, innledendekastemetodeid, avsluttendekastemetodeid)
VALUES
  (9971, 'SNC runde 1 – Førde',  'Førde',  '2026-07-01', 9971, 9971, NULL, 9970, 9972, NULL),
  (9972, 'SNC runde 1 – Bergen', 'Bergen', '2026-07-01', 9972, 9971, NULL, 9970, NULL, NULL);

SELECT results_eq(
  $$ SELECT stevnetypeid, kategoriid, innledendekastemetodeid, avsluttendekastemetodeid
     FROM public.stevne WHERE id = 9971 $$,
  $$ VALUES (9970, 9970, 9970, 9971) $$,
  'lokalstevne får stevnetype, kategori og kastemetodar frå hovudstevnet'
);

SELECT throws_ok(
  $$ UPDATE public.stevne SET snc_hovudstevne_id = 9971 WHERE id = 9972 $$,
  'P0001', NULL,
  'eit lokalstevne kan ikkje peike på eit anna lokalstevne'
);

-- The ranking flag is per round: set on the umbrella, it follows the locals.
UPDATE public.stevne SET ernorgesranking = true WHERE id = 9970;

SELECT is(
  (SELECT COUNT(*)::int FROM public.stevne WHERE snc_hovudstevne_id = 9970 AND ernorgesranking),
  2,
  'ernorgesranking frå hovudstevnet blir propagert til lokalstevna'
);

SELECT throws_ok(
  $$ UPDATE public.stevne SET er_snc_hovudstevne = true WHERE id = 9971 $$,
  '23514', NULL,
  'eit lokalstevne kan ikkje samtidig vere hovudstevne'
);

-- ── Case 3: pamelding - one local stevne per thrower ─────────────────────────

INSERT INTO public.pamelding (stevneid, kasterid, registrert_av)
VALUES (9971, 9971, '00000000-0000-0000-0000-000000000302');

SELECT throws_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, registrert_av)
     VALUES (9972, 9971, '00000000-0000-0000-0000-000000000302') $$,
  'P0001', NULL,
  'same utøvar kan ikkje melde seg på to lokalstevne i same runde'
);

SELECT lives_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, registrert_av)
     VALUES (9972, 9973, '00000000-0000-0000-0000-000000000302') $$,
  'ein annan utøvar kan melde seg på det andre lokalstevnet'
);

SELECT throws_ok(
  $$ INSERT INTO public.pamelding (stevneid, kasterid, registrert_av)
     VALUES (9970, 9974, '00000000-0000-0000-0000-000000000302') $$,
  'P0001', NULL,
  'ingen kan melde seg på sjølve hovudstevnet'
);

-- Results from both venues. Kongelag points plus carried-over X-kast
-- (15 x 20 -> a third):
--   Ada  : kongelag 60, xkast 120 -> 60 + 40 = 100
--   Cato : kongelag 55, xkast 150 -> 55 + 50 = 105  <- overall winner
--   Dina : kongelag 55, xkast 120 -> 55 + 40 =  95
--   Bo   : kongelag 40, xkast  90 -> 40 + 30 =  70

INSERT INTO public.resultat (id, stevneid, kasterid, klubbid, plassering, hcp,
  poeng_xkast, antall_ring_xkast, poeng_kongelag, antall_ring_kongelag)
VALUES
  (9971, 9971, 9971, 9971, 1, 0, 120, 12, 60, 6),
  (9972, 9971, 9972, 9971, 2, 0,  90,  9, 40, 4),
  (9973, 9972, 9973, 9972, 1, 0, 150, 15, 55, 5),
  (9974, 9972, 9974, 9972, 2, 0, 120, 11, 55, 5);

-- ── Case 4: the umbrella is not an ordinary stevne ───────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000301","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.complete_stevne(9970) $$,
  'P0001', NULL,
  'complete_stevne avviser eit SNC-hovudstevne'
);

SELECT throws_ok(
  $$ SELECT public.complete_snc_hovudstevne(9971) $$,
  'P0001', NULL,
  'complete_snc_hovudstevne avviser eit lokalstevne'
);

SELECT throws_ok(
  $$ SELECT public.complete_snc_hovudstevne(9970) $$,
  'P0001', NULL,
  'kan ikkje konsolidere før alle lokalstevna er fullførte'
);

-- ── Case 5: a local stevne completes without NC points ───────────────────────

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9971) $$,
  'lokalstevne kan fullførast'
);

SELECT is(
  (SELECT COUNT(*)::int FROM public.resultat WHERE stevneid = 9971 AND nc_poeng IS NOT NULL),
  0,
  'lokalstevne får ikkje NC-poeng frå den lokale plasseringa'
);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9972) $$,
  'det andre lokalstevnet kan fullførast'
);

-- ── Case 6: consolidation ────────────────────────────────────────────────────

SELECT lives_ok(
  $$ SELECT public.complete_snc_hovudstevne(9970) $$,
  'admin kan konsolidere SNC-runden når alle lokalstevna er fullførte'
);

RESET ROLE;

SELECT results_eq(
  $$ SELECT kasterid, snc_plassering FROM public.resultat
     WHERE stevneid IN (9971, 9972) ORDER BY snc_plassering, kasterid $$,
  $$ VALUES (9973, 1), (9971, 2), (9974, 3), (9972, 4) $$,
  'samla plassering blir rangert på tvers av lokalstevna (Kongelag + X-kast-overføring)'
);

SELECT results_eq(
  $$ SELECT kasterid, nc_poeng::int FROM public.resultat
     WHERE stevneid IN (9971, 9972) ORDER BY kasterid $$,
  $$ VALUES (9971, 64), (9972, 0), (9973, 75), (9974, 53) $$,
  'NC-poeng = CEIL(poengnc * 0.75) frå samla plassering, 0 utanfor tabellen'
);

SELECT is(
  (SELECT erfullfort FROM public.stevne WHERE id = 9970),
  true,
  'hovudstevnet er markert fullført etter konsolidering'
);

-- Local placement is untouched, so local prizes still stand.
SELECT results_eq(
  $$ SELECT kasterid, plassering FROM public.resultat
     WHERE stevneid IN (9971, 9972) ORDER BY kasterid $$,
  $$ VALUES (9971, 1), (9972, 2), (9973, 1), (9974, 2) $$,
  'lokal plassering er uendra etter konsolidering'
);

SELECT throws_ok(
  $$ INSERT INTO public.stevne (id, navn, dato, klubbid, snc_hovudstevne_id)
     VALUES (9978, 'For seint', '2026-07-01', 9971, 9970) $$,
  'P0001', NULL,
  'nye lokalstevne kan ikkje leggjast til ein konsolidert SNC-runde'
);

SELECT throws_ok(
  $$ UPDATE public.stevne SET snc_hovudstevne_id = NULL WHERE id = 9971 $$,
  'P0001', NULL,
  'eit lokalstevne kan ikkje løysast frå ein konsolidert SNC-runde'
);

-- ── Case 7: the lock still holds after consolidation ─────────────────────────

SELECT throws_ok(
  $$ UPDATE public.resultat SET poeng_kongelag = 99 WHERE id = 9971 $$,
  'P0001', NULL,
  'vanlege resultatendringar er framleis blokkerte på eit fullført lokalstevne'
);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000301","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.reopen_stevne(9971) $$,
  'P0001', NULL,
  'lokalstevnet kan ikkje gjenopnast mens SNC-runden er konsolidert'
);

-- ── Case 8: reopening clears the merged list ─────────────────────────────────

SELECT lives_ok(
  $$ SELECT public.reopen_snc_hovudstevne(9970) $$,
  'admin kan gjenopne SNC-runden'
);

RESET ROLE;

SELECT is(
  (SELECT COUNT(*)::int FROM public.resultat
   WHERE stevneid IN (9971, 9972) AND (snc_plassering IS NOT NULL OR nc_poeng IS NOT NULL)),
  0,
  'gjenopning nullstiller samla plassering og NC-poeng'
);

SELECT finish();
ROLLBACK;
