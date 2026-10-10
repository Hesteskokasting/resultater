BEGIN;

SELECT plan(19);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- bekreft_avsluttende_kamp_rangert replaces the organizer's sequential cup
-- writes with one SECURITY DEFINER call. Asserted here: the writes it makes for
-- a regular round, a Finale and a Semifinale; that a rescore flips the bracket
-- and a retry changes nothing; and that it is organizer-only, avsluttende-only,
-- rejects ids from outside the kamp and still respects the fullført lock.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000061', 'admin@rang.test',  'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000062', 'player@rang.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9960, 'Rang Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9961, 'Rang', 'A', 9960),
  (9962, 'Rang', 'B', 9960),
  (9963, 'Rang', 'C', 9960),
  (9964, 'Rang', 'D', 9960);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000061', NULL, 'admin',  'ingen'),
  ('00000000-0000-0000-0000-000000000062', 9961, 'bruker', 'ingen')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, rolle = EXCLUDED.rolle;

INSERT INTO public.stevne (id, navn, dato) VALUES
  (9960, 'Rang Test Stevne', '2026-01-01'),
  (9961, 'Rang Fullført Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, runde_navn, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9960, 'rang-r1',     9960, 'avsluttende', 1, NULL,         false),
  (9961, 'rang-finale', 9960, 'avsluttende', 3, 'Finale',     false),
  (9962, 'rang-semi',   9960, 'avsluttende', 2, 'Semifinale', false),
  (9963, 'rang-innl',   9960, 'innledende',  1, NULL,         false),
  (9964, 'rang-done',   9961, 'avsluttende', 1, NULL,         false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid, score_poeng, kamp_poeng, antall_ringer)
OVERRIDING SYSTEM VALUE
VALUES
  (9960, 9960, 9961, 0, 0, 0),
  (9961, 9960, 9962, 0, 0, 0),
  (9962, 9961, 9961, 0, 0, 0),
  (9963, 9961, 9963, 0, 0, 0),
  (9964, 9962, 9962, 0, 0, 0),
  (9965, 9962, 9964, 0, 0, 0),
  (9966, 9963, 9961, 0, 0, 0),
  (9967, 9963, 9962, 0, 0, 0),
  (9968, 9964, 9961, 0, 0, 0),
  (9969, 9964, 9962, 0, 0, 0);

INSERT INTO public.resultat (id, stevneid, kasterid, hcp)
VALUES
  (9960, 9960, 9961, 0),
  (9961, 9960, 9962, 0),
  (9962, 9960, 9963, 0),
  (9963, 9960, 9964, 0);

INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, antall_ringer, registrert_av)
VALUES (9960, 1, 6, 2, '00000000-0000-0000-0000-000000000061');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000061","role":"authenticated"}', true);

-- ── Case 1: organizer settles a regular round ────────────────────────────────

SELECT public.bekreft_avsluttende_kamp_rangert(
  9960,
  '[{"kamp_spelar_id": 9960, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0},
    {"kamp_spelar_id": 9961, "score_poeng": 15, "kamp_poeng": 0, "antall_ringer": 0}]'::jsonb,
  '[[9961]]'::jsonb,
  ARRAY[9962],
  true
);

SELECT is((SELECT score_poeng FROM public.kamp_spelar WHERE id = 9960), 21, 'winner score written');
SELECT is(
  (SELECT array_agg(kamp_plassering ORDER BY id) FROM public.kamp_spelar WHERE kampid = 9960),
  ARRAY[1, 2],
  'per-match rank: advancing side 1, eliminated side 2'
);
SELECT is((SELECT er_bekreftet FROM public.kamp WHERE id = 9960), true, 'kamp confirmed');
SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9962),
  1,
  'loser marked out in this round'
);
SELECT is(
  (SELECT count(*)::int FROM public.kamp_omgang WHERE kamp_spelar_id IN (9960, 9961)),
  0,
  'p_slett_omgangar clears the omgang detail'
);

