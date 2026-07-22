-- ============================================================
-- X-kast & Kongelag — dedicated tables
-- (plans/x-kast_kongelag-pulje-tables.md)
--
-- Both formats are individually-scored courts (no opponent, no
-- winner), so they get their own tables instead of reusing the
-- head-to-head kamp/kamp_spelar/kamp_omgang trio. Purely
-- additive: nothing on the kamp tables is altered.
-- ============================================================

-- ------------------------------------------------------------
-- 1. XKAST_KONGELAG
-- One row = one scored court: a bane, 1–3 participants
-- (X-kast) or 1 (Kongelag), each throwing a fixed number of
-- omganger. pulje groups courts into larger scheduling units.
-- ------------------------------------------------------------
CREATE TABLE public.xkast_kongelag (
  id           integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  stevneid     integer NOT NULL,
  fase         text    NOT NULL,
  pulje        integer,
  bane_nummer  integer,
  er_bekreftet boolean NOT NULL DEFAULT false,

  CONSTRAINT xkast_kongelag_pkey PRIMARY KEY (id),
  CONSTRAINT xkast_kongelag_stevneid_fkey
    FOREIGN KEY (stevneid) REFERENCES public.stevne(id) ON DELETE RESTRICT,
  CONSTRAINT xkast_kongelag_fase_check
    CHECK (fase IN ('innledende', 'avsluttende'))
);

COMMENT ON TABLE public.xkast_kongelag IS
  'Ein skåra bane i X-kast (innledende) eller Kongelag (avsluttende). Ingen motstandar — deltakarane kastar kvar for seg.';
COMMENT ON COLUMN public.xkast_kongelag.pulje IS
  'Numerisk pulje-nummer (1, 2, 3, …). Fleire banar deler same pulje.';

CREATE INDEX idx_xkast_kongelag_stevneid ON public.xkast_kongelag(stevneid);

-- ------------------------------------------------------------
-- 2. XKAST_KONGELAG_DELTAKER
-- One row = one player's participation on one court. poeng and
-- antall_ringer are aggregates over the player's omgang rows,
-- written only by the confirm RPC (single source of truth).
-- No kamp_poeng/kamp_plassering: there is no win/loss outcome.
-- ------------------------------------------------------------
CREATE TABLE public.xkast_kongelag_deltaker (
  id                integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  xkast_kongelag_id integer NOT NULL,
  kasterid          integer NOT NULL,
  poeng             integer NOT NULL DEFAULT 0,
  antall_ringer     integer NOT NULL DEFAULT 0,

  CONSTRAINT xkast_kongelag_deltaker_pkey PRIMARY KEY (id),
  CONSTRAINT xkast_kongelag_deltaker_xkast_kongelag_id_fkey
    FOREIGN KEY (xkast_kongelag_id) REFERENCES public.xkast_kongelag(id) ON DELETE CASCADE,
  CONSTRAINT xkast_kongelag_deltaker_kasterid_fkey
    FOREIGN KEY (kasterid) REFERENCES public.kaster(id) ON DELETE RESTRICT,
  CONSTRAINT xkast_kongelag_deltaker_bane_kaster_uniq
    UNIQUE (xkast_kongelag_id, kasterid)
);

COMMENT ON COLUMN public.xkast_kongelag_deltaker.poeng IS
  'SUM(xkast_kongelag_omgang.poeng) for deltakaren — skrive av confirm_xkast_kongelag(), ikkje av klienten.';

CREATE INDEX idx_xkast_kongelag_deltaker_xkast_kongelag_id
  ON public.xkast_kongelag_deltaker(xkast_kongelag_id);
CREATE INDEX idx_xkast_kongelag_deltaker_kasterid
  ON public.xkast_kongelag_deltaker(kasterid);

