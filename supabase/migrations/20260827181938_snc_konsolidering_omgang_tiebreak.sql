-- ============================================================
-- SNC consolidation: single-omgang tiebreak
--
-- complete_snc_hovudstevne ranked on total -> hovudpoeng ->
-- hovudringar -> X-kast poeng -> X-kast ringar, because resultat
-- stores only the sums. That put the better innledende result
-- ahead of the better single omgang, which contradicts the
-- ranking the app itself uses (utils/xkastKongelag/xkastStandings.ts).
--
-- The omganger are reachable from xkast_kongelag_omgang, so they
-- now come in as criterion 4, ahead of the innledende figures.
-- Postgres compares arrays element by element and sorts a shorter
-- prefix first, which matches compareOmgangArrays (a missing
-- omgang counts as -1). Participants with a directly-entered
-- total have no omgang rows and so rank last on this criterion,
-- exactly as they do in the app. The X-kast figures stay on as
-- criteria 5-6, which is what imported stevner without omgang
-- rows fall back to.
-- ============================================================

CREATE OR REPLACE FUNCTION public.complete_snc_hovudstevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hovud       public.stevne;
  v_year        INT;
  v_omganger    INT;
  v_faktor      NUMERIC;
  v_har_innl    BOOLEAN;
  v_har_avsl    BOOLEAN;
  v_begge       BOOLEAN;
  v_fase        TEXT;
  v_antal_lokal INT;
  v_uferdige    INT;
BEGIN
  SELECT * INTO v_hovud FROM public.stevne WHERE id = p_stevneid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;
  IF NOT v_hovud.er_snc_hovudstevne THEN
    RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', p_stevneid;
  END IF;

  IF NOT (
    public.min_rolle() = 'admin'
    OR (
      public.min_rolle() = 'klubbadmin'
      AND EXISTS (
        SELECT 1 FROM public.klubbadmin_klubber kk
        WHERE kk.bruker_id = auth.uid() AND kk.klubbid = v_hovud.klubbid
      )
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to complete stevne %', p_stevneid;
  END IF;

  IF v_hovud.erfullfort THEN
    RAISE EXCEPTION 'SNC-hovudstevne % er allereie konsolidert', p_stevneid;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE NOT erfullfort)
  INTO v_antal_lokal, v_uferdige
  FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid;

  IF v_antal_lokal = 0 THEN
    RAISE EXCEPTION 'SNC-hovudstevne % har ingen lokalstevne', p_stevneid;
  END IF;
  IF v_uferdige > 0 THEN
    RAISE EXCEPTION '% av % lokalstevne er ikkje fullførte enno', v_uferdige, v_antal_lokal;
  END IF;

  v_har_innl := v_hovud.innledendekastemetodeid IS NOT NULL;
  v_har_avsl := v_hovud.avsluttendekastemetodeid IS NOT NULL;
  v_begge    := v_har_innl AND v_har_avsl;

  -- The omganger that decide the tiebreak are the ones from the phase the
  -- ranking is built on: Kongelag when there is one, else X-kast innledende.
  v_fase := CASE WHEN v_har_avsl THEN 'avsluttende' ELSE 'innledende' END;

  IF v_begge THEN
    SELECT antall_omganger INTO v_omganger
    FROM public.kastemetode WHERE id = v_hovud.innledendekastemetodeid;
    IF COALESCE(v_omganger, 0) <= 0 THEN
      RAISE EXCEPTION 'Innleiande kastemetode manglar antall_omganger — kan ikkje rekne overføring';
    END IF;
    v_faktor := 100.0 / (v_omganger * 20);
  ELSE
    v_faktor := 0;
  END IF;

  UPDATE public.resultat r
  SET snc_plassering = rangert.pl
  FROM (
    SELECT
      x.id,
      RANK() OVER (ORDER BY x.total DESC, x.hovudpoeng DESC, x.hovudringar DESC,
                            x.omgangar DESC, x.bipoeng DESC, x.biringar DESC) AS pl
    FROM (
      SELECT
        r2.id,
        CASE
          WHEN v_begge THEN COALESCE(r2.poeng_kongelag, 0)
                            + ROUND(COALESCE(r2.poeng_xkast, 0) * v_faktor)
          WHEN v_har_avsl THEN COALESCE(r2.poeng_kongelag, 0)
          ELSE COALESCE(r2.poeng_xkast, 0)
        END AS total,
        CASE WHEN v_har_avsl THEN COALESCE(r2.poeng_kongelag, 0)
             ELSE COALESCE(r2.poeng_xkast, 0) END AS hovudpoeng,
        CASE WHEN v_har_avsl THEN COALESCE(r2.antall_ring_kongelag, 0)
             ELSE COALESCE(r2.antall_ring_xkast, 0) END AS hovudringar,
        COALESCE(omg.poeng_desc, '{}'::int[]) AS omgangar,
        CASE WHEN v_begge THEN COALESCE(r2.poeng_xkast, 0) ELSE 0 END AS bipoeng,
        CASE WHEN v_begge THEN COALESCE(r2.antall_ring_xkast, 0) ELSE 0 END AS biringar
      FROM public.resultat r2
      JOIN public.stevne s ON s.id = r2.stevneid
      LEFT JOIN LATERAL (
        SELECT array_agg(o.poeng ORDER BY o.poeng DESC) AS poeng_desc
        FROM public.xkast_kongelag k
        JOIN public.xkast_kongelag_deltaker d ON d.xkast_kongelag_id = k.id
        JOIN public.xkast_kongelag_omgang o ON o.xkast_kongelag_deltaker_id = d.id
        WHERE k.stevneid = r2.stevneid
          AND k.fase = v_fase
          AND d.kasterid = r2.kasterid
      ) omg ON true
      WHERE s.snc_hovudstevne_id = p_stevneid AND r2.kasterid IS NOT NULL
    ) x
  ) rangert
  WHERE r.id = rangert.id;

  -- NC points from the merged placement: SNC scores 75 % of the NC table, as
  -- before, and placements with no row in it score 0.
  v_year := EXTRACT(YEAR FROM v_hovud.dato);

  UPDATE public.resultat r
  SET nc_poeng = 0
  WHERE r.stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid)
    AND NOT EXISTS (
      SELECT 1 FROM public.norgescuppoeng np
      WHERE np.plassering = r.snc_plassering
        AND np.gjelderfraaar <= v_year
        AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year)
    );

  UPDATE public.resultat r
  SET nc_poeng = CEIL(np.poengnc * 0.75)
  FROM public.norgescuppoeng np
  WHERE r.stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid)
    AND np.plassering = r.snc_plassering
    AND np.gjelderfraaar <= v_year
    AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year);

  UPDATE public.stevne SET erfullfort = true WHERE id = p_stevneid;
END;
$$;
