BEGIN;

SELECT plan(5);

-- ── Seed ─────────────────────────────────────────────────────────────────────
-- One SNC round, one local stevne, two throwers that tie on every criterion
-- the sums can express: total 170, kongelag 116 poeng / 7 ringar. They part
-- only on the omganger — Ada threw a 16, Bo's best is 15 — and on innledende,
-- where Bo is one point ahead. Before the omgang tiebreak, Bo won on that
-- point; now Ada's 16 decides it.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000401', 'admin@omgang.test', 'authenticated',
        'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES ('00000000-0000-0000-0000-000000000401', 'admin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.klubb (id, navn) VALUES (9980, 'NHF SNC'), (9981, 'Førde');
INSERT INTO public.stevnetype (id, navn) VALUES (9980, 'SNC');
INSERT INTO public.kategori (id, navn) VALUES (9980, 'Singel');
INSERT INTO public.kastemetode (id, navn, er_innledende, er_avsluttende, antall_omganger) VALUES
  (9980, 'Minimatch X-kast', true,  false, 15),
  (9981, 'Kongelag',         false, true,  10);

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9980, 'Omgang Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9981, 'Ada', 'Førde', 9980, 9981),
  (9982, 'Bo',  'Førde', 9980, 9981);

DELETE FROM public.norgescuppoeng
WHERE gjelderfraaar <= 2026 AND (gjeldertilaar IS NULL OR gjeldertilaar >= 2026);
INSERT INTO public.norgescuppoeng (id, plassering, poengnc, poengdnc, gjelderfraaar, gjeldertilaar)
VALUES (9980, 1, 100, 75, 2020, NULL), (9981, 2, 85, 60, 2020, NULL);

INSERT INTO public.stevne (id, navn, dato, klubbid, stevnetypeid, kategoriid,
  er_snc_hovudstevne, innledendekastemetodeid, avsluttendekastemetodeid)
VALUES (9980, 'SNC runde 5', '2026-08-26', 9980, 9980, 9980, true, 9980, 9981);

INSERT INTO public.stevne (id, navn, sted, dato, klubbid, stevnetypeid,
  snc_hovudstevne_id)
VALUES (9981, 'SNC 5 – Førde', 'Førde', '2026-08-26', 9981, 9980, 9980);

-- ROUND(162/3) = ROUND(163/3) = 54, so both totals land on 116 + 54 = 170.
INSERT INTO public.resultat (id, stevneid, kasterid, klubbid, plassering, hcp,
  poeng_xkast, antall_ring_xkast, poeng_kongelag, antall_ring_kongelag)
VALUES
  (9981, 9981, 9981, 9981, 1, 0, 162,  6, 116, 7),
  (9982, 9981, 9982, 9981, 2, 0, 163, 12, 116, 7);

-- Kongelag courts, one per thrower, confirmed so the stevne can complete.
INSERT INTO public.xkast_kongelag (id, stevneid, fase, pulje, bane_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9981, 9981, 'avsluttende', 1, 1, true),
       (9982, 9981, 'avsluttende', 1, 2, true);

INSERT INTO public.xkast_kongelag_deltaker (id, xkast_kongelag_id, kasterid, poeng, antall_ringer)
OVERRIDING SYSTEM VALUE
VALUES (9981, 9981, 9981, 116, 7),
       (9982, 9982, 9982, 116, 7);

-- Both sum to 116 poeng / 7 ringar over 10 omganger. Ringar per omgang stay
-- inside the poeng/ringar check (poeng between 5r and 5r + 3(4-r)).
INSERT INTO public.xkast_kongelag_omgang (xkast_kongelag_deltaker_id, omgang, poeng, antall_ringer)
VALUES
  (9981,  1, 16, 3), (9981,  2, 12, 2), (9981,  3, 12, 2), (9981,  4, 12, 0),
  (9981,  5, 12, 0), (9981,  6, 12, 0), (9981,  7, 12, 0), (9981,  8, 12, 0),
  (9981,  9, 12, 0), (9981, 10,  4, 0),
  (9982,  1, 15, 3), (9982,  2, 15, 2), (9982,  3, 12, 2), (9982,  4, 12, 0),
  (9982,  5, 12, 0), (9982,  6, 12, 0), (9982,  7, 12, 0), (9982,  8, 12, 0),
  (9982,  9, 10, 0), (9982, 10,  4, 0);

SELECT is(
  (SELECT SUM(poeng)::int FROM public.xkast_kongelag_omgang
   WHERE xkast_kongelag_deltaker_id = 9981),
  116,
  'Ada sine omganger summerer til poeng_kongelag'
);

SELECT is(
  (SELECT SUM(poeng)::int FROM public.xkast_kongelag_omgang
   WHERE xkast_kongelag_deltaker_id = 9982),
  116,
  'Bo sine omganger summerer til poeng_kongelag'
);

-- ── Consolidate ──────────────────────────────────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000401","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.complete_stevne(9981) $$,
  'lokalstevnet kan fullførast'
);

SELECT lives_ok(
  $$ SELECT public.complete_snc_hovudstevne(9980) $$,
  'runden kan konsoliderast'
);

RESET ROLE;

SELECT results_eq(
  $$ SELECT kasterid, snc_plassering FROM public.resultat
     WHERE stevneid = 9981 ORDER BY snc_plassering $$,
  $$ VALUES (9981, 1), (9982, 2) $$,
  'beste enkeltomgang avgjer før innleiande poeng når total, poeng og ringar er like'
);

SELECT * FROM finish();
ROLLBACK;
