BEGIN;

SELECT plan(16);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Covers the v6 branches of bekreft_avsluttende_kamp_deltakar that 03 leaves
-- untested: Semifinale (loser advances — no elimination writes), Bronsefinale
-- (plassering 3/4), Par sides resolved via resultat.startnummer, and the
-- NULL-startnummer fallback. Called as admin to isolate branch logic from the
-- participant-authorization check (covered in 03).

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000031', 'admin@v6.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES ('00000000-0000-0000-0000-000000000031', 'admin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9930, 'V6 Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9931, 'Semi', 'Winner', 9930),
  (9932, 'Semi', 'Loser', 9930),
  (9933, 'Bronse', 'Winner', 9930),
  (9934, 'Bronse', 'Loser', 9930),
  (9941, 'ParA', 'One', 9930),
  (9942, 'ParA', 'Two', 9930),
  (9943, 'ParB', 'One', 9930),
  (9944, 'ParB', 'Two', 9930),
  (9935, 'NoResultat', 'Player', 9930),
  (9936, 'HasResultat', 'Player', 9930);

INSERT INTO public.stevne (id, navn, dato) VALUES (9930, 'V6 Test Stevne', '2026-01-01');

-- Par players share startnummer per side; semifinale/bronsefinale players
-- have no startnummer (each is their own side). Player 9935 deliberately has
-- NO resultat row at all — that is the fallback case.
INSERT INTO public.resultat (id, stevneid, kasterid, startnummer, hcp)
VALUES
  (9931, 9930, 9931, NULL, 0),
  (9932, 9930, 9932, NULL, 0),
  (9933, 9930, 9933, NULL, 0),
  (9934, 9930, 9934, NULL, 0),
  (9941, 9930, 9941, 1, 0),
  (9942, 9930, 9942, 1, 0),
  (9943, 9930, 9943, 2, 0),
  (9944, 9930, 9944, 2, 0),
  (9936, 9930, 9936, NULL, 0);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, runde_navn, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9931, 'v6-semifinale',   9930, 'avsluttende', 4, 'Semifinale',   false),
  (9932, 'v6-bronsefinale', 9930, 'avsluttende', 5, 'Bronsefinale', false),
  (9933, 'v6-par-runde',    9930, 'avsluttende', 2, NULL,           false),
  (9934, 'v6-fallback',     9930, 'avsluttende', 3, NULL,           false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9931, 9931, 9931),
  (9932, 9931, 9932),
  (9933, 9932, 9933),
  (9934, 9932, 9934),
  (9941, 9933, 9941),
  (9942, 9933, 9942),
  (9943, 9933, 9943),
  (9944, 9933, 9944),
  (9935, 9934, 9935),
  (9936, 9934, 9936);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}', true);

-- ── Case 1: Semifinale — loser advances, no elimination writes ────────────────

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9931, 9932) $$,
  'semifinale confirmation succeeds'
);

RESET ROLE;

SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9931),
  true,
  'semifinale kamp is confirmed'
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9932),
  NULL::integer,
  'semifinale loser gets NO runde_eliminert — advances to bronsefinale'
);

SELECT is(
  (SELECT plassering FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9932),
  NULL::integer,
  'semifinale loser gets no plassering'
);

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9932),
  2,
  'semifinale loser still gets per-match rank 2'
);

-- ── Case 2: Bronsefinale — winner plassering 3, loser 4 ───────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9932, 9934) $$,
  'bronsefinale confirmation succeeds'
);

RESET ROLE;

SELECT is(
  (SELECT plassering FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9933),
  3,
  'bronsefinale winner gets plassering 3'
);

SELECT is(
  (SELECT plassering FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9934),
  4,
  'bronsefinale loser gets plassering 4'
);

-- ── Case 3: Par — eliminated side resolved via startnummer ────────────────────
-- Eliminating one member (9942) must eliminate the whole side (9941 + 9942),
-- and kamp_plassering counts SIDES (2), not kamp_spelar rows (4).

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9933, 9942) $$,
  'par confirmation succeeds'
);

RESET ROLE;

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9941),
  2,
  'pair partner (same startnummer) is eliminated too'
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9942),
  2,
  'named eliminated player gets runde_eliminert'
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9930 AND kasterid = 9943),
  NULL::integer,
  'winning side is not eliminated'
);

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9941),
  2,
  'eliminated pair gets kamp_plassering = number of SIDES (2), not rows (4)'
);

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9943),
  1,
  'winning pair gets kamp_plassering 1'
);

-- ── Case 4: eliminated player with no resultat row (NULL startnummer fallback)

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9934, 9935) $$,
  'confirmation succeeds when eliminated player has no resultat row'
);

RESET ROLE;

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9935),
  2,
  'fallback: eliminated player treated as their own side'
);

SELECT finish();
ROLLBACK;
