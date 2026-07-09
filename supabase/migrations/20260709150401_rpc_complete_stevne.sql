CREATE OR REPLACE FUNCTION public.complete_stevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klubbid      INT;
  v_dato         DATE;
  v_stevnetype   TEXT;
  v_year         INT;
BEGIN
  SELECT s.klubbid, s.dato, st.navn
  INTO v_klubbid, v_dato, v_stevnetype
  FROM public.stevne s
  LEFT JOIN public.stevnetype st ON st.id = s.stevnetypeid
  WHERE s.id = p_stevneid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;

  IF NOT (
    public.min_rolle() = 'admin'
    OR (
      public.min_rolle() = 'klubbadmin'
      AND EXISTS (
        SELECT 1 FROM public.klubbadmin_klubber kk
        WHERE kk.bruker_id = auth.uid() AND kk.klubbid = v_klubbid
      )
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to complete stevne %', p_stevneid;
  END IF;

  IF v_stevnetype IN ('NC', 'DNC', 'SNC') THEN
    v_year := EXTRACT(YEAR FROM v_dato);

    -- Placements with no matching point-table row score 0.
    UPDATE public.resultat r
    SET nc_poeng = 0
    WHERE r.stevneid = p_stevneid
      AND NOT EXISTS (
        SELECT 1 FROM public.norgescuppoeng np
        WHERE np.plassering = r.plassering
          AND np.gjelderfraaar <= v_year
          AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year)
      );

    UPDATE public.resultat r
    SET nc_poeng = CASE v_stevnetype
      WHEN 'NC'  THEN np.poengnc
      WHEN 'DNC' THEN np.poengdnc
      WHEN 'SNC' THEN CEIL(np.poengnc * 0.75)
    END
    FROM public.norgescuppoeng np
    WHERE r.stevneid = p_stevneid
      AND np.plassering = r.plassering
      AND np.gjelderfraaar <= v_year
      AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year);
  END IF;

  UPDATE public.stevne SET erfullfort = true WHERE id = p_stevneid;
END;
$$;
