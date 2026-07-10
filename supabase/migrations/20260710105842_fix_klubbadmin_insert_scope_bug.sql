-- stevne_insert_klubbadmin and kaster_insert_klubbadmin both checked
-- kk.klubbid = kk.klubbid (always true) instead of comparing against the
-- inserted row's klubbid, unlike their _update_ siblings. This let any
-- klubbadmin insert stevne/kaster rows for any club, not just their own.

ALTER POLICY stevne_insert_klubbadmin ON public.stevne
  WITH CHECK (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = stevne.klubbid
    )
  );

ALTER POLICY kaster_insert_klubbadmin ON public.kaster
  WITH CHECK (
    min_rolle() = 'klubbadmin'
    AND EXISTS (
      SELECT 1 FROM public.klubbadmin_klubber kk
      WHERE kk.bruker_id = (select auth.uid()) AND kk.klubbid = kaster.klubbid
    )
  );

-- DOWN
-- Revert to the tautological kk.klubbid = kk.klubbid check if ever needed
-- (not recommended — that version is unscoped).
