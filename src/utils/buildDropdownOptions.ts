import { escHtml } from "./escHtml";

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
