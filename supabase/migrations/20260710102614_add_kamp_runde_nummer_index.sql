CREATE INDEX IF NOT EXISTS idx_kamp_runde_nummer ON public.kamp USING btree (runde_nummer);

-- DOWN
-- DROP INDEX IF EXISTS public.idx_kamp_runde_nummer;
