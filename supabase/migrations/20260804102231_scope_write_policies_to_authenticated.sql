-- Scope every write policy in public to the authenticated role.
--
-- All 64 INSERT/UPDATE/DELETE/ALL policies were created without a TO clause,
-- which defaults to TO public — i.e. they are evaluated for anon as well. Since
-- 20260724112105 mirrors prod's full DML grants to anon, RLS is the only gate
-- on anon writes, and that gate currently runs anon through every policy
-- expression before rejecting it.
--
-- No behaviour changes: every one of these policies is already gated on
-- min_rolle() (NULL for anon) or auth.uid() (NULL for anon), so no anon write
-- can pass today. Scoping makes the denial happen at the policy-role check
-- instead of inside the expression, which also stops anon from reaching the
-- SECURITY DEFINER helpers those expressions call — the structural fix behind
-- 20260804094747. service_role is BYPASSRLS, so edge functions are unaffected.
--
-- SELECT policies are deliberately left TO public: results, stevner and kastere
-- are readable without signing in.

ALTER POLICY "antallTellendeNc_admin_delete" ON public."antallTellendeNc" TO authenticated;
ALTER POLICY "antallTellendeNc_admin_insert" ON public."antallTellendeNc" TO authenticated;
ALTER POLICY "antallTellendeNc_admin_update" ON public."antallTellendeNc" TO authenticated;
ALTER POLICY bruker_profil_admin_delete ON public.bruker_profil TO authenticated;
ALTER POLICY bruker_profil_admin_insert ON public.bruker_profil TO authenticated;
ALTER POLICY bp_oppdater ON public.bruker_profil TO authenticated;
ALTER POLICY gruppe_admin_delete ON public.gruppe TO authenticated;
ALTER POLICY gruppe_admin_insert ON public.gruppe TO authenticated;
ALTER POLICY gruppe_admin_update ON public.gruppe TO authenticated;
ALTER POLICY kamp_admin_delete ON public.kamp TO authenticated;
ALTER POLICY kamp_admin_insert ON public.kamp TO authenticated;
ALTER POLICY kamp_update ON public.kamp TO authenticated;
ALTER POLICY kamp_omgang_admin_delete ON public.kamp_omgang TO authenticated;
ALTER POLICY kamp_omgang_insert ON public.kamp_omgang TO authenticated;
ALTER POLICY kamp_omgang_update ON public.kamp_omgang TO authenticated;
ALTER POLICY kamp_spelar_admin_delete ON public.kamp_spelar TO authenticated;
ALTER POLICY kamp_spelar_admin_insert ON public.kamp_spelar TO authenticated;
ALTER POLICY kamp_spelar_update_deltakar ON public.kamp_spelar TO authenticated;
ALTER POLICY kastemetode_admin_delete ON public.kastemetode TO authenticated;
ALTER POLICY kastemetode_admin_insert ON public.kastemetode TO authenticated;
ALTER POLICY kastemetode_admin_update ON public.kastemetode TO authenticated;
ALTER POLICY kaster_admin_delete ON public.kaster TO authenticated;
ALTER POLICY kaster_insert ON public.kaster TO authenticated;
ALTER POLICY kaster_update ON public.kaster TO authenticated;
ALTER POLICY kategori_admin_delete ON public.kategori TO authenticated;
ALTER POLICY kategori_admin_insert ON public.kategori TO authenticated;
ALTER POLICY kategori_admin_update ON public.kategori TO authenticated;
ALTER POLICY kjonn_admin_delete ON public.kjonn TO authenticated;
ALTER POLICY kjonn_admin_insert ON public.kjonn TO authenticated;
ALTER POLICY kjonn_admin_update ON public.kjonn TO authenticated;
ALTER POLICY klasse_admin_delete ON public.klasse TO authenticated;
ALTER POLICY klasse_admin_insert ON public.klasse TO authenticated;
ALTER POLICY klasse_admin_update ON public.klasse TO authenticated;
ALTER POLICY klubb_admin_delete ON public.klubb TO authenticated;
ALTER POLICY klubb_admin_insert ON public.klubb TO authenticated;
ALTER POLICY klubb_update ON public.klubb TO authenticated;
ALTER POLICY klubbadmin_klubber_admin_delete ON public.klubbadmin_klubber TO authenticated;
ALTER POLICY klubbadmin_klubber_admin_insert ON public.klubbadmin_klubber TO authenticated;
ALTER POLICY klubbadmin_klubber_admin_update ON public.klubbadmin_klubber TO authenticated;
ALTER POLICY norgescuppoeng_admin_delete ON public.norgescuppoeng TO authenticated;
ALTER POLICY norgescuppoeng_admin_insert ON public.norgescuppoeng TO authenticated;
ALTER POLICY norgescuppoeng_admin_update ON public.norgescuppoeng TO authenticated;
ALTER POLICY notification_queue_admin_all ON public.notification_queue TO authenticated;
ALTER POLICY pamelding_delete ON public.pamelding TO authenticated;
ALTER POLICY pamelding_insert ON public.pamelding TO authenticated;
ALTER POLICY pamelding_update ON public.pamelding TO authenticated;
ALTER POLICY resultat_admin_delete ON public.resultat TO authenticated;
ALTER POLICY resultat_admin_insert ON public.resultat TO authenticated;
ALTER POLICY resultat_admin_update ON public.resultat TO authenticated;
ALTER POLICY stevne_admin_delete ON public.stevne TO authenticated;
ALTER POLICY stevne_insert ON public.stevne TO authenticated;
ALTER POLICY stevne_update ON public.stevne TO authenticated;
ALTER POLICY stevnetype_admin_delete ON public.stevnetype TO authenticated;
ALTER POLICY stevnetype_admin_insert ON public.stevnetype TO authenticated;
ALTER POLICY stevnetype_admin_update ON public.stevnetype TO authenticated;
ALTER POLICY xkast_kongelag_admin_delete ON public.xkast_kongelag TO authenticated;
ALTER POLICY xkast_kongelag_admin_insert ON public.xkast_kongelag TO authenticated;
ALTER POLICY xkast_kongelag_admin_update ON public.xkast_kongelag TO authenticated;
ALTER POLICY xkast_kongelag_deltaker_admin_delete ON public.xkast_kongelag_deltaker TO authenticated;
ALTER POLICY xkast_kongelag_deltaker_admin_insert ON public.xkast_kongelag_deltaker TO authenticated;
ALTER POLICY xkast_kongelag_deltaker_admin_update ON public.xkast_kongelag_deltaker TO authenticated;
ALTER POLICY xkast_kongelag_omgang_admin_delete ON public.xkast_kongelag_omgang TO authenticated;
ALTER POLICY xkast_kongelag_omgang_insert ON public.xkast_kongelag_omgang TO authenticated;
ALTER POLICY xkast_kongelag_omgang_update ON public.xkast_kongelag_omgang TO authenticated;
