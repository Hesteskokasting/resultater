import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import type { Tables } from "@/types";

export type NotificationPreferencesRow = Pick<
  Tables<"bruker_profil">,
  "varsle_stevne_start" | "varsle_kamp_opprettet"
>;

export async function getNotificationPreferences(
  userId: string,
): Promise<{ data: NotificationPreferencesRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("bruker_profil")
    .select("varsle_stevne_start, varsle_kamp_opprettet")
    .eq("id", userId)
    .maybeSingle();
  if (error) logError("getNotificationPreferences", error);
  return { data, error };
}

export async function updateNotificationPreference(
  userId: string,
  field: keyof NotificationPreferencesRow,
  value: boolean,
): Promise<{ error: unknown }> {
  const patch: Partial<NotificationPreferencesRow> =
    field === "varsle_stevne_start"
      ? { varsle_stevne_start: value }
      : { varsle_kamp_opprettet: value };
  const { error } = await supabase.from("bruker_profil").update(patch).eq("id", userId);
  if (error) logError("updateNotificationPreference", error);
  return { error };
}
