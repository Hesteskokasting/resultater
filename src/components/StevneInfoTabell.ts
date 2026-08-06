// The info table every stevne page shows. An SNC-hovudstevne is still a stevne,
// so it gets the same rows — only the status line and the trailing counts differ.

import { escHtml } from "@/utils/escHtml";
import { formatDateNumeric, formatTime } from "@/utils/shared";

export interface StevneInfoRow {
  label: string;
  /** Escaped or otherwise trusted HTML. */
  html: string;
}

interface NamedRow {
  navn?: string | null;
}

export interface StevneInfoSource {
  sted?: string | null;
  dato?: string | null;
  tid?: string | null;
  stevnetype?: NamedRow | null;
  kategori?: NamedRow | null;
  klubb?: NamedRow | null;
  kontakt?: { fornavn?: string | null; etternavn?: string | null } | null;
  kastemetodeInnl?: NamedRow | null;
  kastemetodeAvsl?: NamedRow | null;
}

/** Stevnetype and kategori read as one label: "SNC Singel". */
export function typeAndCategoryLabel(stevne: StevneInfoSource): string {
  return [stevne.stevnetype?.navn, stevne.kategori?.navn].filter(Boolean).join(" ") || "—";
}

/** The rows shared by every stevne, in the order they are shown. */
export function stevneInfoRows(stevne: StevneInfoSource): StevneInfoRow[] {
  const contact = stevne.kontakt
    ? `${stevne.kontakt.fornavn ?? ""} ${stevne.kontakt.etternavn ?? ""}`.trim()
    : "";
  return [
    { label: "Stad", html: escHtml(stevne.sted ?? "—") },
    { label: "Dato", html: stevne.dato ? formatDateNumeric(stevne.dato) : "—" },
    { label: "Tid", html: stevne.tid ? formatTime(stevne.tid) : "—" },
    { label: "Type / Kategori", html: escHtml(typeAndCategoryLabel(stevne)) },
    { label: "Arrangør", html: escHtml(stevne.klubb?.navn ?? "—") },
    { label: "Kontaktperson", html: escHtml(contact || "—") },
    { label: "Kastemetode innleiande", html: escHtml(stevne.kastemetodeInnl?.navn ?? "—") },
    { label: "Kastemetode avsluttande", html: escHtml(stevne.kastemetodeAvsl?.navn ?? "—") },
  ];
}

export function stevneInfoCardHtml(rows: StevneInfoRow[]): string {
  const body = rows
    .map((row) => `<tr><th>${escHtml(row.label)}</th><td>${row.html}</td></tr>`)
    .join("");
  return `
    <div class="card mb-3 org-max-480">
      <div class="card-body">
        <table class="table table-sm mb-0">
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
}
