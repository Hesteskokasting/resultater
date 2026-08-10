BEGIN;

SELECT plan(8);

-- ── swap_xkast_kongelag_deltaker — refusals ───────────────────────────────────
-- The swap rewrites a seat's kasterid, and BOTH forms of score hang off the
-- seat: omgang rows reference it, and a manual total sits in the seat's own
-- poeng/antall_ringer with no omgang rows at all. The original guard
-- (20260723104711) only checked for omgang rows, so a manual total — added
-- later by 20260723115743 — swapped straight through and handed one player's
-- total to another. See 20260810175820.

-- ── Seed (postgres superuser — bypasses RLS) ──────────────────────────────────

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000009017', 'admin@swap.test', 'authenticated', 'authenticated', '', now(), now());

INSERT INTO public.kjonn (id, navn, kortform) VALUES (9017, 'Swap Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid) VALUES
  (9017, 'Seat', 'A', 9017),
  (9018, 'Seat', 'B', 9017),
  (9019, 'Seat', 'C', 9017),
  (9020, 'Seat', 'D', 9017);

INSERT INTO public.bruker_profil (id, kasterid, rolle, kobling_status)
VALUES ('00000000-0000-0000-0000-000000009017', 9017, 'admin', 'godkjent')
ON CONFLICT (id) DO UPDATE SET kasterid = EXCLUDED.kasterid, rolle = 'admin';

-- antall_omganger drives set_xkast_kongelag_total's bounds check
INSERT INTO public.kastemetode (id, navn, antall_omganger)
VALUES (9017, 'X-kast 10 omganger', 10);

INSERT INTO public.stevne (id, navn, dato, innledendekastemetodeid)
VALUES (9017, 'Swap Test Stevne', '2026-01-01', 9017);

-- Two open courts, two seats each
INSERT INTO public.xkast_kongelag (id, stevneid, fase, pulje, bane_nummer, er_bekreftet)
OVERRIDING SYSTEM VALUE
VALUES
  (9017, 9017, 'innledende', 1, 1, false),
  (9018, 9017, 'innledende', 1, 2, false);

INSERT INTO public.xkast_kongelag_deltaker (id, xkast_kongelag_id, kasterid)
OVERRIDING SYSTEM VALUE
VALUES
  (9017, 9017, 9017),
  (9018, 9017, 9018),
  (9019, 9018, 9019),
  (9020, 9018, 9020);

-- set_xkast_kongelag_total re-syncs resultat when a court is confirmed
INSERT INTO public.resultat (stevneid, kasterid, hcp) VALUES
  (9017, 9017, 0), (9017, 9018, 0), (9017, 9019, 0), (9017, 9020, 0);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009017","role":"authenticated"}', true);

-- ── Case 1: two unscored seats on different courts swap fine ─────────────────

SELECT lives_ok(
  $$ SELECT public.swap_xkast_kongelag_deltaker(9017, 9019) $$,
  'admin can swap two unscored seats on different courts'
);

SELECT is(
  (SELECT kasterid FROM public.xkast_kongelag_deltaker WHERE id = 9017),
  9019,
  'seat 9017 now holds the other court''s player'
);

SELECT is(
  (SELECT kasterid FROM public.xkast_kongelag_deltaker WHERE id = 9019),
  9017,
  'seat 9019 now holds the first court''s player'
);

-- Swap back so the remaining cases start from the seeded pairing
SELECT public.swap_xkast_kongelag_deltaker(9017, 9019);

-- ── Case 2: a seat with omganger is refused (the original guard) ─────────────

RESET ROLE;
INSERT INTO public.xkast_kongelag_omgang (xkast_kongelag_deltaker_id, omgang, poeng, antall_ringer)
VALUES (9018, 1, 12, 2);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000009017","role":"authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.swap_xkast_kongelag_deltaker(9018, 9020) $$,
  'Cannot swap: participant has recorded omganger',
  'seat with recorded omganger cannot be swapped'
);

-- ── Case 3: a seat with a manual total is refused (the regression) ───────────
-- Seat 9017 gets a total via the RPC, which deletes its omgang rows and sets
-- totalsum_manuelt — so an omganger-only guard sees an unscored seat.

SELECT lives_ok(
  $$ SELECT public.set_xkast_kongelag_total(9017, 143, 21) $$,
  'admin can enter a manual total on an unscored seat'
);

SELECT is(
  (SELECT count(*)::int FROM public.xkast_kongelag_omgang WHERE xkast_kongelag_deltaker_id = 9017),
  0,
  'the manual total leaves no omgang rows behind — what fooled the old guard'
);

SELECT throws_ok(
  $$ SELECT public.swap_xkast_kongelag_deltaker(9017, 9019) $$,
  'Cannot swap: participant has a manual total',
  'seat with a manual total cannot be swapped'
);

SELECT is(
  (SELECT kasterid FROM public.xkast_kongelag_deltaker WHERE id = 9017),
  9017,
  'the refused swap left the manual total with its own player'
);

SELECT finish();
ROLLBACK;
