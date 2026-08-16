import { throwerName } from "@/utils/kaster";

interface NamedThrower {
  fornavn: string | null;
  etternavn: string | null;
}

/**
 * Lower-cased thrower names per club id, so the club search can match on a member
 * without re-walking the whole thrower list for every keystroke.
 */
export function throwerNamesByClub(
  throwers: (NamedThrower & { klubb: { id: number } | null })[],
): Map<number, string[]> {
  const byClub = new Map<number, string[]>();
  for (const t of throwers) {
    if (!t.klubb?.id) continue;
    const name = throwerName(t).toLowerCase();
    const names = byClub.get(t.klubb.id);
    if (names) names.push(name);
    else byClub.set(t.klubb.id, [name]);
  }
  return byClub;
}

/** A club matches on its own name or on any of its members'. Blank keeps everything. */
export function filterClubs<T extends { id: number; navn: string }>(
  clubs: T[],
  namesByClub: Map<number, string[]>,
  searchText: string,
): T[] {
  const search = searchText.trim().toLowerCase();
  if (!search) return clubs;
  return clubs.filter(
    (k) =>
      k.navn.toLowerCase().includes(search) ||
      (namesByClub.get(k.id) ?? []).some((n) => n.includes(search)),
  );
}

/** Free-text match on the member's name. Blank keeps everything. */
export function filterMembers<T extends NamedThrower>(members: T[], searchText: string): T[] {
  const search = searchText.trim().toLowerCase();
  if (!search) return members;
  return members.filter((m) => throwerName(m).toLowerCase().includes(search));
}
