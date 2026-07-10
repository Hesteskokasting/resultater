CREATE INDEX IF NOT EXISTS idx_pamelding_kasterid ON public.pamelding USING btree (kasterid);

-- DOWN
-- DROP INDEX IF EXISTS public.idx_pamelding_kasterid;
