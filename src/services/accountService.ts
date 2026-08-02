import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";

export interface LinkedAccountRow {
  id: string;
  epost: string;
  opprettet_at: string;
}

/** Login accounts linked (godkjent) to the caller's kasterid, including the caller. */
export async function getLinkedAccounts(): Promise<{ data: LinkedAccountRow[]; error: unknown }> {
  const { data, error } = await supabase.rpc("hent_kobla_kontoar");
  if (error) logError("getLinkedAccounts", error);
  return { data: data ?? [], error };
}

/**
 * Deletes a login account: `bruker_profil` plus the `auth.users` row. The
 * thrower profile (`kaster`) and everything keyed by kasterid — results,
 * registrations, match history — is deliberately left in place.
 *
 * The RPC allows the caller's own id, or any account when the caller is an
 * admin. The last remaining admin account is refused either way.
 */
export async function deleteUserAccount(targetId: string): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("slett_brukarkonto", { target_id: targetId });
  if (error) logError("deleteUserAccount", error);
  return { error };
}
