-- =============================================================================
-- RLS consolidation: bring migration history in line with production
-- =============================================================================
-- The production database accumulated RLS changes through the Supabase dashboard
-- that were never recorded as migrations. This file captures all of those changes
-- so local development is an accurate replica of production.
--
-- Changes captured here:
--   1. rls_auto_enable function + ensure_rls event trigger (auto-enables RLS on
--      new public tables — acts as a safety net for future migrations)
--   2. ENABLE ROW LEVEL SECURITY on all tables that lacked it in migrations
--   3. Uniform *_admin_all ALL policies across every table (replaces the older
--      per-operation admin policies that were in the init migration)
--   4. "Enable read access for all users" SELECT policies on every public table
--
-- All statements are idempotent: DROP IF EXISTS precedes every CREATE so this
-- migration is safe to apply to production where the policies already exist.
-- =============================================================================


-- ── 1. rls_auto_enable event trigger ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
       AND cmd.schema_name IN ('public')
       AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
       AND cmd.schema_name NOT LIKE 'pg_toast%'
       AND cmd.schema_name NOT LIKE 'pg_temp%'
    THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (schema not in enforced list: %)', cmd.object_identity, cmd.schema_name;
    END IF;
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS ensure_rls;
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();


-- ── 2. Enable RLS on tables missing it in migrations ─────────────────────────

ALTER TABLE public."antallTellendeNc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gruppe             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kastemetode        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaster             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kjonn              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klasse             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klubb              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.norgescuppoeng     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultat           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stevne             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stevnetype         ENABLE ROW LEVEL SECURITY;


-- ── 3. Drop per-operation admin policies replaced by *_admin_all ─────────────

DROP POLICY IF EXISTS "bp_les_admin"        ON public.bruker_profil;
DROP POLICY IF EXISTS "bp_oppdater_admin"   ON public.bruker_profil;
DROP POLICY IF EXISTS "pm_admin_alt"        ON public.pamelding;
DROP POLICY IF EXISTS "kaster_insert_admin" ON public.kaster;
DROP POLICY IF EXISTS "kaster_update_admin" ON public.kaster;
DROP POLICY IF EXISTS "kaster_delete_admin" ON public.kaster;
DROP POLICY IF EXISTS "klubb_insert_admin"  ON public.klubb;
DROP POLICY IF EXISTS "klubb_update_admin"  ON public.klubb;
DROP POLICY IF EXISTS "klubb_delete_admin"  ON public.klubb;


-- ── 4. *_admin_all policies (ALL operations, applied to every table) ──────────

DROP POLICY IF EXISTS "antallTellendeNc_admin_all"  ON public."antallTellendeNc";
CREATE POLICY "antallTellendeNc_admin_all" ON public."antallTellendeNc"
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "bruker_profil_admin_all" ON public.bruker_profil;
CREATE POLICY "bruker_profil_admin_all" ON public.bruker_profil
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "gruppe_admin_all" ON public.gruppe;
CREATE POLICY "gruppe_admin_all" ON public.gruppe
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kamp_admin_all" ON public.kamp;
CREATE POLICY "kamp_admin_all" ON public.kamp
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kamp_omgang_admin_all" ON public.kamp_omgang;
CREATE POLICY "kamp_omgang_admin_all" ON public.kamp_omgang
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kamp_spelar_admin_all" ON public.kamp_spelar;
CREATE POLICY "kamp_spelar_admin_all" ON public.kamp_spelar
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kastemetode_admin_all" ON public.kastemetode;
CREATE POLICY "kastemetode_admin_all" ON public.kastemetode
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kaster_admin_all" ON public.kaster;
CREATE POLICY "kaster_admin_all" ON public.kaster
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kategori_admin_all" ON public.kategori;
CREATE POLICY "kategori_admin_all" ON public.kategori
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "kjonn_admin_all" ON public.kjonn;
CREATE POLICY "kjonn_admin_all" ON public.kjonn
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "klasse_admin_all" ON public.klasse;
CREATE POLICY "klasse_admin_all" ON public.klasse
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "klubb_admin_all" ON public.klubb;
CREATE POLICY "klubb_admin_all" ON public.klubb
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "klubbadmin_klubber_admin_all" ON public.klubbadmin_klubber;
CREATE POLICY "klubbadmin_klubber_admin_all" ON public.klubbadmin_klubber
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "norgescuppoeng_admin_all" ON public.norgescuppoeng;
CREATE POLICY "norgescuppoeng_admin_all" ON public.norgescuppoeng
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "pamelding_admin_all" ON public.pamelding;
CREATE POLICY "pamelding_admin_all" ON public.pamelding
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "resultat_admin_all" ON public.resultat;
CREATE POLICY "resultat_admin_all" ON public.resultat
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "stevne_admin_all" ON public.stevne;
CREATE POLICY "stevne_admin_all" ON public.stevne
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');

DROP POLICY IF EXISTS "stevnetype_admin_all" ON public.stevnetype;
CREATE POLICY "stevnetype_admin_all" ON public.stevnetype
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');


-- ── 5. Public SELECT policies ("Enable read access for all users") ────────────

DROP POLICY IF EXISTS "Enable read access for all users" ON public."antallTellendeNc";
CREATE POLICY "Enable read access for all users" ON public."antallTellendeNc"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.gruppe;
CREATE POLICY "Enable read access for all users" ON public.gruppe
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kamp;
CREATE POLICY "Enable read access for all users" ON public.kamp
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kamp_omgang;
CREATE POLICY "Enable read access for all users" ON public.kamp_omgang
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kamp_spelar;
CREATE POLICY "Enable read access for all users" ON public.kamp_spelar
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kastemetode;
CREATE POLICY "Enable read access for all users" ON public.kastemetode
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kaster;
CREATE POLICY "Enable read access for all users" ON public.kaster
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kategori;
CREATE POLICY "Enable read access for all users" ON public.kategori
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kjonn;
CREATE POLICY "Enable read access for all users" ON public.kjonn
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.klasse;
CREATE POLICY "Enable read access for all users" ON public.klasse
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.klubb;
CREATE POLICY "Enable read access for all users" ON public.klubb
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.norgescuppoeng;
CREATE POLICY "Enable read access for all users" ON public.norgescuppoeng
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.resultat;
CREATE POLICY "Enable read access for all users" ON public.resultat
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.stevne;
CREATE POLICY "Enable read access for all users" ON public.stevne
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.stevnetype;
CREATE POLICY "Enable read access for all users" ON public.stevnetype
  FOR SELECT USING (true);
