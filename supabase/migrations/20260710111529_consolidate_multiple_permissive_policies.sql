-- Fix performance advisor: multiple_permissive_policies (205 findings).
--
-- Root cause: 20260608113908_consolidate_rls_policies.sql gave every table a
-- "*_admin_all" FOR ALL policy alongside a public "Enable read access for all
-- users" FOR SELECT policy (and, on several tables, older per-action policies
-- it should have replaced but didn't: stevne_delete_admin/insert_admin/
-- update_admin, kk_admin_alt). Postgres evaluates every permissive policy
-- that applies to a given role+action and ORs the results, so each of these
-- overlaps is evaluated on every row of every query, for no behavioral
-- benefit — the widest policy already decides the outcome.
--
-- Fix pattern per table:
--   * Where a table only overlaps on SELECT (admin_all's SELECT branch vs.
--     the public "true" read policy), split admin_all into per-action
--     (INSERT/UPDATE/DELETE) policies and leave the read policy alone —
--     removes the redundant SELECT branch, changes nothing else.
--   * Where a table has genuinely different write policies (admin bypass,
--     klubbadmin ownership, self-ownership) competing for the same action,
--     merge them into one OR'd policy per action so Postgres evaluates a
--     single expression instead of N.
--   * Drop plain leftover duplicates (stevne's *_admin single-action
--     policies duplicate stevne_admin_all; kk_admin_alt duplicates
--     klubbadmin_klubber_admin_all) outright.
--
-- Every merged condition below is copied verbatim from the live policy
-- definitions (via pg_policies), not retyped from memory, to guarantee the
-- resulting permission set is the union of the policies it replaces.

-- ============================================================
-- Pattern A: pure SELECT redundancy (admin_all + public read only).
-- Split admin_all into per-action policies; public read is untouched.
-- ============================================================

DROP POLICY IF EXISTS "antallTellendeNc_admin_all" ON public."antallTellendeNc";
CREATE POLICY "antallTellendeNc_admin_insert" ON public."antallTellendeNc" FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "antallTellendeNc_admin_update" ON public."antallTellendeNc" FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "antallTellendeNc_admin_delete" ON public."antallTellendeNc" FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "gruppe_admin_all" ON public.gruppe;
CREATE POLICY "gruppe_admin_insert" ON public.gruppe FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "gruppe_admin_update" ON public.gruppe FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "gruppe_admin_delete" ON public.gruppe FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "kastemetode_admin_all" ON public.kastemetode;
CREATE POLICY "kastemetode_admin_insert" ON public.kastemetode FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kastemetode_admin_update" ON public.kastemetode FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kastemetode_admin_delete" ON public.kastemetode FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "kategori_admin_all" ON public.kategori;
CREATE POLICY "kategori_admin_insert" ON public.kategori FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kategori_admin_update" ON public.kategori FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kategori_admin_delete" ON public.kategori FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "kjonn_admin_all" ON public.kjonn;
CREATE POLICY "kjonn_admin_insert" ON public.kjonn FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kjonn_admin_update" ON public.kjonn FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kjonn_admin_delete" ON public.kjonn FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "klasse_admin_all" ON public.klasse;
CREATE POLICY "klasse_admin_insert" ON public.klasse FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "klasse_admin_update" ON public.klasse FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "klasse_admin_delete" ON public.klasse FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "norgescuppoeng_admin_all" ON public.norgescuppoeng;
CREATE POLICY "norgescuppoeng_admin_insert" ON public.norgescuppoeng FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "norgescuppoeng_admin_update" ON public.norgescuppoeng FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "norgescuppoeng_admin_delete" ON public.norgescuppoeng FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "stevnetype_admin_all" ON public.stevnetype;
CREATE POLICY "stevnetype_admin_insert" ON public.stevnetype FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "stevnetype_admin_update" ON public.stevnetype FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "stevnetype_admin_delete" ON public.stevnetype FOR DELETE USING (min_rolle() = 'admin');

DROP POLICY IF EXISTS "resultat_admin_all" ON public.resultat;
CREATE POLICY "resultat_admin_insert" ON public.resultat FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "resultat_admin_update" ON public.resultat FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "resultat_admin_delete" ON public.resultat FOR DELETE USING (min_rolle() = 'admin');

-- ============================================================
-- Pattern B: tables with real write-policy overlaps. Merge via OR.
-- ============================================================

-- bruker_profil: admin_all vs. bp_les_eigen (SELECT) and bp_oppdater_eigen (UPDATE).
DROP POLICY IF EXISTS "bruker_profil_admin_all" ON public.bruker_profil;
DROP POLICY IF EXISTS "bp_les_eigen" ON public.bruker_profil;
DROP POLICY IF EXISTS "bp_oppdater_eigen" ON public.bruker_profil;

CREATE POLICY "bruker_profil_admin_insert" ON public.bruker_profil FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "bruker_profil_admin_delete" ON public.bruker_profil FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "bp_select" ON public.bruker_profil FOR SELECT
  USING (min_rolle() = 'admin' OR (select auth.uid()) = id);

