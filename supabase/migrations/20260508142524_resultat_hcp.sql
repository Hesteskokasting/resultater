-- Drop cilumn hcp from kamp_kaster
-- Add column hcp to resultat

ALTER TABLE public.kamp_spelar
DROP COLUMN hcp;

ALTER TABLE public.resultat
ADD COLUMN hcp INT DEFAULT 0;