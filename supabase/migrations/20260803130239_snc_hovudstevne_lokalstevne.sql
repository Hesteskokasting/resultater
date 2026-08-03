-- ============================================================
-- SNC: one umbrella stevne tying its local stevner together
--
-- An SNC round runs simultaneously at several clubs. Each
-- local stevne keeps its own result list and prizes; the
-- umbrella owns the consolidated list that decides NC points.
--
-- Modelled as a self-reference on stevne rather than a new
-- entity, so every existing per-stevne mechanism (pamelding,
-- kamp generation, X-kast/Kongelag courts, resultat, rekorder,
-- norgescup) keeps working unchanged for the local stevner.
-- The umbrella row itself never holds kamper or resultat.
-- ============================================================

ALTER TABLE public.stevne
  ADD COLUMN er_snc_hovudstevne boolean NOT NULL DEFAULT false,
  ADD COLUMN snc_hovudstevne_id integer REFERENCES public.stevne(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.stevne.er_snc_hovudstevne IS
  'Paraplystevnet for ein SNC-runde. Har ingen kampar/resultat sjølv; eig den samla resultatlista.';
COMMENT ON COLUMN public.stevne.snc_hovudstevne_id IS
  'Sett på eit lokalstevne: kva SNC-hovudstevne det høyrer til. NULL for vanlege stevne.';

-- An umbrella can never itself be local (no nesting).
ALTER TABLE public.stevne
  ADD CONSTRAINT stevne_snc_ikkje_nesta
  CHECK (NOT (er_snc_hovudstevne AND snc_hovudstevne_id IS NOT NULL));

CREATE INDEX stevne_snc_hovudstevne_id_idx
  ON public.stevne (snc_hovudstevne_id)
  WHERE snc_hovudstevne_id IS NOT NULL;

-- Placement in the consolidated list. resultat.plassering stays the local
-- placement (local prizes); for a local stevne nc_poeng comes from
-- snc_plassering instead - see complete_snc_hovudstevne below.
ALTER TABLE public.resultat ADD COLUMN snc_plassering integer;

COMMENT ON COLUMN public.resultat.snc_plassering IS
  'Plassering i den samla SNC-lista på tvers av alle lokalstevna. NULL utanom SNC.';

-- ── Which kastemetoder SNC allows ────────────────────────────────────────────
-- SNC is always X-kast, Kongelag or both, never Gloppen, NHM or cup. The name
-- patterns mirror isXkastMethodName() in src/utils/kastemetode.ts.

CREATE OR REPLACE FUNCTION public.er_xkast_kastemetode(p_kastemetodeid INT)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kastemetode
    WHERE id = p_kastemetodeid
      AND lower(navn) ~ '(x-kast|minimatch|halvmatch|heilmatch)'
  );
$$;

CREATE OR REPLACE FUNCTION public.er_kongelag_kastemetode(p_kastemetodeid INT)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kastemetode
    WHERE id = p_kastemetodeid AND lower(navn) LIKE '%kongelag%'
  );
$$;

-- ── SNC invariants ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_stevne_snc_invariantar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_hovud    public.stevne;
  v_typenavn TEXT;
