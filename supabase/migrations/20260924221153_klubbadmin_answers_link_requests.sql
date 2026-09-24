-- #35: a klubbadmin answers link requests for throwers in their own club.
-- Reading goes through RLS (the Forespørslar list and its badge count); the
-- answer goes through an RPC, so a klubbadmin gets no UPDATE on bruker_profil
-- and cannot touch rolle or any other column of the requester's profile.

-- ── Helper ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION private.er_klubbadmin_for_kaster(p_kasterid integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT public.min_rolle() IS NOT DISTINCT FROM 'klubbadmin'
    AND EXISTS (
      SELECT 1
      FROM public.kaster k
      JOIN public.klubbadmin_klubber kk ON kk.klubbid = k.klubbid
      WHERE k.id = p_kasterid AND kk.bruker_id = (SELECT auth.uid())
    )
$$;

REVOKE EXECUTE ON FUNCTION private.er_klubbadmin_for_kaster(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.er_klubbadmin_for_kaster(integer) TO authenticated, service_role;

-- ── Reading: pending requests for the klubbadmin's throwers ──────────────────

ALTER POLICY bp_select ON public.bruker_profil
  USING (
    min_rolle() = 'admin'
    OR (SELECT auth.uid()) = id
    OR (kobling_status = 'venter' AND private.er_klubbadmin_for_kaster(kobling_kasterid))
  );

CREATE OR REPLACE FUNCTION public.hent_bruker_epost(bruker_ids uuid[])
RETURNS TABLE(id uuid, epost text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.id = ANY(bruker_ids)
    AND (
      public.min_rolle() = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.bruker_profil bp
        WHERE bp.id = au.id
          AND bp.kobling_status = 'venter'
          AND private.er_klubbadmin_for_kaster(bp.kobling_kasterid)
      )
    );
$$;

-- ── Answering ────────────────────────────────────────────────────────────────

-- Approving links the requested thrower; rejecting clears the link, as the
-- admin panel always did.
CREATE OR REPLACE FUNCTION public.svar_koblingsforespurnad(p_bruker_id uuid, p_godkjenn boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_kasterid integer;
BEGIN
  SELECT kobling_kasterid INTO v_kasterid
  FROM public.bruker_profil
  WHERE id = p_bruker_id AND kobling_status = 'venter'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brukaren har ingen ventande forespurnad' USING ERRCODE = 'P0002';
  END IF;

  IF NOT (
    public.min_rolle() IS NOT DISTINCT FROM 'admin'
    OR private.er_klubbadmin_for_kaster(v_kasterid)
  ) THEN
    RAISE EXCEPTION 'Not authorized: the thrower is not in your club' USING ERRCODE = '42501';
  END IF;

  IF p_godkjenn AND v_kasterid IS NULL THEN
    RAISE EXCEPTION 'Forespurnaden har ingen utøvar å kople til' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.bruker_profil
  SET kasterid = CASE WHEN p_godkjenn THEN v_kasterid END,
      kobling_status = CASE WHEN p_godkjenn THEN 'godkjent' ELSE 'avvist' END,
      kobling_kasterid = NULL
  WHERE id = p_bruker_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.svar_koblingsforespurnad(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.svar_koblingsforespurnad(uuid, boolean) TO authenticated, service_role;
