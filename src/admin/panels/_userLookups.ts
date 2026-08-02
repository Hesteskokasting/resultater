import { getUserEmails } from "@/services/adminService";
import { getThrowersById } from "@/services/kasterService";
import type { ThrowerForLinkRow } from "@/services/kasterService";

/**
 * Emails and thrower rows for a set of user profiles, as lookup maps.
 *
 * `bruker_profil` carries no email (it lives in `auth.users`, reachable only
 * through an RPC) and no thrower name, so both the user list and the link
 * request queue need this same second round trip before they can render a row.
 */
export interface UserLookups {
  emailMap: Map<string, string>;
  throwerMap: Map<number, ThrowerForLinkRow>;
}

export async function loadUserLookups(
  userIds: string[],
  throwerIds: number[],
): Promise<UserLookups> {
  const [{ data: emails }, { data: throwers }] = await Promise.all([
    getUserEmails(userIds),
    getThrowersById([...new Set(throwerIds)]),
  ]);

  return {
    emailMap: new Map((emails ?? []).map((r) => [r.id, r.epost] as const)),
    throwerMap: new Map((throwers ?? []).map((k) => [k.id, k] as const)),
  };
}
