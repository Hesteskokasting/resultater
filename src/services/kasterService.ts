import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import type { Tables } from "@/types";

// Query builders used only for type inference — no HTTP calls at module load
const _medlemQuery = supabase
  .from("kaster")
  .select("id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)");
const _kasterListeQuery = supabase
  .from("kaster")
  .select("id, fornavn, etternavn, eraktiv, avatarurl, kjonnid, klubb:klubbid(id, navn)");
const _kasterDetaljQuery = supabase
  .from("kaster")
  .select(
    "id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)",
  );
const _kasterForKoblingQuery = supabase
  .from("kaster")
  .select("id, fornavn, etternavn, klubb:klubbid(navn)");
const _resultatDetaljQuery = supabase.from("resultat").select(`
  id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
  klubb:klubbid(id, navn),
  stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
`);

export type MemberRow = QueryData<typeof _medlemQuery>[number];
export type ThrowerListRow = QueryData<typeof _kasterListeQuery>[number];
export type ThrowerDetailRow = QueryData<typeof _kasterDetaljQuery>[number];
export type ThrowerForLinkRow = QueryData<typeof _kasterForKoblingQuery>[number];
export type ResultDetailRow = QueryData<typeof _resultatDetaljQuery>[number];

// ── Caches ────────────────────────────────────────────────────────────────────

let _kasterListeAktivCache: ThrowerListRow[] | null = null;
let _kasterListeAlleCache: ThrowerListRow[] | null = null;

const _klubbDetaljCache = new Map<number, { data: MemberRow[]; error: unknown }>();
const _kasterDetaljCache = new Map<
  number,
  { kaster: ThrowerDetailRow | null; resultater: ResultDetailRow[]; error: unknown }
>();
const _kasterKoblingCache = new Map<number, { data: ThrowerForLinkRow | null; error: unknown }>();

// ── Exported functions ────────────────────────────────────────────────────────

export async function getClubMembers(
  klubbId: number,
): Promise<{ data: MemberRow[]; error: unknown }> {
  if (_klubbDetaljCache.has(klubbId)) return _klubbDetaljCache.get(klubbId)!;
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)")
    .eq("klubbid", klubbId)
    .eq("eraktiv", true)
    .order("etternavn")
    .order("fornavn");
  if (error) logError("getClubMembers", error);
  const entry = { data: data ?? [], error };
  _klubbDetaljCache.set(klubbId, entry);
  return entry;
}

export async function getActiveThrowerList(): Promise<{ data: ThrowerListRow[]; error: unknown }> {
  if (_kasterListeAktivCache) return { data: _kasterListeAktivCache, error: null };
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, eraktiv, avatarurl, kjonnid, klubb:klubbid(id, navn)")
    .eq("eraktiv", true)
    .order("etternavn")
    .order("fornavn");
  if (error) logError("getActiveThrowerList", error);
  _kasterListeAktivCache = data ?? [];
  return { data: _kasterListeAktivCache, error };
}

export async function getAllThrowerList(): Promise<{ data: ThrowerListRow[]; error: unknown }> {
  if (_kasterListeAlleCache) return { data: _kasterListeAlleCache, error: null };
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, eraktiv, avatarurl, kjonnid, klubb:klubbid(id, navn)")
    .order("etternavn")
    .order("fornavn");
  if (error) logError("getAllThrowerList", error);
  _kasterListeAlleCache = data ?? [];
  return { data: _kasterListeAlleCache, error };
}

