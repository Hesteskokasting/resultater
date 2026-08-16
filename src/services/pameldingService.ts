import type { QueryData, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { verifyRowsAffected } from "@/utils/verifiedWrite";

const _pameldingQuery = supabase.from("pamelding").select(`
      id,
      stevne:stevneid(
        id, navn, dato, sted, ernm, erfullfort, stevne_fase,
        klubb:klubbid(id, navn),
        stevnetype:stevnetypeid(id, navn),
        kategori:kategoriid(id, navn)
      )
    `);
const _pameldingMedKasterQuery = supabase
  .from("pamelding")
  .select("id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))");
const _pameldingStatusQuery = supabase
  .from("pamelding")
  .select("id, kasterid, er_bekreftet, lag_id");

export type RegistrationRow = QueryData<typeof _pameldingQuery>[number];
export type RegistrationWithThrowerRow = QueryData<typeof _pameldingMedKasterQuery>[number];
export type RegistrationStatusRow = QueryData<typeof _pameldingStatusQuery>[number];

// ── Par/Mix pair types ────────────────────────────────────────────────────────

const _pairMemberQuery = supabase
  .from("pamelding")
  .select(
    "id, kasterid, lag_id, posisjon, kaster:kasterid(id, fornavn, etternavn, kjonnid, klubb:klubbid(navn))",
  );

// lag_id/posisjon are non-null for every row getPairsForTournament returns —
// guaranteed by its query filter and runtime narrowing.
export type RegistrationPairMember = QueryData<typeof _pairMemberQuery>[number] & {
  lag_id: number;
  posisjon: number;
};

export interface RegistrationPair {
  lag_id: number;
  sideA: RegistrationPairMember; // posisjon 1
  sideB: RegistrationPairMember; // posisjon 2
}

export async function getMyRegistrations(
  kasterid: number,
): Promise<{ data: RegistrationRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select(`
      id,
      stevne:stevneid(
        id, navn, dato, sted, ernm, erfullfort, stevne_fase,
        klubb:klubbid(id, navn),
        stevnetype:stevnetypeid(id, navn),
        kategori:kategoriid(id, navn)
      )
    `)
    .eq("kasterid", kasterid)
    .limit(50);
  if (error) logError("getMyRegistrations", error);
  return { data: data ?? [], error };
}

export async function getRegistrationsForTournament(
  stevneId: number,
): Promise<{ data: RegistrationWithThrowerRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))")
    .eq("stevneid", stevneId)
    .order("id");
  if (error) logError("getRegistrationsForTournament", error);
  return { data: data ?? [], error };
}

export interface MyRegistrationRow {
  id: number;
  er_bekreftet: boolean;
  bekreftet_at: string | null;
}

export async function getMyRegistrationForTournament(
  stevneId: number,
  kasterid: number,
): Promise<{ data: MyRegistrationRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("id, er_bekreftet, bekreftet_at")
    .eq("stevneid", stevneId)
    .eq("kasterid", kasterid)
    .maybeSingle();
  if (error) logError("getMyRegistrationForTournament", error);
  return { data, error };
}

export async function registerForTournament(
  stevneId: number,
  kasterid: number,
): Promise<{ error: unknown; id: number | null }> {
  const { data, error } = await supabase
    .from("pamelding")
    .insert({ stevneid: stevneId, kasterid })
    .select("id")
    .single();
  if (error) logError("registerForTournament", error);
  return { error, id: data?.id ?? null };
}

export async function removeRegistration(pameldingId: number): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase.from("pamelding").delete().eq("id", pameldingId).select("id"),
  );
  if (error) logError("removeRegistration", error);
  return { error };
}

export interface TournamentRegistrationSummary {
  /** Påmeldingar per stevne. */
  counts: Map<number, number>;
  /** Which of the queried stevner the thrower is already entered in. */
  ownStevneId: number | null;
  ownRegistrationId: number | null;
}

/**
 * Registration counts for several stevner in one round trip, plus where the
 * thrower is entered. Used by the SNC info tab, which lists them side by side.
 */
export async function getRegistrationsAcrossTournaments(
  stevneIds: number[],
  kasterid: number | null,
): Promise<TournamentRegistrationSummary> {
  const summary: TournamentRegistrationSummary = {
    counts: new Map(),
    ownStevneId: null,
    ownRegistrationId: null,
  };
  if (!stevneIds.length) return summary;

  const { data, error } = await supabase
    .from("pamelding")
    .select("id, stevneid, kasterid")
    .in("stevneid", stevneIds);
  if (error) {
    logError("getRegistrationsAcrossTournaments", error);
    return summary;
  }

  for (const row of data ?? []) {
    summary.counts.set(row.stevneid, (summary.counts.get(row.stevneid) ?? 0) + 1);
    if (kasterid != null && row.kasterid === kasterid) {
      summary.ownStevneId = row.stevneid;
      summary.ownRegistrationId = row.id;
    }
  }
  return summary;
}

export async function getRegistrationCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from("pamelding")
    .select("id", { count: "exact", head: true })
    .eq("stevneid", stevneId);
  if (error) logError("getRegistrationCount", error);
  return count ?? 0;
}

