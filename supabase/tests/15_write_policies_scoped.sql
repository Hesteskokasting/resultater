BEGIN;

SELECT plan(2);

-- ── Guard: write policies must be scoped TO authenticated ─────────────────────
-- CREATE POLICY without a TO clause defaults to TO public, which makes the
-- policy evaluate for anon too. anon holds full table DML (20260724112105), so
-- an unscoped write policy means anon runs the whole policy expression — and
-- every SECURITY DEFINER helper it calls — before being rejected on the
-- auth.uid()/min_rolle() test. Scoping is what keeps those helpers out of
-- anon's reach (see 20260804094747, 20260804102231).

SELECT is_empty($$
  SELECT tablename || '.' || policyname || ' (' || cmd || ')'
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd <> 'SELECT'
    AND roles::text = '{public}'
$$, 'no write policy in public is left TO public');

-- Public read access is intentional (results are visible without signing in),
-- so SELECT policies must stay TO public — assert that too, to catch an
-- over-eager sweep that locks anonymous visitors out of the results pages.
SELECT isnt_empty($$
  SELECT tablename || '.' || policyname
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd = 'SELECT'
    AND roles::text = '{public}'
$$, 'SELECT policies remain readable without signing in');

SELECT finish();
ROLLBACK;
