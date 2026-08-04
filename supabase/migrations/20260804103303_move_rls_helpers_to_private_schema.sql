-- Advisor lint 0029 (authenticated_security_definer_function_executable) flags
-- 17 SECURITY DEFINER functions in public. 13 are real client RPCs and are meant
-- to be callable. The remaining 4 are RLS helpers with no client caller at all,
-- yet they sit at /rest/v1/rpc/<name> purely because they live in the exposed
-- schema. EXECUTE cannot simply be revoked from authenticated: RLS policies are
-- evaluated as the calling role, so revoking breaks every write (and on PG 17.6
-- segfaults the backend — see 20260804094747). Moving them out of the exposed
-- schema is the advisor's third remedy and the correct one.
--
-- ALTER FUNCTION ... SET SCHEMA keeps the function OID, and policy expressions
-- store funcid rather than a schema-qualified name, so the policies from
-- 20260804102231 keep working untouched.
--
-- private gets USAGE for authenticated (policies are evaluated as that role)
-- and service_role, but never anon. CREATE stays owner-only.
--
-- min_rolle() is deliberately NOT moved. 12 RPCs (complete_stevne,
-- slett_brukarkonto, confirm_xkast_kongelag, …) call it as public.min_rolle()
-- — schema-qualified, so neither the OID nor a widened search_path saves them;
-- moving it means re-emitting all 12 bodies. That is a large edit across the
-- app's admin surface to buy nothing: the function returns only the caller's
-- own role, so its exposure at /rest/v1/rpc/min_rolle leaks nothing an
-- authenticated caller doesn't already know. Left as an accepted lint, to be
-- retired opportunistically as those RPCs are touched for other reasons.

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.is_match_participant(integer) SET SCHEMA private;
ALTER FUNCTION public.kamp_spelar_original(integer) SET SCHEMA private;
ALTER FUNCTION public.min_kobling_original() SET SCHEMA private;