CREATE POLICY "bp_oppdater" ON public.bruker_profil FOR UPDATE
  USING (min_rolle() = 'admin' OR (select auth.uid()) = id)
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      (select auth.uid()) = id
      AND rolle = (SELECT bruker_profil_1.rolle FROM public.bruker_profil bruker_profil_1 WHERE bruker_profil_1.id = (select auth.uid()))
    )
  );

-- kamp: admin_all vs. kamp_bekreft_deltakar (UPDATE).
DROP POLICY IF EXISTS "kamp_admin_all" ON public.kamp;
DROP POLICY IF EXISTS "kamp_bekreft_deltakar" ON public.kamp;

CREATE POLICY "kamp_admin_insert" ON public.kamp FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kamp_admin_delete" ON public.kamp FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "kamp_update" ON public.kamp FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR (
      er_bekreftet = false
      AND EXISTS (
        SELECT 1 FROM public.kamp_spelar ks JOIN public.bruker_profil bp ON bp.kasterid = ks.kasterid
        WHERE ks.kampid = kamp.id AND bp.id = (select auth.uid())
      )
    )
  )
  WITH CHECK (min_rolle() = 'admin' OR er_bekreftet = true);

-- kamp_omgang: admin_all vs. kamp_omgang_insert (INSERT) and kamp_omgang_update (UPDATE).
DROP POLICY IF EXISTS "kamp_omgang_admin_all" ON public.kamp_omgang;
DROP POLICY IF EXISTS "kamp_omgang_insert" ON public.kamp_omgang;
DROP POLICY IF EXISTS "kamp_omgang_update" ON public.kamp_omgang;

CREATE POLICY "kamp_omgang_admin_delete" ON public.kamp_omgang FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "kamp_omgang_insert" ON public.kamp_omgang FOR INSERT
  WITH CHECK (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.kamp_spelar target_ks
        JOIN public.kamp k ON k.id = target_ks.kampid
        JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
        JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_omgang.kamp_spelar_id AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
    )
  );

CREATE POLICY "kamp_omgang_update" ON public.kamp_omgang FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.kamp_spelar target_ks
        JOIN public.kamp k ON k.id = target_ks.kampid
        JOIN public.kamp_spelar participant_ks ON participant_ks.kampid = target_ks.kampid
        JOIN public.bruker_profil bp ON bp.kasterid = participant_ks.kasterid
      WHERE target_ks.id = kamp_omgang.kamp_spelar_id AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
    )
  );

-- kamp_spelar: admin_all vs. kamp_spelar_update_deltakar (UPDATE, fixed in
-- 20260710110000 for the always-true bug — now folding in the admin branch).
DROP POLICY IF EXISTS "kamp_spelar_admin_all" ON public.kamp_spelar;
DROP POLICY IF EXISTS "kamp_spelar_update_deltakar" ON public.kamp_spelar;

CREATE POLICY "kamp_spelar_admin_insert" ON public.kamp_spelar FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "kamp_spelar_admin_delete" ON public.kamp_spelar FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "kamp_spelar_update_deltakar" ON public.kamp_spelar FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.kamp k JOIN public.bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
      WHERE k.id = kamp_spelar.kampid AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
    )
  )
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      kampid = (SELECT existing.kampid FROM public.kamp_spelar existing WHERE existing.id = kamp_spelar.id)
      AND kasterid = (SELECT existing.kasterid FROM public.kamp_spelar existing WHERE existing.id = kamp_spelar.id)
      AND EXISTS (
        SELECT 1 FROM public.kamp k JOIN public.bruker_profil bp ON bp.kasterid = kamp_spelar.kasterid
        WHERE k.id = kamp_spelar.kampid AND bp.id = (select auth.uid()) AND k.er_bekreftet = false
      )
    )
  );

-- kaster: admin_all vs. kaster_insert_klubbadmin (INSERT) and kaster_update_klubbadmin (UPDATE).
DROP POLICY IF EXISTS "kaster_admin_all" ON public.kaster;
DROP POLICY IF EXISTS "kaster_insert_klubbadmin" ON public.kaster;
DROP POLICY IF EXISTS "kaster_update_klubbadmin" ON public.kaster;

CREATE POLICY "kaster_admin_delete" ON public.kaster FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "kaster_insert" ON public.kaster FOR INSERT
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.klubbadmin_klubber kk WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kaster.klubbid)
    )
  );

CREATE POLICY "kaster_update" ON public.kaster FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.klubbadmin_klubber kk WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kaster.klubbid)
    )
  );

-- klubb: admin_all vs. klubb_update_klubbadmin (UPDATE).
DROP POLICY IF EXISTS "klubb_admin_all" ON public.klubb;
DROP POLICY IF EXISTS "klubb_update_klubbadmin" ON public.klubb;

