-- Fix performance advisor: unused_index.
--
-- Verified via pg_stat_user_indexes (idx_scan = 0) and pg_stat_database
-- (stats_reset = null, i.e. these stats cover the database's entire
-- lifetime, not a recent reset). All four have genuinely never been chosen
-- by the planner:
--   * idx_norgescup_aar (140 rows) / idx_stevne_stevnetypeid (1250 rows):
--     tables small enough that Postgres always prefers a seq scan.
--   * idx_resultat_klubbid / idx_resultat_klasseid (36k+ rows): the columns
--     are queried, but always after the table is already narrowed down by
--     stevneid (which has its own index), so klubbid/klasseid are applied
--     as a cheap filter on the small remaining row set rather than via an
--     index scan of their own.
DROP INDEX IF EXISTS public.idx_norgescup_aar;
DROP INDEX IF EXISTS public.idx_resultat_klubbid;
DROP INDEX IF EXISTS public.idx_stevne_stevnetypeid;
DROP INDEX IF EXISTS public.idx_resultat_klasseid;
