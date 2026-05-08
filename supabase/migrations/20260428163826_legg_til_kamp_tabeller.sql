-- ============================================================
-- REVIDERT SKJEMA – hesteskokasting turnerings-app
-- ============================================================
-- Køyr dette i Supabase SQL-editor.
-- Tabellane byggjer på eksisterande public.stevne, public.kaster,
-- public.klubb, public.klasse, public.gruppe og auth.users.
-- ============================================================

-- Fjern eksisterande kaster_rekorder view
DROP VIEW IF EXISTS kaster_rekorder;

-- ------------------------------------------------------------
-- 1. RESULTAT (eksisterande tabell – berre endringar)
-- ------------------------------------------------------------
-- Nye kolonnar
ALTER TABLE public.resultat
  ADD COLUMN IF NOT EXISTS startnummer integer,
  ADD COLUMN IF NOT EXISTS runde_eliminert integer;

-- Kolonnenavn-endringar (køyr éin og éin)
ALTER TABLE public.resultat RENAME COLUMN norgescuppoeng     TO nc_poeng;
ALTER TABLE public.resultat RENAME COLUMN kamppoeng          TO kamp_poeng_innl;
ALTER TABLE public.resultat RENAME COLUMN skarinnledende     TO score_poeng_innl;
ALTER TABLE public.resultat RENAME COLUMN poengkongelag      TO poeng_kongelag;
ALTER TABLE public.resultat RENAME COLUMN poenggolf          TO poeng_golf;
ALTER TABLE public.resultat RENAME COLUMN antallringkongelag TO antall_ring_kongelag;

-- Slå saman x-kast kolonnar (berre éin metode er aktiv per stevne)
ALTER TABLE public.resultat
  ADD COLUMN IF NOT EXISTS poeng_xkast       integer,
  ADD COLUMN IF NOT EXISTS antall_ring_xkast integer;

-- Migrer eksisterande data (tek den som ikkje er null)
UPDATE public.resultat SET
  poeng_xkast       = COALESCE(poengminimatch, poengxhalvmatch, poengxheilmatch),
  antall_ring_xkast = COALESCE(antallringminimatch, antallringhalvmatch, antallringheilmatch);

-- Fjern gamle kolonnar etter migrering
ALTER TABLE public.resultat
  DROP COLUMN IF EXISTS poengminimatch,
  DROP COLUMN IF EXISTS poengxhalvmatch,
  DROP COLUMN IF EXISTS poengxheilmatch,
  DROP COLUMN IF EXISTS antallringminimatch,
  DROP COLUMN IF EXISTS antallringhalvmatch,
  DROP COLUMN IF EXISTS antallringheilmatch;


-- ------------------------------------------------------------
-- 2. KAMP
-- Metadata om ein enkelt kamp: runde, bane, fase og status.
-- Inneheld ikkje resultat – det ligg i kamp_spelar.
-- match_id er app-generert tekst-ID (t.d. "P0IxgK0uBf").
-- Kan fjernast når all data går gjennom databasen.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kamp (
  id              integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  match_id        text NOT NULL,
  stevneid        integer NOT NULL,
  fase            text NOT NULL,
  runde_nummer    integer NOT NULL,
  gruppe_navn     text,
  runde_navn      text,
  bane_nummer     integer,
  er_bekreftet    boolean NOT NULL DEFAULT false,
  er_walkover     boolean NOT NULL DEFAULT false,
  er_tre_spelarar boolean NOT NULL DEFAULT false,

  CONSTRAINT kamp_pkey PRIMARY KEY (id),
  CONSTRAINT kamp_stevneid_fkey
    FOREIGN KEY (stevneid) REFERENCES public.stevne(id),
  CONSTRAINT kamp_match_id_stevne_uniq
    UNIQUE (stevneid, match_id),
  CONSTRAINT kamp_fase_check
    CHECK (fase IN ('innledende', 'avsluttende')),
  CONSTRAINT kamp_gruppe_check
    CHECK (gruppe_navn IS NULL OR gruppe_navn IN ('A', 'B'))
);

CREATE INDEX IF NOT EXISTS idx_kamp_stevneid ON public.kamp(stevneid);


-- ------------------------------------------------------------
-- 3. KAMP_SPELAR
-- Éin rad per spelar per kamp.
-- Sluttresultat for spelaren i denne konkrete kampen.
-- Når er_bekreftet = true på kamp, summerast poeng opp til resultat.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kamp_spelar (
  id            integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  kampid        integer NOT NULL,
  kasterid      integer NOT NULL,
  score_poeng   integer NOT NULL DEFAULT 0,
  kamp_poeng    real    NOT NULL DEFAULT 0,
  antall_ringer integer NOT NULL DEFAULT 0,
  hcp           integer NOT NULL DEFAULT 0,
  posisjon      integer,

  CONSTRAINT kamp_spelar_pkey PRIMARY KEY (id),
  CONSTRAINT kamp_spelar_kampid_fkey
    FOREIGN KEY (kampid) REFERENCES public.kamp(id),
  CONSTRAINT kamp_spelar_kasterid_fkey
    FOREIGN KEY (kasterid) REFERENCES public.kaster(id),
  CONSTRAINT kamp_spelar_kamp_kaster_uniq
    UNIQUE (kampid, kasterid),
  CONSTRAINT kamp_spelar_kamp_poeng_check
    CHECK (kamp_poeng IN (0, 1, 1.5, 2))
);

