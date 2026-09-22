-- Deleting a login account was impossible once the user had registered a throw in
-- any completed stevne: slett_brukarkonto clears kamp_omgang.registrert_av (an FK
-- to auth.users with no ON DELETE), and the completion lock from 20260709160000
-- refused that UPDATE.
--
-- The lock exists to freeze the result data of a finished stevne. registrert_av is
-- not result data — it is the audit pointer that has to go when the account does.
-- So the two omgang triggers now let through the one UPDATE that clears it to NULL
-- and changes nothing else. Setting it to another user is still refused, so the
-- lock cannot be used to rewrite who registered a throw.
--
-- xkast_kongelag_omgang.registrert_av is the same FK and was never cleared at all,
-- so the delete would have failed on it next; slett_brukarkonto now covers it.

CREATE OR REPLACE FUNCTION public.trg_kamp_omgang_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid INT;
  v_old public.kamp_omgang;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.registrert_av IS NULL THEN
    v_old := OLD;
    v_old.registrert_av := NULL;
    IF v_old IS NOT DISTINCT FROM NEW THEN
      RETURN NEW;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    SELECT k.stevneid INTO v_stevneid
    FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
    WHERE ks.id = OLD.kamp_spelar_id;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
    END IF;
    RETURN OLD;
  END IF;

  SELECT k.stevneid INTO v_stevneid
  FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
  WHERE ks.id = NEW.kamp_spelar_id;
  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT k.stevneid INTO v_stevneid
    FROM public.kamp_spelar ks JOIN public.kamp k ON k.id = ks.kampid
    WHERE ks.id = OLD.kamp_spelar_id;
    IF public.stevne_is_completed(v_stevneid) THEN
      RAISE EXCEPTION 'Kan ikkje endre kamp_omgang: stevne % er fullført', v_stevneid;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stevneid integer;
  v_old public.xkast_kongelag_omgang;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.registrert_av IS NULL THEN
    v_old := OLD;
    v_old.registrert_av := NULL;
    IF v_old IS NOT DISTINCT FROM NEW THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT xk.stevneid INTO v_stevneid
  FROM public.xkast_kongelag_deltaker d
  JOIN public.xkast_kongelag xk ON xk.id = d.xkast_kongelag_id
  WHERE d.id = COALESCE(NEW.xkast_kongelag_deltaker_id, OLD.xkast_kongelag_deltaker_id);

  IF public.stevne_is_completed(v_stevneid) THEN
    RAISE EXCEPTION 'Kan ikkje endre xkast_kongelag_omgang: stevne % er fullført', v_stevneid;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_kamp_omgang_block_if_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_xkast_kongelag_omgang_block_if_completed() FROM PUBLIC, anon, authenticated;

-- Unchanged from 20260802195652 apart from the xkast_kongelag_omgang line.
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
  UPDATE public.xkast_kongelag_omgang SET registrert_av = NULL WHERE registrert_av = target_id;
  DELETE FROM public.bruker_profil WHERE id = target_id;

  -- notification_queue.user_id has ON DELETE CASCADE; Supabase's internal auth
  -- tables (identities, sessions, refresh_tokens, ...) cascade from auth.users.
  DELETE FROM auth.users WHERE id = target_id;
END;
$$;