BEGIN
  -- Detaching a local stevne from a consolidated round would leave the merged
  -- list holding results that no longer belong to it. Has to run before the
  -- early return below: once detached, the row looks like an ordinary stevne.
  IF TG_OP = 'UPDATE'
     AND OLD.snc_hovudstevne_id IS NOT NULL
     AND NEW.snc_hovudstevne_id IS DISTINCT FROM OLD.snc_hovudstevne_id
     AND EXISTS (SELECT 1 FROM public.stevne WHERE id = OLD.snc_hovudstevne_id AND erfullfort) THEN
    RAISE EXCEPTION 'SNC-hovudstevne % er konsolidert — gjenopne det før du flyttar lokalstevnet',
      OLD.snc_hovudstevne_id;
  END IF;

  IF NOT NEW.er_snc_hovudstevne AND NEW.snc_hovudstevne_id IS NULL THEN
    RETURN NEW;  -- not an SNC stevne
  END IF;

  IF NEW.snc_hovudstevne_id IS NOT NULL THEN
    IF NEW.snc_hovudstevne_id = NEW.id THEN
      RAISE EXCEPTION 'Eit stevne kan ikkje vere sitt eige SNC-hovudstevne';
    END IF;

    SELECT * INTO v_hovud FROM public.stevne WHERE id = NEW.snc_hovudstevne_id;
    IF NOT FOUND OR NOT v_hovud.er_snc_hovudstevne THEN
      RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', NEW.snc_hovudstevne_id;
    END IF;

    -- The merged list is already computed; a new local stevne would be left out.
    IF v_hovud.erfullfort
       AND (TG_OP = 'INSERT' OR OLD.snc_hovudstevne_id IS DISTINCT FROM NEW.snc_hovudstevne_id) THEN
      RAISE EXCEPTION 'SNC-hovudstevne % er konsolidert — gjenopne det før du legg til lokalstevne',
        NEW.snc_hovudstevne_id;
    END IF;

    -- The umbrella owns the format: scores from different venues must be
    -- comparable in the merged list, so type, category and both kastemetoder
    -- follow it. Ranking follows too - the throws happen locally, but the
    -- decision is per round.
    NEW.stevnetypeid             := v_hovud.stevnetypeid;
    NEW.kategoriid               := v_hovud.kategoriid;
    NEW.innledendekastemetodeid  := v_hovud.innledendekastemetodeid;
    NEW.avsluttendekastemetodeid := v_hovud.avsluttendekastemetodeid;
    NEW.ernorgesranking          := v_hovud.ernorgesranking;
  END IF;

  IF NEW.er_snc_hovudstevne THEN
    SELECT navn INTO v_typenavn FROM public.stevnetype WHERE id = NEW.stevnetypeid;
    IF COALESCE(v_typenavn, '') <> 'SNC' THEN
      RAISE EXCEPTION 'Eit SNC-hovudstevne må ha stevnetype SNC';
    END IF;
  END IF;

  IF NEW.innledendekastemetodeid IS NULL AND NEW.avsluttendekastemetodeid IS NULL THEN
    RAISE EXCEPTION 'SNC-stevne må ha X-kast, Kongelag eller begge';
  END IF;
  IF NEW.innledendekastemetodeid IS NOT NULL
     AND NOT public.er_xkast_kastemetode(NEW.innledendekastemetodeid) THEN
    RAISE EXCEPTION 'SNC-stevne må bruke X-kast som innleiande kastemetode';
  END IF;
  IF NEW.avsluttendekastemetodeid IS NOT NULL
     AND NOT public.er_kongelag_kastemetode(NEW.avsluttendekastemetodeid) THEN
    RAISE EXCEPTION 'SNC-stevne må bruke Kongelag som avsluttande kastemetode';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stevne_snc_invariantar ON public.stevne;
CREATE TRIGGER stevne_snc_invariantar
BEFORE INSERT OR UPDATE ON public.stevne
FOR EACH ROW EXECUTE FUNCTION public.trg_stevne_snc_invariantar();

-- Format changes on the umbrella cascade to its local stevner. Only allowed
-- while none has started: courts and kamper come from the old format.
CREATE OR REPLACE FUNCTION public.trg_stevne_snc_propager_format()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.er_snc_hovudstevne THEN
    RETURN NULL;
  END IF;

  -- ernorgesranking only decides whether throws count, and nothing generated
  -- depends on it, so it can follow the umbrella at any time.
  IF NEW.ernorgesranking IS DISTINCT FROM OLD.ernorgesranking THEN
    UPDATE public.stevne SET ernorgesranking = NEW.ernorgesranking
    WHERE snc_hovudstevne_id = NEW.id;
  END IF;

  IF NEW.stevnetypeid IS NOT DISTINCT FROM OLD.stevnetypeid
     AND NEW.kategoriid IS NOT DISTINCT FROM OLD.kategoriid
     AND NEW.innledendekastemetodeid IS NOT DISTINCT FROM OLD.innledendekastemetodeid
     AND NEW.avsluttendekastemetodeid IS NOT DISTINCT FROM OLD.avsluttendekastemetodeid THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.stevne
    WHERE snc_hovudstevne_id = NEW.id
      AND (erfullfort OR stevne_fase IN ('innledende', 'avsluttende'))
  ) THEN
    RAISE EXCEPTION 'Kan ikkje endre format: eit eller fleire lokalstevne er starta eller fullført';
  END IF;

  UPDATE public.stevne SET
    stevnetypeid             = NEW.stevnetypeid,
    kategoriid               = NEW.kategoriid,
    innledendekastemetodeid  = NEW.innledendekastemetodeid,
    avsluttendekastemetodeid = NEW.avsluttendekastemetodeid
  WHERE snc_hovudstevne_id = NEW.id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS stevne_snc_propager_format ON public.stevne;
