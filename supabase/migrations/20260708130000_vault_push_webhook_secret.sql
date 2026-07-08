-- Moves PUSH_WEBHOOK_SECRET out of the trigger function body and into
-- Supabase Vault. The previous value was a plaintext literal in
-- 20260706120400_webhook_notification_queue_to_edge_function.sql, which
-- got committed to git history and had to be treated as compromised.
--
-- The new secret value was already rotated out-of-band (Edge Function
-- secret updated via `supabase secrets set`, and stored in Vault via
-- `select vault.create_secret('<value>', 'push_webhook_secret')` run
-- directly against the project — not as a migration, so the plaintext
-- value never lands in a committed file). This migration only wires the
-- trigger function to read it back from vault.decrypted_secrets at call
-- time; the literal never appears here.
CREATE OR REPLACE FUNCTION public.trg_notification_queue_send_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://urtvpewjlevhlevtnvkf.supabase.co/functions/v1/send-push-notification',
    body := jsonb_build_object('record', to_jsonb(NEW)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'push_webhook_secret'
      )
    ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;
