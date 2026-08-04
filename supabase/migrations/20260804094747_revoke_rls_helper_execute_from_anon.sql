-- Advisor (security): "Function public.is_match_participant can be executed by
-- the anon role as a SECURITY DEFINER function via /rest/v1/rpc/...".
--
-- Same root cause as 20260710110200: Supabase's default privileges grant
-- EXECUTE directly to anon at function-creation time, so the
-- "REVOKE EXECUTE ... FROM PUBLIC" in 20260714120000 (is_match_participant)
-- stripped only the PUBLIC pseudo-role grant and left anon=X in place.
--
-- Impact of the exposure was nil: all three helpers key off auth.uid(), which is
-- NULL for anon (is_match_participant always false, min_rolle always NULL), and
-- kamp_spelar_original only returns columns the "Enable read access for all
-- users" SELECT policy already exposes with USING (true).
--
-- These are RLS helpers, never client-callable RPCs, so anon loses nothing.
-- Note the write policies on kamp_spelar are still TO public while anon holds
-- table-level DML (see 20260724112105), so an anon write now fails with 42501
-- permission denied for function instead of matching zero rows. Both deny it;
-- only the error shape changes. Scoping those policies TO authenticated is the
-- structural fix and is left as follow-up work.

REVOKE EXECUTE ON FUNCTION public.is_match_participant(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.kamp_spelar_original(integer) FROM anon;

-- min_rolle needs both halves: it carries a PUBLIC grant (=X/postgres) as well
-- as the direct anon grant, so revoking only from anon leaves it reachable
-- through PUBLIC.
--
-- Dropping PUBLIC must be paired with explicit grants. Prod also has direct
-- authenticated/service_role grants, but a fresh `supabase db reset` does not:
-- locally those roles reach min_rolle *only* through PUBLIC, so revoking it
-- alone leaves authenticated unable to evaluate any policy that calls
-- min_rolle. Postgres 17.6 does not merely error on that path — the backend
-- segfaults mid-INSERT (caught by supabase/tests/01_rls_kamp_omgang.sql).
-- Granting explicitly makes prod and local converge on the same end state.
REVOKE EXECUTE ON FUNCTION public.min_rolle() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.min_rolle() TO authenticated, service_role;
