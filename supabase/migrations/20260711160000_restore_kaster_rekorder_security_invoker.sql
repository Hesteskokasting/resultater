-- The live kaster_rekorder view currently has reloptions = null (confirmed via
-- `select reloptions from pg_class where relname = 'kaster_rekorder'`) — the
-- security_invoker = true set by 20260710110300_kaster_rekorder_security_invoker.sql
-- was lost at some point, most likely because a later CREATE OR REPLACE VIEW
-- (the dashboard-side recreation after the untracked 20260508 drop) did not
-- preserve it. CREATE OR REPLACE VIEW does not carry forward previously-set
-- view reloptions, so any future recreation of this view must re-assert this
-- explicitly. Re-applying now regardless of history to guarantee the state.

ALTER VIEW public.kaster_rekorder SET (security_invoker = true);
