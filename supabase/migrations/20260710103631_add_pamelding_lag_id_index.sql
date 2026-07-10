CREATE INDEX IF NOT EXISTS idx_pamelding_lag_id ON public.pamelding USING btree (lag_id);

-- DOWN
-- DROP INDEX IF EXISTS public.idx_pamelding_lag_id;
