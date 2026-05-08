-- ============================================================
-- RLS for kamp_omgang
-- ============================================================

-- ------------------------------------------------------------
-- kamp_omgang
-- Spelarar kan legge til eller endre eigne registreringar, så lenge public.kamp.er_bekreftet = false
-- ------------------------------------------------------------
ALTER TABLE public.kamp_omgang ENABLE ROW LEVEL SECURITY;

-- Spelarar kan registrere omgangar for eigne kamp_spelar-rader, men berre så lenge kampen ikkje er bekrefta.
CREATE POLICY "kamp_omgang_insert"
  ON public.kamp_omgang FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kamp_spelar ks
      JOIN public.kamp k ON k.id = ks.kampid
      JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
      WHERE ks.id = kamp_spelar_id
        AND bp.id = auth.uid()
        AND k.er_bekreftet = false
    )
  );

-- Spelarar kan oppdatere eigne omgangar, men berre så lenge kampen ikkje er bekrefta.
CREATE POLICY "kamp_omgang_update"
  ON public.kamp_omgang FOR UPDATE
  USING (
    registrert_av = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.kamp_spelar ks
      JOIN public.kamp k ON k.id = ks.kampid
      WHERE ks.id = kamp_spelar_id
        AND k.er_bekreftet = false
    )
  );