-- ------------------------------------------------------------
-- 3. XKAST_KONGELAG_OMGANG
-- One row = one omgang (4 shoes) for one participant.
-- Per shoe: 5 (ringer) or 3/2/1/0 by distance → omgang max is
-- 20 poeng / 4 ringere. Rounds ("runder", groups of 5 omganger)
-- are derived in code, not stored.
-- ------------------------------------------------------------
CREATE TABLE public.xkast_kongelag_omgang (
  id                         integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  xkast_kongelag_deltaker_id integer NOT NULL,
  omgang                     integer NOT NULL,
  poeng                      integer NOT NULL,
  antall_ringer              integer,
  registrert_av              uuid DEFAULT auth.uid(),
  registrert_at              timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT xkast_kongelag_omgang_pkey PRIMARY KEY (id),
  CONSTRAINT xkast_kongelag_omgang_deltaker_fkey
    FOREIGN KEY (xkast_kongelag_deltaker_id)
    REFERENCES public.xkast_kongelag_deltaker(id) ON DELETE CASCADE,
  CONSTRAINT xkast_kongelag_omgang_registrert_av_fkey
    FOREIGN KEY (registrert_av) REFERENCES auth.users(id),
  CONSTRAINT xkast_kongelag_omgang_deltaker_omgang_uniq
    UNIQUE (xkast_kongelag_deltaker_id, omgang),
  CONSTRAINT xkast_kongelag_omgang_poeng_check
    CHECK (poeng BETWEEN 0 AND 20),
  CONSTRAINT xkast_kongelag_omgang_ringer_check
    CHECK (antall_ringer IS NULL OR antall_ringer BETWEEN 0 AND 4)
);

COMMENT ON COLUMN public.xkast_kongelag_omgang.omgang IS
  'Sekvensielt omgangsnummer: 1..antall_omganger frå kastemetode (15/25/50 for X-kast, 10 for Kongelag).';
COMMENT ON COLUMN public.xkast_kongelag_omgang.antall_ringer IS
  'NULL = ikkje registrert enno, 0 = registrert null ringar.';

CREATE INDEX idx_xkast_kongelag_omgang_deltaker_id
  ON public.xkast_kongelag_omgang(xkast_kongelag_deltaker_id);
CREATE INDEX idx_xkast_kongelag_omgang_registrert_av
  ON public.xkast_kongelag_omgang(registrert_av);

-- ------------------------------------------------------------
-- 4. New columns on existing tables
-- ------------------------------------------------------------
-- Total omgang count is a property of the kastemetode, not the
-- stevne (every Minimatch-stevne is always 15 omganger).
ALTER TABLE public.kastemetode ADD COLUMN antall_omganger integer;

COMMENT ON COLUMN public.kastemetode.antall_omganger IS
  'Talet på omganger per deltakar for individuelt skåra metodar (X-kast/Kongelag). NULL for kampbaserte metodar.';

UPDATE public.kastemetode SET antall_omganger = 15 WHERE navn = 'Minimatch';
UPDATE public.kastemetode SET antall_omganger = 25 WHERE navn = 'Halvmatch';
UPDATE public.kastemetode SET antall_omganger = 50 WHERE navn = 'Heilmatch';
UPDATE public.kastemetode SET antall_omganger = 10 WHERE navn = 'Kongelag';

-- Admin-entered venue capacity that drives pulje division
-- (see "Pulje sizing" in plans/x-kast_kongelag-pulje-tables.md).
ALTER TABLE public.stevne ADD COLUMN tilgjengelige_baner integer;

COMMENT ON COLUMN public.stevne.tilgjengelige_baner IS
  'Talet på tilgjengelege banar — styrer puljeinndelinga for X-kast/Kongelag. NULL for andre stevneformat.';

-- ------------------------------------------------------------
-- 5. RLS
-- Mirrors the kamp tables: public read (scoreboards are open),
-- admin-managed structure, participants may register omganger
-- while their court is unconfirmed.
-- ------------------------------------------------------------
ALTER TABLE public.xkast_kongelag          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xkast_kongelag_deltaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xkast_kongelag_omgang   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.xkast_kongelag
  FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.xkast_kongelag_deltaker
  FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.xkast_kongelag_omgang
  FOR SELECT USING (true);

-- Court structure (rows, pulje/bane assignment) is admin-only.
-- Confirmation (er_bekreftet) goes through the SECURITY DEFINER
-- RPC, so participants need no direct UPDATE on this table.
CREATE POLICY "xkast_kongelag_admin_insert" ON public.xkast_kongelag
  FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "xkast_kongelag_admin_update" ON public.xkast_kongelag
  FOR UPDATE USING (min_rolle() = 'admin');
CREATE POLICY "xkast_kongelag_admin_delete" ON public.xkast_kongelag
  FOR DELETE USING (min_rolle() = 'admin');

-- Participant aggregates are written only by the confirm RPC
-- (SECURITY DEFINER) — direct writes are admin-only.
CREATE POLICY "xkast_kongelag_deltaker_admin_insert" ON public.xkast_kongelag_deltaker
  FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "xkast_kongelag_deltaker_admin_update" ON public.xkast_kongelag_deltaker
  FOR UPDATE USING (min_rolle() = 'admin');
