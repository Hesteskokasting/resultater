// ── Select and option markup ──────────────────────────────────────────────────

import { escHtml } from "@/utils/escHtml";

interface DropdownItem {
  id: number | string;
  navn?: string | null;
  klubbnavn?: string | null;
}

export function buildDropdownOptions(
  items: DropdownItem[] | null | undefined,
  selectedId: number | string | null | undefined,
  emptyLabel = "— velg —",
): string {
  let html = `<option value="">${emptyLabel}</option>`;
  for (const item of items ?? []) {
    const selected = String(item.id) === String(selectedId) ? " selected" : "";
    const label = escHtml(item.navn ?? item.klubbnavn ?? "");
    html += `<option value="${item.id}"${selected}>${label}</option>`;
  }
  return html;
}

/** A `<select>` with the matching option pre-selected. Labels and values are escaped. */
export function selectHtml(
  id: string,
  options: { value: string; label: string }[],
  selected: string,
  className = "app-select",
): string {
  const opts = options
    .map(
      (o) =>
        `<option value="${escHtml(o.value)}"${o.value === selected ? " selected" : ""}>${escHtml(o.label)}</option>`,
    )
    .join("");
  return `<select id="${id}" class="${className}">${opts}</select>`;
}

/** Descending year `<option>`s, newest first. */
export function yearOptions(selected: number, from: number, to = new Date().getFullYear()): string {
  let html = "";
  for (let year = to; year >= from; year--) {
    html += `<option value="${year}"${year === selected ? " selected" : ""}>${year}</option>`;
  }
  return html;
}
