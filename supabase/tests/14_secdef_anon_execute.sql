BEGIN;

SELECT plan(2);

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

SELECT finish();
ROLLBACK;
