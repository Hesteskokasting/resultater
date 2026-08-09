-- Confirmed avsluttende matches never had their scores persisted: the cup
-- confirm paths only wrote er_bekreftet, kamp_plassering and elimination, so
-- the score stayed in kamp_omgang and kamp_spelar.score_poeng remained 0.
-- Backfill those rows from their own omgangar (each member carries only the
-- omgangar they threw). HCP is not recoverable here and is left out.

WITH omg AS (
  SELECT kamp_spelar_id,
         COALESCE(SUM(score), 0) AS sum_score,
         COALESCE(SUM(antall_ringer), 0) AS sum_ringer
  FROM public.kamp_omgang
  WHERE kamp_spelar_id IS NOT NULL
  GROUP BY kamp_spelar_id
)
UPDATE public.kamp_spelar ks
SET score_poeng = omg.sum_score,
    antall_ringer = omg.sum_ringer
FROM omg, public.kamp k
WHERE omg.kamp_spelar_id = ks.id
  AND k.id = ks.kampid
  AND k.fase = 'avsluttende'
  AND k.er_bekreftet
  AND COALESCE(ks.score_poeng, 0) = 0
  AND omg.sum_score > 0;
