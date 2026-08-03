-- ============================================================
-- SNC: eitt hovudstevne som bind saman lokalstevna
--
-- Eit SNC-stevne blir arrangert samtidig av fleire klubbar på
-- ulike stader. Kvart lokalstevne har si eiga resultatliste og
-- sine eigne premiar; hovudstevnet eig den samla lista som
-- avgjer NC-poenga.
--
-- Modellert som ei sjølvreferanse på stevne (ikkje ein ny
-- entitet), slik at all eksisterande per-stevne-maskineri —
-- påmelding, kampgenerering, X-kast/Kongelag-banar, resultat,
-- rekordar og norgescup — held fram med å virke uendra for
-- lokalstevna. Hovudstevne-rada har sjølv aldri kampar eller
-- resultat: han er berre paraplyen + den samla lista.
-- ============================================================

ALTER TABLE public.stevne
  ADD COLUMN er_snc_hovudstevne boolean NOT NULL DEFAULT false,
  ADD COLUMN snc_hovudstevne_id integer REFERENCES public.stevne(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.stevne.er_snc_hovudstevne IS
  'Paraplystevnet for ein SNC-runde. Har ingen kampar/resultat sjølv; eig den samla resultatlista.';
COMMENT ON COLUMN public.stevne.snc_hovudstevne_id IS
  'Sett på eit lokalstevne: kva SNC-hovudstevne det høyrer til. NULL for vanlege stevne.';

-- Eit hovudstevne kan ikkje sjølv vere lokalstevne (ingen nesting).
ALTER TABLE public.stevne
  ADD CONSTRAINT stevne_snc_ikkje_nesta
  CHECK (NOT (er_snc_hovudstevne AND snc_hovudstevne_id IS NOT NULL));

CREATE INDEX stevne_snc_hovudstevne_id_idx
  ON public.stevne (snc_hovudstevne_id)
  WHERE snc_hovudstevne_id IS NOT NULL;

-- Plasseringa i den samla SNC-lista. resultat.plassering held fram med å vere
-- den lokale plasseringa (premiar på staden); nc_poeng blir rekna ut frå
-- snc_plassering for lokalstevne, jf. complete_snc_hovudstevne under.
ALTER TABLE public.resultat ADD COLUMN snc_plassering integer;

COMMENT ON COLUMN public.resultat.snc_plassering IS
  'Plassering i den samla SNC-lista på tvers av alle lokalstevna. NULL utanom SNC.';

-- ── Hjelparar: kva kastemetodar er lovlege for SNC ───────────────────────────
-- SNC er alltid X-kast, Kongelag eller begge — aldri Gloppen, NHM eller cup.
-- Namnemønstra speglar isXkastMethodName() i src/utils/kastemetode.ts.

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

-- ── Invariantar for SNC-stevne ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_stevne_snc_invariantar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_hovud    public.stevne;
  v_typenavn TEXT;
BEGIN
  -- Å løyse eit lokalstevne frå ein konsolidert runde ville late den samla lista
  -- stå att med resultat som ikkje lenger høyrer til henne. Sjekken må kome før
  -- retur-snarvegen under: etter ei fråkopling ser rada ut som eit vanleg stevne.
  IF TG_OP = 'UPDATE'
     AND OLD.snc_hovudstevne_id IS NOT NULL
     AND NEW.snc_hovudstevne_id IS DISTINCT FROM OLD.snc_hovudstevne_id
     AND EXISTS (SELECT 1 FROM public.stevne WHERE id = OLD.snc_hovudstevne_id AND erfullfort) THEN
    RAISE EXCEPTION 'SNC-hovudstevne % er konsolidert — gjenopne det før du flyttar lokalstevnet',
      OLD.snc_hovudstevne_id;
  END IF;

  IF NOT NEW.er_snc_hovudstevne AND NEW.snc_hovudstevne_id IS NULL THEN
    RETURN NEW;  -- vanleg stevne: ingenting å validere
  END IF;

  IF NEW.snc_hovudstevne_id IS NOT NULL THEN
    IF NEW.snc_hovudstevne_id = NEW.id THEN
      RAISE EXCEPTION 'Eit stevne kan ikkje vere sitt eige SNC-hovudstevne';
    END IF;

    SELECT * INTO v_hovud FROM public.stevne WHERE id = NEW.snc_hovudstevne_id;
    IF NOT FOUND OR NOT v_hovud.er_snc_hovudstevne THEN
      RAISE EXCEPTION 'Stevne % er ikkje eit SNC-hovudstevne', NEW.snc_hovudstevne_id;
    END IF;

    -- Den samla lista er alt rekna ut: ein ny stad ville stått utanfor henne.
    IF v_hovud.erfullfort
       AND (TG_OP = 'INSERT' OR OLD.snc_hovudstevne_id IS DISTINCT FROM NEW.snc_hovudstevne_id) THEN
      RAISE EXCEPTION 'SNC-hovudstevne % er konsolidert — gjenopne det før du legg til lokalstevne',
        NEW.snc_hovudstevne_id;
    END IF;

    -- Hovudstevnet eig formatet. Poengsummane frå ulike stader må vere
    -- samanliknbare i den samla lista, så stevnetype, kategori og begge
    -- kastemetodane blir tvinga til å følgje hovudstevnet. Rankinga følgjer med
    -- fordi kasta som tel skjer lokalt, men avgjerda gjeld heile runden.
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

-- Endrar hovudstevnet formatet, følgjer lokalstevna med. Berre lovleg så lenge
-- ingen av dei er starta — då er banar/kampar alt generert for det gamle formatet.
CREATE OR REPLACE FUNCTION public.trg_stevne_snc_propager_format()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.er_snc_hovudstevne THEN
    RETURN NULL;
  END IF;

  -- ernorgesranking styrer berre om kasta blir teljande i norgesrankinga — ingen
  -- banar eller kampar avheng av han, så han kan følgje hovudstevnet når som helst.
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

-- ── Påmelding: ein utøvar kan berre stå på éin stad per SNC-runde ────────────

CREATE OR REPLACE FUNCTION public.trg_pamelding_snc_ein_stad()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_hovudid INT;
BEGIN
  SELECT snc_hovudstevne_id INTO v_hovudid FROM public.stevne WHERE id = NEW.stevneid;
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

-- ── Låsen på fullførte stevne: opne for SNC-konsolidering ────────────────────
-- Konsolideringa skriv samla plassering og NC-poeng til lokalstevna sine
-- resultat-rader ETTER at lokalstevna er fullførte. trg_resultat_block_if_completed
-- (20260709160000) blokkerer alt slikt, uavhengig av SECURITY DEFINER. Slepp
-- gjennom nøyaktig det konsolideringa gjer: ein UPDATE som ikkje rører anna enn
-- snc_plassering/nc_poeng, på eit lokalstevne der hovudstevnet ikkje er
-- konsolidert enno.

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

-- ── complete_stevne / reopen_stevne: SNC-tilpassing ──────────────────────────
-- Eit lokalstevne får IKKJE NC-poeng frå si lokale plassering — poenga kjem frå
-- den samla lista (complete_snc_hovudstevne). Hovudstevnet blir aldri fullført
-- gjennom complete_stevne.

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

  -- Den samla lista er alt rekna ut av desse resultata: gjenopne hovudstevnet
  -- først, elles ville lokalstevnet kunne endre seg under ei låst SNC-liste.
  IF v_hovudid IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.stevne WHERE id = v_hovudid AND erfullfort) THEN
    RAISE EXCEPTION 'SNC-hovudstevnet % er konsolidert — gjenopne det først', v_hovudid;
  END IF;

  UPDATE public.stevne SET erfullfort = false WHERE id = p_stevneid;
