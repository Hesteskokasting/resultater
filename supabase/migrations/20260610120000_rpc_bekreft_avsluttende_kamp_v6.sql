-- v6: Par/Mix support — resolve the eliminated UNIT from resultat.startnummer.
-- Same signature as v5. The eliminated kasterid's startnummer identifies the
-- side; everyone sharing it (the pair partner) gets the same elimination
-- writes. For Singel every startnummer group has one member, so behavior is
-- byte-identical to v5.
--
-- Also fixes the eliminated kamp_plassering for multi-member sides: place is
-- the number of SIDES in the kamp (distinct startnummer), not the number of
-- kamp_spelar rows (a Par match has 4 rows but 2 sides).

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
  v_stevne_id            INT;
  v_runde_nummer         INT;
  v_runde_navn           TEXT;
  v_eliminert_snr        INT;
  v_eliminert_kasterids  INT[];
  v_vinnar_kasterids     INT[];
  v_antall_sider         INT;
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

  -- Fetch kamp context (don't trust client-supplied values)
  SELECT stevneid, runde_nummer, runde_navn
  INTO v_stevne_id, v_runde_nummer, v_runde_navn
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  -- Mark kamp as confirmed
  UPDATE public.kamp
  SET er_bekreftet = true
  WHERE id = p_kamp_id;

  IF p_eliminert_kasterid IS NOT NULL THEN
    -- Resolve the eliminated SIDE: all kasterids sharing the eliminated
    -- player's startnummer (the pair). Singel: the player alone.
    SELECT startnummer INTO v_eliminert_snr
    FROM public.resultat
    WHERE stevneid = v_stevne_id AND kasterid = p_eliminert_kasterid;

    IF v_eliminert_snr IS NULL THEN
      v_eliminert_kasterids := ARRAY[p_eliminert_kasterid];
    ELSE
      SELECT array_agg(kasterid) INTO v_eliminert_kasterids
      FROM public.resultat
      WHERE stevneid = v_stevne_id
        AND startnummer = v_eliminert_snr
        AND kasterid IS NOT NULL;
    END IF;

    -- Number of SIDES in the kamp (players without startnummer count as
    -- their own side via the negated-kasterid fallback)
    SELECT COUNT(DISTINCT COALESCE(r.startnummer, -ks.kasterid)) INTO v_antall_sider
    FROM public.kamp_spelar ks
    LEFT JOIN public.resultat r
      ON r.stevneid = v_stevne_id AND r.kasterid = ks.kasterid
    WHERE ks.kampid = p_kamp_id;

    -- Write per-match rank to kamp_spelar for display.
    -- Must happen here (SECURITY DEFINER) because the RLS policy on kamp_spelar
    -- only allows participant updates when er_bekreftet = false.
    UPDATE public.kamp_spelar
    SET kamp_plassering = v_antall_sider
    WHERE kampid = p_kamp_id
      AND kasterid = ANY(v_eliminert_kasterids);

    UPDATE public.kamp_spelar
    SET kamp_plassering = 1
    WHERE kampid = p_kamp_id
      AND NOT (kasterid = ANY(v_eliminert_kasterids));
  END IF;

  -- Semifinale losers advance to bronsefinale — no runde_eliminert change
  IF v_runde_navn = 'Semifinale' THEN
    RETURN;
  END IF;

  IF p_eliminert_kasterid IS NOT NULL THEN
    IF v_runde_navn IN ('Finale', 'Bronsefinale') THEN
      SELECT array_agg(DISTINCT ks.kasterid) INTO v_vinnar_kasterids
      FROM public.kamp_spelar ks
      WHERE ks.kampid = p_kamp_id
        AND ks.kasterid IS NOT NULL
        AND NOT (ks.kasterid = ANY(v_eliminert_kasterids));

      IF v_runde_navn = 'Finale' THEN
        UPDATE public.resultat SET plassering = 1
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_kasterids);
        UPDATE public.resultat SET plassering = 2
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert_kasterids);
      ELSIF v_runde_navn = 'Bronsefinale' THEN
        UPDATE public.resultat SET plassering = 3
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_kasterids);
        UPDATE public.resultat SET plassering = 4
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert_kasterids);
      END IF;
    ELSE
      UPDATE public.resultat
      SET runde_eliminert = v_runde_nummer
      WHERE stevneid = v_stevne_id
        AND kasterid = ANY(v_eliminert_kasterids);
    END IF;
  END IF;
END;
$$;
