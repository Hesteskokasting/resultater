import type { Kaster, Klubb } from "@/types";

export function throwerName(
  k: { fornavn?: string | null; etternavn?: string | null } | null | undefined,
): string {
  return [k?.fornavn, k?.etternavn].filter(Boolean).join(" ");
}

/** "Fornavn E." — first name plus last-name initial. */
export function throwerNameShort(
  k: { fornavn?: string | null; etternavn?: string | null } | null | undefined,
): string {
  const initial = k?.etternavn ? ` ${k.etternavn.charAt(0)}.` : "";
  return `${k?.fornavn ?? ""}${initial}`.trim();
}

function buildSlugStr(str: string): string {
  return (str ?? "")
    .toLowerCase()
    .replace(/[æä]/g, "ae")
    .replace(/[øö]/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildThrowerSlug(k: Pick<Kaster, "id" | "fornavn" | "etternavn">): string {
  return `${k.id}-` + buildSlugStr(`${k.etternavn ?? ""}-${k.fornavn ?? ""}`);
}

export function buildClubSlug(k: Pick<Klubb, "id" | "navn">): string {
  return `${k.id}-` + buildSlugStr(k.navn ?? "");
}
