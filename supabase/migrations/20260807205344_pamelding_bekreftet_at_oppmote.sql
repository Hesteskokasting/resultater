-- Oppmøte (attendance) is moving from an admin-only checkbox to something the
-- player can confirm themselves from the stevne info page, opening two hours
-- before start. Two pieces are needed:
--
--   1. bekreftet_at, so the UI can show *when* attendance was confirmed. The
--      column is maintained entirely by the trigger below — a client never
--      supplies it, so the timestamp is the database clock rather than the
--      device clock.
--   2. Server-side enforcement of the two-hour window. pamelding_update
--      (20260711140000) already lets a linked player update their own row, so a
--      client-side check alone would be decoration: anyone could PATCH
--      er_bekreftet early through PostgREST. RLS cannot express this, since a
--      WITH CHECK clause sees only the new row and the rule is about the
--      transition — hence a BEFORE trigger, which sees both.

ALTER TABLE public.pamelding ADD COLUMN bekreftet_at timestamptz;

COMMENT ON COLUMN public.pamelding.bekreftet_at IS
  'Når oppmøtet blei stadfesta. Settast berre av trigger, aldri av klienten.';

-- Backfill: rows confirmed before this migration have no known moment, so they
-- keep a null timestamp and the UI falls back to a time-less "bekrefta" label.

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Stevne start is stored as a local date plus an optional local time, so the
-- window has to be anchored in Norwegian time rather than the server's UTC.
-- A stevne with no tid has no known start; opening at midnight local time on
-- the day itself is the conservative reading (never the evening before).
CREATE OR REPLACE FUNCTION private.stevne_oppmote_opnar(p_stevneid integer)
RETURNS timestamptz
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN s.tid IS NULL THEN s.dato::timestamp AT TIME ZONE 'Europe/Oslo'
    ELSE ((s.dato + s.tid) AT TIME ZONE 'Europe/Oslo') - interval '2 hours'
  END
  FROM public.stevne s
  WHERE s.id = p_stevneid
$$;

COMMENT ON FUNCTION private.stevne_oppmote_opnar(integer) IS
  'Tidspunktet oppmøtestadfesting opnar: to timar før start (Europe/Oslo).';

-- Same organiser test the pamelding policies use. Organisers check players in
-- at the venue and are not bound by the window.
CREATE OR REPLACE FUNCTION private.er_stevnearrangor(p_stevneid integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT public.min_rolle() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.stevne s
      JOIN public.klubbadmin_klubber kk ON kk.klubbid = s.klubbid
      WHERE s.id = p_stevneid AND kk.bruker_id = (select auth.uid())
    )
$$;

COMMENT ON FUNCTION private.er_stevnearrangor(integer) IS
  'Om innloggd brukar arrangerer stevnet (admin eller klubbadmin for arrangørklubben).';

GRANT EXECUTE ON FUNCTION private.stevne_oppmote_opnar(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.er_stevnearrangor(integer) TO authenticated, service_role;

-- ── Trigger ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.pamelding_oppmote_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_opnar timestamptz;
  v_endra boolean;
BEGIN
  v_endra := TG_OP = 'INSERT' OR NEW.er_bekreftet IS DISTINCT FROM OLD.er_bekreftet;

  -- bekreftet_at is derived, so an update that leaves the flag alone must not
  -- be able to rewrite (or clear) the stamp.
  IF NOT v_endra THEN
    NEW.bekreftet_at := OLD.bekreftet_at;
    RETURN NEW;
  END IF;

  -- Only confirming is gated; withdrawing an own confirmation ("Angre") and
  -- every organiser action stay open.
  IF NEW.er_bekreftet AND NOT private.er_stevnearrangor(NEW.stevneid) THEN
    v_opnar := private.stevne_oppmote_opnar(NEW.stevneid);
    IF v_opnar IS NULL OR now() < v_opnar THEN
      RAISE EXCEPTION 'Oppmøte kan tidlegast stadfestast to timar før stevnestart'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  NEW.bekreftet_at := CASE WHEN NEW.er_bekreftet THEN now() ELSE NULL END;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.pamelding_oppmote_guard() IS
  'Stemplar bekreftet_at og handhevar to-timarsvindauget for eigenstadfesta oppmøte.';

CREATE TRIGGER pamelding_oppmote_guard
  BEFORE INSERT OR UPDATE ON public.pamelding
  FOR EACH ROW EXECUTE FUNCTION public.pamelding_oppmote_guard();
