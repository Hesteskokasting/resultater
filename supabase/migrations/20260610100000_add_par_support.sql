-- =============================================================================
-- Par/Mix support: add lag_id and posisjon to pamelding, posisjon to resultat,
-- and a trigger enforcing gender rules for Mix competitions.
-- =============================================================================

-- ── 1. pamelding: lag_id + posisjon ──────────────────────────────────────────
--
-- lag_id   : groups two (or more, for Lag) players into a team per stevne.
--            NULL for Singel registrations.
-- posisjon : court-side assignment — 1 = side A, 2 = side B (1–4 for Lag).
--            NULL for Singel registrations.

ALTER TABLE public.pamelding
  ADD COLUMN lag_id   integer,
  ADD COLUMN posisjon smallint;

-- ── 2. resultat: posisjon ────────────────────────────────────────────────────
--
-- Copied from pamelding.posisjon at match-generation time so that pair identity
-- and court-side are preserved after pamelding rows are deleted post-stevne.

ALTER TABLE public.resultat
  ADD COLUMN posisjon smallint;

-- ── 3. Mix gender trigger ────────────────────────────────────────────────────
--
-- Fires AFTER a pamelding row is inserted or its lag_id updated.
-- Raises P0001 if the stevne is Mix and the resulting lag group contains
-- two or more players who all share the same kjonnid.

CREATE OR REPLACE FUNCTION public.validate_mix_pamelding()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_is_mix        boolean;
  v_total_in_lag  integer;
  v_distinct_kjonn integer;
BEGIN
  -- Nothing to check when lag_id is cleared
  IF NEW.lag_id IS NULL THEN
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

  -- Count players and distinct genders in this lag (the INSERT/UPDATE has already landed)
  SELECT COUNT(*), COUNT(DISTINCT ka.kjonnid)
  INTO v_total_in_lag, v_distinct_kjonn
  FROM public.pamelding p
  JOIN public.kaster ka ON ka.id = p.kasterid
  WHERE p.stevneid = NEW.stevneid
    AND p.lag_id = NEW.lag_id;

  -- Only enforce when the pair is complete (2+ players assigned)
  IF v_total_in_lag >= 2 AND v_distinct_kjonn < 2 THEN
    RAISE EXCEPTION 'Mix-par krev ein mannleg og ein kvinneleg spelar'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_mix_pamelding_trigger ON public.pamelding;
CREATE TRIGGER validate_mix_pamelding_trigger
  AFTER INSERT OR UPDATE OF lag_id ON public.pamelding
  FOR EACH ROW EXECUTE FUNCTION public.validate_mix_pamelding();
