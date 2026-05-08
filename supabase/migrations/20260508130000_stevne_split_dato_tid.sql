DROP VIEW IF EXISTS kaster_rekorder;

ALTER TABLE public.stevne
  ALTER COLUMN dato TYPE date USING dato::date,
  ADD COLUMN tid time;
