BEGIN;

SELECT plan(4);

-- ── Seed ─────────────────────────────────────────────────────────────────────
-- Three stevne across three years. Ada throws in both 2025 stevne (she must be
-- counted once), Bo only in one. 2024 has a resultat row with no kasterid — it
-- must not inflate the count — and 2023 falls outside the from-year window.

INSERT INTO public.klubb (id, navn) VALUES (9990, 'Deltakar Test');
INSERT INTO public.stevnetype (id, navn) VALUES (9990, 'Deltakar Test');
INSERT INTO public.kategori (id, navn) VALUES (9990, 'Singel');
INSERT INTO public.kjonn (id, navn, kortform) VALUES (9990, 'Deltakar Test', 'X');

INSERT INTO public.kaster (id, fornavn, etternavn, kjonnid, klubbid) VALUES
  (9991, 'Ada', 'Deltakar', 9990, 9990),
  (9992, 'Bo',  'Deltakar', 9990, 9990);

INSERT INTO public.stevne (id, navn, dato, klubbid, stevnetypeid, kategoriid) VALUES
  (9990, 'Vår 2025',  '2025-05-01', 9990, 9990, 9990),
  (9991, 'Haust 2025','2025-09-01', 9990, 9990, 9990),
  (9992, 'Test 2024', '2024-05-01', 9990, 9990, 9990),
  (9993, 'Test 2023', '2023-05-01', 9990, 9990, 9990);

INSERT INTO public.resultat (id, stevneid, kasterid) VALUES
  (99901, 9990, 9991),
  (99902, 9991, 9991),
  (99903, 9991, 9992),
  (99904, 9992, NULL),
  (99905, 9992, 9991),
  (99906, 9993, 9992);

-- ── Assertions ───────────────────────────────────────────────────────────────

SELECT is(
  (SELECT deltakarar FROM public.deltakarar_per_ar(2024) WHERE ar = 2025),
  2::bigint,
  'counts each thrower once per year, not once per resultat row'
);

SELECT is(
  (SELECT deltakarar FROM public.deltakarar_per_ar(2024) WHERE ar = 2024),
  1::bigint,
  'ignores resultat rows without a kasterid'
);

SELECT is(
  (SELECT count(*) FROM public.deltakarar_per_ar(2024) WHERE ar = 2023),
  0::bigint,
  'excludes years before p_from_year'
);

-- The whole point of the RPC: the row count is years, not participations, so
-- PostgREST's 1000-row cap can never truncate it.
SELECT cmp_ok(
  (SELECT count(*) FROM public.deltakarar_per_ar(1900)),
  '<',
  1000::bigint,
  'returns one row per year, well under the PostgREST row cap'
);

SELECT * FROM finish();
ROLLBACK;
