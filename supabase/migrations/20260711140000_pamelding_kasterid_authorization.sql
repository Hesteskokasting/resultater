-- pamelding authorization was keyed on bruker_id (the specific login account),
-- but multiple auth accounts can be approved-linked to the same kasterid.
-- A second linked account saw itself as "registered" (kasterid-based display)
-- but its own DELETE silently affected 0 rows under the old bruker_id-based
-- RLS, since the row's bruker_id belonged to the other account. Re-key
-- ownership on kasterid + bruker_profil linkage instead, and keep bruker_id
-- as a renamed, non-authoritative audit column (same convention as
-- kamp_omgang.registrert_av).

ALTER TABLE public.pamelding RENAME COLUMN bruker_id TO registrert_av;
ALTER TABLE public.pamelding ALTER COLUMN registrert_av DROP NOT NULL;
ALTER TABLE public.pamelding ALTER COLUMN registrert_av SET DEFAULT auth.uid();
ALTER TABLE public.pamelding RENAME CONSTRAINT pamelding_bruker_id_fkey TO pamelding_registrert_av_fkey;

COMMENT ON COLUMN public.pamelding.registrert_av IS
  'auth.users.id – kven som utførte handlinga. Kun til revisjon, ikkje brukt i RLS.';

-- No unique constraint existed on (stevneid, kasterid); a second linked
-- account could insert a duplicate registration for the same kasterid.
ALTER TABLE public.pamelding
  ADD CONSTRAINT pamelding_stevneid_kasterid_uniq UNIQUE (stevneid, kasterid);

-- Dead weight: existed only to serve the bruker_id-based RLS joins removed below.
DROP INDEX IF EXISTS public.idx_pamelding_bruker_id;

DROP POLICY IF EXISTS "pamelding_insert" ON public.pamelding;
DROP POLICY IF EXISTS "pamelding_update" ON public.pamelding;
DROP POLICY IF EXISTS "pamelding_delete" ON public.pamelding;

CREATE POLICY "pamelding_insert" ON public.pamelding FOR INSERT
  WITH CHECK (
    min_rolle() = 'admin'
    OR EXISTS (SELECT 1 FROM public.stevne s JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.bruker_profil bp
      WHERE bp.id = (select auth.uid())
        AND bp.kasterid = pamelding.kasterid
        AND bp.kobling_status = 'godkjent'
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
    OR EXISTS (
      SELECT 1 FROM public.bruker_profil bp
      WHERE bp.id = (select auth.uid())
        AND bp.kasterid = pamelding.kasterid
        AND bp.kobling_status = 'godkjent'
    )
  );

CREATE POLICY "pamelding_delete" ON public.pamelding FOR DELETE
  USING (
    min_rolle() = 'admin'
    OR EXISTS (SELECT 1 FROM public.stevne s JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid WHERE s.id = pamelding.stevneid AND kk.bruker_id = (select auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.bruker_profil bp
      WHERE bp.id = (select auth.uid())
        AND bp.kasterid = pamelding.kasterid
        AND bp.kobling_status = 'godkjent'
    )
  );
