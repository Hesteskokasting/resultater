-- Fix security advisor: security_definer_view on public.kaster_rekorder.
-- Views default to running with the creator's privileges rather than the
-- querying user's. Every underlying table (resultat, kaster, kjonn, klubb,
-- stevne) already has a public "read access for all users" policy, so this
-- has no behavioral effect today — it just makes RLS enforcement explicit
-- for this view going forward.
ALTER VIEW public.kaster_rekorder SET (security_invoker = true);
