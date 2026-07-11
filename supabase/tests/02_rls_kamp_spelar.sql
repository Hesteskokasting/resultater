BEGIN;

SELECT plan(6);

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

INSERT INTO public.stevne (id, navn, dato) VALUES (9901, 'RLS Test Stevne', '2026-01-01');

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9901, 'rls-spelar-test', 9901, 'innledende', 1, false);

INSERT INTO public.kamp_spelar (id, kampid, kasterid, score_poeng)
OVERRIDING SYSTEM VALUE
VALUES
  (9901, 9901, 9901, 0),
  (9902, 9901, 9902, 0);

-- Player C has no kamp_spelar row — that is the point.

-- ── Case 4: participant edits kamp_spelar score while match unconfirmed ───────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.kamp_spelar SET score_poeng = 21 WHERE id = 9901 $$,
  'participant can update kamp_spelar score while match is unconfirmed'
);

-- ── Case 3: non-participant cannot flip er_bekreftet ─────────────────────────
-- Run before case 1 so the kamp is still unconfirmed here; this isolates the
-- participant EXISTS check in USING from the er_bekreftet = false check.

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

UPDATE public.kamp SET er_bekreftet = true WHERE id = 9901;

RESET ROLE;
SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9901),
  false,
  'non-participant cannot flip er_bekreftet (silent no-op, row hidden by USING EXISTS check)'
);

-- ── Case 1: participant flips er_bekreftet false → true ───────────────────────

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT lives_ok(
  $$ UPDATE public.kamp SET er_bekreftet = true WHERE id = 9901 $$,
  'participant can flip er_bekreftet false to true'
);

RESET ROLE;
SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9901),
  true,
  'er_bekreftet is now true after participant confirmation'
);

-- ── Case 2: participant cannot flip er_bekreftet true → false ─────────────────
-- kamp is confirmed; USING (er_bekreftet = false) hides the row — silent no-op.

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

UPDATE public.kamp SET er_bekreftet = false WHERE id = 9901;

RESET ROLE;
SELECT is(
  (SELECT er_bekreftet FROM public.kamp WHERE id = 9901),
  true,
  'confirmed match cannot be unconfirmed — er_bekreftet stays true (silent no-op, row hidden by USING)'
);

-- ── Case 5: participant cannot edit kamp_spelar score after match confirmed ────
-- kamp.er_bekreftet = true; kamp_spelar_update_deltakar USING (k.er_bekreftet = false)
-- hides the row — silent no-op.

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

UPDATE public.kamp_spelar SET score_poeng = 99 WHERE id = 9901;

RESET ROLE;
SELECT is(
  (SELECT score_poeng FROM public.kamp_spelar WHERE id = 9901),
  21,
  'participant cannot edit kamp_spelar score after match confirmed (silent no-op, row hidden by USING)'
);

SELECT finish();
ROLLBACK;