CREATE TRIGGER stevne_snc_propager_format
AFTER UPDATE ON public.stevne
FOR EACH ROW EXECUTE FUNCTION public.trg_stevne_snc_propager_format();

-- ── Pamelding: one local stevne per thrower per round ────────────────────────

CREATE OR REPLACE FUNCTION public.trg_pamelding_snc_ein_stad()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_hovudid  INT;
  v_er_hovud BOOLEAN;
BEGIN
  SELECT snc_hovudstevne_id, er_snc_hovudstevne
  INTO v_hovudid, v_er_hovud
  FROM public.stevne WHERE id = NEW.stevneid;

  -- The umbrella has no participants of its own: a registration there would
  -- never reach a start list or a result.
  IF v_er_hovud THEN
    RAISE EXCEPTION 'Påmelding skjer på eit lokalt SNC-stevne, ikkje på hovudstevnet %', NEW.stevneid;
  END IF;

  IF v_hovudid IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.pamelding p
    JOIN public.stevne s ON s.id = p.stevneid
    WHERE s.snc_hovudstevne_id = v_hovudid
      AND p.kasterid = NEW.kasterid
      AND p.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'Utøvaren er allereie påmeld eit anna lokalstevne i same SNC-runde';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pamelding_snc_ein_stad ON public.pamelding;
CREATE TRIGGER pamelding_snc_ein_stad
BEFORE INSERT OR UPDATE OF stevneid, kasterid ON public.pamelding
FOR EACH ROW EXECUTE FUNCTION public.trg_pamelding_snc_ein_stad();

-- ── The completed-stevne lock, opened for consolidation ──────────────────────
-- Consolidation writes the merged placement and NC points onto the local
-- stevner resultat rows AFTER those stevner are completed, which
-- trg_resultat_block_if_completed (20260709160000) blocks regardless of
-- SECURITY DEFINER. Allow exactly what consolidation does: an UPDATE touching
-- nothing but snc_plassering/nc_poeng, on a local stevne whose umbrella is
-- still open.

CREATE OR REPLACE FUNCTION public.snc_kan_konsolidere(p_stevneid INT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.stevne lokal
    JOIN public.stevne hovud ON hovud.id = lokal.snc_hovudstevne_id
    WHERE lokal.id = p_stevneid AND NOT hovud.erfullfort
  );
$$;

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

  IF TG_OP = 'UPDATE'
     AND OLD.stevneid IS NOT DISTINCT FROM NEW.stevneid
     AND public.snc_kan_konsolidere(OLD.stevneid)
     AND (to_jsonb(OLD) - 'snc_plassering' - 'nc_poeng')
         = (to_jsonb(NEW) - 'snc_plassering' - 'nc_poeng') THEN
    RETURN NEW;
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

-- ── complete_stevne / reopen_stevne ──────────────────────────────────────────
-- A local stevne gets NO NC points from its local placement - they come from
-- the merged list. The umbrella is never completed through complete_stevne.

CREATE OR REPLACE FUNCTION public.complete_stevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klubbid    INT;
  v_dato       DATE;
  v_stevnetype TEXT;
  v_year       INT;
  v_er_hovud   BOOLEAN;
  v_hovudid    INT;
