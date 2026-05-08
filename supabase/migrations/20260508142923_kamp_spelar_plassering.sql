-- Add column kamp_plassering to kamp_spelar. Used to set place in the match

ALTER TABLE public.kamp_spelar
ADD COLUMN kamp_plassering INT;