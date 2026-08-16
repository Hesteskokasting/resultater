/**
 * Klasse 1 and Klasse 2 were merged into a single class from the 2026 season.
 * Older seasons still have to be listed, filtered and grouped per class, so
 * every view that reads historic results asks this rather than comparing the
 * year itself.
 */
export function hasSeparateClasses(year: number): boolean {
  return year < 2026;
}
