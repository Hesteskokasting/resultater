-- Fixes 42P17 "infinite recursion detected in policy for relation ...",
-- observed live for bruker_profil (PATCH from src/pages/minside.ts toggling
-- notification prefs) and present by the same construction in kamp_spelar
-- (confirming one's own match result).
--
-- Both policies' WITH CHECK read back the row's own pre-update values with a
-- raw subquery directly against the same table the policy is defined on:
--   rolle = (SELECT rolle FROM bruker_profil WHERE id = auth.uid())
--   kampid = (SELECT existing.kampid FROM kamp_spelar existing WHERE existing.id = kamp_spelar.id)
-- Because these subqueries are inline in the policy (not wrapped in a
-- SECURITY DEFINER function), Postgres evaluates them under the caller's own
-- privileges, which re-triggers the table's RLS while its RLS is already
-- being evaluated for the outer UPDATE. Postgres's row-security recursion
-- guard is keyed per-relation, not per-command, so it refuses to re-enter
-- and raises 42P17 instead of risking an incorrect result.
--
-- min_rolle() already reads back the caller's own rolle the exact same way,
-- but is SECURITY DEFINER and owned by postgres (bruker_profil's table
-- owner), which bypasses RLS entirely on that inner lookup — used
-- everywhere else in this project's policies for exactly this reason.
-- Reuse it for bruker_profil, and add an equivalent helper for kamp_spelar.

CREATE OR REPLACE FUNCTION public.kamp_spelar_original(p_id integer)
RETURNS TABLE(kampid integer, kasterid integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT kampid, kasterid FROM public.kamp_spelar WHERE id = p_id;
$$;

REVOKE EXECUTE ON FUNCTION public.kamp_spelar_original(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kamp_spelar_original(integer) TO authenticated;

ALTER POLICY bp_oppdater ON public.bruker_profil
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      (select auth.uid()) = id
      AND rolle = min_rolle()
    )
  );

ALTER POLICY kamp_spelar_update_deltakar ON public.kamp_spelar
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      EXISTS (
        SELECT 1 FROM public.kamp_spelar_original(kamp_spelar.id) o
        WHERE o.kampid = kamp_spelar.kampid AND o.kasterid = kamp_spelar.kasterid
      )
      AND EXISTS (
        SELECT 1 FROM public.kamp k JOIN public.bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
        WHERE k.id = kamp_spelar.kampid AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
      )
    )
  );