export async function getThrowerDetail(id: number): Promise<{
  kaster: ThrowerDetailRow | null;
  resultater: ResultDetailRow[];
  error: unknown;
}> {
  if (_kasterDetaljCache.has(id)) return _kasterDetaljCache.get(id)!;

  const [kasterRes, resultatRes] = await Promise.all([
    supabase
      .from("kaster")
      .select(
        "id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("resultat")
      .select(`
        id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
        klubb:klubbid(id, navn),
        stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
      `)
      .eq("kasterid", id),
  ]);

  const error = kasterRes.error || resultatRes.error;
  if (error) logError("getThrowerDetail", error);

  const resultater = (resultatRes.data ?? [])
    .filter((r) => r.stevne?.dato)
    .sort((a, b) => (b.stevne?.dato ?? "").localeCompare(a.stevne?.dato ?? ""));

  const entry = { kaster: kasterRes.data, resultater, error };
  _kasterDetaljCache.set(id, entry);
  return entry;
}

export async function getThrowersForClubs(
  klubbIds: number[],
): Promise<{ data: ThrowerListRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, eraktiv, avatarurl, kjonnid, klubb:klubbid(id, navn)")
    .in("klubbid", klubbIds)
    .eq("eraktiv", true)
    .order("etternavn")
    .order("fornavn");
  if (error) logError("getThrowersForClubs", error);
  return { data: data ?? [], error };
}

export async function getThrowerForLink(
  id: number,
): Promise<{ data: ThrowerForLinkRow | null; error: unknown }> {
  if (_kasterKoblingCache.has(id)) return _kasterKoblingCache.get(id)!;
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, klubb:klubbid(navn)")
    .eq("id", id)
    .single();
  if (error) logError("getThrowerForLink", error);
  const entry = { data, error };
  _kasterKoblingCache.set(id, entry);
  return entry;
}

// ── Admin functions ───────────────────────────────────────────────────────────

export type ClassRow = Pick<Tables<"klasse">, "id" | "navn">;
export type GenderRow = Pick<Tables<"kjonn">, "id" | "navn">;

export type ThrowerAdminRow = Pick<
  Tables<"kaster">,
  | "id"
  | "fornavn"
  | "etternavn"
  | "kjonnid"
  | "klasseid"
  | "klubbid"
  | "epost"
  | "telefon"
  | "medlemsnummer"
  | "eraktiv"
>;
export type ThrowerAdminPayload = Omit<ThrowerAdminRow, "id">;

export async function getClasses(): Promise<{ data: ClassRow[]; error: unknown }> {
  const { data, error } = await supabase.from("klasse").select("id, navn").order("navn");
  if (error) logError("getClasses", error);
  return { data: data ?? [], error };
}

export async function getGenders(): Promise<{ data: GenderRow[]; error: unknown }> {
  const { data, error } = await supabase.from("kjonn").select("id, navn").order("id");
  if (error) logError("getGenders", error);
  return { data: data ?? [], error };
}

export async function getThrowersById(
  ids: number[],
): Promise<{ data: ThrowerForLinkRow[]; error: unknown }> {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from("kaster")
    .select("id, fornavn, etternavn, klubb:klubbid(navn)")
    .in("id", ids);
  if (error) logError("getThrowersById", error);
  return { data: data ?? [], error };
}

export async function getThrowerForAdmin(
  id: number,
): Promise<{ data: ThrowerAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("kaster")
    .select(
      "id, fornavn, etternavn, kjonnid, klasseid, klubbid, epost, telefon, medlemsnummer, eraktiv",
    )
    .eq("id", id)
    .single();
  if (error) logError("getThrowerForAdmin", error);
  return { data, error };
}

/**
 * Drop the cached thrower lists so the next read hits the database.
 * Called after every write below; export it for callers that mutate `kaster` by other means.
 */
export function invalidateThrowerListCache(): void {
  _kasterListeAktivCache = null;
  _kasterListeAlleCache = null;
}

export async function createThrower(
  payload: ThrowerAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from("kaster").insert(payload).select("id").single();
  if (error) logError("createThrower", error);
  else invalidateThrowerListCache();
  return { data, error };
}

export async function updateThrower(
  id: number,
  payload: ThrowerAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from("kaster")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();
  if (error) logError("updateThrower", error);
  else invalidateThrowerListCache();
  return { data, error };
}

export async function deleteThrower(id: number): Promise<{ error: unknown }> {
  const { error } = await supabase.from("kaster").delete().eq("id", id);
  if (error) logError("deleteThrower", error);
  else invalidateThrowerListCache();
  return { error };
}
