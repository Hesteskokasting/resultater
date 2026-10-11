-- kamp_plassering is now computed by the client (confirmMatch) and written with
-- the scores: ranked by side total with ties sharing a place (1-1-3), or by the
-- finishing order of a 3-player race.
--
-- bekreft_innledende_kamp: also writes kamp_plassering from p_scores. Older
-- clients leave it out, which keeps the stored value.
--
-- bekreft_avsluttende_kamp_deltakar: no longer overwrites a placement the client
-- already wrote (it set every non-eliminated side to 1, so a 3-player match
-- became 1-1-3). The old 1/N write stays as the fallback for older clients.

CREATE OR REPLACE FUNCTION public.bekreft_innledende_kamp(
  p_kamp_id INT,
  p_scores  JSONB
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_er_admin      boolean;
  v_er_bekreftet  boolean;
  v_fase          text;
  v_framande      int;
BEGIN
  v_er_admin := public.min_rolle() = 'admin';

  IF NOT (
    v_er_admin
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

  SELECT er_bekreftet, fase INTO v_er_bekreftet, v_fase
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  -- A cup kamp settles through bekreft_avsluttende_kamp_deltakar, which also
  -- writes the bracket. Confirming one here would leave it half-settled.
  IF v_fase <> 'innledende' THEN
    RAISE EXCEPTION 'Kamp % er ikkje ein innleiande kamp', p_kamp_id;
  END IF;

  IF v_er_bekreftet AND NOT v_er_admin THEN
    RETURN false;
  END IF;

  -- The ids come from the client, so they are checked rather than trusted.
  SELECT count(*) INTO v_framande
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb)) AS s(kamp_spelar_id int)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kamp_spelar ks
    WHERE ks.id = s.kamp_spelar_id AND ks.kampid = p_kamp_id
  );

  IF v_framande > 0 THEN
    RAISE EXCEPTION 'kamp_spelar-rader høyrer ikkje til kamp %', p_kamp_id;
  END IF;

  UPDATE public.kamp_spelar ks
  SET score_poeng   = s.score_poeng,
      kamp_poeng    = s.kamp_poeng,
      antall_ringer = s.antall_ringer,
      kamp_plassering = COALESCE(s.kamp_plassering, ks.kamp_plassering)
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb))
    AS s(kamp_spelar_id int, score_poeng int, kamp_poeng real, antall_ringer int, kamp_plassering int)
  WHERE ks.id = s.kamp_spelar_id
    AND ks.kampid = p_kamp_id;

  UPDATE public.kamp SET er_bekreftet = true WHERE id = p_kamp_id;

  RETURN true;
END;
$$;

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

    -- Fallback per-match rank for clients that do not write kamp_plassering
    -- with the scores; a placement already written is left alone.
    UPDATE public.kamp_spelar
    SET kamp_plassering = v_antall_sider
    WHERE kampid = p_kamp_id
      AND kasterid = ANY(v_eliminert_kasterids)
      AND kamp_plassering IS NULL;

    UPDATE public.kamp_spelar
    SET kamp_plassering = 1
    WHERE kampid = p_kamp_id
      AND NOT (kasterid = ANY(v_eliminert_kasterids))
      AND kamp_plassering IS NULL;
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
