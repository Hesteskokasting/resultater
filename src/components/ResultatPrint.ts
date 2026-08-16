// Screen-hidden, print-only blocks: the title and the stevneinfo a printed sheet
// or a PDF needs to stand on its own, without the app chrome around it. Both the
// consolidated SNC list and an ordinary stevne's result build theirs from here.

import { escHtml } from "@/utils/escHtml";
import { formatDateNumeric, formatTime } from "@/utils/shared";

export type Fakta = [label: string, value: string | number | null];

interface NamedRow {
  navn?: string | null;
}

/** What an ordinary stevne's print header needs of its own row. */
export interface PrintStevne {
  navn: string;
  dato?: string | null;
  tid?: string | null;
  sted?: string | null;
  juryleder?: string | null;
  klubb?: NamedRow | null;
  stevnetype?: NamedRow | null;
  kategori?: NamedRow | null;
  kontakt?: { fornavn?: string | null; etternavn?: string | null } | null;
  innledende?: NamedRow | null;
  avsluttende?: NamedRow | null;
}

function fullName(person: { fornavn?: string | null; etternavn?: string | null } | null): string {
  if (!person) return "";
  return `${person.fornavn ?? ""} ${person.etternavn ?? ""}`.trim();
}

function printFactsHtml(facts: Fakta[]): string {
  const pairs = facts
    .map(
      ([label, value]) => `
        <div class="res-print-fakta__par">
          <dt>${escHtml(label)}</dt>
          <dd>${escHtml(String(value ?? "—") || "—")}</dd>
        </div>`,
    )
    .join("");
  return `<dl class="res-print-fakta">${pairs}</dl>`;
}

/** The sheet's own heading: what was thrown, and the facts about it. */
export function printHeaderHtml(tittel: string, facts: Fakta[]): string {
  return `
    <div class="res-print-blokk">
      <h1 class="res-print-tittel">${escHtml(tittel)}</h1>
      ${printFactsHtml(facts)}
    </div>`;
}

/** A block below the main list — one local stevne, or any other named section. */
export function printSeksjonHtml(tittel: string, facts: Fakta[], innhald: string): string {
  return `
    <div class="res-print-blokk res-print-lokal">
      <h2 class="res-print-undertittel">${escHtml(tittel)}</h2>
      ${printFactsHtml(facts)}
      ${innhald}
    </div>`;
}

/**
 * An ordinary stevne's facts, in the order the printed sheet shows them. The
 * screen has all of this on the info tab, so paper is the only place it is worth
 * repeating.
 */
export function stevneInfoFacts(stevne: PrintStevne, deltakarar: number): Fakta[] {
  const facts: Fakta[] = [
    ["Arrangør", stevne.klubb?.navn ?? ""],
    ["Dato", formatDateNumeric(stevne.dato)],
    ["Tid", formatTime(stevne.tid)],
    ["Stad", stevne.sted ?? ""],
    ["Type / kategori", [stevne.stevnetype?.navn, stevne.kategori?.navn].filter(Boolean).join(" ")],
    ["Kontaktperson", fullName(stevne.kontakt ?? null)],
  ];
  // Paper keeps the juryleiar even though the screen moved it to the info tab: a
  // printed result is the official document, and that is where the name belongs.
  if (stevne.juryleder) facts.push(["Juryleiar", stevne.juryleder]);
  if (stevne.innledende?.navn) facts.push(["Innleiande", stevne.innledende.navn]);
  if (stevne.avsluttende?.navn) facts.push(["Avsluttande", stevne.avsluttende.navn]);
  facts.push(["Deltakarar", deltakarar]);
  return facts;
}
