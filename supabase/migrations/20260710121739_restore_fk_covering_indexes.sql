-- Corrects 20260710112612_drop_unused_indexes.sql.
-- idx_resultat_klubbid, idx_resultat_klasseid, and idx_stevne_stevnetypeid
-- were dropped as "unused" without checking they were also the only
-- covering index for resultat_klubbid_fkey, resultat_klasseid_fkey, and
-- stevne_stevnetypeid_fkey — that's exactly why those FKs weren't in the
-- original unindexed_foreign_keys findings. Dropping them just moved the
-- same three columns into that other advisor category. Restoring them.
CREATE INDEX IF NOT EXISTS idx_resultat_klubbid ON public.resultat USING btree (klubbid);
CREATE INDEX IF NOT EXISTS idx_resultat_klasseid ON public.resultat USING btree (klasseid);
CREATE INDEX IF NOT EXISTS idx_stevne_stevnetypeid ON public.stevne USING btree (stevnetypeid);
