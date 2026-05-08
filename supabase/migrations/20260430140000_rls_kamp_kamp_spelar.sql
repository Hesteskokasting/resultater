-- ============================================================
-- RLS for kamp og kamp_spelar
-- ============================================================

-- ------------------------------------------------------------
-- kamp
-- ------------------------------------------------------------
ALTER TABLE public.kamp ENABLE ROW LEVEL SECURITY;

-- Spelarar kan bekrefte eigen kamp (berre sette er_bekreftet: false → true)
DROP POLICY IF EXISTS "kamp_bekreft_deltakar" ON public.kamp;
CREATE POLICY "kamp_bekreft_deltakar" ON public.kamp FOR UPDATE
  USING (
    er_bekreftet = false
    AND EXISTS (
      SELECT 1 FROM public.kamp_spelar ks
      JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
      WHERE ks.kampid = kamp.id AND bp.id = auth.uid()
    )
  )
  WITH CHECK (er_bekreftet = true);

-- ------------------------------------------------------------
-- kamp_spelar
-- ------------------------------------------------------------
ALTER TABLE public.kamp_spelar ENABLE ROW LEVEL SECURITY;


-- Spelarar kan oppdatere poeng i ein kamp dei deltek i, men berre så lenge kampen ikkje er bekrefta
DROP POLICY IF EXISTS "kamp_spelar_update_deltakar" ON public.kamp_spelar;
CREATE POLICY "kamp_spelar_update_deltakar" ON public.kamp_spelar FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.kamp k
      JOIN public.kamp_spelar participant ON participant.kampid = k.id
      JOIN public.bruker_profil bp ON bp.kasterid = participant.kasterid
      WHERE k.id = kampid AND bp.id = auth.uid() AND k.er_bekreftet = false
    )
  )
  WITH CHECK (true);
