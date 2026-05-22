ALTER TABLE public.kamp_spelar DROP COLUMN posisjon;

-- Advancing players get rank 1, 2, … ordered by kasterid (stable arbitrary order).
-- posisjon was only meaningful for 2v2 which is not implemented.
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
  v_stevne_id           INT;
  v_runde_nummer        INT;
  v_runde_navn          TEXT;
  v_vinnar_kasterid     INT;
  v_total_spelarar      INT;
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

  -- Write per-match rank to kamp_spelar for display.
  -- Must happen here (SECURITY DEFINER) because the RLS policy on kamp_spelar
  -- only allows participant updates when er_bekreftet = false.
  IF p_eliminert_kasterid IS NOT NULL THEN
    SELECT COUNT(*) INTO v_total_spelarar
    FROM public.kamp_spelar
    WHERE kampid = p_kamp_id;

    -- Eliminated player gets the last rank (e.g. 2 for 2-player, 3 for 3-player)
    UPDATE public.kamp_spelar
    SET kamp_plassering = v_total_spelarar
    WHERE kampid = p_kamp_id
      AND kasterid = p_eliminert_kasterid;

    -- Advancing players get rank 1, 2, … ordered by kasterid
    UPDATE public.kamp_spelar ks
    SET kamp_plassering = sub.rn
    FROM (
      SELECT kasterid, ROW_NUMBER() OVER (ORDER BY kasterid) AS rn
      FROM public.kamp_spelar
      WHERE kampid = p_kamp_id AND kasterid != p_eliminert_kasterid
    ) sub
    WHERE ks.kampid = p_kamp_id AND ks.kasterid = sub.kasterid;
  END IF;

  -- Semifinale losers are not finally eliminated — they advance to bronsefinale
  IF v_runde_navn = 'Semifinale' THEN
    RETURN;
  END IF;

  -- Mark eliminated player (skip if none supplied)
  IF p_eliminert_kasterid IS NOT NULL THEN
    IF v_runde_navn NOT IN ('Finale', 'Bronsefinale') THEN
      UPDATE public.resultat
      SET runde_eliminert = v_runde_nummer
      WHERE stevneid = v_stevne_id
        AND kasterid = p_eliminert_kasterid;
    ELSE
      -- Finale/Bronsefinale: derive winner, write plassering, mark loser eliminated
      SELECT kasterid INTO v_vinnar_kasterid
      FROM public.kamp_spelar
      WHERE kampid = p_kamp_id
        AND kasterid != p_eliminert_kasterid
      LIMIT 1;

      -- Reset runde_eliminert for both participants before re-writing
      UPDATE public.resultat
      SET runde_eliminert = NULL
      WHERE stevneid = v_stevne_id
        AND kasterid IN (p_eliminert_kasterid, v_vinnar_kasterid);

      -- Loser is finally eliminated
      UPDATE public.resultat
      SET runde_eliminert = v_runde_nummer
      WHERE stevneid = v_stevne_id
        AND kasterid = p_eliminert_kasterid;

      -- Write final tournament placement
      IF v_runde_navn = 'Finale' THEN
        UPDATE public.resultat SET plassering = 1
        WHERE stevneid = v_stevne_id AND kasterid = v_vinnar_kasterid;
        UPDATE public.resultat SET plassering = 2
        WHERE stevneid = v_stevne_id AND kasterid = p_eliminert_kasterid;
      ELSIF v_runde_navn = 'Bronsefinale' THEN
        UPDATE public.resultat SET plassering = 3
        WHERE stevneid = v_stevne_id AND kasterid = v_vinnar_kasterid;
        UPDATE public.resultat SET plassering = 4
        WHERE stevneid = v_stevne_id AND kasterid = p_eliminert_kasterid;
      END IF;
    END IF;
  END IF;
END;
$$;
