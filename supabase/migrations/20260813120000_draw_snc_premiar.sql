-- Random prize draw for a consolidated SNC round (cf. issue #41, minimum version).
--
-- An admin picks a percentage; the function draws that share of the round's
-- placed participants at random and flags them with resultat.erpremie. The three
-- top-ranked are never drawn — they have prizes for placing.
--
-- A round is drawn once. Drawing again would let an admin keep pulling until they
-- liked the outcome, so a second draw is refused: clear_snc_premiar resets the
-- round and only then can it be drawn afresh.

-- ── The completed-stevne lock, opened for erpremie ────────────────────────────
-- The draw runs after the round is consolidated, so every local stevne is
-- fullført and trg_resultat_block_if_completed (20260709160000) blocks the
-- UPDATE regardless of SECURITY DEFINER — the same problem consolidation had in
-- 20260803130239. Allow exactly what the draw does: an UPDATE touching nothing
-- but erpremie, on a local stevne whose umbrella is consolidated.

CREATE OR REPLACE FUNCTION public.snc_kan_trekke_premie(p_stevneid INT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.stevne lokal
    JOIN public.stevne hovud ON hovud.id = lokal.snc_hovudstevne_id
    WHERE lokal.id = p_stevneid AND hovud.erfullfort
  );
$$;

CREATE OR REPLACE FUNCTION public.trg_resultat_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.stevne_is_completed(OLD.stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre resultat: stevne % er fullført', OLD.stevneid;
    END IF;
    RETURN OLD;
  END IF;

  -- Consolidation: snc_plassering/nc_poeng while the umbrella is still open.
  IF TG_OP = 'UPDATE'
     AND OLD.stevneid IS NOT DISTINCT FROM NEW.stevneid
     AND public.snc_kan_konsolidere(OLD.stevneid)
     AND (to_jsonb(OLD) - 'snc_plassering' - 'nc_poeng')
         = (to_jsonb(NEW) - 'snc_plassering' - 'nc_poeng') THEN
    RETURN NEW;
  END IF;

  -- Prize draw: erpremie only, once the umbrella is consolidated.
  IF TG_OP = 'UPDATE'
     AND OLD.stevneid IS NOT DISTINCT FROM NEW.stevneid
     AND public.snc_kan_trekke_premie(OLD.stevneid)
     AND (to_jsonb(OLD) - 'erpremie') = (to_jsonb(NEW) - 'erpremie') THEN
    RETURN NEW;
  END IF;

  IF public.stevne_is_completed(NEW.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre resultat: stevne % er fullført', NEW.stevneid;
  END IF;

  IF TG_OP = 'UPDATE' AND public.stevne_is_completed(OLD.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre resultat: stevne % er fullført', OLD.stevneid;
  END IF;

  RETURN NEW;
END;
$$;

-- ── The draw ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.draw_snc_premiar(p_stevneid INT, p_prosent NUMERIC)
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
  IF p_prosent IS NULL OR p_prosent <= 0 OR p_prosent > 100 THEN
    RAISE EXCEPTION 'Prosenten må vere mellom 0 og 100, fekk %', p_prosent;
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

  v_antal := LEAST(CEIL(v_plasserte * p_prosent / 100.0)::INT, v_kandidatar);
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

-- ── Clearing a draw ──────────────────────────────────────────────────────────
-- The counterpart to the once-only rule: an admin who drew by mistake resets the
-- round and draws again, rather than topping the draw up.

CREATE OR REPLACE FUNCTION public.clear_snc_premiar(p_stevneid INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hovud public.stevne;
  v_antal INT;
BEGIN
  SELECT * INTO v_hovud FROM public.stevne WHERE id = p_stevneid;
  IF v_hovud.id IS NULL OR NOT v_hovud.er_snc_hovudstevne THEN
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
    RAISE EXCEPTION 'Not authorized to clear the prize draw for stevne %', p_stevneid;
  END IF;

  UPDATE public.resultat r
  SET erpremie = NULL
  FROM public.stevne s
  WHERE s.id = r.stevneid
    AND s.snc_hovudstevne_id = p_stevneid
    AND r.erpremie;

  GET DIAGNOSTICS v_antal = ROW_COUNT;
  RETURN v_antal;
END;
$$;

-- ── EXECUTE grants (cf. 20260710110100 / 20260710110200) ─────────────────────

REVOKE EXECUTE ON FUNCTION public.draw_snc_premiar(integer, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.draw_snc_premiar(integer, numeric) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.clear_snc_premiar(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_snc_premiar(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.snc_kan_trekke_premie(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_resultat_block_if_completed() FROM PUBLIC, anon, authenticated;
