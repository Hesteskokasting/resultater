-- ============================================================
-- innledende_kamp_poeng — per-player innledende kamp totals
--
-- resultat.kamp_poeng_innl / score_poeng_innl have been dead
-- since 20260521120000 dropped the sync triggers without a
-- replacement writer (the kamp views compute standings client-
-- side, so nothing noticed). Kongelag needs the totals again —
-- both for seeding courts from a Gloppen/NHM innledende and for
-- the carry-over column in the stilling — so they are exposed
-- as an aggregate view over confirmed innledende kamper instead
-- of reviving the trigger-written columns.
--
-- security_invoker: the caller's RLS on kamp/kamp_spelar applies
-- (both are public-read, same as the scoreboards).
-- ============================================================

CREATE VIEW public.innledende_kamp_poeng
WITH (security_invoker = on) AS
SELECT
  k.stevneid,
  ks.kasterid,
  SUM(ks.kamp_poeng)  AS kamp_poeng_innl,
  SUM(ks.score_poeng) AS score_poeng_innl
FROM public.kamp_spelar ks
JOIN public.kamp k ON k.id = ks.kampid
WHERE k.fase = 'innledende'
  AND k.er_bekreftet = true
  AND ks.kasterid IS NOT NULL
GROUP BY k.stevneid, ks.kasterid;

GRANT SELECT ON public.innledende_kamp_poeng TO anon, authenticated;
