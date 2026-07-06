-- Notify every opted-in user when a stevne transitions out of
-- 'ikke_startet'. Broadcast, not club-scoped.
CREATE OR REPLACE FUNCTION public.trg_stevne_fase_start_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_queue (user_id, notification_type, entity_id, title, body, deep_link)
  SELECT bp.id, 'stevne_start', NEW.id,
         'Stevne starta',
         format('%s har starta', NEW.navn),
         '/stevne/' || NEW.id
  FROM public.bruker_profil bp
  WHERE bp.varsle_stevne_start = true
  ON CONFLICT (user_id, notification_type, entity_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- AFTER UPDATE OF stevne_fase means this only fires when stevne_fase is
-- actually named in the UPDATE's SET list at all (e.g. renaming navn never
-- invokes it), and the WHEN clause narrows further to the specific
-- ikke_startet -> anything-else transition.
CREATE TRIGGER stevne_fase_start_notify
AFTER UPDATE OF stevne_fase ON public.stevne
FOR EACH ROW
WHEN (OLD.stevne_fase = 'ikke_startet' AND NEW.stevne_fase IS DISTINCT FROM 'ikke_startet')
EXECUTE FUNCTION public.trg_stevne_fase_start_notify();
