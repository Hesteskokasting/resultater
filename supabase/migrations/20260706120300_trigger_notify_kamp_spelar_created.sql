-- Notify a user when a kamp_spelar row links a kamp to their linked kaster.
-- Statement-level with a transition table: match generation inserts
-- kamp_spelar rows in batches (a Par/Mix match writes up to 4 rows), and a
-- row-level trigger would fire once per row. Firing once per INSERT
-- statement and collapsing with SELECT DISTINCT keeps this to one queue
-- row per (user, kamp) regardless of batch size.
CREATE OR REPLACE FUNCTION public.trg_kamp_spelar_notify_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
  SELECT DISTINCT bp.id, 'kamp_opprettet', k.id,
         'Ny kamp',
         format('Du har fått ny kamp i %s', s.navn),
         '/kamp/' || k.id
  FROM new_table nt
  JOIN public.kamp k           ON k.id = nt.kampid
  JOIN public.stevne s         ON s.id = k.stevneid
  JOIN public.bruker_profil bp ON bp.kasterid = nt.kasterid
                               AND bp.kobling_status = 'godkjent'
                               AND bp.varsle_kamp_opprettet = true
  ON CONFLICT (user_id, notification_type, entity_id) DO NOTHING;

  RETURN NULL;
END;
$$;

CREATE TRIGGER kamp_spelar_notify_created
AFTER INSERT ON public.kamp_spelar
REFERENCING NEW TABLE AS new_table
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_kamp_spelar_notify_created();
