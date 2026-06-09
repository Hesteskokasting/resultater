BEGIN;

SELECT plan(9);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'player-a@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'player-b@rls.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'player-c@rls.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9901, 'RLS Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9901, 'Player', 'A', 9901),
  (9902, 'Player', 'B', 9901),
  (9903, 'Player', 'C', 9901);

-- handle_new_user trigger creates bruker_profil rows on auth.users INSERT;
-- ON CONFLICT handles the case where the trigger fires before we get here.
INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 9901, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000002', 9902, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000003', 9903, 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid;

INSERT INTO public.stevne (id, navn) VALUES (9901, 'RLS Test Stevne');

-- kamp 9901: regular avsluttende round (runde_navn NULL → runde_eliminert branch)
-- kamp 9902: Finale (runde_navn = 'Finale' → plassering branch)
INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9901, 'rpc-avsluttende-test', 9901, 'avsluttende', 2, false);

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, runde_navn, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9902, 'rpc-finale-test', 9901, 'avsluttende', 5, 'Finale', false);

-- Players A and B in both matches; C is in neither.
INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9901, 9901, 9901),
  (9902, 9901, 9902),
  (9903, 9902, 9901),
  (9904, 9902, 9902);

-- resultat rows — the RPC updates these.  Regular nextval sequence: no OVERRIDING needed.
INSERT INTO public.resultat (id, stevneid, kasterid)
VALUES
  (9901, 9901, 9901),
  (9902, 9901, 9902);

-- ── Case 3: non-participant call raises exception ─────────────────────────────
-- Must run as authenticated (not postgres) so auth.uid() is populated and the
-- participant check inside the SECURITY DEFINER function works correctly.

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9901, NULL) $$,
  'P0001',
  NULL,
  'non-participant call raises not-authorized exception'
);

-- ── Case 1: participant calls for regular avsluttende kamp ────────────────────
-- Called as authenticated (not postgres): proves SECURITY DEFINER is required —
-- without it, the kamp_spelar writes would be blocked by RLS after kamp is confirmed.

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9901, 9902) $$,
  'participant can call bekreft_avsluttende_kamp_deltakar'
);

-- ── Case 2: assert all writes landed ─────────────────────────────────────────

RESET ROLE;

SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9901),
  true,
  'kamp.er_bekreftet is set to true'
);

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9902),
  2,
  'eliminated player (B) gets kamp_plassering = 2'
);

SELECT is(
  (SELECT kamp_plassering FROM public.kamp_spelar WHERE id = 9901),
  1,
  'advancing player (A) gets kamp_plassering = 1'
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE kasterid = 9902 AND stevneid = 9901),
  2,
  'loser resultat.runde_eliminert set to runde_nummer'
);

-- ── Case 4: Finale — winner gets plassering 1, loser gets plassering 2 ───────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_deltakar(9902, 9902) $$,
  'participant can call for Finale kamp'
);

RESET ROLE;

SELECT is(
  (SELECT plassering FROM public.resultat WHERE kasterid = 9901 AND stevneid = 9901),
  1,
  'Finale winner (A) gets plassering = 1'
);

SELECT is(
  (SELECT plassering FROM public.resultat WHERE kasterid = 9902 AND stevneid = 9901),
  2,
  'Finale loser (B) gets plassering = 2'
);

SELECT finish();
ROLLBACK;
