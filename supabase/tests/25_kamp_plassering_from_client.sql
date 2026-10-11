BEGIN;

SELECT plan(7);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- The client writes kamp_plassering with the scores; the confirm RPCs must keep
-- it. bekreft_avsluttende_kamp_deltakar only fills placements still NULL.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000251', 'admin@plassering.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES ('00000000-0000-0000-0000-000000000251', 'admin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle;

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9250, 'Plassering Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9251, 'Innl', 'One', 9250),
  (9252, 'Innl', 'Two', 9250),
  (9253, 'Tre', 'One', 9250),
  (9254, 'Tre', 'Two', 9250),
  (9255, 'Tre', 'Three', 9250),
  (9256, 'Old', 'Winner', 9250),
  (9257, 'Old', 'Loser', 9250);

INSERT INTO public.stevne (id, navn, dato) VALUES (9250, 'Plassering Test Stevne', '2026-01-01');

INSERT INTO public.resultat (id, stevneid, kasterid, startnummer, hcp)
VALUES
  (9251, 9250, 9251, 1, 0),
  (9252, 9250, 9252, 2, 0),
  (9253, 9250, 9253, 3, 0),
  (9254, 9250, 9254, 4, 0),
  (9255, 9250, 9255, 5, 0),
  (9256, 9250, 9256, 6, 0),
  (9257, 9250, 9257, 7, 0);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, runde_navn, er_bekreftet, er_tre_spelarar)
OVERRIDING SYSTEM VALUE
VALUES
  (9251, 'plass-innl',   9250, 'innledende',  1, NULL, false, false),
  (9252, 'plass-tre',    9250, 'avsluttende', 1, NULL, false, true),
  (9253, 'plass-gammal', 9250, 'avsluttende', 1, NULL, false, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid, kamp_plassering)
OVERRIDING SYSTEM VALUE
VALUES
  (9251, 9251, 9251, NULL),
  (9252, 9251, 9252, NULL),
  -- Written by the client before the RPC: the two best finished together
  (9253, 9252, 9253, 1),
  (9254, 9252, 9254, 1),
  (9255, 9252, 9255, 3),
  (9256, 9253, 9256, NULL),
  (9257, 9253, 9257, NULL);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000251","role":"authenticated"}', true);

-- ── Innledende: a tie is stored as 1-1 ────────────────────────────────────────

SELECT is(
  public.bekreft_innledende_kamp(9251, '[
    {"kamp_spelar_id": 9251, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0, "kamp_plassering": 1},
    {"kamp_spelar_id": 9252, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0, "kamp_plassering": 1}
  ]'::jsonb),
  true,
  'innledende confirm succeeds'
);

SELECT results_eq(
  $$ SELECT kamp_plassering FROM public.kamp_spelar WHERE kampid = 9251 ORDER BY id $$,
  $$ VALUES (1), (1) $$,
  'innledende writes kamp_plassering from p_scores'
);

-- ── Cup 3-player: the client placements survive the RPC ───────────────────────

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9252, 9255) $$,
  '3-player confirm succeeds'
);

SELECT results_eq(
  $$ SELECT kamp_plassering FROM public.kamp_spelar WHERE kampid = 9252 ORDER BY id $$,
  $$ VALUES (1), (1), (3) $$,
  'client placements are kept'
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9250 AND kasterid = 9255),
  1,
  'the third side is still eliminated'
);

-- ── Cup from an older client: placements still filled ─────────────────────────

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9253, 9257) $$,
  'older-client confirm succeeds'
);

SELECT results_eq(
  $$ SELECT kamp_plassering FROM public.kamp_spelar WHERE kampid = 9253 ORDER BY id $$,
  $$ VALUES (1), (2) $$,
  'NULL placements get the 1/N fallback'
);

SELECT * FROM finish();
ROLLBACK;
