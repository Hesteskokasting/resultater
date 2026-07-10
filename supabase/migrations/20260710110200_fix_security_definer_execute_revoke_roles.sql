-- Corrects 20260710110100_restrict_security_definer_function_execute.sql.
-- That migration only ran "REVOKE EXECUTE ... FROM PUBLIC", but Supabase's
-- default privileges grant EXECUTE directly to anon/authenticated at
-- function-creation time (not merely inherited through PUBLIC), so those
-- direct per-role grants survived untouched and the advisor findings did not
-- clear. Revoke from the actual roles this time.

REVOKE EXECUTE ON FUNCTION public.bekreft_avsluttende_kamp_deltakar(integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.complete_stevne(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reopen_stevne(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.hent_bruker_epost(uuid[]) FROM anon;

REVOKE EXECUTE ON FUNCTION public.stevne_is_completed(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_mix_pamelding() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_omgang_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_spelar_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_kamp_spelar_notify_created() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_notification_queue_send_webhook() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_resultat_block_if_completed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_stevne_fase_start_notify() FROM anon, authenticated;
