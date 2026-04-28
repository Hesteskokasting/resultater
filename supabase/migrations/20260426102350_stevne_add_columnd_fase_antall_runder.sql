ALTER TABLE public.stevne
ADD COLUMN stevne_fase text,
ADD COLUMN antall_runder_innl integer,
ADD COLUMN antall_runder_avsl integer;

-- Angre: npx supabase migration new angre_kastemetodeinfo, legg inn:
-- ALTER TABLE public.stevne 
-- DROP COLUMN stevne_fase, 
-- DROP COLUMN antall_runder_innl,
-- DROP COLUMN antall_runder_avsl;