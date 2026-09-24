-- The admin dashboard counts participations from resultat instead of
-- registrations from pamelding, which is cleared over time. A year holds ~1200
-- resultat rows, past PostgREST's 1000-row cap, so both counts are aggregated
-- here. SECURITY INVOKER: resultat and stevne are readable by everyone.

-- The return type grows a column, which CREATE OR REPLACE cannot do.
DROP FUNCTION public.deltakarar_per_ar(INT);

CREATE FUNCTION public.deltakarar_per_ar(p_from_year INT)
RETURNS TABLE (ar INT, deltakarar BIGINT, deltakingar BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM s.dato)::INT AS ar,
         COUNT(DISTINCT r.kasterid)     AS deltakarar,
         COUNT(*)                       AS deltakingar
  FROM resultat r
  JOIN stevne s ON s.id = r.stevneid
  WHERE s.dato >= make_date(p_from_year, 1, 1)
    AND r.kasterid IS NOT NULL
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE FUNCTION public.deltakingar_per_stevne(p_stevneids INT[])
RETURNS TABLE (stevneid INT, deltakingar BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT r.stevneid, COUNT(*) AS deltakingar
  FROM resultat r
  WHERE r.stevneid = ANY(p_stevneids)
    AND r.kasterid IS NOT NULL
  GROUP BY 1;
$$;
