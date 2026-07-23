-- =============================================================================
-- Atomic insert of avsluttende (cup) matches + their players.
--
-- Cup-round generation previously inserted the kamp rows and their kamp_spelar
-- rows as two separate client writes. A failure between them (network drop,
-- constraint violation on the second write) left matches with no players — a
-- half-generated round. generateCupRound1 also looped per group, so a failure
-- mid-loop left some groups generated and others not.
--
-- This wraps both inserts in one transaction, driven by a JSONB payload the
-- client builds from its (tested) TS pairing logic. Pairing/seeding stays in
-- TypeScript; only the writes move into the DB.
--
-- SECURITY INVOKER: the client already inserts these rows directly under its
-- own RLS today, so running as the caller preserves the exact same
-- authorization (and keeps the function off the anon-callable surface that the
-- SECURITY DEFINER RPCs have to guard against).
--
-- Payload shape (array):
--   [{ match_id, stevneid, fase, runde_nummer, gruppe_navn, bane_nummer,
--      er_bekreftet, er_walkover, er_tre_spelarar, runde_navn,
--      players: [{ kasterid }, ...] }, ...]
-- =============================================================================

CREATE OR REPLACE FUNCTION public.insert_avsluttende_matches(p_matches jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_match  jsonb;
  v_kampid integer;
  v_count  integer := 0;
BEGIN
  FOR v_match IN SELECT jsonb_array_elements(p_matches)
  LOOP
    INSERT INTO public.kamp (
      match_id, stevneid, fase, runde_nummer, gruppe_navn,
      bane_nummer, er_bekreftet, er_walkover, er_tre_spelarar, runde_navn
    )
    VALUES (
      v_match->>'match_id',
      (v_match->>'stevneid')::integer,
      v_match->>'fase',
      (v_match->>'runde_nummer')::integer,
      v_match->>'gruppe_navn',
      NULLIF(v_match->>'bane_nummer', '')::integer,
      COALESCE((v_match->>'er_bekreftet')::boolean, false),
      COALESCE((v_match->>'er_walkover')::boolean, false),
      COALESCE((v_match->>'er_tre_spelarar')::boolean, false),
      v_match->>'runde_navn'
    )
    RETURNING id INTO v_kampid;

    INSERT INTO public.kamp_spelar (kampid, kasterid, score_poeng, kamp_poeng, antall_ringer)
    SELECT v_kampid, (player->>'kasterid')::integer, 0, 0, 0
    FROM jsonb_array_elements(v_match->'players') AS player;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Same execute-privilege convention as the other user-invoked RPCs
-- (see 20260710110200_fix_security_definer_execute_revoke_roles.sql).
REVOKE EXECUTE ON FUNCTION public.insert_avsluttende_matches(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.insert_avsluttende_matches(jsonb) TO authenticated;
