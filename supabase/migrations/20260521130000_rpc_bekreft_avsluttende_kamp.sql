CREATE OR REPLACE FUNCTION public.bekreft_avsluttende_kamp_deltakar(
  p_kamp_id              INT,
  p_eliminert_kasterid   INT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevne_id    INT;
  v_runde_nummer INT;
BEGIN
  -- Caller must be a participant in this kamp or an admin
  IF NOT (
    public.min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.kamp_spelar ks
      JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
      WHERE ks.kampid = p_kamp_id
        AND bp.id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized: caller is not a participant in kamp %', p_kamp_id;
  END IF;

  -- Fetch kamp context (don't trust client-supplied stevne_id / runde_nummer)
  SELECT stevneid, runde_nummer
  INTO v_stevne_id, v_runde_nummer
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  -- Mark kamp as confirmed
  UPDATE public.kamp
  SET er_bekreftet = true
  WHERE id = p_kamp_id;

  -- Mark eliminated player (skip if none supplied)
  IF p_eliminert_kasterid IS NOT NULL THEN
    UPDATE public.resultat
    SET runde_eliminert = v_runde_nummer
    WHERE stevneid = v_stevne_id
      AND kasterid = p_eliminert_kasterid;
  END IF;
END;
$$;
