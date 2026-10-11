-- bekreft_avsluttende_kamp_rangert: settles a cup kamp whose ranking the
-- organizer supplies (numberpad score, 3-side dialog, rescore of a confirmed
-- kamp) in one transaction. The client used to do this in 4-6 sequential
-- writes; on a poor connection that was slow and could stop halfway, leaving
-- scores written but the kamp unconfirmed or the loser never eliminated.
--
-- Idempotent: calling it again with the same arguments leaves the same state,
-- so a retry after a lost response is safe.

CREATE OR REPLACE FUNCTION public.bekreft_avsluttende_kamp_rangert(
  p_kamp_id integer,
  p_scores jsonb,
  p_vidare jsonb,
  p_eliminert integer[],
  p_slett_omgangar boolean DEFAULT false
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_stevne_id     int;
  v_runde_nummer  int;
  v_runde_navn    text;
  v_fase          text;
  v_kasterids     int[];
  v_vidare_ids    int[];
  v_vinnar_ids    int[];
  v_eliminert     int[] := COALESCE(p_eliminert, '{}');
  v_framande      int;
BEGIN
  IF NOT private.er_kamp_arrangor(p_kamp_id) THEN
    RAISE EXCEPTION 'Not authorized: caller does not organize kamp %', p_kamp_id;
  END IF;

  -- Round context comes from the kamp, not the client
  SELECT stevneid, runde_nummer, runde_navn, fase
  INTO v_stevne_id, v_runde_nummer, v_runde_navn, v_fase
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  IF v_fase <> 'avsluttende' THEN
    RAISE EXCEPTION 'Kamp % er ikkje ein avsluttande kamp', p_kamp_id;
  END IF;

  SELECT array_agg(kasterid) INTO v_kasterids
  FROM public.kamp_spelar
  WHERE kampid = p_kamp_id;

  -- p_vidare: advancing sides in rank order, each an array of kasterids
  SELECT COALESCE(array_agg(e::int), '{}') INTO v_vidare_ids
  FROM jsonb_array_elements(COALESCE(p_vidare, '[]'::jsonb)) AS side,
       jsonb_array_elements_text(side) AS e;

  SELECT COALESCE(array_agg(e::int), '{}') INTO v_vinnar_ids
  FROM jsonb_array_elements_text(COALESCE(p_vidare -> 0, '[]'::jsonb)) AS e;

  -- Every id comes from the client, so they are checked rather than trusted
  IF NOT (v_vidare_ids || v_eliminert) <@ COALESCE(v_kasterids, '{}') THEN
    RAISE EXCEPTION 'kastarar høyrer ikkje til kamp %', p_kamp_id;
  END IF;

  IF v_vidare_ids && v_eliminert THEN
    RAISE EXCEPTION 'ein kastar kan ikkje både gå vidare og vere ute i kamp %', p_kamp_id;
  END IF;

  SELECT count(*) INTO v_framande
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb)) AS s(kamp_spelar_id int)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kamp_spelar ks
    WHERE ks.id = s.kamp_spelar_id AND ks.kampid = p_kamp_id
  );

  IF v_framande > 0 THEN
    RAISE EXCEPTION 'kamp_spelar-rader høyrer ikkje til kamp %', p_kamp_id;
  END IF;

  -- A typed-in total replaces the omgang detail it would contradict
  IF p_slett_omgangar THEN
    DELETE FROM public.kamp_omgang om
    USING public.kamp_spelar ks
    WHERE om.kamp_spelar_id = ks.id AND ks.kampid = p_kamp_id;
  END IF;

  UPDATE public.kamp_spelar ks
  SET score_poeng   = s.score_poeng,
      kamp_poeng    = s.kamp_poeng,
      antall_ringer = s.antall_ringer
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb))
    AS s(kamp_spelar_id int, score_poeng int, kamp_poeng real, antall_ringer int)
  WHERE ks.id = s.kamp_spelar_id
    AND ks.kampid = p_kamp_id;

  -- Per-match rank: advancing sides 1, 2, …; the eliminated side last
  UPDATE public.kamp_spelar ks
  SET kamp_plassering = v.plass
  FROM (
    SELECT e::int AS kasterid, side.ord::int AS plass
    FROM jsonb_array_elements(COALESCE(p_vidare, '[]'::jsonb)) WITH ORDINALITY AS side(ids, ord),
         jsonb_array_elements_text(side.ids) AS e
    UNION ALL
    SELECT unnest(v_eliminert), jsonb_array_length(COALESCE(p_vidare, '[]'::jsonb)) + 1
  ) v
  WHERE ks.kampid = p_kamp_id
    AND ks.kasterid = v.kasterid;

  UPDATE public.kamp SET er_bekreftet = true WHERE id = p_kamp_id;

  -- Semifinale losers are not out — they go on to the bronsefinale
  IF v_runde_navn = 'Semifinale' OR cardinality(v_eliminert) = 0 THEN
    RETURN;
  END IF;

  IF v_runde_navn = 'Finale' THEN
    IF cardinality(v_vinnar_ids) > 0 THEN
      UPDATE public.resultat SET plassering = 1
      WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_ids);
      UPDATE public.resultat SET plassering = 2
      WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert);
    END IF;
  ELSIF v_runde_navn = 'Bronsefinale' THEN
    IF cardinality(v_vinnar_ids) > 0 THEN
      UPDATE public.resultat SET plassering = 3
      WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_ids);
      UPDATE public.resultat SET plassering = 4
      WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert);
    END IF;
  ELSE
    -- Clear this round's eliminations for the kamp first, so a rescore that
    -- flips the result leaves only the new loser out
    UPDATE public.resultat SET runde_eliminert = NULL
    WHERE stevneid = v_stevne_id
      AND runde_eliminert = v_runde_nummer
      AND kasterid = ANY(v_kasterids);
    UPDATE public.resultat SET runde_eliminert = v_runde_nummer
    WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert);
  END IF;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.bekreft_avsluttende_kamp_rangert(integer, jsonb, jsonb, integer[], boolean) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.bekreft_avsluttende_kamp_rangert(integer, jsonb, jsonb, integer[], boolean) TO authenticated, service_role;
