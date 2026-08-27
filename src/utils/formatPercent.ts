const percentFmt = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Ring percentage and the like, nb-NO with two decimals. "–" when unknown. */
export function formatPercent(p: number | null | undefined): string {
  if (p == null) return "–";
  return percentFmt.format(p) + " %";
}
