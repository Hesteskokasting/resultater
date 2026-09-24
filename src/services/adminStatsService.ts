import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import type { Tables } from "@/types";

/**
 * Read-only queries behind the admin dashboard. Key figures come back as exact
 * head-counts (no rows over the wire); the charts fetch only the columns they
 * aggregate on.
 */

export interface AdminEntityCounts {
  activeClubs: number;
  totalClubs: number;
  totalUsers: number;
}

export type TournamentStatRow = Pick<Tables<"stevne">, "dato" | "erfullfort" | "stevne_fase">;
export interface ParticipantYearRow {
  ar: number;
  deltakarar: number;
  deltakingar: number;
}

type CountResult = { count: number | null; error: unknown };

function resolveCount(label: string, { count, error }: CountResult): number {
  if (error) logError(label, error);
  return count ?? 0;
}

export async function getAdminEntityCounts(): Promise<AdminEntityCounts> {
  const head = { count: "exact", head: true } as const;

  const [activeClubs, totalClubs, totalUsers] = await Promise.all([
    supabase.from("klubb").select("id", head).eq("eraktiv", true),
    supabase.from("klubb").select("id", head),
    supabase.from("bruker_profil").select("id", head),
  ]);

  return {
    activeClubs: resolveCount("adminStats.activeClubs", activeClubs),
    totalClubs: resolveCount("adminStats.totalClubs", totalClubs),
    totalUsers: resolveCount("adminStats.totalUsers", totalUsers),
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
 * Distinct throwers and total participations with a result per year, from `fromYear` onwards. Counted in
 * the database: one row per participation would blow past PostgREST's row cap.
 */
export async function getParticipantsPerYear(
  fromYear: number,
): Promise<{ data: ParticipantYearRow[]; error: unknown }> {
  const { data, error } = await supabase.rpc("deltakarar_per_ar", { p_from_year: fromYear });
  if (error) logError("getParticipantsPerYear", error);
  return {
    data: (data ?? []).map((r) => ({
      ar: r.ar,
      deltakarar: Number(r.deltakarar),
      deltakingar: Number(r.deltakingar),
    })),
    error,
  };
}

/**
 * Participations (resultat rows) per tournament, for a set of tournament ids.
 * Counted in the database for the same row-cap reason as above.
 */
export async function getParticipationCountsForTournaments(
  ids: number[],
): Promise<Map<number, number>> {
  const counts = new Map<number, number>();
  if (!ids.length) return counts;

  const { data, error } = await supabase.rpc("deltakingar_per_stevne", { p_stevneids: ids });
  if (error) {
    logError("getParticipationCountsForTournaments", error);
    return counts;
  }
  for (const row of data ?? []) counts.set(row.stevneid, Number(row.deltakingar));
  return counts;
}
