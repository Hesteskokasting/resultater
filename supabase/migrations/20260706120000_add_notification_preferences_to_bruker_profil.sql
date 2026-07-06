-- Two opt-in push notification preferences, stored on the 1:1 profile row.
ALTER TABLE public.bruker_profil
  ADD COLUMN varsle_stevne_start   boolean NOT NULL DEFAULT false,
  ADD COLUMN varsle_kamp_opprettet boolean NOT NULL DEFAULT false;

-- No RLS change needed: bp_les_eigen/bp_oppdater_eigen already scope
-- read/update of bruker_profil to auth.uid() = id, which covers these
-- new columns for free.
