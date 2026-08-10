-- ============================================================
-- swap_xkast_kongelag_deltaker — also refuse seats that carry a
-- manual total.
--
-- The original guard (20260723104711) only checked for omgang
-- rows, because at that point a score could only exist as omgang
-- rows. 20260723115743 then added totalsum_manuelt: a directly
-- entered total lives in xkast_kongelag_deltaker.poeng /
-- .antall_ringer with NO omgang rows at all — so the EXISTS check
-- found nothing and the swap went through, handing one player's
-- total to another.
--
-- Unscored now means: no omgang rows AND totalsum_manuelt = false.
-- Everything else about the function is unchanged.
-- ============================================================

CREATE OR REPLACE FUNCTION public.swap_xkast_kongelag_deltaker(
  p_deltaker_a INT,
  p_deltaker_b INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_a RECORD;
  v_b RECORD;
BEGIN
  IF public.min_rolle() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Not authorized: only admins can swap participants';
  END IF;

  IF p_deltaker_a = p_deltaker_b THEN
    RAISE EXCEPTION 'Cannot swap a participant with itself';
  END IF;

  SELECT d.id, d.kasterid, d.xkast_kongelag_id, d.totalsum_manuelt,
         xk.stevneid, xk.fase, xk.er_bekreftet
  INTO v_a
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = p_deltaker_a
  FOR UPDATE OF d;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag_deltaker % not found', p_deltaker_a;
  END IF;

  SELECT d.id, d.kasterid, d.xkast_kongelag_id, d.totalsum_manuelt,
         xk.stevneid, xk.fase, xk.er_bekreftet
  INTO v_b
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = p_deltaker_b
  FOR UPDATE OF d;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag_deltaker % not found', p_deltaker_b;
  END IF;

  IF v_a.xkast_kongelag_id = v_b.xkast_kongelag_id THEN
    RAISE EXCEPTION 'Participants are on the same court';
  END IF;

  IF v_a.stevneid <> v_b.stevneid OR v_a.fase <> v_b.fase THEN
    RAISE EXCEPTION 'Participants belong to different stevner or faser';
  END IF;

  IF v_a.er_bekreftet OR v_b.er_bekreftet THEN
    RAISE EXCEPTION 'Cannot swap: court is already confirmed';
  END IF;

  IF v_a.totalsum_manuelt OR v_b.totalsum_manuelt THEN
    RAISE EXCEPTION 'Cannot swap: participant has a manual total';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.xkast_kongelag_omgang o
    WHERE o.xkast_kongelag_deltaker_id IN (p_deltaker_a, p_deltaker_b)
  ) THEN
    RAISE EXCEPTION 'Cannot swap: participant has recorded omganger';
  END IF;

  UPDATE public.xkast_kongelag_deltaker d
  SET kasterid = CASE d.id
    WHEN p_deltaker_a THEN v_b.kasterid
    WHEN p_deltaker_b THEN v_a.kasterid
  END
  WHERE d.id IN (p_deltaker_a, p_deltaker_b);
END;
$$;

-- CREATE OR REPLACE preserves the existing ACL, so the anon revoke from
-- 20260723211118 should survive — restated explicitly so a future replace
-- cannot quietly reopen the RPC to anon.
REVOKE EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) TO authenticated;
