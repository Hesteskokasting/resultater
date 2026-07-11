-- The preceding migration (20260508130000_stevne_split_dato_tid.sql) dropped
-- kaster_rekorder to change stevne.dato's column type, but never recreated
-- it — it was later recreated directly against the remote database instead
-- of via a migration, so migration history never reflected it. A full
-- `supabase db reset` / fresh provision from migrations alone therefore
-- fails here, and any later migration touching this view (e.g.
-- 20260710110300_kaster_rekorder_security_invoker.sql, which sets
-- security_invoker = true) would silently no-op or fail against a
-- nonexistent view. Recreating it here, immediately after the drop, so
-- migration history matches what actually happened and later migrations
-- keep applying against a real view in the correct order.
--
-- Definition confirmed via pg_get_viewdef() against the live remote
-- database — exact match to 20260428190000_oppdater_kaster_rekorder_view.sql.

CREATE OR REPLACE VIEW public.kaster_rekorder AS

SELECT
  'kongelag' AS metode,
  r.poeng_kongelag AS poeng,
  k.id AS kasterid, k.fornavn, k.etternavn,
  kj.id AS kjonn_id, kj.navn AS kjonn_navn,
  kb.id AS klubb_id, kb.navn AS klubb_navn,
  s.id AS stevne_id, s.navn AS stevne_navn,
  EXTRACT(YEAR FROM s.dato)::int AS ar
FROM (
  SELECT DISTINCT ON (kasterid) kasterid, poeng_kongelag, klubbid, stevneid
  FROM public.resultat
  WHERE poeng_kongelag IS NOT NULL
  ORDER BY kasterid, poeng_kongelag DESC
) r
JOIN public.kaster  k  ON k.id  = r.kasterid
LEFT JOIN public.kjonn  kj ON kj.id = k.kjonnid
LEFT JOIN public.klubb  kb ON kb.id = r.klubbid
LEFT JOIN public.stevne s  ON s.id  = r.stevneid

UNION ALL

SELECT
  lower(km.navn) AS metode,
  r.poeng_xkast  AS poeng,
  k.id AS kasterid, k.fornavn, k.etternavn,
  kj.id AS kjonn_id, kj.navn AS kjonn_navn,
  kb.id AS klubb_id, kb.navn AS klubb_navn,
  s.id AS stevne_id, s.navn AS stevne_navn,
  EXTRACT(YEAR FROM s.dato)::int AS ar
FROM (
  SELECT DISTINCT ON (res.kasterid, st.innledendekastemetodeid)
    res.kasterid, res.poeng_xkast, res.klubbid, res.stevneid,
    st.innledendekastemetodeid AS metode_id
  FROM public.resultat res
  JOIN public.stevne st ON st.id = res.stevneid
  WHERE res.poeng_xkast IS NOT NULL
    AND st.innledendekastemetodeid IS NOT NULL
  ORDER BY res.kasterid, st.innledendekastemetodeid, res.poeng_xkast DESC
) r
JOIN public.kaster      k  ON k.id  = r.kasterid
LEFT JOIN public.kjonn  kj ON kj.id = k.kjonnid
LEFT JOIN public.klubb  kb ON kb.id = r.klubbid
LEFT JOIN public.stevne s  ON s.id  = r.stevneid
LEFT JOIN public.kastemetode km ON km.id = r.metode_id;
