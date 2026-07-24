-- Reproduce prod's client-role table privileges in migration history.
--
-- Prod (project urtvpewjlevhlevtnvkf) grants full DML (SELECT/INSERT/UPDATE/
-- DELETE) to both anon and authenticated on every table in public. Those grants
-- came from Supabase platform provisioning at project creation and were never
-- captured in a migration. Older CLI versions replicated them on a fresh
-- `supabase db reset`; the current CLI does not, so every role-switching pgTAP
-- test dies with 42501 permission denied even though the RLS policies are fine.
--
-- This is safe, not a widening of prod's posture: it mirrors grants prod already
-- has (a no-op there), and RLS remains the actual gate. Every table in public
-- has RLS enabled, and the `ensure_rls` event trigger (rls_auto_enable) forces
-- RLS on for any future table at ddl_command_end — so the ALTER DEFAULT
-- PRIVILEGES line cannot expose an unguarded future table.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
