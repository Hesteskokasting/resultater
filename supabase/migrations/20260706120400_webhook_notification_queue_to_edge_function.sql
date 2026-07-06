-- Fires the send-push-notification Edge Function for every row inserted
-- into notification_queue.
--
-- Originally written against supabase_functions.http_request (the wrapper
-- the Studio "Database Webhooks" UI generates), but that schema does not
-- exist on this project (confirmed: `select * from pg_namespace where
-- nspname = 'supabase_functions'` returns nothing). Falling back to calling
-- the underlying pg_net extension directly — same async HTTP-call
-- mechanism, just without the convenience wrapper.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- The secret below is a dedicated PUSH_WEBHOOK_SECRET, not the service_role
-- key, so a leak only exposes this one endpoint. It's stored here as a
-- plaintext literal in the function body, which is a known/accepted v1 gap
-- (see plans/native-push-notifications.md — "Known gaps"): anyone with
-- SQL-editor access on this project can read it back out of pg_proc, and
-- rotating it means a new migration. Set the same value as a Supabase
-- secret before deploying the Edge Function:
--   supabase secrets set PUSH_WEBHOOK_SECRET=61afeed087a86515e333b04b68a48d88f51d154a1eaa124153f113ef7dd688ca
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
      'x-webhook-secret', '61afeed087a86515e333b04b68a48d88f51d154a1eaa124153f113ef7dd688ca'
    ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER notification_queue_send_webhook
AFTER INSERT ON public.notification_queue
FOR EACH ROW
EXECUTE FUNCTION public.trg_notification_queue_send_webhook();
