-- Holds one row per resolved push notification to send. Populated by
-- SECURITY DEFINER triggers on stevne/kamp_spelar (which already do the
-- recipient-resolution + preference-filtering joins), drained by an Edge
-- Function invoked via the webhook trigger added in a later migration.
CREATE TABLE public.notification_queue (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('stevne_start', 'kamp_opprettet')),
  entity_id         integer NOT NULL,
  title             text NOT NULL,
  body              text NOT NULL,
  deep_link         text NOT NULL,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  sent_at           timestamptz,
  CONSTRAINT notification_queue_dedupe_uniq UNIQUE (user_id, notification_type, entity_id)
);

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- No policy for regular users: only SECURITY DEFINER trigger functions
-- (which bypass RLS) and the service_role-authenticated Edge Function
-- touch this table. Admins can inspect it for support/debugging.
CREATE POLICY "notification_queue_admin_all" ON public.notification_queue
  FOR ALL USING (public.min_rolle() = 'admin') WITH CHECK (public.min_rolle() = 'admin');
