-- =============================================================================
-- Atomic pair creation.
--
-- createPair (pameldingService) issued two UPDATEs as separate transactions
-- with a best-effort client-side rollback. Failure modes:
--   1. Crash/network drop between the updates, or a failed rollback request,
--      left an orphaned half-pair.
--   2. An update matching 0 rows (player not registered, or concurrently
--      removed) passed silently — half-pair with no error at all.
--   3. Concurrent calls read the same MAX(lag_id) and merged two pairs under
--      one team ID.
--   4. No guard against re-pairing a player already in a pair.
--
-- One transaction fixes 1; ROW_COUNT checks fix 2 and 4; a per-stevne
-- advisory lock around the MAX(lag_id) read fixes 3. The Mix gender trigger
-- (validate_mix_pamelding) fires per row inside this transaction and aborts
-- the whole pair on violation.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_pair(
  p_stevneid INT,
  p_kaster_a INT,
  p_kaster_b INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lag_id  INT;
  v_updated INT;
BEGIN
  -- Pairing touches two different throwers' rows, so self-registration rights
  -- don't apply: admin or klubbadmin of the stevne's klubb only (same rule as
  -- complete_stevne).
  IF NOT (
    public.min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.stevne s
      JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid
      WHERE s.id = p_stevneid AND kk.bruker_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Du har ikkje tilgang til å opprette par';
  END IF;

  IF p_kaster_a = p_kaster_b THEN
    RAISE EXCEPTION 'Eit par må bestå av to ulike spelarar';
  END IF;

  -- Serialize lag_id assignment per stevne: MAX()+1 alone races under
  -- concurrent calls. Released automatically at transaction end.
  PERFORM pg_advisory_xact_lock(hashtext('pamelding_lag_id'), p_stevneid);

  SELECT COALESCE(MAX(lag_id), 0) + 1
  INTO v_lag_id
  FROM public.pamelding
  WHERE stevneid = p_stevneid AND lag_id IS NOT NULL;

  UPDATE public.pamelding
  SET lag_id = v_lag_id, posisjon = 1
  WHERE stevneid = p_stevneid AND kasterid = p_kaster_a AND lag_id IS NULL;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Spelaren på side A er ikkje påmeld, eller er allereie i eit par';
  END IF;

  UPDATE public.pamelding
  SET lag_id = v_lag_id, posisjon = 2
  WHERE stevneid = p_stevneid AND kasterid = p_kaster_b AND lag_id IS NULL;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Spelaren på side B er ikkje påmeld, eller er allereie i eit par';
  END IF;
END;
$$;

-- Same execute-privilege convention as the other user-invoked RPCs
-- (see 20260710110200_fix_security_definer_execute_revoke_roles.sql).
REVOKE EXECUTE ON FUNCTION public.create_pair(INT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_pair(INT, INT, INT) TO authenticated;
