-- ============================================================
-- Lock kamp / kamp_spelar / kamp_omgang / resultat once the
-- owning stevne is marked erfullfort = true. Enforced via
-- BEFORE triggers so it holds regardless of role, RLS policy,
-- or SECURITY DEFINER context (nothing in this app sets
-- session_replication_role = replica).
--
-- complete_stevne() recomputes resultat.nc_poeng BEFORE setting
-- erfullfort = true, so it keeps working unmodified - these
-- triggers only ever see erfullfort = true for writes that
-- happen strictly after that final UPDATE.
-- ============================================================

-- ── Helper: current completion state of a stevne (NULL-safe) ────────────────
CREATE OR REPLACE FUNCTION public.stevne_is_completed(p_stevneid INT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT erfullfort FROM public.stevne WHERE id = p_stevneid), false);
$$;

-- ── kamp (stevneid direct) ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_kamp_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.stevne_is_completed(OLD.stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp: stevne % er fullført', OLD.stevneid;
    END IF;
    RETURN OLD;
  END IF;

  IF public.stevne_is_completed(NEW.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre kamp: stevne % er fullført', NEW.stevneid;
  END IF;

  IF TG_OP = 'UPDATE' AND public.stevne_is_completed(OLD.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre kamp: stevne % er fullført', OLD.stevneid;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kamp_block_if_completed ON public.kamp;
CREATE TRIGGER kamp_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.kamp
FOR EACH ROW EXECUTE FUNCTION public.trg_kamp_block_if_completed();

-- ── kamp_spelar (resolve via kampid -> kamp.stevneid) ────────────────────────
CREATE OR REPLACE FUNCTION public.trg_kamp_spelar_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT stevneid INTO v_stevneid FROM public.kamp WHERE id = OLD.kampid;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_spelar: stevne % er fullført', v_stevneid;
    END IF;
    RETURN OLD;
  END IF;

  SELECT stevneid INTO v_stevneid FROM public.kamp WHERE id = NEW.kampid;
  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre kamp_spelar: stevne % er fullført', v_stevneid;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT stevneid INTO v_stevneid FROM public.kamp WHERE id = OLD.kampid;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_spelar: stevne % er fullført', v_stevneid;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kamp_spelar_block_if_completed ON public.kamp_spelar;
CREATE TRIGGER kamp_spelar_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.kamp_spelar
FOR EACH ROW EXECUTE FUNCTION public.trg_kamp_spelar_block_if_completed();

-- ── kamp_omgang (resolve via kamp_spelar_id -> kamp_spelar.kampid -> kamp.stevneid) ──
CREATE OR REPLACE FUNCTION public.trg_kamp_omgang_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT k.stevneid INTO v_stevneid
    FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
    WHERE ks.id = OLD.kamp_spelar_id;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
    END IF;
    RETURN OLD;
  END IF;

  SELECT k.stevneid INTO v_stevneid
  FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
  WHERE ks.id = NEW.kamp_spelar_id;
  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT k.stevneid INTO v_stevneid
    FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
    WHERE ks.id = OLD.kamp_spelar_id;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kamp_omgang_block_if_completed ON public.kamp_omgang;
CREATE TRIGGER kamp_omgang_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.kamp_omgang
FOR EACH ROW EXECUTE FUNCTION public.trg_kamp_omgang_block_if_completed();

-- ── resultat (stevneid direct, nullable) ─────────────────────────────────────
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

  IF public.stevne_is_completed(NEW.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre resultat: stevne % er fullført', NEW.stevneid;
  END IF;

  IF TG_OP = 'UPDATE' AND public.stevne_is_completed(OLD.stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre resultat: stevne % er fullført', OLD.stevneid;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resultat_block_if_completed ON public.resultat;
CREATE TRIGGER resultat_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.resultat
FOR EACH ROW EXECUTE FUNCTION public.trg_resultat_block_if_completed();

-- ============================================================
-- reopen_stevne: the counterpart to complete_stevne(). Same
-- admin/klubbadmin-ownership auth check, so undoing completion
-- is an explicit, authorized action rather than a raw checkbox
-- toggle.
-- ============================================================
CREATE OR REPLACE FUNCTION public.reopen_stevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klubbid INT;
BEGIN
  SELECT s.klubbid INTO v_klubbid
  FROM public.stevne s
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
    RAISE EXCEPTION 'Not authorized to reopen stevne %', p_stevneid;
  END IF;

  UPDATE public.stevne SET erfullfort = false WHERE id = p_stevneid;
END;
$$;
