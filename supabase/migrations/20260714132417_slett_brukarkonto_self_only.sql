-- Restrict slett_brukarkonto to self-deletion only. Sibling deletion let an
-- accidentally-approved link request destroy the legitimate accounts on the
-- same kasterid; removing it shrinks the blast radius of a bad approval to
-- read-only exposure. The target_id parameter is kept (must equal auth.uid())
-- so existing clients and generated types stay valid.
CREATE OR REPLACE FUNCTION public.slett_brukarkonto(target_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_id uuid := (select auth.uid());
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF target_id <> caller_id THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  -- FKs referencing auth.users(id) without ON DELETE CASCADE:
  DELETE FROM public.klubbadmin_klubber WHERE bruker_id = target_id;
  UPDATE public.klubbadmin_klubber SET tildelt_av = NULL WHERE tildelt_av = target_id;
  UPDATE public.pamelding SET registrert_av = NULL WHERE registrert_av = target_id;
  UPDATE public.kamp_omgang SET registrert_av = NULL WHERE registrert_av = target_id;
  DELETE FROM public.bruker_profil WHERE id = target_id;

  -- notification_queue.user_id has ON DELETE CASCADE; Supabase's internal auth
  -- tables (identities, sessions, refresh_tokens, ...) cascade from auth.users.
  DELETE FROM auth.users WHERE id = target_id;
END;
$$;
