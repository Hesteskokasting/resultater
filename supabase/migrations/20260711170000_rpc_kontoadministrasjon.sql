-- Konto tab on Min side: several login accounts can be linked to the same
-- thrower profile (kasterid). These RPCs let an approved-linked account list
-- and delete its sibling accounts. SECURITY DEFINER is required because the
-- bp_select RLS policy only grants reads on the caller's own bruker_profil
-- row, and auth.users is not readable by client roles at all.

-- ── List linked accounts (modeled on hent_bruker_epost) ──────────────────────
CREATE OR REPLACE FUNCTION public.hent_kobla_kontoar()
RETURNS TABLE(id uuid, epost text, opprettet_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT bp.id, au.email::text, bp.opprettet_at
  FROM public.bruker_profil me
  JOIN public.bruker_profil bp
    ON bp.kasterid = me.kasterid AND bp.kobling_status = 'godkjent'
  JOIN auth.users au ON au.id = bp.id
  WHERE me.id = (select auth.uid())
    AND me.kobling_status = 'godkjent'
    AND me.kasterid IS NOT NULL
  ORDER BY bp.opprettet_at;
$$;

REVOKE EXECUTE ON FUNCTION public.hent_kobla_kontoar() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.hent_kobla_kontoar() FROM anon;
GRANT EXECUTE ON FUNCTION public.hent_kobla_kontoar() TO authenticated;

-- ── Delete a login account ────────────────────────────────────────────────────
-- Deletes ONLY the login account (bruker_profil + auth.users). Thrower data
-- (kaster, resultat, pamelding) is keyed by kasterid and is left untouched.
-- Allowed targets: the caller itself, or a non-admin sibling account sharing
-- the caller's approved kasterid.
CREATE OR REPLACE FUNCTION public.slett_brukarkonto(target_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_id uuid := (select auth.uid());
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF target_id <> caller_id AND NOT EXISTS (
    SELECT 1
    FROM public.bruker_profil me
    JOIN public.bruker_profil target ON target.kasterid = me.kasterid
    WHERE me.id = caller_id AND target.id = target_id
      AND me.kobling_status = 'godkjent'
      AND target.kobling_status = 'godkjent'
      AND me.kasterid IS NOT NULL
      AND target.rolle <> 'admin'
  ) THEN
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

REVOKE EXECUTE ON FUNCTION public.slett_brukarkonto(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.slett_brukarkonto(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.slett_brukarkonto(uuid) TO authenticated;