END;
$$;

-- ── Konsolidering av SNC-runden ──────────────────────────────────────────────
-- Rangeringa speglar standen lokalstevna viser (src/utils/xkastStilling.ts +
-- kongelagStilling.ts):
--   X-kast åleine   → poeng_xkast, deretter ringar
--   Kongelag åleine → poeng_kongelag, deretter ringar
--   Begge           → poeng_kongelag + overført X-kast (normalisert til 100
--                     poeng: 100 / (antall_omganger * 20)), deretter
--                     kongelagpoeng, kongelagringar, X-kastpoeng, X-kastringar
-- Per-omgang-tiebreaket frå den lokale standen finst ikkje i resultat, så
-- likestilte utøvarar deler plassering (RANK: 1, 1, 3) i den samla lista.

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

  -- NC-poeng frå den samla plasseringa. SNC gir 75 % av NC-tabellen, som før;
  -- plasseringar utan rad i tabellen gir 0.
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

  -- Hovudstevnet må opnast før resultata kan nullstillast: snc_kan_konsolidere()
  -- er det som slepp skrivinga gjennom resultat-låsen.
  UPDATE public.stevne SET erfullfort = false WHERE id = p_stevneid;

  UPDATE public.resultat
  SET snc_plassering = NULL, nc_poeng = NULL
  WHERE stevneid IN (SELECT id FROM public.stevne WHERE snc_hovudstevne_id = p_stevneid);
END;
$$;

-- ── EXECUTE-rettar (jf. 20260710110100 / 20260710110200) ─────────────────────

REVOKE EXECUTE ON FUNCTION public.complete_snc_hovudstevne(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_snc_hovudstevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reopen_snc_hovudstevne(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reopen_snc_hovudstevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.snc_kan_konsolidere(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_resultat_block_if_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_snc_invariantar() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_snc_propager_format() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_pamelding_snc_ein_stad() FROM PUBLIC, anon, authenticated;
