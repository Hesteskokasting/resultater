-- Fix performance advisor: unindexed_foreign_keys.
--
-- 14 FK columns were flagged. Skipping 2 pure audit-trail columns with no
-- query usage anywhere in the app (kamp_omgang.registrert_av,
-- klubbadmin_klubber.tildelt_av — "who did this", never filtered/joined on).
-- Adding covering indexes for the other 12: each is either explicitly
-- filtered (.eq(...)), used as an embedded-select join target, or — for
-- bruker_profil.kasterid, klubbadmin_klubber.klubbid, pamelding.bruker_id —
-- a hot path in the RLS policies from 20260710111529_consolidate_multiple_
-- permissive_policies.sql, which runs these as EXISTS-subquery joins on
-- nearly every write.

CREATE INDEX IF NOT EXISTS idx_bruker_profil_kasterid ON public.bruker_profil USING btree (kasterid);
CREATE INDEX IF NOT EXISTS idx_bruker_profil_kobling_kasterid ON public.bruker_profil USING btree (kobling_kasterid);

CREATE INDEX IF NOT EXISTS idx_kaster_kjonnid ON public.kaster USING btree (kjonnid);
CREATE INDEX IF NOT EXISTS idx_kaster_klasseid ON public.kaster USING btree (klasseid);
CREATE INDEX IF NOT EXISTS idx_kaster_klubbid ON public.kaster USING btree (klubbid);

CREATE INDEX IF NOT EXISTS idx_klubbadmin_klubber_klubbid ON public.klubbadmin_klubber USING btree (klubbid);

CREATE INDEX IF NOT EXISTS idx_pamelding_bruker_id ON public.pamelding USING btree (bruker_id);

CREATE INDEX IF NOT EXISTS idx_resultat_gruppeid ON public.resultat USING btree (gruppeid);

CREATE INDEX IF NOT EXISTS idx_stevne_avsluttendekastemetodeid ON public.stevne USING btree (avsluttendekastemetodeid);
CREATE INDEX IF NOT EXISTS idx_stevne_innledendekastemetodeid ON public.stevne USING btree (innledendekastemetodeid);
CREATE INDEX IF NOT EXISTS idx_stevne_klubbid ON public.stevne USING btree (klubbid);
CREATE INDEX IF NOT EXISTS idx_stevne_kontaktkasterid ON public.stevne USING btree (kontaktkasterid);

-- DOWN
-- DROP INDEX IF EXISTS public.idx_bruker_profil_kasterid;
-- DROP INDEX IF EXISTS public.idx_bruker_profil_kobling_kasterid;
-- DROP INDEX IF EXISTS public.idx_kaster_kjonnid;
-- DROP INDEX IF EXISTS public.idx_kaster_klasseid;
-- DROP INDEX IF EXISTS public.idx_kaster_klubbid;
-- DROP INDEX IF EXISTS public.idx_klubbadmin_klubber_klubbid;
-- DROP INDEX IF EXISTS public.idx_pamelding_bruker_id;
-- DROP INDEX IF EXISTS public.idx_resultat_gruppeid;
-- DROP INDEX IF EXISTS public.idx_stevne_avsluttendekastemetodeid;
-- DROP INDEX IF EXISTS public.idx_stevne_innledendekastemetodeid;
-- DROP INDEX IF EXISTS public.idx_stevne_klubbid;
-- DROP INDEX IF EXISTS public.idx_stevne_kontaktkasterid;
