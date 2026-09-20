-- Approved kiosk devices. The MDM (Intune) pushes nothing but a device key, never
-- a password: the app exchanges that key for a session on the club account the row
-- points at, through the device-login edge function. A lost tablet is cut off by
-- setting active = false — no password rotation, and no other device affected.
--
-- The key itself is never stored, only its sha256: a leak of this table hands
-- nobody a key they can log in with.

CREATE TABLE public.kiosk_device (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  user_id uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login_at timestamp with time zone,
  CONSTRAINT kiosk_device_pkey PRIMARY KEY (id),
  CONSTRAINT kiosk_device_key_hash_key UNIQUE (key_hash),
  CONSTRAINT kiosk_device_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Deny-all for everyone but admin: the edge function reads with the service role,
-- which bypasses RLS anyway. No anon or user policy, so a logged-in user can
-- neither list devices nor see which account they sign in as.
--
-- TO authenticated is not optional (see 20260804102231): left TO public, anon
-- evaluates the expression and hits min_rolle(), which anon lost EXECUTE on in
-- 20260804094747 — the denial then arrives as a function-permission error instead
-- of an empty result.
ALTER TABLE public.kiosk_device ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kd_admin_all" ON public.kiosk_device FOR ALL TO authenticated
  USING (public.min_rolle() = 'admin');
