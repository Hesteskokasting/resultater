-- draw_snc_premiar, take two (20260813120000 is the original):
--
--  * The percentage rounds DOWN. A tenth of 67 throwers is 6 prizes, not 7 —
--    CEIL handed out one prize more than the share allows.
--  * An exact number can be given instead of a percentage, for the rounds where
--    the club simply has N prizes on the table. Exactly one of the two: two
--    answers to "how many" would leave the caller guessing which one was used.
--
-- The old two-argument function is dropped rather than left alongside: with
-- DEFAULT NULL on the new one, draw_snc_premiar(id, 10) would match both and
-- Postgres would refuse the call as ambiguous.

DROP FUNCTION IF EXISTS public.draw_snc_premiar(integer, numeric);

CREATE OR REPLACE FUNCTION public.draw_snc_premiar(
  p_stevneid INT,
  p_prosent  NUMERIC DEFAULT NULL,
  p_antal    INT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hovud      public.stevne;
  v_plasserte  INT;
  v_kandidatar INT;
  v_alt_trekt  INT;
  v_antal      INT;
BEGIN
  IF (p_prosent IS NULL) = (p_antal IS NULL) THEN
    RAISE EXCEPTION 'Oppgi anten prosent eller tal på premiar, ikkje begge';
  END IF;

  IF p_prosent IS NOT NULL AND (p_prosent <= 0 OR p_prosent > 100) THEN
    RAISE EXCEPTION 'Prosenten må vere mellom 0 og 100, fekk %', p_prosent;
  END IF;

  IF p_antal IS NOT NULL AND p_antal <= 0 THEN
    RAISE EXCEPTION 'Talet på premiar må vere større enn 0, fekk %', p_antal;
  END IF;

  SELECT * INTO v_hovud FROM public.stevne WHERE id = p_stevneid;
  IF v_hovud.id IS NULL OR NOT v_hovud.er_snc_hovudstevne THEN
    RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', p_stevneid;
  END IF;
  IF NOT v_hovud.erfullfort THEN
    RAISE EXCEPTION 'SNC-hovudstevne % er ikkje konsolidert enno', p_stevneid;
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
    RAISE EXCEPTION 'Not authorized to draw prizes for stevne %', p_stevneid;
  END IF;

  -- The percentage counts every placed participant; the top three are only
  -- barred from being drawn.
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE r.snc_plassering > 3 AND r.erpremie IS NOT TRUE),
    COUNT(*) FILTER (WHERE r.snc_plassering > 3 AND r.erpremie)
  INTO v_plasserte, v_kandidatar, v_alt_trekt
  FROM public.resultat r
  JOIN public.stevne s ON s.id = r.stevneid
  WHERE s.snc_hovudstevne_id = p_stevneid
    AND r.snc_plassering IS NOT NULL;

  IF v_plasserte = 0 THEN
    RAISE EXCEPTION 'SNC-hovudstevne % har ingen plasserte deltakarar', p_stevneid;
  END IF;

  IF v_alt_trekt > 0 THEN
    RAISE EXCEPTION
      'Premiar er alt trekte for SNC-hovudstevne % — nullstill trekninga før du trekkjer på nytt',
      p_stevneid;
  END IF;

  v_antal := LEAST(
    COALESCE(p_antal, FLOOR(v_plasserte * p_prosent / 100.0)::INT),
    v_kandidatar
  );
  IF v_antal <= 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.resultat
  SET erpremie = true
  WHERE id IN (
    SELECT r.id
    FROM public.resultat r
    JOIN public.stevne s ON s.id = r.stevneid
    WHERE s.snc_hovudstevne_id = p_stevneid
      AND r.snc_plassering > 3
      AND r.erpremie IS NOT TRUE
    ORDER BY random()
    LIMIT v_antal
  );

  RETURN v_antal;
END;
$$;

-- ── EXECUTE grants (cf. 20260710110100 / 20260710110200) ─────────────────────
-- The dropped function took its grants with it, so the new signature needs its own.

REVOKE EXECUTE ON FUNCTION public.draw_snc_premiar(integer, numeric, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.draw_snc_premiar(integer, numeric, integer) TO authenticated;
