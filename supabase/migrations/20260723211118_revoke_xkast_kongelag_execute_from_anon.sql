-- The xkast/kongelag functions (added 2026-07-22/23) only ran
-- "REVOKE EXECUTE ... FROM PUBLIC". As 20260710110200 already documented,
-- Supabase grants EXECUTE directly to anon/authenticated at function-creation
-- time (not merely through PUBLIC), so those direct per-role grants survived
-- and the functions stayed callable via /rest/v1/rpc by the anon role.
-- Revoke from the actual roles, mirroring that earlier fix.

-- App RPCs: organizer/participant actions — keep authenticated, drop anon only.
REVOKE EXECUTE ON FUNCTION public.confirm_xkast_kongelag(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.swap_xkast_kongelag_deltaker(integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.edit_xkast_kongelag_omgang(integer, integer, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_xkast_kongelag_total(integer, integer, integer) FROM anon;

-- Internal helper: never meant to be reachable over the API.
REVOKE EXECUTE ON FUNCTION public._sync_xkast_kongelag_resultat(integer) FROM anon, authenticated;

-- Trigger functions: fired by the DB, never called as RPCs.
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_deltaker_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed() FROM anon, authenticated;
