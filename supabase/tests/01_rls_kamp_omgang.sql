BEGIN;

SELECT plan(4);

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

INSERT INTO public.kamp (id, match_id, stevneid, fase, runde_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES (9901, 'rls-omgang-test', 9901, 'innledende', 1, false);

-- ks_a (id 9901) = player A in the match; ks_b (id 9902) = player B.
-- Player C has no kamp_spelar row — that is the point.
INSERT INTO public.kamp_spelar (id, kampid, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9901, 9901, 9901),
  (9902, 9901, 9902);

-- ── Case 1: player A inserts omgang for own kamp_spelar ───────────────────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, registrert_av)
     VALUES (9901, 1, 4, '00000000-0000-0000-0000-000000000001') $$,
  'player A can insert omgang for own kamp_spelar'
);

-- ── Case 2: player B inserts for player A kamp_spelar (both in same match) ────
-- Policy allows any match participant to register omgangar for any spelar in the match.
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, registrert_av)
     VALUES (9901, 2, 6, '00000000-0000-0000-0000-000000000002') $$,
  'player B can insert omgang for player A kamp_spelar (both in match)'
);

-- ── Case 3: player C (not in match) cannot insert ─────────────────────────────
-- INSERT WITH CHECK fails → raises 42501 insufficient_privilege.
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

SELECT throws_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, registrert_av)
     VALUES (9901, 3, 4, '00000000-0000-0000-0000-000000000003') $$,
  '42501', NULL,
  'player C (not in match) cannot insert omgang'
);

-- ── Case 4: player A cannot insert after match is confirmed ───────────────────
-- Reset to superuser to flip the flag, then re-enter authenticated for the check.
RESET ROLE;
UPDATE public.kamp SET er_bekreftet = true WHERE id = 9901;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

SELECT throws_ok(
  $$ INSERT INTO public.kamp_omgang (kamp_spelar_id, omgang, score, registrert_av)
     VALUES (9901, 4, 4, '00000000-0000-0000-0000-000000000001') $$,
  '42501', NULL,
  'player A cannot insert omgang after match is confirmed'
);

RESET ROLE;

SELECT finish();
ROLLBACK;
