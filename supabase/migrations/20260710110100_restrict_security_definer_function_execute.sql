-- Restrict EXECUTE on SECURITY DEFINER functions (security advisor:
-- anon_security_definer_function_executable / authenticated_security_definer_function_executable).
--
-- Two groups:
-- 1. Client-callable RPCs that already gate access internally via min_rolle()
--    or a participant check (bekreft_avsluttende_kamp_deltakar, complete_stevne,
--    reopen_stevne, hent_bruker_epost). These require an authenticated
--    auth.uid() to pass their internal check, so anon has no legitimate use
--    for them — revoke anon, keep authenticated.
-- 2. Internal-only helpers never called directly by the client: trigger
--    functions (checked by Postgres to be un-callable outside trigger
--    context anyway) and stevne_is_completed (only used inside those
--    triggers, which run under the SECURITY DEFINER owner context and so are
--    unaffected by revoking the client roles' EXECUTE grant). Revoke from
--    PUBLIC entirely; nothing should call these via PostgREST.
--
-- public.min_rolle() is intentionally left untouched: RLS policies across
-- almost every table invoke it for anon and authenticated alike, so revoking
-- EXECUTE there would break ordinary reads, not just writes.

REVOKE EXECUTE ON FUNCTION public.bekreft_avsluttende_kamp_deltakar(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bekreft_avsluttende_kamp_deltakar(integer, integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.complete_stevne(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_stevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reopen_stevne(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reopen_stevne(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.hent_bruker_epost(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hent_bruker_epost(uuid[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.stevne_is_completed(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_mix_pamelding() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_omgang_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_spelar_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_spelar_notify_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_notification_queue_send_webhook() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_resultat_block_if_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_fase_start_notify() FROM PUBLIC;
