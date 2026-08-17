-- Confirming an innledende kamp took three REST round trips: one PATCH per
-- kamp_spelar row, then a PATCH on kamp. The kamp write has to come last —
-- both write policies require er_bekreftet = false — so the client could not
-- batch them. This RPC does the same writes in one call, in the same order.
--
-- It is SECURITY DEFINER only to save round trips, NOT to widen access: the
-- authorization check below is the same rule the two UPDATE policies enforce
-- (admin, or a participant while the kamp is still open), and the write is
-- narrowed to score columns on rows that belong to p_kamp_id. The
-- *_block_if_completed triggers still fire, so a fullført stevne stays locked.
--
-- Returns false when the kamp is already confirmed and the caller is not an
-- admin — the client turns that into "already confirmed by someone else",
-- which is what the zero-rows-affected check used to detect.

CREATE OR REPLACE FUNCTION public.bekreft_innledende_kamp(
  p_kamp_id INT,
  p_scores  JSONB
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_er_admin      boolean;
  v_er_bekreftet  boolean;
  v_fase          text;
  v_framande      int;
BEGIN
  v_er_admin := public.min_rolle() = 'admin';

  IF NOT (
    v_er_admin
    OR EXISTS (
      SELECT 1
      FROM public.kamp_spelar ks
      JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
      WHERE ks.kampid = p_kamp_id
        AND bp.id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized: caller is not a participant in kamp %', p_kamp_id;
  END IF;

  SELECT er_bekreftet, fase INTO v_er_bekreftet, v_fase
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  -- A cup kamp settles through bekreft_avsluttende_kamp_deltakar, which also
  -- writes the bracket. Confirming one here would leave it half-settled.
  IF v_fase <> 'innledende' THEN
    RAISE EXCEPTION 'Kamp % er ikkje ein innleiande kamp', p_kamp_id;
  END IF;

  IF v_er_bekreftet AND NOT v_er_admin THEN
    RETURN false;
  END IF;

  -- The ids come from the client, so they are checked rather than trusted.
  SELECT count(*) INTO v_framande
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb)) AS s(kamp_spelar_id int)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kamp_spelar ks
    WHERE ks.id = s.kamp_spelar_id AND ks.kampid = p_kamp_id
  );

  IF v_framande > 0 THEN
    RAISE EXCEPTION 'kamp_spelar-rader høyrer ikkje til kamp %', p_kamp_id;
  END IF;

  UPDATE public.kamp_spelar ks
  SET score_poeng   = s.score_poeng,
      kamp_poeng    = s.kamp_poeng,
      antall_ringer = s.antall_ringer
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb))
    AS s(kamp_spelar_id int, score_poeng int, kamp_poeng real, antall_ringer int)
  WHERE ks.id = s.kamp_spelar_id
    AND ks.kampid = p_kamp_id;

  UPDATE public.kamp SET er_bekreftet = true WHERE id = p_kamp_id;

  RETURN true;
END;
$$;

-- Supabase's default privileges grant EXECUTE to anon at creation time; see
-- supabase/tests/14_secdef_anon_execute.sql for the guard on this.
REVOKE EXECUTE ON FUNCTION public.bekreft_innledende_kamp(int, jsonb) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.bekreft_innledende_kamp(int, jsonb) TO authenticated, service_role;
