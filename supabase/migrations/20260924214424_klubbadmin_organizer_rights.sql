-- #35: a klubbadmin runs their own club's stevner with the same rights as an
-- admin: generate matches, enter and confirm scores, xkast/kongelag, resultat.
-- Every "admin only" branch on the match tables and their RPCs becomes "admin,
-- or klubbadmin of the club hosting this stevne". The participant branches are
-- unchanged.

-- ── Organizer helpers ────────────────────────────────────────────────────────

-- Now also requires the klubbadmin role, so a demoted user with leftover
-- klubbadmin_klubber rows loses access. IS NOT DISTINCT FROM keeps the result
-- false rather than NULL for a caller with no profile: callers use IF NOT.
CREATE OR REPLACE FUNCTION private.er_stevnearrangor(p_stevneid integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT public.min_rolle() IS NOT DISTINCT FROM 'admin'
    OR (
      public.min_rolle() IS NOT DISTINCT FROM 'klubbadmin'
      AND EXISTS (
        SELECT 1
        FROM public.stevne s
        JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid
        WHERE s.id = p_stevneid AND kk.bruker_id = (select auth.uid())
      )
    )
$$;

CREATE OR REPLACE FUNCTION private.er_kamp_arrangor(p_kampid integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT private.er_stevnearrangor((SELECT k.stevneid FROM public.kamp k WHERE k.id = p_kampid))
$$;

CREATE OR REPLACE FUNCTION private.er_xkast_kongelag_arrangor(p_xkast_kongelag_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT private.er_stevnearrangor(
    (SELECT xk.stevneid FROM public.xkast_kongelag xk WHERE xk.id = p_xkast_kongelag_id)
  )
$$;

REVOKE EXECUTE ON FUNCTION private.er_kamp_arrangor(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.er_xkast_kongelag_arrangor(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.er_kamp_arrangor(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.er_xkast_kongelag_arrangor(integer) TO authenticated, service_role;

-- ── Match tables: admin branch → organizer branch ────────────────────────────

ALTER POLICY kamp_admin_delete ON public.kamp
  USING (private.er_stevnearrangor(stevneid));
ALTER POLICY kamp_admin_delete ON public.kamp RENAME TO kamp_arrangor_delete;

ALTER POLICY kamp_admin_insert ON public.kamp
  WITH CHECK (private.er_stevnearrangor(stevneid));
ALTER POLICY kamp_admin_insert ON public.kamp RENAME TO kamp_arrangor_insert;

ALTER POLICY kamp_update ON public.kamp
  USING (
    (private.er_stevnearrangor(stevneid) OR ((er_bekreftet = false) AND (EXISTS ( SELECT 1
   FROM (kamp_spelar ks
     JOIN bruker_profil bp ON ((bp.kasterid = ks.kasterid)))
  WHERE ((ks.kampid = kamp.id) AND (bp.id = ( SELECT auth.uid() AS uid)))))))
  )
  WITH CHECK (
    (private.er_stevnearrangor(stevneid) OR (er_bekreftet = true))
  );

ALTER POLICY kamp_omgang_delete ON public.kamp_omgang
  USING (
    (private.er_kamp_arrangor((SELECT ks.kampid FROM public.kamp_spelar ks WHERE ks.id = kamp_omgang.kamp_spelar_id)) OR (EXISTS ( SELECT 1
   FROM (((kamp_spelar target_ks
     JOIN kamp k ON ((k.id = target_ks.kampid)))
     JOIN kamp_spelar participant_ks ON ((participant_ks.kampid = target_ks.kampid)))
     JOIN bruker_profil bp ON ((bp.kasterid = participant_ks.kasterid)))
  WHERE ((target_ks.id = kamp_omgang.kamp_spelar_id) AND (bp.id = ( SELECT auth.uid() AS uid)) AND (k.er_bekreftet = false)))))
  );

ALTER POLICY kamp_omgang_insert ON public.kamp_omgang
  WITH CHECK (
    (private.er_kamp_arrangor((SELECT ks.kampid FROM public.kamp_spelar ks WHERE ks.id = kamp_omgang.kamp_spelar_id)) OR (EXISTS ( SELECT 1
   FROM (((kamp_spelar target_ks
     JOIN kamp k ON ((k.id = target_ks.kampid)))
     JOIN kamp_spelar participant_ks ON ((participant_ks.kampid = target_ks.kampid)))
     JOIN bruker_profil bp ON ((bp.kasterid = participant_ks.kasterid)))
  WHERE ((target_ks.id = kamp_omgang.kamp_spelar_id) AND (bp.id = ( SELECT auth.uid() AS uid)) AND (k.er_bekreftet = false)))))
  );

ALTER POLICY kamp_omgang_update ON public.kamp_omgang
  USING (
    (private.er_kamp_arrangor((SELECT ks.kampid FROM public.kamp_spelar ks WHERE ks.id = kamp_omgang.kamp_spelar_id)) OR (EXISTS ( SELECT 1
   FROM (((kamp_spelar target_ks
     JOIN kamp k ON ((k.id = target_ks.kampid)))
     JOIN kamp_spelar participant_ks ON ((participant_ks.kampid = target_ks.kampid)))
     JOIN bruker_profil bp ON ((bp.kasterid = participant_ks.kasterid)))
  WHERE ((target_ks.id = kamp_omgang.kamp_spelar_id) AND (bp.id = ( SELECT auth.uid() AS uid)) AND (k.er_bekreftet = false)))))
  );

ALTER POLICY kamp_spelar_admin_delete ON public.kamp_spelar
  USING (private.er_kamp_arrangor(kampid));
ALTER POLICY kamp_spelar_admin_delete ON public.kamp_spelar RENAME TO kamp_spelar_arrangor_delete;

ALTER POLICY kamp_spelar_admin_insert ON public.kamp_spelar
  WITH CHECK (private.er_kamp_arrangor(kampid));
ALTER POLICY kamp_spelar_admin_insert ON public.kamp_spelar RENAME TO kamp_spelar_arrangor_insert;

ALTER POLICY kamp_spelar_update_deltakar ON public.kamp_spelar
  USING (
    (private.er_kamp_arrangor(kampid) OR (private.is_match_participant(kampid) AND (EXISTS ( SELECT 1
   FROM kamp k
  WHERE ((k.id = kamp_spelar.kampid) AND (k.er_bekreftet = false))))))
  )
  WITH CHECK (
    (private.er_kamp_arrangor(kampid) OR ((EXISTS ( SELECT 1
   FROM private.kamp_spelar_original(kamp_spelar.id) o(kampid, kasterid)
  WHERE ((o.kampid = kamp_spelar.kampid) AND (o.kasterid = kamp_spelar.kasterid)))) AND private.is_match_participant(kampid) AND (EXISTS ( SELECT 1
   FROM kamp k
  WHERE ((k.id = kamp_spelar.kampid) AND (k.er_bekreftet = false))))))
  );

ALTER POLICY resultat_admin_delete ON public.resultat
  USING (private.er_stevnearrangor(stevneid));
ALTER POLICY resultat_admin_delete ON public.resultat RENAME TO resultat_arrangor_delete;

ALTER POLICY resultat_admin_insert ON public.resultat
  WITH CHECK (private.er_stevnearrangor(stevneid));
ALTER POLICY resultat_admin_insert ON public.resultat RENAME TO resultat_arrangor_insert;

ALTER POLICY resultat_admin_update ON public.resultat
  USING (private.er_stevnearrangor(stevneid))
  WITH CHECK (private.er_stevnearrangor(stevneid));
ALTER POLICY resultat_admin_update ON public.resultat RENAME TO resultat_arrangor_update;

ALTER POLICY xkast_kongelag_admin_delete ON public.xkast_kongelag
  USING (private.er_stevnearrangor(stevneid));
ALTER POLICY xkast_kongelag_admin_delete ON public.xkast_kongelag RENAME TO xkast_kongelag_arrangor_delete;

ALTER POLICY xkast_kongelag_admin_insert ON public.xkast_kongelag
  WITH CHECK (private.er_stevnearrangor(stevneid));
ALTER POLICY xkast_kongelag_admin_insert ON public.xkast_kongelag RENAME TO xkast_kongelag_arrangor_insert;

ALTER POLICY xkast_kongelag_admin_update ON public.xkast_kongelag
  USING (private.er_stevnearrangor(stevneid));
ALTER POLICY xkast_kongelag_admin_update ON public.xkast_kongelag RENAME TO xkast_kongelag_arrangor_update;

ALTER POLICY xkast_kongelag_deltaker_admin_delete ON public.xkast_kongelag_deltaker
  USING (private.er_xkast_kongelag_arrangor(xkast_kongelag_id));
ALTER POLICY xkast_kongelag_deltaker_admin_delete ON public.xkast_kongelag_deltaker RENAME TO xkast_kongelag_deltaker_arrangor_delete;

ALTER POLICY xkast_kongelag_deltaker_admin_insert ON public.xkast_kongelag_deltaker
  WITH CHECK (private.er_xkast_kongelag_arrangor(xkast_kongelag_id));
ALTER POLICY xkast_kongelag_deltaker_admin_insert ON public.xkast_kongelag_deltaker RENAME TO xkast_kongelag_deltaker_arrangor_insert;

ALTER POLICY xkast_kongelag_deltaker_admin_update ON public.xkast_kongelag_deltaker
  USING (private.er_xkast_kongelag_arrangor(xkast_kongelag_id));
ALTER POLICY xkast_kongelag_deltaker_admin_update ON public.xkast_kongelag_deltaker RENAME TO xkast_kongelag_deltaker_arrangor_update;

ALTER POLICY xkast_kongelag_omgang_admin_delete ON public.xkast_kongelag_omgang
  USING (private.er_xkast_kongelag_arrangor((SELECT d.xkast_kongelag_id FROM public.xkast_kongelag_deltaker d WHERE d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id)));
ALTER POLICY xkast_kongelag_omgang_admin_delete ON public.xkast_kongelag_omgang RENAME TO xkast_kongelag_omgang_arrangor_delete;

ALTER POLICY xkast_kongelag_omgang_insert ON public.xkast_kongelag_omgang
  WITH CHECK (
    (private.er_xkast_kongelag_arrangor((SELECT d.xkast_kongelag_id FROM public.xkast_kongelag_deltaker d WHERE d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id)) OR (EXISTS ( SELECT 1
   FROM (((xkast_kongelag_deltaker target_d
     JOIN xkast_kongelag xk ON ((xk.id = target_d.xkast_kongelag_id)))
     JOIN xkast_kongelag_deltaker participant_d ON ((participant_d.xkast_kongelag_id = target_d.xkast_kongelag_id)))
     JOIN bruker_profil bp ON ((bp.kasterid = participant_d.kasterid)))
  WHERE ((target_d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id) AND (bp.id = ( SELECT auth.uid() AS uid)) AND (xk.er_bekreftet = false)))))
  );

ALTER POLICY xkast_kongelag_omgang_update ON public.xkast_kongelag_omgang
  USING (
    (private.er_xkast_kongelag_arrangor((SELECT d.xkast_kongelag_id FROM public.xkast_kongelag_deltaker d WHERE d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id)) OR (EXISTS ( SELECT 1
   FROM (((xkast_kongelag_deltaker target_d
     JOIN xkast_kongelag xk ON ((xk.id = target_d.xkast_kongelag_id)))
     JOIN xkast_kongelag_deltaker participant_d ON ((participant_d.xkast_kongelag_id = target_d.xkast_kongelag_id)))
     JOIN bruker_profil bp ON ((bp.kasterid = participant_d.kasterid)))
  WHERE ((target_d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id) AND (bp.id = ( SELECT auth.uid() AS uid)) AND (xk.er_bekreftet = false)))))
  );

-- ── RPCs: admin guard → organizer guard ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bekreft_avsluttende_kamp_deltakar(p_kamp_id integer, p_eliminert_kasterid integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_stevne_id            INT;
  v_runde_nummer         INT;
  v_runde_navn           TEXT;
  v_eliminert_snr        INT;
  v_eliminert_kasterids  INT[];
  v_vinnar_kasterids     INT[];
  v_antall_sider         INT;
BEGIN
  -- Caller must be a participant in this kamp or organize its stevne
  IF NOT (
    private.er_kamp_arrangor(p_kamp_id)
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

  -- Fetch kamp context (don't trust client-supplied values)
  SELECT stevneid, runde_nummer, runde_navn
  INTO v_stevne_id, v_runde_nummer, v_runde_navn
  FROM public.kamp
  WHERE id = p_kamp_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamp % not found', p_kamp_id;
  END IF;

  -- Mark kamp as confirmed
  UPDATE public.kamp
  SET er_bekreftet = true
  WHERE id = p_kamp_id;

  IF p_eliminert_kasterid IS NOT NULL THEN
    -- Resolve the eliminated SIDE: all kasterids sharing the eliminated
    -- player's startnummer (the pair). Singel: the player alone.
    SELECT startnummer INTO v_eliminert_snr
    FROM public.resultat
    WHERE stevneid = v_stevne_id AND kasterid = p_eliminert_kasterid;

    IF v_eliminert_snr IS NULL THEN
      v_eliminert_kasterids := ARRAY[p_eliminert_kasterid];
    ELSE
      SELECT array_agg(kasterid) INTO v_eliminert_kasterids
      FROM public.resultat
      WHERE stevneid = v_stevne_id
        AND startnummer = v_eliminert_snr
        AND kasterid IS NOT NULL;
    END IF;

    -- Number of SIDES in the kamp (players without startnummer count as
    -- their own side via the negated-kasterid fallback)
    SELECT COUNT(DISTINCT COALESCE(r.startnummer, -ks.kasterid)) INTO v_antall_sider
    FROM public.kamp_spelar ks
    LEFT JOIN public.resultat r
      ON r.stevneid = v_stevne_id AND r.kasterid = ks.kasterid
    WHERE ks.kampid = p_kamp_id;

    -- Fallback per-match rank for clients that do not write kamp_plassering
    -- with the scores; a placement already written is left alone.
    UPDATE public.kamp_spelar
    SET kamp_plassering = v_antall_sider
    WHERE kampid = p_kamp_id
      AND kasterid = ANY(v_eliminert_kasterids)
      AND kamp_plassering IS NULL;

    UPDATE public.kamp_spelar
    SET kamp_plassering = 1
    WHERE kampid = p_kamp_id
      AND NOT (kasterid = ANY(v_eliminert_kasterids))
      AND kamp_plassering IS NULL;
  END IF;

  -- Semifinale losers advance to bronsefinale — no runde_eliminert change
  IF v_runde_navn = 'Semifinale' THEN
    RETURN;
  END IF;

  IF p_eliminert_kasterid IS NOT NULL THEN
    IF v_runde_navn IN ('Finale', 'Bronsefinale') THEN
      SELECT array_agg(DISTINCT ks.kasterid) INTO v_vinnar_kasterids
      FROM public.kamp_spelar ks
      WHERE ks.kampid = p_kamp_id
        AND ks.kasterid IS NOT NULL
        AND NOT (ks.kasterid = ANY(v_eliminert_kasterids));

      IF v_runde_navn = 'Finale' THEN
        UPDATE public.resultat SET plassering = 1
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_kasterids);
        UPDATE public.resultat SET plassering = 2
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert_kasterids);
      ELSIF v_runde_navn = 'Bronsefinale' THEN
        UPDATE public.resultat SET plassering = 3
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_vinnar_kasterids);
        UPDATE public.resultat SET plassering = 4
        WHERE stevneid = v_stevne_id AND kasterid = ANY(v_eliminert_kasterids);
      END IF;
    ELSE
      UPDATE public.resultat
      SET runde_eliminert = v_runde_nummer
      WHERE stevneid = v_stevne_id
        AND kasterid = ANY(v_eliminert_kasterids);
    END IF;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bekreft_innledende_kamp(p_kamp_id integer, p_scores jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_er_arrangor   boolean;
  v_er_bekreftet  boolean;
  v_fase          text;
  v_framande      int;
BEGIN
  v_er_arrangor := private.er_kamp_arrangor(p_kamp_id);

  IF NOT (
    v_er_arrangor
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

  IF v_er_bekreftet AND NOT v_er_arrangor THEN
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
      antall_ringer = s.antall_ringer,
      kamp_plassering = COALESCE(s.kamp_plassering, ks.kamp_plassering)
  FROM jsonb_to_recordset(COALESCE(p_scores, '[]'::jsonb))
    AS s(kamp_spelar_id int, score_poeng int, kamp_poeng real, antall_ringer int, kamp_plassering int)
  WHERE ks.id = s.kamp_spelar_id
    AND ks.kampid = p_kamp_id;

  UPDATE public.kamp SET er_bekreftet = true WHERE id = p_kamp_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.confirm_xkast_kongelag(p_xkast_kongelag_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_stevneid INT;
  v_missing  INT;
BEGIN
  IF NOT (
    private.er_xkast_kongelag_arrangor(p_xkast_kongelag_id)
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
$function$;

CREATE OR REPLACE FUNCTION public.edit_xkast_kongelag_omgang(p_deltaker_id integer, p_omgang integer, p_poeng integer, p_antall_ringer integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_court_id  INT;
  v_manuelt   BOOLEAN;
  v_bekreftet BOOLEAN;
BEGIN
  IF NOT private.er_xkast_kongelag_arrangor((SELECT xkast_kongelag_id FROM public.xkast_kongelag_deltaker WHERE id = p_deltaker_id)) THEN
    RAISE EXCEPTION 'Not authorized: only the stevne organizer can edit omganger';
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
$function$;

CREATE OR REPLACE FUNCTION public.set_xkast_kongelag_total(p_deltaker_id integer, p_poeng integer, p_antall_ringer integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_court_id   INT;
  v_stevneid   INT;
  v_fase       TEXT;
  v_bekreftet  BOOLEAN;
  v_omganger   INT;
  v_max_poeng  INT;
  v_max_ringer INT;
BEGIN
  IF NOT private.er_xkast_kongelag_arrangor((SELECT xkast_kongelag_id FROM public.xkast_kongelag_deltaker WHERE id = p_deltaker_id)) THEN
    RAISE EXCEPTION 'Not authorized: only the stevne organizer can set totals';
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
$function$;

CREATE OR REPLACE FUNCTION public.swap_xkast_kongelag_deltaker(p_deltaker_a integer, p_deltaker_b integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_a RECORD;
  v_b RECORD;
BEGIN
  IF NOT private.er_xkast_kongelag_arrangor((SELECT xkast_kongelag_id FROM public.xkast_kongelag_deltaker WHERE id = p_deltaker_a)) THEN
    RAISE EXCEPTION 'Not authorized: only the stevne organizer can swap participants';
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
$function$;

-- ── One club per klubbadmin ──────────────────────────────────────────────────

ALTER TABLE public.klubbadmin_klubber
  ADD CONSTRAINT klubbadmin_klubber_bruker_id_key UNIQUE (bruker_id);

-- ── kaster: a klubbadmin may release a thrower, never hand it to another club ─

-- Without WITH CHECK the USING clause also checks the new row, which made
-- klubbid = NULL impossible for a klubbadmin.
ALTER POLICY kaster_update ON public.kaster
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND (
        klubbid IS NULL
        OR EXISTS (
          SELECT 1 FROM public.klubbadmin_klubber kk
          WHERE kk.bruker_id = (SELECT auth.uid()) AND kk.klubbid = kaster.klubbid
        )
      )
    )
  );
