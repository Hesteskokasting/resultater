-- Collapse kamp-created notifications to one push per user per stevne per
-- statement. Match generation can insert kamp_spelar rows for several kamps
-- belonging to the same user in one statement (cascade/Gloppen writes every
-- round up front); the previous one-row-per-(user, kamp) fanout queued one
-- push per kamp. A multi-kamp batch now produces a single "N nye kampar"
-- notification deep-linking to /minside (kampar tab); a single-kamp batch
-- keeps the /kamp/<id> link. entity_id stays a kamp id (min of the batch) so
-- the dedupe constraint (user_id, notification_type, entity_id) still guards
-- against re-fires for the same kamp without blocking later rounds.
CREATE OR REPLACE FUNCTION public.trg_kamp_spelar_notify_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
  SELECT agg.user_id,
         'kamp_opprettet',
         agg.first_kamp_id,
         CASE WHEN agg.kamp_count = 1 THEN 'Ny kamp' ELSE 'Nye kampar' END,
         CASE WHEN agg.kamp_count = 1
              THEN format('Du har fått ny kamp i %s', agg.stevne_navn)
              ELSE format('Du har fått %s nye kampar i %s', agg.kamp_count, agg.stevne_navn)
         END,
         CASE WHEN agg.kamp_count = 1
              THEN '/kamp/' || agg.first_kamp_id
              ELSE '/minside'
         END
  FROM (
    SELECT bp.id AS user_id,
           s.navn AS stevne_navn,
           count(DISTINCT k.id) AS kamp_count,
           min(k.id) AS first_kamp_id
    FROM new_table nt
    JOIN public.kamp k           ON k.id = nt.kampid
    JOIN public.stevne s         ON s.id = k.stevneid
    JOIN public.bruker_profil bp ON bp.kasterid = nt.kasterid
                                 AND bp.kobling_status = 'godkjent'
                                 AND bp.varsle_kamp_opprettet = true
    GROUP BY bp.id, s.id, s.navn
  ) agg
  ON CONFLICT (user_id, notification_type, entity_id) DO NOTHING;

  RETURN NULL;
END;
$$;
