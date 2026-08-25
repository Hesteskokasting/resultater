/** Cuts a string to `max` characters and marks the cut with an ellipsis. */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
