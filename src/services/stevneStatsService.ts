import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";

const _statsQuery = supabase.from("kamp").select(`
  id,
  er_walkover,
  er_tre_spelarar,
  spelarar:kamp_spelar(
    id,
    kasterid,
    score_poeng,
    omgangar:kamp_omgang(score, antall_ringer),
    kaster:kasterid(id, fornavn, etternavn)
  )
`);

export type StatsMatchRow = QueryData<typeof _statsQuery>[number];

export async function getMatchesForStats(
  stevneId: number,
): Promise<{ data: StatsMatchRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kamp")
    .select(`
      id,
      er_walkover,
      er_tre_spelarar,
      spelarar:kamp_spelar(
        id,
        kasterid,
        score_poeng,
        omgangar:kamp_omgang(score, antall_ringer),
        kaster:kasterid(id, fornavn, etternavn)
      )
    `)
    .eq("stevneid", stevneId)
    .eq("er_bekreftet", true)
    .eq("er_walkover", false);
  if (error) logError("getMatchesForStats", error);
  return { data: data ?? [], error };
}

/**
 * kasterid → posisjon for a stevne (Par/Mix only; empty for Singel).
 * Used to compare each player's score against the same-posisjon opponent:
 * in Par/Mix posisjon 1 plays posisjon 1, posisjon 2 plays posisjon 2.
 */
export async function getPositionForTournament(stevneId: number): Promise<Map<number, number>> {
  const { data, error } = await supabase
    .from("resultat")
    .select("kasterid, posisjon")
    .eq("stevneid", stevneId);
  if (error) logError("getPositionForTournament", error);
  const map = new Map<number, number>();
  for (const r of data ?? []) {
    if (r.kasterid != null && r.posisjon != null) map.set(r.kasterid, r.posisjon);
  }
  return map;
}
