import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { verifyRowsAffected } from "@/utils/verifiedWrite";
import type { Tables, Json, Round1FormatTyped } from "@/types";

// ── Admin-typar ───────────────────────────────────────────────────────────────

export type TournamentAdminRow = Pick<
  Tables<"stevne">,
  | "id"
  | "navn"
  | "sted"
  | "dato"
  | "tid"
  | "klubbid"
  | "stevnetypeid"
  | "innledendekastemetodeid"
  | "avsluttendekastemetodeid"
  | "kategoriid"
  | "kontaktkasterid"
  | "ernm"
  | "ernorgesranking"
  | "erfullfort"
  | "erekskludertfrarekorder"
  | "resultaturl"
  | "er_snc_hovudstevne"
  | "snc_hovudstevne_id"
>;
export type TournamentAdminPayload = Omit<TournamentAdminRow, "id" | "erfullfort">;

export type TournamentTypeRow = Pick<Tables<"stevnetype">, "id" | "navn">;
export type ThrowingMethodRow = Pick<Tables<"kastemetode">, "id" | "navn">;
export type CategoryRow = Pick<Tables<"kategori">, "id" | "navn">;

// ── Info-tab typar ────────────────────────────────────────────────────────────

const _infoStevneQuery = supabase.from("stevne").select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid, tilgjengelige_baner,
    snc_hovudstevne_id,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
    kategori:kategoriid(erlagbasert, navn)
  `);

export type InfoTournamentRow = QueryData<typeof _infoStevneQuery>[number];

export type LatestResultRow = Pick<Tables<"stevne">, "id" | "navn" | "dato">;
export type LiveTournamentRow = Pick<
  Tables<"stevne">,
  | "id"
  | "navn"
  | "dato"
  | "stevne_fase"
  | "erfullfort"
  | "er_snc_hovudstevne"
  | "snc_hovudstevne_id"
>;
export type UpcomingTournamentRow = Pick<
  Tables<"stevne">,
  "id" | "navn" | "dato" | "stevne_fase" | "erfullfort" | "er_snc_hovudstevne"
>;
const _pameldingStevneQuery = supabase
  .from("stevne")
  .select(
    "id, navn, dato, tid, sted, erfullfort, klubbid, er_snc_hovudstevne, snc_hovudstevne_id, kategori:kategoriid(navn)",
  );

export type RegistrationTournamentRow = QueryData<typeof _pameldingStevneQuery>[number];
export type RelatedTournamentRow = Pick<Tables<"stevne">, "id" | "navn" | "dato">;

// The home page shows an SNC round as one event. Local stevner are filtered out
// in the query, not the client, because limit(5) would otherwise fill up with them.
export async function getLatestResults(): Promise<{ data: LatestResultRow[]; error: unknown }> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato")
    .lte("dato", today)
    .eq("erfullfort", true)
    .is("snc_hovudstevne_id", null)
    .order("dato", { ascending: false })
    .limit(5);
  if (error) logError("getLatestResults", error);
  return { data: data ?? [], error };
}

/** Includes SNC local stevner — the admin overview needs them. */
export async function getLiveTournaments(): Promise<{ data: LiveTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato, stevne_fase, erfullfort, er_snc_hovudstevne, snc_hovudstevne_id")
    .in("stevne_fase", ["innledende", "avsluttende"])
    .order("dato", { ascending: true });
  if (error) logError("getLiveTournaments", error);
  return { data: data ?? [], error };
}

/** Used by the home page to swap live local stevner for their umbrella. */
export async function getTournamentsByIds(
  ids: number[],
): Promise<{ data: LiveTournamentRow[]; error: unknown }> {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato, stevne_fase, erfullfort, er_snc_hovudstevne, snc_hovudstevne_id")
    .in("id", ids)
    .order("dato", { ascending: true });
  if (error) logError("getTournamentsByIds", error);
  return { data: data ?? [], error };
}

export async function getUpcomingTournaments(): Promise<{
  data: UpcomingTournamentRow[];
  error: unknown;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato, stevne_fase, erfullfort, er_snc_hovudstevne")
    .gte("dato", today)
    .eq("erfullfort", false)
    .is("snc_hovudstevne_id", null)
    .or("stevne_fase.is.null,stevne_fase.eq.ikke_startet")
    .order("dato", { ascending: true })
    .limit(5);
  if (error) logError("getUpcomingTournaments", error);
  return { data: data ?? [], error };
}

export async function getTournamentForRegistration(
  id: number,
): Promise<{ data: RegistrationTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, navn, dato, tid, sted, erfullfort, klubbid, er_snc_hovudstevne, snc_hovudstevne_id, kategori:kategoriid(navn)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) logError("getTournamentForRegistration", error);
  return { data, error };
}

export async function getRelatedTournaments(
  klubbId: number,
  fromDate: string,
  toDate: string,
  excludeId: number,
): Promise<{ data: RelatedTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato")
    .eq("klubbid", klubbId)
    .eq("erfullfort", false)
    .neq("id", excludeId)
    .gte("dato", fromDate)
    .lte("dato", toDate)
    .order("dato");
  if (error) logError("getRelatedTournaments", error);
  return { data: data ?? [], error };
}

export async function getInfoTournament(
  id: number,
): Promise<{ data: InfoTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid, tilgjengelige_baner,
      snc_hovudstevne_id,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn),
      kategori:kategoriid(erlagbasert, navn)
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) logError("getInfoTournament", error);
  return { data, error };
}

export async function updateTournamentPhase(
  id: number,
  phase: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from("stevne").update({ stevne_fase: phase }).eq("id", id);
  if (error) logError("updateTournamentPhase", error);
  return { error };
}

// ── Oppslag for admin-skjema ──────────────────────────────────────────────────

export async function getTournamentTypes(): Promise<{ data: TournamentTypeRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevnetype")
    .select("id, navn")
    .eq("eraktiv", true)
    .order("navn");
  if (error) logError("getTournamentTypes", error);
  return { data: data ?? [], error };
}

export async function getInitialThrowingMethods(): Promise<{
  data: ThrowingMethodRow[];
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("kastemetode")
    .select("id, navn")
    .eq("er_innledende", true)
    .eq("eraktiv", true)
    .order("navn");
  if (error) logError("getInitialThrowingMethods", error);
  return { data: data ?? [], error };
}

export async function getFinalThrowingMethods(): Promise<{
  data: ThrowingMethodRow[];
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("kastemetode")
    .select("id, navn")
    .eq("er_avsluttende", true)
    .eq("eraktiv", true)
    .order("navn");
  if (error) logError("getFinalThrowingMethods", error);
  return { data: data ?? [], error };
}

export async function getCategories(): Promise<{ data: CategoryRow[]; error: unknown }> {
  const { data, error } = await supabase.from("kategori").select("id, navn").order("navn");
  if (error) logError("getCategories", error);
  return { data: data ?? [], error };
}

// ── Stevne-admin CRUD ─────────────────────────────────────────────────────────

export async function getTournamentForAdmin(
  id: number,
): Promise<{ data: TournamentAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, kontaktkasterid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, resultaturl, er_snc_hovudstevne, snc_hovudstevne_id",
    )
    .eq("id", id)
    .single();
  if (error) logError("getTournamentForAdmin", error);
  return { data, error };
}

export async function createTournament(
  payload: TournamentAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from("stevne").insert(payload).select("id").single();
  if (error) logError("createTournament", error);
  return { data, error };
}

export async function updateTournament(
  id: number,
  payload: TournamentAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();
  if (error) logError("updateTournament", error);
  return { data, error };
}

export async function deleteTournament(id: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from("stevne").delete().eq("id", id);
  if (error) logError("deleteTournament", error);
  return { error };
}

// ── SNC: umbrella + local stevner ─────────────────────────────────────────────

// One string per query, used both to derive the row type and to run it, so the
// two cannot drift apart.
const SNC_LOKALSTEVNE_SELECT =
  "id, navn, sted, dato, tid, erfullfort, stevne_fase, klubbid, klubb:klubbid(id, navn, logourl)" as const;

const _sncLokalstevneQuery = supabase.from("stevne").select(SNC_LOKALSTEVNE_SELECT);

/** One local stevne in an SNC round — a venue the thrower can pick. */
export type SncLocalTournamentRow = QueryData<typeof _sncLokalstevneQuery>[number];

const SNC_HOVUDSTEVNE_SELECT =
  "id, navn, sted, dato, tid, erfullfort, klubbid, innledendekastemetodeid, avsluttendekastemetodeid, kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn, antall_omganger), kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn), kategori:kategoriid(navn, erlagbasert), klubb:klubbid(id, navn)" as const;

const _sncHovudstevneQuery = supabase.from("stevne").select(SNC_HOVUDSTEVNE_SELECT);

export type SncParentTournamentRow = QueryData<typeof _sncHovudstevneQuery>[number];

export type SncParentOptionRow = Pick<Tables<"stevne">, "id" | "navn" | "dato" | "erfullfort">;

export async function getSncParentTournament(
  id: number,
): Promise<{ data: SncParentTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(SNC_HOVUDSTEVNE_SELECT)
    .eq("id", id)
    .eq("er_snc_hovudstevne", true)
    .maybeSingle();
  if (error) logError("getSncParentTournament", error);
  return { data, error };
}

export async function getSncLocalTournaments(
  hovudstevneId: number,
): Promise<{ data: SncLocalTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(SNC_LOKALSTEVNE_SELECT)
    .eq("snc_hovudstevne_id", hovudstevneId)
    .order("dato")
    .order("navn");
  if (error) logError("getSncLocalTournaments", error);
  return { data: data ?? [], error };
}

/** Umbrellas a local stevne can be attached to, newest first. */
export async function getSncParentOptions(): Promise<{
  data: SncParentOptionRow[];
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("stevne")
    .select("id, navn, dato, erfullfort")
    .eq("er_snc_hovudstevne", true)
    .order("dato", { ascending: false });
  if (error) logError("getSncParentOptions", error);
  return { data: data ?? [], error };
}

/** Computes the merged list and marks the umbrella completed. */
export async function completeSncParent(hovudstevneId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("complete_snc_hovudstevne", { p_stevneid: hovudstevneId });
  if (error) logError("completeSncParent", error);
  return { error };
}

/** Clears the merged list and NC points, and reopens the umbrella. */
export async function reopenSncParent(hovudstevneId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("reopen_snc_hovudstevne", { p_stevneid: hovudstevneId });
  if (error) logError("reopenSncParent", error);
  return { error };
}

// ── Terminliste ───────────────────────────────────────────────────────────────

export type ClubRow = Pick<Tables<"klubb">, "id" | "navn">;

export interface FilterOptions {
  stevnetyper: TournamentTypeRow[];
  kastemetoder: ThrowingMethodRow[];
  klubber: ClubRow[];
  kategorier: CategoryRow[];
}

const _terminlisteStevneQuery = supabase.from("stevne").select(`
    id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, resultaturl,
    er_snc_hovudstevne, snc_hovudstevne_id,
    klubb:klubbid(id, navn),
    stevnetype:stevnetypeid(id, navn),
    innledende:kastemetode!innledendekastemetodeid(id, navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
    kategori:kategoriid(id, navn)
  `);

export type ScheduleTournamentRow = QueryData<typeof _terminlisteStevneQuery>[number];

export async function getScheduleTournaments(
  ar: number,
): Promise<{ data: ScheduleTournamentRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(`
      id, navn, sted, dato, tid, ernm, erfullfort, stevne_fase, resultaturl,
      er_snc_hovudstevne, snc_hovudstevne_id,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `)
    .gte("dato", `${ar}-01-01`)
    .lte("dato", `${ar}-12-31`)
    .order("dato");
  if (error) logError("getScheduleTournaments", error);
  return { data: data ?? [], error };
}

export async function getFilterOptions(): Promise<{ data: FilterOptions; error: unknown }> {
  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from("stevnetype").select("id, navn").order("navn"),
    supabase.from("kastemetode").select("id, navn").order("navn"),
    supabase.from("klubb").select("id, navn").order("navn"),
    supabase.from("kategori").select("id, navn").order("navn"),
  ]);
  const firstError = r1.error ?? r2.error ?? r3.error ?? r4.error ?? null;
  if (firstError) logError("getFilterOptions", firstError);
  return {
    data: {
      stevnetyper: r1.data ?? [],
      kastemetoder: r2.data ?? [],
      klubber: r3.data ?? [],
      kategorier: r4.data ?? [],
    },
    error: firstError,
  };
}

// ── Stevne-side header ────────────────────────────────────────────────────────

const _stevneHeaderQuery = supabase
  .from("stevne")
  .select(
    "id, navn, stevne_fase, erfullfort, avsluttendekastemetodeid, er_snc_hovudstevne, snc_hovudstevne_id, kategori:kategoriid(id, navn, erlagbasert)",
  );

export type TournamentHeaderRow = QueryData<typeof _stevneHeaderQuery>[number];

export async function getTournamentHeader(
  id: number,
): Promise<{ data: TournamentHeaderRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, navn, stevne_fase, erfullfort, avsluttendekastemetodeid, er_snc_hovudstevne, snc_hovudstevne_id, kategori:kategoriid(id, navn, erlagbasert)",
    )
    .eq("id", id)
    .single();
  if (error) logError("getTournamentHeader", error);
  return { data, error };
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslStevneQuery = supabase
  .from("stevne")
  .select(
    "id, navn, stevne_fase, erfullfort, runde1_format, kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn), kategori:kategoriid(erlagbasert)",
  );

export type FinalPhaseTournamentRow = QueryData<typeof _avslStevneQuery>[number];

export async function getFinalPhaseTournament(
  stevneid: number,
): Promise<{ data: FinalPhaseTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, navn, stevne_fase, erfullfort, runde1_format, kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn), kategori:kategoriid(erlagbasert)",
    )
    .eq("id", stevneid)
    .maybeSingle();
  if (error) logError("getFinalPhaseTournament", error);
  return { data, error };
}

export async function setRound1Format(
  stevneid: number,
  format: Round1FormatTyped | null,
): Promise<{ error: unknown }> {
  // Round1FormatTyped serialises cleanly to JSON; cast is justified at this DB boundary
  const { error } = await verifyRowsAffected(
    supabase
      .from("stevne")
      .update({ runde1_format: format as unknown as Json })
      .eq("id", stevneid)
      .select("id"),
  );
  if (error) logError("setRound1Format", error);
  return { error };
}

export async function getTournamentRegistrationCount(
  stevneid: number,
): Promise<{ count: number; error: unknown }> {
  const { count, error } = await supabase
    .from("pamelding")
    .select("id", { count: "exact", head: true })
    .eq("stevneid", stevneid);
  if (error) logError("getTournamentRegistrationCount", error);
  return { count: count ?? 0, error };
}

// ── Innstillingar-tab ─────────────────────────────────────────────────────────

export type TournamentSettingsRow = Pick<
  Tables<"stevne">,
  | "id"
  | "stevne_fase"
  | "antall_runder_innl"
  | "innledendekastemetodeid"
  | "avsluttendekastemetodeid"
  | "tilgjengelige_baner"
  | "er_snc_hovudstevne"
  | "snc_hovudstevne_id"
>;
export type ActiveThrowingMethodRow = Pick<
  Tables<"kastemetode">,
  "id" | "navn" | "er_innledende" | "er_avsluttende"
>;
export type TournamentSettingsUpdatePayload = Pick<
  Tables<"stevne">,
  | "innledendekastemetodeid"
  | "avsluttendekastemetodeid"
  | "antall_runder_innl"
  | "tilgjengelige_baner"
>;

export async function getTournamentSettings(
  id: number,
): Promise<{ data: TournamentSettingsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid, tilgjengelige_baner, er_snc_hovudstevne, snc_hovudstevne_id",
    )
    .eq("id", id)
    .single();
  if (error) logError("getTournamentSettings", error);
  return { data, error };
}

export async function getActiveThrowingMethods(): Promise<{
  data: ActiveThrowingMethodRow[];
  error: unknown;
}> {
  const { data, error } = await supabase
    .from("kastemetode")
    .select("id, navn, er_innledende, er_avsluttende")
    .eq("eraktiv", true)
    .order("navn");
  if (error) logError("getActiveThrowingMethods", error);
  return { data: data ?? [], error };
}

export async function updateTournamentSettings(
  id: number,
  payload: TournamentSettingsUpdatePayload,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase.from("stevne").update(payload).eq("id", id).select("id"),
  );
  if (error) logError("updateTournamentSettings", error);
  return { error };
}

export interface ThrowerRegistrations {
  /** stevneid → pameldingid, for stevner the thrower is registered to directly. */
  byTournament: Map<number, number>;
  /**
   * SNC umbrellas the thrower is in through one of their local stevner. A pamelding
   * row never names the umbrella itself, so `byTournament` cannot answer this.
   */
  sncParentIds: Set<number>;
}

export function emptyThrowerRegistrations(): ThrowerRegistrations {
  return { byTournament: new Map(), sncParentIds: new Set() };
}

export async function getRegistrationsForThrower(kasterid: number): Promise<ThrowerRegistrations> {
  const { data, error } = await supabase
    .from("pamelding")
    .select("id, stevneid, stevne:stevneid(snc_hovudstevne_id)")
    .eq("kasterid", kasterid);
  if (error) logError("getRegistrationsForThrower", error);
  const registrations = emptyThrowerRegistrations();
  for (const row of data ?? []) {
    if (row.stevneid == null) continue;
    registrations.byTournament.set(row.stevneid, row.id);
    const parentId = row.stevne?.snc_hovudstevne_id;
    if (parentId != null) registrations.sncParentIds.add(parentId);
  }
  return registrations;
}

// ── Dispatcher-hjelparar ──────────────────────────────────────────────────────

export async function getInitialMethodName(
  stevneid: number,
): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select("m:kastemetode!stevne_innledendekastemetodeid_fkey(navn)")
    .eq("id", stevneid)
    .single();
  if (error) logError("getInitialMethodName", error);
  const rel = data?.m;
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? "";
  return { navn: navn.toLowerCase(), error };
}

export async function getFinalMethodName(
  stevneid: number,
): Promise<{ navn: string; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select("m:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)")
    .eq("id", stevneid)
    .single();
  if (error) logError("getFinalMethodName", error);
  const rel = data?.m;
  const navn = (rel && !Array.isArray(rel) ? (rel as { navn: string | null }).navn : null) ?? "";
  return { navn: navn.toLowerCase(), error };
}

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlStevneQuery = supabase
  .from("stevne")
  .select(
    "id, navn, erfullfort, stevne_fase, antall_runder_innl, avsluttendekastemetodeid, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)",
  );

export type InitialPhaseTournamentRow = QueryData<typeof _innlStevneQuery>[number];

export async function getInitialPhaseTournament(
  stevneid: number,
): Promise<{ data: InitialPhaseTournamentRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(
      "id, navn, erfullfort, stevne_fase, antall_runder_innl, avsluttendekastemetodeid, kastemetodeInnl:innledendekastemetodeid(id, navn), kategori:kategoriid(erlagbasert)",
    )
    .eq("id", stevneid)
    .maybeSingle();
  if (error) logError("getInitialPhaseTournament", error);
  return { data, error };
}

export async function setTournamentCompleted(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("complete_stevne", { p_stevneid: stevneid });
  if (error) logError("setTournamentCompleted", error);
  return { error };
}

export async function reopenTournament(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("reopen_stevne", { p_stevneid: stevneid });
  if (error) logError("reopenTournament", error);
  return { error };
}
