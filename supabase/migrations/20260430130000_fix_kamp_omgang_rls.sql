-- Erstatt kamp_omgang-policyar så begge spelarane i ein kamp kan registrere kast for kvarandre

DROP POLICY IF EXISTS "kamp_omgang_insert" ON public.kamp_omgang;
DROP POLICY IF EXISTS "kamp_omgang_update" ON public.kamp_omgang;

-- Spelarar kan registrere omgangar for alle kamp_spelar-rader i ein kamp dei sjølve deltek i,
-- men berre så lenge kampen ikkje er bekrefta.
CREATE POLICY "kamp_omgang_insert"
  ON public.kamp_omgang FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.kamp_spelar target_ks
      JOIN public.kamp k ON k.id = target_ks.kampid
      JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
      JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_spelar_id
        AND bp.id = auth.uid()
        AND k.er_bekreftet = false
    )
  );

-- Spelarar kan oppdatere omgangar i ein kamp dei sjølve deltek i, men berre så lenge kampen ikkje er bekrefta.
CREATE POLICY "kamp_omgang_update"
  ON public.kamp_omgang FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.kamp_spelar target_ks
      JOIN public.kamp k ON k.id = target_ks.kampid
      JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
      JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_spelar_id
        AND bp.id = auth.uid()
        AND k.er_bekreftet = false
    )
  );