BEGIN
  SELECT s.klubbid, s.dato, st.navn, s.er_snc_hovudstevne, s.snc_hovudstevne_id
  INTO v_klubbid, v_dato, v_stevnetype, v_er_hovud, v_hovudid
  FROM public.stevne s
  LEFT JOIN public.stevnetype st ON st.id = s.stevnetypeid
  WHERE s.id = p_stevneid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;

  IF v_er_hovud THEN
    RAISE EXCEPTION 'Stevne % er eit SNC-hovudstevne — bruk complete_snc_hovudstevne', p_stevneid;
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
    RAISE EXCEPTION 'Not authorized to complete stevne %', p_stevneid;
  END IF;

  IF v_hovudid IS NULL AND v_stevnetype IN ('NC', 'DNC', 'SNC') THEN
    v_year := EXTRACT(YEAR FROM v_dato);

    -- Placements with no matching point-table row score 0.
    UPDATE public.resultat r
    SET nc_poeng = 0
    WHERE r.stevneid = p_stevneid
      AND NOT EXISTS (
        SELECT 1 FROM public.norgescuppoeng np
        WHERE np.plassering = r.plassering
          AND np.gjelderfraaar <= v_year
          AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year)
      );

    UPDATE public.resultat r
    SET nc_poeng = CASE v_stevnetype
      WHEN 'NC'  THEN np.poengnc
      WHEN 'DNC' THEN np.poengdnc
      WHEN 'SNC' THEN CEIL(np.poengnc * 0.75)
    END
    FROM public.norgescuppoeng np
    WHERE r.stevneid = p_stevneid
      AND np.plassering = r.plassering
      AND np.gjelderfraaar <= v_year
      AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year);
  END IF;

  UPDATE public.stevne SET erfullfort = true WHERE id = p_stevneid;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_stevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klubbid  INT;
  v_er_hovud BOOLEAN;
  v_hovudid  INT;
BEGIN
  SELECT s.klubbid, s.er_snc_hovudstevne, s.snc_hovudstevne_id
  INTO v_klubbid, v_er_hovud, v_hovudid
  FROM public.stevne s
  WHERE s.id = p_stevneid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;

  IF v_er_hovud THEN
    RAISE EXCEPTION 'Stevne % er eit SNC-hovudstevne — bruk reopen_snc_hovudstevne', p_stevneid;
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

  -- The merged list was computed from these results: reopen the umbrella
  -- first, or the local stevne could change underneath a locked SNC list.
  IF v_hovudid IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.stevne WHERE id = v_hovudid AND erfullfort) THEN
    RAISE EXCEPTION 'SNC-hovudstevnet % er konsolidert — gjenopne det først', v_hovudid;
  END IF;

  UPDATE public.stevne SET erfullfort = false WHERE id = p_stevneid;
END;
$$;

-- ── Consolidating the round ──────────────────────────────────────────────────
-- The ranking mirrors the standing the local stevner show (xkastStilling.ts
-- and kongelagStilling.ts):
--   X-kast only   -> poeng_xkast, then ringer
--   Kongelag only -> poeng_kongelag, then ringer
--   Both          -> poeng_kongelag + carried-over X-kast (normalised to 100
--                   points: 100 / (antall_omganger * 20)), then kongelag
--                   points, kongelag ringer, X-kast points, X-kast ringer
-- resultat has no per-omgang tiebreaker, so ties share a placement (RANK).

CREATE OR REPLACE FUNCTION public.complete_snc_hovudstevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hovud       public.stevne;
  v_year        INT;
  v_omganger    INT;
  v_faktor      NUMERIC;
  v_har_innl    BOOLEAN;
  v_har_avsl    BOOLEAN;
  v_begge       BOOLEAN;
  v_antal_lokal INT;
  v_uferdige    INT;
