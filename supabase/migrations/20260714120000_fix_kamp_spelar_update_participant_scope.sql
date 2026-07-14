-- Fix: participants cannot confirm a match (false "Kampen er allereie
-- stadfesta av ein annan deltakar." for non-admin users).
--
-- 20260710110000 fixed the always-true kamp_spelar_update_deltakar policy by
-- correlating the participant check to the row being updated:
--   JOIN bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
-- That made the policy own-rows-only, but the confirm flow
-- (confirmInitialMatch in kampService.ts) legitimately writes BOTH sides'
-- kamp_spelar rows (score_poeng, kamp_poeng, hcp) — and in Par/Mix also the
-- partner's row. Under the own-rows-only policy those updates silently match
-- zero rows, which verifyRowsAffected misreads as "already confirmed".
--
-- Correct scope (same as the kamp_omgang policies): the caller must be a
-- participant in the SAME MATCH as the target row, not the owner of the row.
-- A participant may update any kamp_spelar row of their own unconfirmed
-- match, but kampid/kasterid stay locked (WITH CHECK), so rows cannot be
-- moved between matches or reassigned to another thrower.
--
-- The participant lookup is a self-reference on kamp_spelar, which inline in
-- the policy would raise 42P17 (row-security recursion — see
-- 20260710173000). Wrap it in a SECURITY DEFINER helper like
-- kamp_spelar_original().

CREATE OR REPLACE FUNCTION public.is_match_participant(p_kampid integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.kamp_spelar ks
    JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
    WHERE ks.kampid = p_kampid AND bp.id = (SELECT auth.uid())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_match_participant(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_match_participant(integer) TO authenticated;

ALTER POLICY kamp_spelar_update_deltakar ON public.kamp_spelar
  USING (
    min_rolle() = 'admin'
    OR (
      is_match_participant(kamp_spelar.kampid)
      AND EXISTS (
        SELECT 1 FROM public.kamp k
        WHERE k.id = kamp_spelar.kampid AND k.er_bekreftet = false
      )
    )
  )
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      -- kampid/kasterid must keep their pre-update values
      EXISTS (
        SELECT 1 FROM public.kamp_spelar_original(kamp_spelar.id) o
        WHERE o.kampid = kamp_spelar.kampid AND o.kasterid = kamp_spelar.kasterid
      )
      AND is_match_participant(kamp_spelar.kampid)
      AND EXISTS (
        SELECT 1 FROM public.kamp k
        WHERE k.id = kamp_spelar.kampid AND k.er_bekreftet = false
      )
    )
  );