/** Enrolled single players with klubb, e.g. for seeding a standalone Kongelag. */
export async function getEnrolledPlayers(
  stevneId: number,
): Promise<{ data: { kasterid: number; klubbid: number | null }[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("kasterid, kaster:kasterid(klubbid)")
    .eq("stevneid", stevneId)
    .order("id");
  if (error) logError("getEnrolledPlayers", error);
  const players = (data ?? []).map((p) => ({
    kasterid: p.kasterid,
    klubbid: p.kaster?.klubbid ?? null,
  }));
  return { data: players, error };
}

export async function getPairCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from("pamelding")
    .select("id", { count: "exact", head: true })
    .eq("stevneid", stevneId)
    .not("lag_id", "is", null);
  if (error) logError("getPairCount", error);
  return Math.floor((count ?? 0) / 2);
}

export async function getUnconfirmedCount(stevneId: number): Promise<number> {
  const { count, error } = await supabase
    .from("pamelding")
    .select("id", { count: "exact", head: true })
    .eq("stevneid", stevneId)
    .eq("er_bekreftet", false);
  if (error) logError("getUnconfirmedCount", error);
  return count ?? 0;
}

export async function getRegistrationStatusForTournament(
  stevneId: number,
): Promise<{ data: RegistrationStatusRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("id, kasterid, er_bekreftet, lag_id")
    .eq("stevneid", stevneId)
    .order("id");
  if (error) logError("getRegistrationStatusForTournament", error);
  return { data: data ?? [], error };
}

export async function addRegistrationAdmin(
  stevneId: number,
  kasterid: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from("pamelding").insert({ stevneid: stevneId, kasterid });
  if (error) logError("addRegistrationAdmin", error);
  return { error };
}

/** bekreftet_at is stamped by a trigger, so the new value is read back, never sent. */
export async function setRegistrationConfirmedForThrower(
  stevneId: number,
  kasterid: number,
  confirmed: boolean,
): Promise<{ bekreftetAt: string | null; error: unknown }> {
  const { data, error } = await verifyRowsAffected<{ bekreftet_at: string | null }>(
    supabase
      .from("pamelding")
      .update({ er_bekreftet: confirmed })
      .eq("stevneid", stevneId)
      .eq("kasterid", kasterid)
      .select("bekreftet_at"),
  );
  if (error) logError("setRegistrationConfirmedForThrower", error);
  return { bekreftetAt: data?.bekreftet_at ?? null, error };
}

export async function removeRegistrationForThrower(
  stevneId: number,
  kasterid: number,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase
      .from("pamelding")
      .delete()
      .eq("stevneid", stevneId)
      .eq("kasterid", kasterid)
      .select("id"),
  );
  if (error) logError("removeRegistrationForThrower", error);
  return { error };
}

// ── Par/Mix functions ─────────────────────────────────────────────────────────

export async function getPairsForTournament(
  stevneId: number,
): Promise<{ data: RegistrationPair[]; error: unknown }> {
  const { data, error } = await supabase
    .from("pamelding")
    .select(
      "id, kasterid, lag_id, posisjon, kaster:kasterid(id, fornavn, etternavn, kjonnid, klubb:klubbid(navn))",
    )
    .eq("stevneid", stevneId)
    .not("lag_id", "is", null)
    .order("lag_id")
    .order("posisjon");

  if (error) {
    logError("getPairsForTournament", error);
    return { data: [], error };
  }

  const rows = (data ?? []).filter(
    (r): r is RegistrationPairMember => r.lag_id != null && r.posisjon != null,
  );
  const parMap = new Map<number, Partial<RegistrationPair>>();

  for (const row of rows) {
    if (!parMap.has(row.lag_id)) parMap.set(row.lag_id, { lag_id: row.lag_id });
    const par = parMap.get(row.lag_id)!;
    if (row.posisjon === 1) par.sideA = row;
    else if (row.posisjon === 2) par.sideB = row;
  }

  const pairs = Array.from(parMap.values()).filter(
    (p): p is RegistrationPair => p.sideA != null && p.sideB != null,
  );

  return { data: pairs, error: null };
}

export async function createPair(
  stevneId: number,
  kasterAId: number,
  kasterBId: number,
): Promise<{ error: unknown }> {
  // Atomic in one transaction: team-ID assignment, both position updates and
  // the Mix gender trigger — no half-pair can survive a mid-flight failure.
  const { error } = await supabase.rpc("create_pair", {
    p_stevneid: stevneId,
    p_kaster_a: kasterAId,
    p_kaster_b: kasterBId,
  });
  if (error) logError("createPair", error);
  return { error };
}

export async function deletePair(stevneId: number, teamId: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from("pamelding")
    .update({ lag_id: null, posisjon: null })
    .eq("stevneid", stevneId)
    .eq("lag_id", teamId);
  if (error) logError("deletePair", error);
  return { error };
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export function subscribeToRegistrationChanges(
  stevneId: number,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(`pamelding-stevne-${stevneId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pamelding", filter: `stevneid=eq.${stevneId}` },
      onChange,
    )
    .subscribe();
}
