-- Let an admin delete a login account from the admin dashboard.
--
-- The self-only rule from 20260714132417 stays in place for everyone else: the
-- sibling-deletion branch is NOT coming back, so an accidentally-approved link
-- request still cannot destroy the legitimate accounts on the same kasterid.
-- Admin deletion is a deliberate action, gated on the admin role instead.
--
-- Scope is unchanged: only the login account (bruker_profil + auth.users) is
-- removed. Thrower data (kaster, resultat, pamelding) is keyed by kasterid and
-- is left untouched, so deleting an account never removes an utøvar.
--
-- Guard: the last remaining admin account cannot be deleted by anyone,
-- including itself — an installation with no admin has no way back in.
CREATE OR REPLACE FUNCTION public.slett_brukarkonto(target_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_id uuid := (select auth.uid());
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF target_id <> caller_id AND public.min_rolle() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.bruker_profil WHERE id = target_id AND rolle = 'admin'
  ) AND (SELECT count(*) FROM public.bruker_profil WHERE rolle = 'admin') <= 1 THEN
    RAISE EXCEPTION 'Cannot delete the last admin account';
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
