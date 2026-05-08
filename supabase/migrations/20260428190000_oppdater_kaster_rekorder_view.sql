-- Fiksar tre feil i kaster_rekorder frå 20260428163826:
--
-- 1. Kongelag: metode var km_avsl.navn (kan vera NULL) → hardkoda 'kongelag'
-- 2. Xkast: metode var ikkje lowercasa → lower(km.navn) so det matchar JS-filter
-- 3. Xkast: DISTINCT ON (kasterid) gav berre éin rad per kaster totalt →
--           DISTINCT ON (kasterid, metode_id) gir beste score per kaster per metode

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
