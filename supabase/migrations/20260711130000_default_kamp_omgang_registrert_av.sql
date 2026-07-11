-- kamp_omgang.registrert_av was added with an auth.users FK and intended to
-- track who logged each round, but no write path ever set it (100% null).
-- Default it to auth.uid() so future inserts populate it automatically via
-- the existing anon-key + RLS flow, without touching kampService.ts.

alter table public.kamp_omgang
  alter column registrert_av set default auth.uid();
