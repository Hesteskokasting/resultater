-- =============================================================================
-- Mix gender rule v2: per-row position check.
--
-- The v1 trigger compared the genders of BOTH rows in the lag group. opprettPar
-- issues two UPDATEs in separate transactions; each trigger ran against a
-- snapshot where the other row was not yet updated, so a same-gender pair
-- slipped through whenever the updates overlapped (reliably on retry).
--
-- v2 validates each row independently — no cross-row query, no race:
-- in a Mix stevne, posisjon 1 (side A) must be a woman and posisjon 2 (side B)
-- a man. This is also the actual Mix rule: women throw against women and men
-- against men, so the sides are gender-fixed.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_mix_pamelding()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_is_mix boolean;
  v_kjonn  text;
BEGIN
  -- Nothing to check when the row is not part of a pair
  IF NEW.lag_id IS NULL OR NEW.posisjon IS NULL THEN
    RETURN NEW;
  END IF;

  -- Is this a Mix stevne?
  SELECT (k.navn ILIKE '%mix%')
  INTO v_is_mix
  FROM public.stevne s
  JOIN public.kategori k ON k.id = s.kategoriid
  WHERE s.id = NEW.stevneid;

  IF NOT COALESCE(v_is_mix, false) THEN
    RETURN NEW;
  END IF;

  -- This player's gender ('K' = kvinne, 'M' = mann)
  SELECT UPPER(LEFT(kj.navn, 1))
  INTO v_kjonn
  FROM public.kaster ka
  JOIN public.kjonn kj ON kj.id = ka.kjonnid
  WHERE ka.id = NEW.kasterid;

  IF NEW.posisjon = 1 AND v_kjonn IS DISTINCT FROM 'K' THEN
    RAISE EXCEPTION 'Mix: Side A (posisjon 1) må vere ei kvinne'
      USING ERRCODE = 'P0001';
  ELSIF NEW.posisjon = 2 AND v_kjonn IS DISTINCT FROM 'M' THEN
    RAISE EXCEPTION 'Mix: Side B (posisjon 2) må vere ein mann'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Re-create the trigger so it also fires when posisjon changes
DROP TRIGGER IF EXISTS validate_mix_pamelding_trigger ON public.pamelding;
CREATE TRIGGER validate_mix_pamelding_trigger
  AFTER INSERT OR UPDATE OF lag_id, posisjon ON public.pamelding
  FOR EACH ROW EXECUTE FUNCTION public.validate_mix_pamelding();
