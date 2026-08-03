/** The shape both SNC views carry for a local stevne. */
export interface SncLocalLike {
  navn: string;
  sted?: string | null;
  klubb?: { navn: string | null } | null;
}

/**
 * How one local stevne in an SNC round is named in the UI: club and place joined
 * with a middot, deduped because they are usually the same word ("Førde"), and
 * falling back to the stevne's own name. Shared so a venue reads identically on
 * the info tab and in the consolidated result table.
 */
export function sncLocalLabel(local: SncLocalLike): string {
  const parts = [local.klubb?.navn, local.sted].filter((value): value is string =>
    Boolean(value?.trim()),
  );
  const unique = [...new Set(parts.map((p) => p.trim()))];
  return unique.length ? unique.join(" · ") : local.navn;
}
