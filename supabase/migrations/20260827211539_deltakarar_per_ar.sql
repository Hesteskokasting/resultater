-- The admin dashboard's "deltakarar per år" chart counted distinct throwers on
-- the client, which meant fetching one resultat row per participation. Eight
-- years is ~9 500 rows — past PostgREST's 1000-row cap, so the chart silently
-- showed a single year. Counting in the database returns one row per year.
--
-- SECURITY INVOKER: resultat and stevne are both readable by everyone
-- ("Enable read access for all users"), so the caller's own RLS is enough.

CREATE OR REPLACE FUNCTION public.deltakarar_per_ar(p_from_year INT)
RETURNS TABLE (ar INT, deltakarar BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM s.dato)::INT AS ar,
         COUNT(DISTINCT r.kasterid)     AS deltakarar
  FROM resultat r
  JOIN stevne s ON s.id = r.stevneid
  WHERE s.dato >= make_date(p_from_year, 1, 1)
    AND r.kasterid IS NOT NULL
  GROUP BY 1
  ORDER BY 1;
$$;
