import type { AuthUser, Role } from "@/types";

export const ROLES = ["bruker", "klubbadmin", "admin"] as const satisfies readonly Role[];

export const ROLE_LABEL: Record<Role, string> = {
  bruker: "Brukar",
  klubbadmin: "Klubbadmin",
  admin: "Admin",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * Only a brukar may be linked to a thrower. The database enforces the same
 * rule (bruker_profil_kobling_berre_bruker); this keeps the UI in step.
 */
export function canLinkThrower(role: string | null | undefined): boolean {
  return role === "bruker";
}

/** Admins and klubbadmins land on the admin dashboard instead of Min side. */
export function isOrganizerRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "klubbadmin";
}

/**
 * Admin, or the klubbadmin of `clubId`. Mirrors private.er_stevnearrangor so the
 * UI never offers a write RLS rejects; a row with no club is admin-only.
 */
export function canOrganize(
  auth: AuthUser | null | undefined,
  clubId: number | null | undefined,
): boolean {
  const role = auth?.profil?.role;
  if (role === "admin") return true;
  return role === "klubbadmin" && clubId != null && auth?.club === clubId;
}
