-- Undo on the scoreboard deletes the last omgang instead of editing it in
-- place, so a participant needs DELETE — until now it was admin-only and the
-- board worked around it with an edit mode nobody understood.
--
-- The predicate is a copy of kamp_omgang_update's (20260710111529): admin, or
-- any participant of the same kamp while it is unconfirmed. Same reach as
-- editing already had. Replaces kamp_omgang_admin_delete rather than adding
-- beside it, so DELETE keeps a single permissive policy.
--
-- The erfullfort lock (20260709160000) still blocks DELETE via trigger.

DROP POLICY IF EXISTS "kamp_omgang_admin_delete" ON public.kamp_omgang;

CREATE POLICY "kamp_omgang_delete" ON public.kamp_omgang FOR DELETE TO authenticated
  USING (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.kamp_spelar target_ks
        JOIN public.kamp k ON k.id = target_ks.kampid
        JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
        JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_omgang.kamp_spelar_id AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
    )
  );
