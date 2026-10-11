BEGIN;

SELECT plan(12);

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────
-- Klubbadmin …281 runs klubb 9281. Brukar …282 asks for a thrower in that club,
-- …283 for one in klubb 9282. …284 is a plain brukar, …285 an admin.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000281', 'klubbadmin@foresp.test', 'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000282', 'eigen@foresp.test',      'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000283', 'annan@foresp.test',      'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000284', 'brukar@foresp.test',     'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000285', 'admin@foresp.test',      'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.klubb (id, navn) VALUES (9281, 'Eigen Klubb'), (9282, 'Annan Klubb');
INSERT INTO public.kjonn (id, navn, kortform) VALUES (9281, 'Forespurnad Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9281, 'Eigen', 'Kastar', 9281, 9281),
  (9282, 'Annan', 'Kastar', 9281, 9282);

INSERT INTO public.bruker_profil (id, rolle, kobling_status, kobling_kasterid)
VALUES
  ('00000000-0000-0000-0000-000000000281', 'klubbadmin', 'ingen',  NULL),
  ('00000000-0000-0000-0000-000000000282', 'bruker',     'venter', 9281),
  ('00000000-0000-0000-0000-000000000283', 'bruker',     'venter', 9282),
  ('00000000-0000-0000-0000-000000000284', 'bruker',     'ingen',  NULL),
  ('00000000-0000-0000-0000-000000000285', 'admin',      'ingen',  NULL)
ON CONFLICT (id) DO UPDATE
  SET rolle = EXCLUDED.rolle, kasterid = NULL,
      kobling_status = EXCLUDED.kobling_status, kobling_kasterid = EXCLUDED.kobling_kasterid;

INSERT INTO public.klubbadmin_klubber (bruker_id, klubbid)
VALUES ('00000000-0000-0000-0000-000000000281', 9281);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000281","role":"authenticated"}', true);

-- ── A klubbadmin sees requests for their own club's throwers only ────────────

SELECT results_eq(
  $$ SELECT id FROM public.bruker_profil WHERE kobling_status = 'venter' $$,
  $$ VALUES ('00000000-0000-0000-0000-000000000282'::uuid) $$,
  'a klubbadmin sees the pending request for their own club''s thrower only'
);

SELECT results_eq(
  $$ SELECT epost FROM public.hent_bruker_epost(ARRAY[
       '00000000-0000-0000-0000-000000000282',
       '00000000-0000-0000-0000-000000000283',
       '00000000-0000-0000-0000-000000000284']::uuid[]) $$,
  $$ VALUES ('eigen@foresp.test'::text) $$,
  'a klubbadmin gets the e-mail of their own club''s requester only'
);

-- ── …and answers them through the RPC, never by writing the row ──────────────

UPDATE public.bruker_profil SET kasterid = 9281, kobling_status = 'godkjent'
WHERE id = '00000000-0000-0000-0000-000000000282';

SELECT is(
  (SELECT kobling_status FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000282'),
  'venter',
  'a direct update of the requester''s profile changes nothing'
);

SELECT throws_ok(
  $$ SELECT public.svar_koblingsforespurnad('00000000-0000-0000-0000-000000000283', true) $$,
  '42501', NULL,
  'a klubbadmin cannot answer a request for another club''s thrower'
);

SELECT lives_ok(
  $$ SELECT public.svar_koblingsforespurnad('00000000-0000-0000-0000-000000000282', true) $$,
  'a klubbadmin can approve a request for their own club''s thrower'
);

SELECT throws_ok(
  $$ SELECT public.svar_koblingsforespurnad('00000000-0000-0000-0000-000000000282', false) $$,
  'P0002', NULL,
  'an answered request cannot be answered again'
);

SELECT is_empty(
  $$ SELECT 1 FROM public.bruker_profil WHERE id = '00000000-0000-0000-0000-000000000282' $$,
  'once answered, the requester''s profile is out of the klubbadmin''s sight'
);

-- ── Nobody else gets in ──────────────────────────────────────────────────────

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000284","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.svar_koblingsforespurnad('00000000-0000-0000-0000-000000000283', true) $$,
  '42501', NULL,
  'a brukar cannot answer a request'
);

-- ── An admin answers any request ─────────────────────────────────────────────

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000285","role":"authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.svar_koblingsforespurnad('00000000-0000-0000-0000-000000000283', false) $$,
  'an admin can reject a request for any club''s thrower'
);

RESET ROLE;

SELECT results_eq(
  $$ SELECT kasterid, kobling_status, kobling_kasterid FROM public.bruker_profil
     WHERE id = '00000000-0000-0000-0000-000000000282' $$,
  $$ VALUES (9281, 'godkjent'::text, NULL::integer) $$,
  'approving links the requested thrower and clears the request'
);

SELECT results_eq(
  $$ SELECT kasterid, kobling_status, kobling_kasterid FROM public.bruker_profil
     WHERE id = '00000000-0000-0000-0000-000000000283' $$,
  $$ VALUES (NULL::integer, 'avvist'::text, NULL::integer) $$,
  'rejecting leaves no link and no request'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.svar_koblingsforespurnad(uuid, boolean)', 'EXECUTE'),
  'anon cannot answer requests'
);

SELECT * FROM finish();
ROLLBACK;
