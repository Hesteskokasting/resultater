-- Wraps every bare auth.uid() call in the 17 RLS policies flagged by the
-- auth_rls_initplan advisor with (select auth.uid()), so Postgres evaluates
-- it once per query (InitPlan) instead of once per row. Logic is unchanged.

ALTER POLICY bp_les_eigen ON public.bruker_profil
  USING ((select auth.uid()) = id);

ALTER POLICY bp_oppdater_eigen ON public.bruker_profil
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND rolle = (SELECT bruker_profil_1.rolle FROM public.bruker_profil bruker_profil_1 WHERE bruker_profil_1.id = (select auth.uid()))
  );

ALTER POLICY kk_les_eigen ON public.klubbadmin_klubber
  USING (bruker_id = (select auth.uid()));

ALTER POLICY pm_insert_brukar ON public.pamelding
  WITH CHECK (
    (select auth.uid()) = bruker_id
    AND kasterid = (
      SELECT bruker_profil.kasterid FROM public.bruker_profil
      WHERE bruker_profil.id = (select auth.uid()) AND bruker_profil.kobling_status = 'godkjent'
    )
  );

ALTER POLICY pm_oppdater_eigen ON public.pamelding
  USING ((select auth.uid()) = bruker_id);

ALTER POLICY pm_slett_eigen ON public.pamelding
  USING ((select auth.uid()) = bruker_id);

ALTER POLICY pm_klubbadmin_sine_stevner ON public.pamelding
  USING (
    EXISTS (
      SELECT 1 FROM public.stevne s
      JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid
      WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid())
    )
  );

-- Note: kk.klubbid = kk.klubbid below is a pre-existing tautology in this
-- policy (and in kaster_insert_klubbadmin) — left as-is, out of scope here.
ALTER POLICY pm_insert_klubbadmin ON public.pamelding
  WITH CHECK (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.kaster k
      JOIN public.klubbadmin_klubber kk ON kk.klubbid = k.klubbid
      WHERE k.id = pamelding.kasterid AND kk.bruker_id = (select auth.uid())
    )
  );

ALTER POLICY stevne_insert_klubbadmin ON public.stevne
  WITH CHECK (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kk.klubbid
    )
  );

ALTER POLICY stevne_update_klubbadmin ON public.stevne
  USING (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = stevne.klubbid
    )
  );

ALTER POLICY kaster_insert_klubbadmin ON public.kaster
  WITH CHECK (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kk.klubbid
    )
  );

ALTER POLICY kaster_update_klubbadmin ON public.kaster
  USING (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kaster.klubbid
    )
  );

ALTER POLICY klubb_update_klubbadmin ON public.klubb
  USING (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = klubb.id
    )
  );

ALTER POLICY kamp_omgang_insert ON public.kamp_omgang
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kamp_spelar target_ks
      JOIN public.kamp k ON k.id = target_ks.kampid
      JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
      JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_omgang.kamp_spelar_id
        AND bp.id = (select auth.uid())
        AND k.er_bekreftet = false
    )
  );

ALTER POLICY kamp_omgang_update ON public.kamp_omgang
  USING (
    EXISTS (
      SELECT 1 FROM public.kamp_spelar target_ks
      JOIN public.kamp k ON k.id = target_ks.kampid
      JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
      JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_omgang.kamp_spelar_id
        AND bp.id = (select auth.uid())
        AND k.er_bekreftet = false
    )
  );

ALTER POLICY kamp_bekreft_deltakar ON public.kamp
  USING (
    er_bekreftet = false
    AND EXISTS (
      SELECT 1 FROM public.kamp_spelar ks
      JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
      WHERE ks.kampid = kamp.id AND bp.id = (select auth.uid())
    )
  );

ALTER POLICY kamp_spelar_update_deltakar ON public.kamp_spelar
  USING (
    EXISTS (
      SELECT 1 FROM public.kamp k
      JOIN public.kamp_spelar participant ON participant.kampid = k.id
      JOIN public.bruker_profil bp ON bp.kasterid = participant.kasterid
      WHERE k.id = participant.kampid AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
    )
  );

-- DOWN
-- Revert each ALTER POLICY above by re-running it with the bare auth.uid()
-- calls (remove every "(select auth.uid())" wrapper back to "auth.uid()").
