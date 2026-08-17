BEGIN;

SELECT plan(13);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- bekreft_innledende_kamp replaces three RLS-checked REST writes with one
-- SECURITY DEFINER call, so what is asserted here is that it grants no more
-- than those policies did: participant-or-admin only, open kamp only, rows
-- belonging to the kamp only, innledende only, and still blocked by the
-- fullført-stevne triggers.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000051', 'player-a@innl.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000052', 'player-b@innl.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000053', 'outsider@innl.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000054', 'admin@innl.test',    'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9950, 'Innl Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9951, 'Innl', 'A', 9950),
  (9952, 'Innl', 'B', 9950),
  (9953, 'Innl', 'Outsider', 9950);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000051', 9951, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000052', 9952, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000053', 9953, 'bruker', 'ingen'),
  ('00000000-0000-0000-0000-000000000054', NULL, 'admin',  'ingen')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, rolle = EXCLUDED.rolle;

INSERT INTO public.stevne (id, navn, dato) VALUES
  (9950, 'Innl Test Stevne', '2026-01-01'),
  (9951, 'Innl Fullført Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9950, 'innl-open',      9950, 'innledende',  1, false),
  (9951, 'innl-second',    9950, 'innledende',  2, false),
  (9952, 'innl-cup',       9950, 'avsluttende', 3, false),
  (9953, 'innl-completed', 9951, 'innledende',  1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid, score_poeng, kamp_poeng, antall_ringer)
OVERRIDING SYSTEM VALUE
VALUES
  (9950, 9950, 9951, 0, 0, 0),
  (9951, 9950, 9952, 0, 0, 0),
  (9952, 9951, 9951, 0, 0, 0),
  (9953, 9951, 9952, 0, 0, 0),
  (9954, 9952, 9951, 0, 0, 0),
  (9955, 9953, 9951, 0, 0, 0);

-- ── Case 1: participant confirms an open kamp ────────────────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000051","role":"authenticated"}', true);

SELECT is(
  public.bekreft_innledende_kamp(9950, '[
    {"kamp_spelar_id": 9950, "score_poeng": 21, "kamp_poeng": 2,   "antall_ringer": 4},
    {"kamp_spelar_id": 9951, "score_poeng": 18, "kamp_poeng": 1.5, "antall_ringer": 2}
  ]'::jsonb),
  true,
  'participant confirms an open innledende kamp'
);

RESET ROLE;

SELECT is(
  (SELECT score_poeng FROM public.kamp_spelar WHERE id = 9950),
  21,
  'own score_poeng written'
);

SELECT is(
  (SELECT score_poeng FROM public.kamp_spelar WHERE id = 9951),
  18,
  'opponent score_poeng written in the same call'
);

SELECT is(
  (SELECT kamp_poeng FROM public.kamp_spelar WHERE id = 9951),
  1.5::real,
  'fractional kamp_poeng survives the jsonb round trip (column is real)'
);

SELECT is(
  (SELECT antall_ringer FROM public.kamp_spelar WHERE id = 9950),
  4,
  'antall_ringer written'
);

SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9950),
  true,
  'kamp confirmed in the same call'
);

-- ── Case 2: the opponent arrives second — same signal the old zero-rows gave ──

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000052","role":"authenticated"}', true);

SELECT is(
  public.bekreft_innledende_kamp(9950, '[{"kamp_spelar_id": 9950, "score_poeng": 3, "kamp_poeng": 0, "antall_ringer": 0}]'::jsonb),
  false,
  'a second participant gets false on an already-confirmed kamp'
);

RESET ROLE;

SELECT is(
  (SELECT score_poeng FROM public.kamp_spelar WHERE id = 9950),
  21,
  'the losing race wrote nothing'
);

-- ── Case 3: an admin may still correct a confirmed kamp (as the policies allow)

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000054","role":"authenticated"}', true);

SELECT is(
  public.bekreft_innledende_kamp(9950, '[{"kamp_spelar_id": 9950, "score_poeng": 20, "kamp_poeng": 1, "antall_ringer": 4}]'::jsonb),
  true,
  'admin may re-confirm an already-confirmed kamp'
);

-- ── Case 4: an outsider is refused ───────────────────────────────────────────

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000053","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_innledende_kamp(9951, '[{"kamp_spelar_id": 9952, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0}]'::jsonb) $$,
  NULL,
  'non-participant cannot confirm a kamp'
);

-- ── Case 5: ids from another kamp are rejected, not silently written ──────────
-- The client supplies these ids, and SECURITY DEFINER means RLS is not there
-- to catch a row that belongs somewhere else.

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000051","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_innledende_kamp(9951, '[{"kamp_spelar_id": 9955, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0}]'::jsonb) $$,
  NULL,
  'a kamp_spelar row from another kamp is refused'
);

-- ── Case 6: a cup kamp must go through the avsluttende RPC ───────────────────

SELECT throws_ok(
  $$ SELECT public.bekreft_innledende_kamp(9952, '[{"kamp_spelar_id": 9954, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0}]'::jsonb) $$,
  NULL,
  'an avsluttende kamp is refused'
);

-- ── Case 7: SECURITY DEFINER does not bypass the fullført-stevne lock ─────────

RESET ROLE;
UPDATE public.stevne SET erfullfort = true WHERE id = 9951;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000051","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.bekreft_innledende_kamp(9953, '[{"kamp_spelar_id": 9955, "score_poeng": 21, "kamp_poeng": 1, "antall_ringer": 0}]'::jsonb) $$,
  NULL,
  'a fullført stevne stays locked — the block triggers still fire'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