CREATE POLICY "klubb_admin_insert" ON public.klubb FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "klubb_admin_delete" ON public.klubb FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "klubb_update" ON public.klubb FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.klubbadmin_klubber kk WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = klubb.id)
    )
  );

-- klubbadmin_klubber: kk_admin_alt is a pure leftover duplicate of
-- klubbadmin_klubber_admin_all (never dropped by the consolidation
-- migration); both also overlap kk_les_eigen on SELECT.
DROP POLICY IF EXISTS "kk_admin_alt" ON public.klubbadmin_klubber;
DROP POLICY IF EXISTS "klubbadmin_klubber_admin_all" ON public.klubbadmin_klubber;
DROP POLICY IF EXISTS "kk_les_eigen" ON public.klubbadmin_klubber;

CREATE POLICY "kk_select" ON public.klubbadmin_klubber FOR SELECT
  USING (min_rolle() = 'admin' OR bruker_id = (select auth.uid()));
CREATE POLICY "klubbadmin_klubber_admin_insert" ON public.klubbadmin_klubber FOR INSERT WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "klubbadmin_klubber_admin_update" ON public.klubbadmin_klubber FOR UPDATE USING (min_rolle() = 'admin') WITH CHECK (min_rolle() = 'admin');
CREATE POLICY "klubbadmin_klubber_admin_delete" ON public.klubbadmin_klubber FOR DELETE USING (min_rolle() = 'admin');

-- pamelding: admin_all + pm_klubbadmin_sine_stevner (FOR ALL) overlap
-- pm_insert_brukar/pm_insert_klubbadmin (INSERT), pm_oppdater_eigen (UPDATE)
-- and pm_slett_eigen (DELETE), and both redundantly cover SELECT alongside
-- pm_les_alle (kept as-is: it alone already grants unconditional read).
DROP POLICY IF EXISTS "pamelding_admin_all" ON public.pamelding;
DROP POLICY IF EXISTS "pm_klubbadmin_sine_stevner" ON public.pamelding;
DROP POLICY IF EXISTS "pm_insert_brukar" ON public.pamelding;
DROP POLICY IF EXISTS "pm_insert_klubbadmin" ON public.pamelding;
DROP POLICY IF EXISTS "pm_oppdater_eigen" ON public.pamelding;
DROP POLICY IF EXISTS "pm_slett_eigen" ON public.pamelding;

CREATE POLICY "pamelding_insert" ON public.pamelding FOR INSERT
  WITH CHECK (
    min_rolle() = 'admin'
    OR EXISTS (SELECT 1 FROM public.stevne s JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid()))
    OR (
      (select auth.uid()) = bruker_id
      AND kasterid = (SELECT bruker_profil.kasterid FROM public.bruker_profil WHERE bruker_profil.id = (select auth.uid()) AND bruker_profil.kobling_status = 'godkjent')
    )
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.kaster k JOIN public.klubbadmin_klubber kk ON kk.klubbid = k.klubbid WHERE k.id = pamelding.kasterid AND kk.bruker_id = (select auth.uid()))
    )
  );

CREATE POLICY "pamelding_update" ON public.pamelding FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR EXISTS (SELECT 1 FROM public.stevne s JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid()))
    OR (select auth.uid()) = bruker_id
  );

CREATE POLICY "pamelding_delete" ON public.pamelding FOR DELETE
  USING (
    min_rolle() = 'admin'
    OR EXISTS (SELECT 1 FROM public.stevne s JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid()))
    OR (select auth.uid()) = bruker_id
  );

-- stevne: stevne_delete_admin/stevne_insert_admin/stevne_update_admin are
-- pure leftover duplicates of stevne_admin_all (never dropped by the
-- consolidation migration); stevne_insert_klubbadmin and
-- stevne_update_klubbadmin genuinely need merging with the admin branch.
DROP POLICY IF EXISTS "stevne_admin_all" ON public.stevne;
DROP POLICY IF EXISTS "stevne_delete_admin" ON public.stevne;
DROP POLICY IF EXISTS "stevne_insert_admin" ON public.stevne;
DROP POLICY IF EXISTS "stevne_insert_klubbadmin" ON public.stevne;
DROP POLICY IF EXISTS "stevne_update_admin" ON public.stevne;
DROP POLICY IF EXISTS "stevne_update_klubbadmin" ON public.stevne;

CREATE POLICY "stevne_admin_delete" ON public.stevne FOR DELETE USING (min_rolle() = 'admin');

CREATE POLICY "stevne_insert" ON public.stevne FOR INSERT
  WITH CHECK (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.klubbadmin_klubber kk WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = stevne.klubbid)
    )
  );

CREATE POLICY "stevne_update" ON public.stevne FOR UPDATE
  USING (
    min_rolle() = 'admin'
    OR (
      min_rolle() = 'klubbadmin'
      AND EXISTS (SELECT 1 FROM public.klubbadmin_klubber kk WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = stevne.klubbid)
    )
  );
