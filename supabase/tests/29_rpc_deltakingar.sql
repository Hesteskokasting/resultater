BEGIN;

SELECT plan(5);

-- ── Seed ─────────────────────────────────────────────────────────────────────
-- Ada throws in both 2025 stevne, Bo in one; a resultat row with no kasterid
-- must not count.

INSERT INTO public.klubb (id, navn) VALUES (9290, 'Deltaking Test');
INSERT INTO public.kjonn (id, navn, kortform) VALUES (9290, 'Deltaking Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9291, 'Ada', 'Deltaking', 9290, 9290),
  (9292, 'Bo',  'Deltaking', 9290, 9290);

INSERT INTO public.stevne (id, navn, dato, klubbid) VALUES
  (9290, 'Vår 2025',   '2025-05-01', 9290),
  (9291, 'Haust 2025', '2025-09-01', 9290),
  (9292, 'Tomt 2025',  '2025-10-01', 9290);

INSERT INTO public.resultat (id, stevneid, kasterid) VALUES
  (92901, 9290, 9291),
  (92902, 9291, 9291),
  (92903, 9291, 9292),
  (92904, 9291, NULL);

-- ── deltakarar_per_ar ────────────────────────────────────────────────────────

SELECT results_eq(
  $$ SELECT deltakarar, deltakingar FROM public.deltakarar_per_ar(2025)
     WHERE ar = 2025 $$,
  $$ VALUES (2::bigint, 3::bigint) $$,
  'a year counts unique throwers and every participation, skipping rows without a thrower'
);

-- ── deltakingar_per_stevne ───────────────────────────────────────────────────

SELECT results_eq(
  $$ SELECT stevneid, deltakingar FROM public.deltakingar_per_stevne(ARRAY[9290, 9291, 9292])
     ORDER BY stevneid $$,
  $$ VALUES (9290, 1::bigint), (9291, 2::bigint) $$,
  'counts participations per stevne, leaving out stevne without results'
);

SELECT is_empty(
  $$ SELECT 1 FROM public.deltakingar_per_stevne(ARRAY[9292]) $$,
  'a stevne without results gives no row'
);

SELECT is_empty(
  $$ SELECT 1 FROM public.deltakingar_per_stevne(ARRAY[]::int[]) $$,
  'no ids gives no rows'
);

SET LOCAL ROLE anon;

SELECT lives_ok(
  $$ SELECT * FROM public.deltakingar_per_stevne(ARRAY[9290]) $$,
  'the public can read the counts, like resultat itself'
);

SELECT * FROM finish();
ROLLBACK;