CREATE POLICY "xkast_kongelag_deltaker_admin_delete" ON public.xkast_kongelag_deltaker
  FOR DELETE USING (min_rolle() = 'admin');

-- Any participant on the same court may register/correct
-- omganger for the whole court while it is unconfirmed —
-- same rule as kamp_omgang (one phone scores for the group).
CREATE POLICY "xkast_kongelag_omgang_insert" ON public.xkast_kongelag_omgang
  FOR INSERT WITH CHECK (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.xkast_kongelag_deltaker target_d
        JOIN public.xkast_kongelag xk ON xk.id = target_d.xkast_kongelag_id
        JOIN public.xkast_kongelag_deltaker participant_d
          ON participant_d.xkast_kongelag_id = target_d.xkast_kongelag_id
        JOIN public.bruker_profil bp ON bp.kasterid = participant_d.kasterid
      WHERE target_d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id
        AND bp.id = (SELECT auth.uid())
        AND xk.er_bekreftet = false
    )
  );

CREATE POLICY "xkast_kongelag_omgang_update" ON public.xkast_kongelag_omgang
  FOR UPDATE USING (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.xkast_kongelag_deltaker target_d
        JOIN public.xkast_kongelag xk ON xk.id = target_d.xkast_kongelag_id
        JOIN public.xkast_kongelag_deltaker participant_d
          ON participant_d.xkast_kongelag_id = target_d.xkast_kongelag_id
        JOIN public.bruker_profil bp ON bp.kasterid = participant_d.kasterid
      WHERE target_d.id = xkast_kongelag_omgang.xkast_kongelag_deltaker_id
        AND bp.id = (SELECT auth.uid())
        AND xk.er_bekreftet = false
    )
  );

CREATE POLICY "xkast_kongelag_omgang_admin_delete" ON public.xkast_kongelag_omgang
  FOR DELETE USING (min_rolle() = 'admin');

-- ------------------------------------------------------------
-- 6. Lock writes once the owning stevne is completed
-- (same protection the kamp tables got in
-- 20260709160000_lock_completed_stevne_writes.sql)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_xkast_kongelag_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.stevne_is_completed(OLD.stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre xkast_kongelag: stevne % er fullført', OLD.stevneid;
    END IF;
    RETURN OLD;
  END IF;

  IF public.stevne_is_completed(NEW.stevneid)
     OR (TG_OP = 'UPDATE' AND public.stevne_is_completed(OLD.stevneid)) THEN
    RAISE EXCEPTION 'Kan ikkje endre xkast_kongelag: stevne % er fullført', NEW.stevneid;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xkast_kongelag_deltaker_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid integer;
BEGIN
  SELECT xk.stevneid INTO v_stevneid
  FROM public.xkast_kongelag xk
  WHERE xk.id = COALESCE(NEW.xkast_kongelag_id, OLD.xkast_kongelag_id);

  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre xkast_kongelag_deltaker: stevne % er fullført', v_stevneid;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid integer;
BEGIN
  SELECT xk.stevneid INTO v_stevneid
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = COALESCE(NEW.xkast_kongelag_deltaker_id, OLD.xkast_kongelag_deltaker_id);

  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre xkast_kongelag_omgang: stevne % er fullført', v_stevneid;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_deltaker_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed() FROM PUBLIC;

CREATE TRIGGER xkast_kongelag_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.xkast_kongelag
FOR EACH ROW EXECUTE FUNCTION public.trg_xkast_kongelag_block_if_completed();

CREATE TRIGGER xkast_kongelag_deltaker_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.xkast_kongelag_deltaker
FOR EACH ROW EXECUTE FUNCTION public.trg_xkast_kongelag_deltaker_block_if_completed();

CREATE TRIGGER xkast_kongelag_omgang_block_if_completed
BEFORE INSERT OR UPDATE OR DELETE ON public.xkast_kongelag_omgang
FOR EACH ROW EXECUTE FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed();

-- ------------------------------------------------------------
-- 7. Realtime
-- Live scoreboards subscribe via postgres_changes. The kamp
-- tables were publication-enabled via the dashboard; these go
-- through migration history as they should.
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.xkast_kongelag;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xkast_kongelag_deltaker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xkast_kongelag_omgang;