BEGIN
  SELECT * INTO v_hovud FROM public.stevne WHERE id = p_stevneid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;
  IF NOT v_hovud.er_snc_hovudstevne THEN
    RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', p_stevneid;
  END IF;

  IF NOT (
    public.min_rolle() = 'admin'
    OR (
      public.min_rolle() = 'klubbadmin'
      AND EXISTS (
        SELECT 1 FROM public.klubbadmin_klubber kk
        WHERE kk.bruker_id = auth.uid() AND kk.klubbid = v_hovud.klubbid
      )
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to complete stevne %', p_stevneid;
  END IF;

  IF v_hovud.erfullfort THEN
    RAISE EXCEPTION 'SNC-hovudstevne % er allereie konsolidert', p_stevneid;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE NOT erfullfort)
  INTO v_antal_lokal, v_uferdige
  FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid;

  IF v_antal_lokal = 0 THEN
    RAISE EXCEPTION 'SNC-hovudstevne % har ingen lokalstevne', p_stevneid;
  END IF;
  IF v_uferdige > 0 THEN
    RAISE EXCEPTION '% av % lokalstevne er ikkje fullførte enno', v_uferdige, v_antal_lokal;
  END IF;

  v_har_innl := v_hovud.innledendekastemetodeid IS NOT NULL;
  v_har_avsl := v_hovud.avsluttendekastemetodeid IS NOT NULL;
  v_begge    := v_har_innl AND v_har_avsl;

  IF v_begge THEN
    SELECT antall_omganger INTO v_omganger
    FROM public.kastemetode WHERE id = v_hovud.innledendekastemetodeid;
    IF COALESCE(v_omganger, 0) <= 0 THEN
      RAISE EXCEPTION 'Innleiande kastemetode manglar antall_omganger — kan ikkje rekne overføring';
    END IF;
    v_faktor := 100.0 / (v_omganger * 20);
  ELSE
    v_faktor := 0;
  END IF;

  UPDATE public.resultat r
  SET snc_plassering = rangert.pl
  FROM (
    SELECT
      x.id,
      RANK() OVER (ORDER BY x.total DESC, x.hovudpoeng DESC, x.hovudringar DESC,
                            x.bipoeng DESC, x.biringar DESC) AS pl
    FROM (
      SELECT
        r2.id,
        CASE
          WHEN v_begge THEN COALESCE(r2.poeng_kongelag, 0)
                            + ROUND(COALESCE(r2.poeng_xkast, 0) * v_faktor)
          WHEN v_har_avsl THEN COALESCE(r2.poeng_kongelag, 0)
          ELSE COALESCE(r2.poeng_xkast, 0)
        END AS total,
        CASE WHEN v_har_avsl THEN COALESCE(r2.poeng_kongelag, 0)
             ELSE COALESCE(r2.poeng_xkast, 0) END AS hovudpoeng,
        CASE WHEN v_har_avsl THEN COALESCE(r2.antall_ring_kongelag, 0)
             ELSE COALESCE(r2.antall_ring_xkast, 0) END AS hovudringar,
        CASE WHEN v_begge THEN COALESCE(r2.poeng_xkast, 0) ELSE 0 END AS bipoeng,
        CASE WHEN v_begge THEN COALESCE(r2.antall_ring_xkast, 0) ELSE 0 END AS biringar
      FROM public.resultat r2
      JOIN public.stevne s ON s.id = r2.stevneid
      WHERE s.snc_hovudstevne_id = p_stevneid AND r2.kasterid IS NOT NULL
    ) x
  ) rangert
  WHERE r.id = rangert.id;

  -- NC points from the merged placement: SNC scores 75 % of the NC table, as
  -- before, and placements with no row in it score 0.
  v_year := EXTRACT(YEAR FROM v_hovud.dato);

  UPDATE public.resultat r
  SET nc_poeng = 0
  WHERE r.stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid)
    AND NOT EXISTS (
      SELECT 1 FROM public.norgescuppoeng np
      WHERE np.plassering = r.snc_plassering
        AND np.gjelderfraaar <= v_year
        AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year)
    );

  UPDATE public.resultat r
  SET nc_poeng = CEIL(np.poengnc * 0.75)
  FROM public.norgescuppoeng np
  WHERE r.stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid)
    AND np.plassering = r.snc_plassering
    AND np.gjelderfraaar <= v_year
    AND (np.gjeldertilaar IS NULL OR np.gjeldertilaar >= v_year);

  UPDATE public.stevne SET erfullfort = true WHERE id = p_stevneid;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_snc_hovudstevne(p_stevneid INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klubbid  INT;
  v_er_hovud BOOLEAN;
BEGIN
  SELECT klubbid, er_snc_hovudstevne INTO v_klubbid, v_er_hovud
  FROM public.stevne WHERE id = p_stevneid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stevne % not found', p_stevneid;
  END IF;
  IF NOT v_er_hovud THEN
    RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', p_stevneid;
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

  -- Open the umbrella first: snc_kan_konsolidere() is what lets the clearing
  -- writes through the resultat lock.
  UPDATE public.stevne SET erfullfort = false WHERE id = p_stevneid;

  UPDATE public.resultat
  SET snc_plassering = NULL, nc_poeng = NULL
  WHERE stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid);
END;
$$;

-- ── EXECUTE grants (cf. 20260710110100 / 20260710110200) ─────────────────────

REVOKE EXECUTE ON FUNCTION public.complete_snc_hovudstevne(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_snc_hovudstevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reopen_snc_hovudstevne(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reopen_snc_hovudstevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.snc_kan_konsolidere(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_resultat_block_if_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_snc_invariantar() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_snc_propager_format() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_pamelding_snc_ein_stad() FROM PUBLIC, anon, authenticated;
