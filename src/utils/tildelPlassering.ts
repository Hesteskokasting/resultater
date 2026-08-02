/**
 * Writes 1-based competition placement onto a list already sorted descending
 * by points: ties share a placement, the next distinct value skips ahead.
 */
export function assignPlacements<T extends { plassering?: number }>(
  liste: T[],
  getPoeng: (item: T) => number,
): void {
  let pl = 1;
  for (let i = 0; i < liste.length; i++) {
    const item = liste[i];
    if (item === undefined) continue;
    const forrige = liste[i - 1];
    if (forrige !== undefined && getPoeng(item) < getPoeng(forrige)) pl = i + 1;
    item.plassering = pl;
  }
}