-- ── Case 2: a rescore that flips the result moves the elimination ────────────

SELECT public.bekreft_avsluttende_kamp_rangert(
  9960,
  '[{"kamp_spelar_id": 9960, "score_poeng": 10, "kamp_poeng": 0, "antall_ringer": 0},
    {"kamp_spelar_id": 9961, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0}]'::jsonb,
  '[[9962]]'::jsonb,
  ARRAY[9961],
  true
);

SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9961),
  1,
  'new loser is out'
);
SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9962),
  NULL,
  'old loser is back in'
);

-- ── Case 3: a retry after a lost response changes nothing ────────────────────

SELECT lives_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(
       9960,
       '[{"kamp_spelar_id": 9960, "score_poeng": 10, "kamp_poeng": 0, "antall_ringer": 0},
         {"kamp_spelar_id": 9961, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0}]'::jsonb,
       '[[9962]]'::jsonb,
       ARRAY[9961],
       true) $$,
  'the same call again succeeds'
);
SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9961),
  1,
  'state after the retry is unchanged'
);

-- ── Case 4: Finale writes the final placings ─────────────────────────────────

SELECT public.bekreft_avsluttende_kamp_rangert(
  9961,
  '[{"kamp_spelar_id": 9962, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0},
    {"kamp_spelar_id": 9963, "score_poeng": 12, "kamp_poeng": 0, "antall_ringer": 0}]'::jsonb,
  '[[9961]]'::jsonb,
  ARRAY[9963]
);

SELECT is((SELECT plassering FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9961), 1, 'Finale winner placed 1');
SELECT is((SELECT plassering FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9963), 2, 'Finale loser placed 2');

-- ── Case 5: a Semifinale loser is not out ────────────────────────────────────

SELECT public.bekreft_avsluttende_kamp_rangert(
  9962,
  '[{"kamp_spelar_id": 9964, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0},
    {"kamp_spelar_id": 9965, "score_poeng": 8, "kamp_poeng": 0, "antall_ringer": 0}]'::jsonb,
  '[[9962]]'::jsonb,
  ARRAY[9964]
);

SELECT is((SELECT er_bekreftet FROM public.kamp WHERE id = 9962), true, 'Semifinale confirmed');
SELECT is(
  (SELECT runde_eliminert FROM public.resultat WHERE stevneid = 9960 AND kasterid = 9964),
  NULL,
  'Semifinale loser goes on to the bronsefinale'
);

-- ── Case 6: refusals ─────────────────────────────────────────────────────────

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(9960, '[]'::jsonb, '[[9961]]'::jsonb, ARRAY[9964]) $$,
  'P0001', NULL,
  'a kasterid from outside the kamp is refused'
);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(
       9960, '[{"kamp_spelar_id": 9962, "score_poeng": 21, "kamp_poeng": 2, "antall_ringer": 0}]'::jsonb,
       '[[9961]]'::jsonb, ARRAY[9962]) $$,
  'P0001', NULL,
  'a kamp_spelar row from another kamp is refused'
);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(9960, '[]'::jsonb, '[[9961]]'::jsonb, ARRAY[9961]) $$,
  'P0001', NULL,
  'a kastar cannot both advance and be out'
);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(9963, '[]'::jsonb, '[[9961]]'::jsonb, ARRAY[9962]) $$,
  'P0001', NULL,
  'an innledende kamp is refused'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000062","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(9960, '[]'::jsonb, '[[9961]]'::jsonb, ARRAY[9962]) $$,
  'P0001', NULL,
  'a participant who does not organize the stevne is refused'
);

-- ── Case 7: SECURITY DEFINER does not bypass the fullført-stevne lock ─────────

RESET ROLE;
UPDATE public.stevne SET erfullfort = true WHERE id = 9961;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000061","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_avsluttende_kamp_rangert(9964, '[]'::jsonb, '[[9961]]'::jsonb, ARRAY[9962]) $$,
  NULL,
  'a fullført stevne stays locked — the block triggers still fire'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
