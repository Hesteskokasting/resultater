-- Fix kamp_spelar_update_deltakar RLS policy (security advisor: rls_policy_always_true).
--
-- Two bugs in the previous policy:
-- 1. USING had no correlation to the row being updated (only to a same-named
--    "participant" alias satisfied by the join itself), so any authenticated
--    user who participates in ANY unconfirmed kamp could update ANY row in
--    kamp_spelar, not just their own.
-- 2. WITH CHECK (true) placed no restriction on the new row values at all.
--
-- Fix: correlate both USING and WITH CHECK directly to the outer kamp_spelar
-- row, and lock kampid/kasterid immutable in WITH CHECK (same pattern already
-- used to lock bruker_profil.rolle in "bp_oppdater_eigen").

DROP POLICY IF EXISTS "kamp_spelar_update_deltakar" ON public.kamp_spelar;
CREATE POLICY "kamp_spelar_update_deltakar" ON public.kamp_spelar FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.kamp k
      JOIN public.bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
      WHERE k.id = kamp_spelar.kampid
        AND bp.id = (select auth.uid())
        AND k.er_bekreftet = false
    )
  )
  WITH CHECK (
    kampid = (SELECT existing.kampid FROM public.kamp_spelar existing WHERE existing.id = kamp_spelar.id)
    AND kasterid = (SELECT existing.kasterid FROM public.kamp_spelar existing WHERE existing.id = kamp_spelar.id)
    AND EXISTS (
      SELECT 1 FROM public.kamp k
      JOIN public.bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
      WHERE k.id = kamp_spelar.kampid
        AND bp.id = (select auth.uid())
        AND k.er_bekreftet = false
    )
  );
