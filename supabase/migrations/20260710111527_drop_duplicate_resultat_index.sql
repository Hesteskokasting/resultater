-- Fix performance advisor: duplicate_index.
-- idx_resultat_stevne and idx_resultat_stevneid are identical btree(stevneid)
-- indexes on public.resultat. idx_resultat_stevneid is the one tracked by a
-- migration (20260426205731_add_resultat_stevneid_index.sql) and matches this
-- table's other index naming (idx_resultat_klubbid, idx_resultat_klasseid), so
-- drop the untracked duplicate.
DROP INDEX IF EXISTS public.idx_resultat_stevne;
