-- ============================================================
-- X-kast / Kongelag — manual totals & score editing
--
-- Admins can (1) enter a total poeng/ringere directly on a
-- deltaker, skipping omgang entry; (2) edit an existing omgang;
-- (3) switch a player to a manual total (deleting omganger).
--
-- New column xkast_kongelag_deltaker.totalsum_manuelt marks a
-- directly-entered total so the standing, completeness check,
-- and confirm aggregation use deltaker.poeng instead of summing
-- (non-existent) omgang rows.
--
-- Editing is allowed after a court is confirmed — the edit RPCs
-- re-sync resultat. Fullførte stevner stay blocked by the
-- existing block-if-completed triggers (they fire on the omgang/
-- deltaker writes regardless of SECURITY DEFINER, rolling the
-- whole RPC back).
-- ============================================================

ALTER TABLE public.xkast_kongelag_deltaker
  ADD COLUMN totalsum_manuelt boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.xkast_kongelag_deltaker.totalsum_manuelt IS
  'true = poeng/antall_ringer entered directly (no omgang rows). Standing/complete/confirm use these totals as-is instead of summing omganger.';

-- ------------------------------------------------------------
-- Helper: aggregate a court's deltaker totals and write them to
-- resultat. Manual totals are kept as-is; the rest are summed
-- from their omgang rows. Does NOT set er_bekreftet — shared by
-- confirm (which then locks the court) and the edit RPCs (which
-- re-sync a already-confirmed court).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._sync_xkast_kongelag_resultat(
  p_xkast_kongelag_id INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid INT;
  v_fase     TEXT;
BEGIN
  SELECT stevneid, fase INTO v_stevneid, v_fase
  FROM public.xkast_kongelag
  WHERE id = p_xkast_kongelag_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag % not found', p_xkast_kongelag_id;
  END IF;

  -- Aggregate omgang rows into the deltaker totals (manual totals kept)
  UPDATE public.xkast_kongelag_deltaker d
  SET
    poeng = CASE WHEN d.totalsum_manuelt THEN d.poeng ELSE COALESCE((
      SELECT SUM(o.poeng) FROM public.xkast_kongelag_omgang o
      WHERE o.xkast_kongelag_deltaker_id = d.id
    ), 0) END,
    antall_ringer = CASE WHEN d.totalsum_manuelt THEN d.antall_ringer ELSE COALESCE((
      SELECT SUM(o.antall_ringer) FROM public.xkast_kongelag_omgang o
      WHERE o.xkast_kongelag_deltaker_id = d.id
    ), 0) END
  WHERE d.xkast_kongelag_id = p_xkast_kongelag_id;

  -- Write to resultat (fase decides the columns)
  IF v_fase = 'innledende' THEN
    UPDATE public.resultat r
    SET poeng_xkast = d.poeng, antall_ring_xkast = d.antall_ringer
    FROM public.xkast_kongelag_deltaker d
    WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
      AND r.stevneid = v_stevneid AND r.kasterid = d.kasterid;
  ELSE
    UPDATE public.resultat r
    SET poeng_kongelag = d.poeng, antall_ring_kongelag = d.antall_ringer
    FROM public.xkast_kongelag_deltaker d
    WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
      AND r.stevneid = v_stevneid AND r.kasterid = d.kasterid;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._sync_xkast_kongelag_resultat(integer) FROM PUBLIC;

-- ------------------------------------------------------------
-- confirm_xkast_kongelag — now delegates aggregation to the
-- helper (which respects totalsum_manuelt) then locks the court.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_xkast_kongelag(
  p_xkast_kongelag_id INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid INT;
  v_missing  INT;
BEGIN
  IF NOT (
    public.min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.xkast_kongelag_deltaker d
      JOIN public.bruker_profil bp ON bp.kasterid = d.kasterid
      WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
        AND bp.id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized: caller is not a participant on xkast_kongelag %', p_xkast_kongelag_id;
  END IF;

  SELECT stevneid INTO v_stevneid
  FROM public.xkast_kongelag
  WHERE id = p_xkast_kongelag_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag % not found', p_xkast_kongelag_id;
  END IF;

  SELECT COUNT(*) INTO v_missing
  FROM public.xkast_kongelag_deltaker d
  WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
    AND NOT EXISTS (
      SELECT 1 FROM public.resultat r
      WHERE r.stevneid = v_stevneid AND r.kasterid = d.kasterid
    );

  IF v_missing > 0 THEN
    RAISE EXCEPTION 'Cannot confirm xkast_kongelag %: % participant(s) have no resultat row for stevne %',
      p_xkast_kongelag_id, v_missing, v_stevneid;
  END IF;

  PERFORM public._sync_xkast_kongelag_resultat(p_xkast_kongelag_id);

  UPDATE public.xkast_kongelag
  SET er_bekreftet = true
  WHERE id = p_xkast_kongelag_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_xkast_kongelag(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_xkast_kongelag(integer) TO authenticated;

-- ------------------------------------------------------------
-- edit_xkast_kongelag_omgang — admin upsert of one omgang.
-- Rejected for manual-total players (they have no omganger).
-- Re-syncs resultat when the court is already confirmed.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.edit_xkast_kongelag_omgang(
  p_deltaker_id    INT,
  p_omgang         INT,
  p_poeng          INT,
  p_antall_ringer  INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_court_id  INT;
  v_manuelt   BOOLEAN;
  v_bekreftet BOOLEAN;
BEGIN
  IF public.min_rolle() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Not authorized: only admins can edit omganger';
  END IF;

  SELECT d.xkast_kongelag_id, d.totalsum_manuelt, xk.er_bekreftet
  INTO v_court_id, v_manuelt, v_bekreftet
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = p_deltaker_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag_deltaker % not found', p_deltaker_id;
  END IF;

  IF v_manuelt THEN
    RAISE EXCEPTION 'Cannot edit an omgang: participant % has a manual total', p_deltaker_id;
  END IF;

  -- poeng/ringer bounds and consistency are enforced by the table CHECKs
  INSERT INTO public.xkast_kongelag_omgang (xkast_kongelag_deltaker_id, omgang, poeng, antall_ringer)
  VALUES (p_deltaker_id, p_omgang, p_poeng, p_antall_ringer)
  ON CONFLICT (xkast_kongelag_deltaker_id, omgang)
  DO UPDATE SET poeng = EXCLUDED.poeng, antall_ringer = EXCLUDED.antall_ringer;

  IF v_bekreftet THEN
    PERFORM public._sync_xkast_kongelag_resultat(v_court_id);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.edit_xkast_kongelag_omgang(integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.edit_xkast_kongelag_omgang(integer, integer, integer, integer) TO authenticated;

-- ------------------------------------------------------------
-- set_xkast_kongelag_total — admin enters a total directly.
-- Deletes the player's omgang rows, sets the total and the
-- totalsum_manuelt flag. Validates against the kastemetode's
-- omgang count (max = antall_omganger×20 poeng / ×4 ringere)
-- and the aggregate shoe model. Re-syncs resultat when the
-- court is already confirmed.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_xkast_kongelag_total(
  p_deltaker_id    INT,
  p_poeng          INT,
  p_antall_ringer  INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_court_id   INT;
  v_stevneid   INT;
  v_fase       TEXT;
  v_bekreftet  BOOLEAN;
  v_omganger   INT;
  v_max_poeng  INT;
  v_max_ringer INT;
BEGIN
  IF public.min_rolle() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Not authorized: only admins can set totals';
  END IF;

  SELECT d.xkast_kongelag_id, xk.stevneid, xk.fase, xk.er_bekreftet
  INTO v_court_id, v_stevneid, v_fase, v_bekreftet
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = p_deltaker_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag_deltaker % not found', p_deltaker_id;
  END IF;

  IF v_fase = 'innledende' THEN
    SELECT k.antall_omganger INTO v_omganger
    FROM public.stevne s JOIN public.kastemetode k ON k.id = s.innledendekastemetodeid
    WHERE s.id = v_stevneid;
  ELSE
    SELECT k.antall_omganger INTO v_omganger
    FROM public.stevne s JOIN public.kastemetode k ON k.id = s.avsluttendekastemetodeid
    WHERE s.id = v_stevneid;
  END IF;

  IF v_omganger IS NULL THEN
    RAISE EXCEPTION 'Kastemetode for stevne % has no antall_omganger', v_stevneid;
  END IF;

  v_max_poeng  := v_omganger * 20;
  v_max_ringer := v_omganger * 4;

  IF p_poeng < 0 OR p_poeng > v_max_poeng THEN
    RAISE EXCEPTION 'poeng % out of range 0..%', p_poeng, v_max_poeng;
  END IF;
  IF p_antall_ringer < 0 OR p_antall_ringer > v_max_ringer THEN
    RAISE EXCEPTION 'antall_ringer % out of range 0..%', p_antall_ringer, v_max_ringer;
  END IF;
  -- Aggregate shoe model: 5R ≤ poeng ≤ 5R + 3·(4·omganger − R)
  IF p_poeng < 5 * p_antall_ringer
     OR p_poeng > 5 * p_antall_ringer + 3 * (4 * v_omganger - p_antall_ringer) THEN
    RAISE EXCEPTION 'poeng % is impossible with % ringere', p_poeng, p_antall_ringer;
  END IF;

  DELETE FROM public.xkast_kongelag_omgang WHERE xkast_kongelag_deltaker_id = p_deltaker_id;

  UPDATE public.xkast_kongelag_deltaker
  SET poeng = p_poeng, antall_ringer = p_antall_ringer, totalsum_manuelt = true
  WHERE id = p_deltaker_id;

  IF v_bekreftet THEN
    PERFORM public._sync_xkast_kongelag_resultat(v_court_id);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_xkast_kongelag_total(integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_xkast_kongelag_total(integer, integer, integer) TO authenticated;
