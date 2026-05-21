DROP TRIGGER IF EXISTS kamp_spelar_sync_innl_poeng ON kamp_spelar;
DROP TRIGGER IF EXISTS kamp_sync_innl_poeng ON kamp;
DROP FUNCTION IF EXISTS public.trg_kamp_spelar_sync_innl();
DROP FUNCTION IF EXISTS public.trg_kamp_sync_innl();
DROP FUNCTION IF EXISTS public._sync_innl_poeng(integer, integer);
