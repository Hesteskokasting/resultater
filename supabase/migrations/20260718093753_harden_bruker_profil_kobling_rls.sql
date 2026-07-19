-- Closes an authorization hole in bp_oppdater: its self-branch WITH CHECK only
-- froze rolle, so any user could PATCH their own row to kobling_status =
-- 'godkjent' with an arbitrary kasterid and bypass admin approval of the
-- kaster link entirely. Self-updates may now only keep kasterid unchanged, and
-- kobling_status may only stay unchanged or move to 'ingen'/'venter' (request
-- and cancel). Approval still flows through the admin branch or SECURITY
-- DEFINER RPCs (godkjenn_kobling_med_telefon, added in the next migration).
--
-- The pre-update values are read via a SECURITY DEFINER helper rather than an
-- inline subquery against bruker_profil itself — an inline subquery would
-- re-enter the table's own RLS mid-evaluation and raise 42P17 (see
-- 20260710173000_fix_bruker_profil_kamp_spelar_rls_recursion.sql).

CREATE OR REPLACE FUNCTION public.min_kobling_original()
RETURNS TABLE(kasterid integer, kobling_status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT kasterid, kobling_status FROM public.bruker_profil WHERE id = (select auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.min_kobling_original() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.min_kobling_original() FROM anon;
GRANT EXECUTE ON FUNCTION public.min_kobling_original() TO authenticated;

ALTER POLICY bp_oppdater ON public.bruker_profil
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      (select auth.uid()) = id
      AND rolle = min_rolle()
      AND kasterid IS NOT DISTINCT FROM (SELECT o.kasterid FROM public.min_kobling_original() o)
      AND (
        kobling_status IS NOT DISTINCT FROM (SELECT o.kobling_status FROM public.min_kobling_original() o)
        OR kobling_status IN ('ingen', 'venter')
      )
    )
  );
