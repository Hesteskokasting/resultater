/** Creates a detached element with optional text content and class. */
export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  tekst: string | null,
  klasse?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (tekst != null) el.textContent = tekst
  if (klasse) el.className = klasse
  return el
}
