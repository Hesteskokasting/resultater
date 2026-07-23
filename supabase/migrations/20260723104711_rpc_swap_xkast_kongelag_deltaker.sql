-- ============================================================
-- swap_xkast_kongelag_deltaker(p_deltaker_a, p_deltaker_b)
--
-- Admin-only: swaps the kasterid of two court seats so players
-- can be reassigned after generation (fix pairings before
-- throwing starts). Atomic single UPDATE — the two seats sit on
-- different courts, so UNIQUE(xkast_kongelag_id, kasterid) never
-- collides mid-swap.
--
-- Refused when:
--   - the seats are the same, or on the same court (meaningless)
--   - the seats belong to different stevner or faser
--   - either court is already confirmed
--   - either seat has recorded omganger (omgang rows hang off
--     the SEAT, so swapping kasterid would hand one player's
--     scores to another)
--
-- SECURITY DEFINER mirrors confirm_xkast_kongelag; the completed-
-- stevne trigger on xkast_kongelag_deltaker still blocks swaps
-- in fullførte stevner.
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

  SELECT d.id, d.kasterid, d.xkast_kongelag_id, xk.stevneid, xk.fase, xk.er_bekreftet
  INTO v_a
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = p_deltaker_a
  FOR UPDATE OF d;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag_deltaker % not found', p_deltaker_a;
  END IF;

  SELECT d.id, d.kasterid, d.xkast_kongelag_id, xk.stevneid, xk.fase, xk.er_bekreftet
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

-- Client-callable but internally admin-gated — same EXECUTE
-- model as confirm_xkast_kongelag.
REVOKE EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) TO authenticated;
