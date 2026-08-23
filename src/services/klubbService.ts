import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { verifyRowsAffected } from "@/utils/data/verifiedWrite";
import type { Tables } from "@/types";

export type ClubListRow = Pick<Tables<"klubb">, "id" | "navn" | "logourl">;

let _clubCache: { data: ClubListRow[]; error: unknown } | null = null;

export async function getClubs(): Promise<{ data: ClubListRow[]; error: unknown }> {
  if (_clubCache) return _clubCache;
  const { data, error } = await supabase
    .from("klubb")
    .select("id, navn, logourl")
    .eq("eraktiv", true)
    .order("navn");
  if (error) logError("getClubs", error);
  _clubCache = { data: data ?? [], error };
  return _clubCache;
}

export async function getClubById(
  id: number,
): Promise<{ data: ClubListRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("klubb")
    .select("id, navn, logourl")
    .eq("id", id)
    .single();
  if (error) logError("getClubById", error);
  return { data, error };
}

// ── Admin-funksjonar ──────────────────────────────────────────────────────────

export type ClubAdminRow = Pick<
  Tables<"klubb">,
  "id" | "navn" | "kortnavn" | "logourl" | "eraktiv"
>;
export type ClubAdminPayload = Omit<ClubAdminRow, "id">;

/**
 * Drop the cached active-club list so the next read hits the database.
 * Called after every write below, since a rename or a deactivation changes it.
 */
function invalidateClubCache(): void {
  _clubCache = null;
}

export async function getClubForAdmin(
  id: number,
): Promise<{ data: ClubAdminRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("klubb")
    .select("id, navn, kortnavn, logourl, eraktiv")
    .eq("id", id)
    .single();
  if (error) logError("getClubForAdmin", error);
  return { data, error };
}

/** Every club, inactive ones included — the admin club list has to show those too. */
export async function getAllClubsForAdmin(): Promise<{ data: ClubAdminRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("klubb")
    .select("id, navn, kortnavn, logourl, eraktiv")
    .order("navn");
  if (error) logError("getAllClubsForAdmin", error);
  return { data: data ?? [], error };
}

export async function createClub(
  payload: ClubAdminPayload,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase.from("klubb").insert(payload).select("id").single();
  if (error) logError("createClub", error);
  else invalidateClubCache();
  return { data, error };
}

export async function updateClub(
  id: number,
  payload: ClubAdminPayload,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffected(
    supabase.from("klubb").update(payload).eq("id", id).select("id"),
  );
  if (error) logError("updateClub", error);
  else invalidateClubCache();
  return { error };
}
