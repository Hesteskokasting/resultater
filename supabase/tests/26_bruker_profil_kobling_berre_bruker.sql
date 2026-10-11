BEGIN;

SELECT plan(7);

-- ── Seed (postgres superuser — a CHECK applies whatever the role) ────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000261', 'brukar@kobling.test',     'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000262', 'admin@kobling.test',      'authenticated', 'authenticated', '', now(), now()),
  ('00000000-0000-0000-0000-000000000263', 'klubbadmin@kobling.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.bruker_profil (id, rolle, kobling_status)
VALUES
  ('00000000-0000-0000-0000-000000000261', 'bruker',     'ingen'),
  ('00000000-0000-0000-0000-000000000262', 'admin',      'ingen'),
  ('00000000-0000-0000-0000-000000000263', 'klubbadmin', 'ingen')
ON CONFLICT (id) DO UPDATE SET rolle = EXCLUDED.rolle, kobling_status = EXCLUDED.kobling_status;

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9260, 'Kobling Test', 'X');
INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES (9261, 'Kobla', 'Kastar', 9260);

-- ── A brukar may link and request ─────────────────────────────────────────────

SELECT lives_ok(
  $$ UPDATE public.bruker_profil SET kasterid = 9261, kobling_status = 'godkjent'
     WHERE id = '00000000-0000-0000-0000-000000000261' $$,
  'a brukar can be linked to a thrower'
);

-- ── Organizers may not ───────────────────────────────────────────────────────

SELECT throws_ok(
  $$ UPDATE public.bruker_profil SET kasterid = 9261, kobling_status = 'godkjent'
     WHERE id = '00000000-0000-0000-0000-000000000262' $$,
  '23514',
  NULL,
  'an admin cannot be linked to a thrower'
);

SELECT throws_ok(
  $$ UPDATE public.bruker_profil SET kobling_kasterid = 9261, kobling_status = 'venter'
     WHERE id = '00000000-0000-0000-0000-000000000263' $$,
  '23514',
  NULL,
  'a klubbadmin cannot request a link'
);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil SET kobling_status = 'avvist'
     WHERE id = '00000000-0000-0000-0000-000000000263' $$,
  'a rejected request with no thrower is allowed on an organizer'
);

-- ── Changing the role of a linked brukar ─────────────────────────────────────

SELECT throws_ok(
  $$ UPDATE public.bruker_profil SET rolle = 'admin'
     WHERE id = '00000000-0000-0000-0000-000000000261' $$,
  '23514',
  NULL,
  'a linked brukar cannot become admin while the link stands'
);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil SET kasterid = NULL, kobling_status = 'ingen'
     WHERE id = '00000000-0000-0000-0000-000000000261' $$,
  'the link can be cleared first'
);

SELECT lives_ok(
  $$ UPDATE public.bruker_profil SET rolle = 'klubbadmin'
     WHERE id = '00000000-0000-0000-0000-000000000261' $$,
  'and then the role changes'
);

SELECT * FROM finish();
ROLLBACK;
