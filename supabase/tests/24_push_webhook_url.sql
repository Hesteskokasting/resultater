BEGIN;

SELECT plan(3);

-- The webhook trigger used to post to a hardcoded project ref. It now reads
-- both the URL and the secret from Vault, so what matters is: no secrets → no
-- call and no aborted insert; secrets present → the call goes to the URL this
-- project was configured with.

INSERT INTO auth.users (id, email, aud, role, encrypted_password, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000009401', 'webhook@url.test', 'authenticated', 'authenticated', '', now(), now());

-- ── Case 1: unconfigured project — warn and continue ─────────────────────────

SELECT lives_ok(
  $$ INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
     VALUES ('00000000-0000-0000-0000-000000009401', 'stevne_start', 9401, 'T', 'B', '/') $$,
  'queue insert survives a project with no push webhook secrets'
);

SELECT is(
  (SELECT count(*) FROM net.http_request_queue),
  0::bigint,
  'nothing is posted when the Vault secrets are missing'
);

-- ── Case 2: configured project — post to its own URL ─────────────────────────

SELECT vault.create_secret('https://test-ref.supabase.co/functions/v1/send-push-notification', 'push_webhook_url');
SELECT vault.create_secret('test-secret', 'push_webhook_secret');

INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
VALUES ('00000000-0000-0000-0000-000000009401', 'stevne_start', 9402, 'T', 'B', '/');

SELECT is(
  (SELECT url FROM net.http_request_queue ORDER BY id DESC LIMIT 1),
  'https://test-ref.supabase.co/functions/v1/send-push-notification',
  'the request goes to the URL stored in this project''s Vault'
);

SELECT finish();
ROLLBACK;
