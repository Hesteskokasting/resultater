-- The Edge Function URL was hardcoded to the dev project ref, so running this
-- migration against any other project made that database post its push jobs to
-- dev's Edge Function. Both the URL and the secret now come from Vault, so the
-- migration is project-agnostic and each project points at itself.
--
-- Set once per project (not as a migration — the values differ per project):
--   select vault.create_secret(
--     'https://<project-ref>.supabase.co/functions/v1/send-push-notification',
--     'push_webhook_url');
--
-- A missing secret skips the call with a warning instead of aborting: a push
-- that never goes out is bad, an insert that rolls back a match result is worse.
CREATE OR REPLACE FUNCTION public.trg_notification_queue_send_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
BEGIN
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets WHERE name = 'push_webhook_url';

  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';

  IF webhook_url IS NULL OR webhook_secret IS NULL THEN
    RAISE WARNING 'push webhook not configured (vault: push_webhook_url / push_webhook_secret) — skipping';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := webhook_url,
    body := jsonb_build_object('record', to_jsonb(NEW)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;
