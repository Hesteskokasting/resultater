-- Self-service approval of a pending kaster link for users with a verified
-- phone number (auth.users.phone_confirmed_at). Owning a verified phone is the
-- accepted accountability bar for auto-approval; users without one wait for
-- admin approval as before. SECURITY DEFINER is required both to read
-- auth.users (not readable by client roles) and because the hardened
-- bp_oppdater policy no longer lets users set kobling_status = 'godkjent'
-- themselves.

CREATE OR REPLACE FUNCTION public.godkjenn_kobling_med_telefon()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_id uuid := (select auth.uid());
  pending_kasterid integer;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = caller_id AND phone IS NOT NULL AND phone_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Phone not verified';
  END IF;

  SELECT kobling_kasterid INTO pending_kasterid
  FROM public.bruker_profil
  WHERE id = caller_id AND kobling_status = 'venter' AND kobling_kasterid IS NOT NULL
  FOR UPDATE;

  IF pending_kasterid IS NULL THEN
    RAISE EXCEPTION 'No pending link request';
  END IF;

  UPDATE public.bruker_profil
  SET kasterid = pending_kasterid, kobling_status = 'godkjent', kobling_kasterid = NULL
  WHERE id = caller_id;

  RETURN pending_kasterid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.godkjenn_kobling_med_telefon() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.godkjenn_kobling_med_telefon() FROM anon;
GRANT EXECUTE ON FUNCTION public.godkjenn_kobling_med_telefon() TO authenticated;
