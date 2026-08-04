BEGIN;

SELECT plan(6);

-- ── Guard: SECURITY DEFINER functions must not be anon-executable ─────────────
-- Supabase's default privileges grant EXECUTE directly to anon at function
-- creation time, so every new SECURITY DEFINER function in public is reachable
-- via /rest/v1/rpc until a migration revokes it FROM anon *by name* — REVOKE
-- FROM PUBLIC strips only the pseudo-role grant and leaves anon=X behind. That
-- mistake has shipped three times (20260710110100, 20260714120000, and the
-- two helpers cleaned up in 20260804094747), so pin it down here instead of
-- waiting for the next advisor run.

-- Sanity check: without the default-privilege grant in place the guard below
-- would pass vacuously, so assert the trap actually exists in this database.
SELECT isnt_empty($$
  SELECT 1
  FROM pg_default_acl d
  JOIN pg_namespace n ON n.oid = d.defaclnamespace
  WHERE n.nspname = 'public'
    AND d.defaclobjtype = 'f'
    AND array_to_string(d.defaclacl, ' ') LIKE '%anon=X%'
$$, 'default privileges grant EXECUTE on new public functions to anon (the trap this guards)');

SELECT is_empty($$
  SELECT n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef
    AND has_function_privilege('anon', p.oid, 'EXECUTE')
$$, 'no SECURITY DEFINER function in public is executable by anon');

-- ── Guard: RLS helpers stay out of the exposed schema ─────────────────────────
-- 20260804103303 moved them to private because EXECUTE cannot be revoked from
-- authenticated (policies are evaluated as that role) — being outside the
-- PostgREST-exposed schema is what keeps them off /rest/v1/rpc.

-- min_rolle is a documented exception: 12 RPCs call it as public.min_rolle(),
-- so moving it means re-emitting all 12 bodies for no security gain (it returns
-- only the caller's own role). See 20260804103303.
SELECT is_empty($$
  SELECT p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('is_match_participant', 'kamp_spelar_original', 'min_kobling_original')
$$, 'RLS helpers do not live in the exposed schema');

SELECT ok(
  NOT has_schema_privilege('anon', 'private', 'USAGE'),
  'anon has no USAGE on private'
);

SELECT ok(
  has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated has USAGE on private (policies are evaluated as this role)'
);

-- The helpers must remain callable by authenticated or every write policy that
-- references them fails — the segfault path from 20260804094747.
SELECT is_empty($$
  SELECT n.nspname || '.' || p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'private'
    AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
$$, 'authenticated can execute every helper in private');

SELECT finish();
ROLLBACK;
