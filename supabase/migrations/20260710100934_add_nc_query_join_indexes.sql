CREATE INDEX IF NOT EXISTS idx_resultat_klasseid ON public.resultat(klasseid);
CREATE INDEX IF NOT EXISTS idx_resultat_klubbid ON public.resultat(klubbid);
CREATE INDEX IF NOT EXISTS idx_stevne_stevnetypeid ON public.stevne(stevnetypeid);

-- DOWN
-- DROP INDEX IF EXISTS public.idx_resultat_klasseid;
-- DROP INDEX IF EXISTS public.idx_resultat_klubbid;
-- DROP INDEX IF EXISTS public.idx_stevne_stevnetypeid;
