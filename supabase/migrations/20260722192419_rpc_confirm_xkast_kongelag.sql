-- ============================================================
-- confirm_xkast_kongelag(p_xkast_kongelag_id)
--
-- Confirms one court (X-kast: 1–3 players, Kongelag: 1 player)
-- atomically:
--   1. Aggregates each participant's omgang rows into
--      xkast_kongelag_deltaker.poeng / antall_ringer
--   2. Writes the totals to resultat — fase decides the target:
--      'innledende'  → poeng_xkast   / antall_ring_xkast
--      'avsluttende' → poeng_kongelag / antall_ring_kongelag
--   3. Sets xkast_kongelag.er_bekreftet = true
--
-- One function for both formats (they differ only in target
-- resultat columns). SECURITY DEFINER because participants have
-- no direct UPDATE on xkast_kongelag/deltaker — this RPC is
-- their only confirmation path, mirroring
-- bekreft_avsluttende_kamp_deltakar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.confirm_xkast_kongelag(
  p_xkast_kongelag_id INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid  INT;
  v_fase      TEXT;
  v_missing   INT;
BEGIN
  -- Caller must be a participant on this court or an admin
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

  -- Fetch court context (don't trust client-supplied values)
  SELECT stevneid, fase
  INTO v_stevneid, v_fase
  FROM public.xkast_kongelag
  WHERE id = p_xkast_kongelag_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'xkast_kongelag % not found', p_xkast_kongelag_id;
  END IF;

  -- Every participant must have a resultat row (created at
  -- påmelding). Failing loudly beats silently dropping a
  -- player's totals — the whole confirm rolls back.
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

  -- 1. Aggregate omgang rows into the deltaker totals
  UPDATE public.xkast_kongelag_deltaker d
  SET
    poeng = COALESCE((
      SELECT SUM(o.poeng)
      FROM public.xkast_kongelag_omgang o
      WHERE o.xkast_kongelag_deltaker_id = d.id
    ), 0),
    antall_ringer = COALESCE((
      SELECT SUM(o.antall_ringer)
      FROM public.xkast_kongelag_omgang o
      WHERE o.xkast_kongelag_deltaker_id = d.id
    ), 0)
  WHERE d.xkast_kongelag_id = p_xkast_kongelag_id;

  -- 2. Write totals to resultat (fase decides the columns)
  IF v_fase = 'innledende' THEN
    UPDATE public.resultat r
    SET
      poeng_xkast       = d.poeng,
      antall_ring_xkast = d.antall_ringer
    FROM public.xkast_kongelag_deltaker d
    WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
      AND r.stevneid = v_stevneid
      AND r.kasterid = d.kasterid;
  ELSE
    UPDATE public.resultat r
    SET
      poeng_kongelag       = d.poeng,
      antall_ring_kongelag = d.antall_ringer
    FROM public.xkast_kongelag_deltaker d
    WHERE d.xkast_kongelag_id = p_xkast_kongelag_id
      AND r.stevneid = v_stevneid
      AND r.kasterid = d.kasterid;
  END IF;

  -- 3. Mark the court as confirmed
  UPDATE public.xkast_kongelag
  SET er_bekreftet = true
  WHERE id = p_xkast_kongelag_id;
END;
$$;

-- Client-callable but internally gated (participant/admin check
-- requires an authenticated auth.uid()) — same EXECUTE model as
-- bekreft_avsluttende_kamp_deltakar
-- (20260710110100_restrict_security_definer_function_execute.sql).
REVOKE EXECUTE ON FUNCTION public.confirm_xkast_kongelag(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_xkast_kongelag(integer) TO authenticated;