COMMENT ON COLUMN public.kamp_spelar.kamp_poeng IS
  '0 = tap (score under 11), 1 = tap (score 11+), 1.5 = uavgjort, 2 = siger';
COMMENT ON COLUMN public.kamp_spelar.posisjon IS
  'Kastenummer i par/mix (1 eller 2). Null i singelkamp.';
COMMENT ON COLUMN public.kamp_spelar.hcp IS
  'Handicap-poeng denne deltakaren startar kampen med.';

CREATE INDEX IF NOT EXISTS idx_kamp_spelar_kampid   ON public.kamp_spelar(kampid);
CREATE INDEX IF NOT EXISTS idx_kamp_spelar_kasterid ON public.kamp_spelar(kasterid);


-- ------------------------------------------------------------
-- 4. KAMP_OMGANG
-- Valfri per-omgang-statistikk registrert av deltakarane sjølve
-- via eigen app. Ikkje obligatorisk.
-- Kasterid hentast via kamp_spelar_id → kamp_spelar.kasterid.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kamp_omgang (
  id             integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  kamp_spelar_id integer NOT NULL,
  omgang         integer NOT NULL,
  score          integer,
  antall_ringer  integer,
  registrert_av  uuid,
  registrert_at  timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT kamp_omgang_pkey PRIMARY KEY (id),
  CONSTRAINT kamp_omgang_kamp_spelar_fkey
    FOREIGN KEY (kamp_spelar_id) REFERENCES public.kamp_spelar(id),
  CONSTRAINT kamp_omgang_registrert_av_fkey
    FOREIGN KEY (registrert_av) REFERENCES auth.users(id),
  CONSTRAINT kamp_omgang_spelar_omgang_uniq
    UNIQUE (kamp_spelar_id, omgang)
);

COMMENT ON TABLE public.kamp_omgang IS
  'Valfri detaljstatistikk per omgang, registrert av deltakarane sjølve.';
COMMENT ON COLUMN public.kamp_omgang.registrert_av IS
  'auth.users.id – kven som registrerte omgangen. Nyttig for validering.';

CREATE INDEX IF NOT EXISTS idx_kamp_omgang_kamp_spelar_id
  ON public.kamp_omgang(kamp_spelar_id);

-- Re-add kaster_rekorder view
  CREATE OR REPLACE VIEW kaster_rekorder AS

SELECT
  km_avsl.navn AS metode,
  r.poeng_kongelag AS poeng,
  k.id AS kasterid, k.fornavn, k.etternavn,
  kj.id AS kjonn_id, kj.navn AS kjonn_navn,
  kb.id AS klubb_id, kb.navn AS klubb_navn,
  s.id AS stevne_id, s.navn AS stevne_navn,
  EXTRACT(YEAR FROM s.dato)::int AS ar
FROM (
  SELECT DISTINCT ON (kasterid) kasterid, poeng_kongelag, klubbid, stevneid
  FROM resultat WHERE poeng_kongelag IS NOT NULL
  ORDER BY kasterid, poeng_kongelag DESC
) r
JOIN kaster k ON k.id = r.kasterid
LEFT JOIN kjonn kj ON kj.id = k.kjonnid
LEFT JOIN klubb kb ON kb.id = r.klubbid
LEFT JOIN stevne s ON s.id = r.stevneid
LEFT JOIN kastemetode km_avsl ON km_avsl.id = s.avsluttendekastemetodeid

UNION ALL

SELECT
  COALESCE(km_innl.navn, km_avsl.navn) AS metode,
  r.poeng_xkast AS poeng,
  k.id, k.fornavn, k.etternavn,
  kj.id, kj.navn, kb.id, kb.navn,
  s.id, s.navn, EXTRACT(YEAR FROM s.dato)::int
FROM (
  SELECT DISTINCT ON (kasterid) kasterid, poeng_xkast, klubbid, stevneid
  FROM resultat WHERE poeng_xkast IS NOT NULL
  ORDER BY kasterid, poeng_xkast DESC
) r
JOIN kaster k ON k.id = r.kasterid
LEFT JOIN kjonn kj ON kj.id = k.kjonnid
LEFT JOIN klubb kb ON kb.id = r.klubbid
LEFT JOIN stevne s ON s.id = r.stevneid
LEFT JOIN kastemetode km_innl ON km_innl.id = s.innledendekastemetodeid
LEFT JOIN kastemetode km_avsl ON km_avsl.id = s.avsluttendekastemetodeid;