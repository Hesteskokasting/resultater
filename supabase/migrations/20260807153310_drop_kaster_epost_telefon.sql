-- Contact details live in auth.users; kaster no longer stores them.
ALTER TABLE public.kaster
  DROP COLUMN IF EXISTS epost,
  DROP COLUMN IF EXISTS telefon;
