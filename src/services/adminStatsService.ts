import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import type { Tables } from "@/types";

/**
 * Read-only queries behind the admin dashboard. Key figures come back as exact
 * head-counts (no rows over the wire); the charts fetch only the columns they
 * aggregate on.
 */

export interface AdminEntityCounts {
  activeThrowers: number;
  totalThrowers: number;
  activeClubs: number;
  totalClubs: number;
  totalUsers: number;
  pendingLinks: number;
}

export type TournamentStatRow = Pick<Tables<"stevne">, "dato" | "erfullfort" | "stevne_fase">;
export type RegistrationStatRow = Pick<Tables<"pamelding">, "opprettet_at">;

type CountResult = { count: number | null; error: unknown };

function resolveCount(label: string, { count, error }: CountResult): number {
  if (error) logError(label, error);
  return count ?? 0;
}

export async function getAdminEntityCounts(): Promise<AdminEntityCounts> {
  const head = { count: "exact", head: true } as const;

  const [activeThrowers, totalThrowers, activeClubs, totalClubs, totalUsers, pendingLinks] =
    await Promise.all([
      supabase.from("kaster").select("id", head).eq("eraktiv", true),
      supabase.from("kaster").select("id", head),
      supabase.from("klubb").select("id", head).eq("eraktiv", true),
      supabase.from("klubb").select("id", head),
      supabase.from("bruker_profil").select("id", head),
      supabase.from("bruker_profil").select("id", head).eq("kobling_status", "venter"),
    ]);

  return {
    activeThrowers: resolveCount("adminStats.activeThrowers", activeThrowers),
    totalThrowers: resolveCount("adminStats.totalThrowers", totalThrowers),
    activeClubs: resolveCount("adminStats.activeClubs", activeClubs),
    totalClubs: resolveCount("adminStats.totalClubs", totalClubs),
    totalUsers: resolveCount("adminStats.totalUsers", totalUsers),
    pendingLinks: resolveCount("adminStats.pendingLinks", pendingLinks),
  };
}

/** Every tournament from `fromYear` onwards — the year and status charts aggregate these. */
export async function getTournamentStatRows(
  fromYear: number,
): Promise<{ data: TournamentStatRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select("dato, erfullfort, stevne_fase")
    .gte("dato", `${fromYear}-01-01`)
    .order("dato");
  if (error) logError("getTournamentStatRows", error);
  return { data: data ?? [], error };
}

/**
 * Registration counts per tournament, for a set of tournament ids. Returned as a
 * map so a list can show "N påmelde" per row from a single round trip.
 */
export async function getRegistrationCountsForTournaments(
  ids: number[],
): Promise<Map<number, number>> {
  const counts = new Map<number, number>();
  if (!ids.length) return counts;

  const { data, error } = await supabase.from("pamelding").select("stevneid").in("stevneid", ids);
  if (error) {
    logError("getRegistrationCountsForTournaments", error);
    return counts;
  }
  for (const row of data ?? []) {
    if (row.stevneid != null) counts.set(row.stevneid, (counts.get(row.stevneid) ?? 0) + 1);
  }
  return counts;
}

/** Registration timestamps for one year, for the per-month activity chart. */
export async function getRegistrationStatRows(
  year: number,
): Promise<{ data: RegistrationStatRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("opprettet_at")
    .gte("opprettet_at", `${year}-01-01`)
    .lt("opprettet_at", `${year + 1}-01-01`);
  if (error) logError("getRegistrationStatRows", error);
  return { data: data ?? [], error };
}
