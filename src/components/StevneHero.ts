// The header of a stevne's info tab: name, status, the key facts as tiles and
// the rest as a quiet detail row. An SNC-hovudstevne is still a stevne, so it
// gets the same hero — only the status text and the trailing details differ.
//
// One narrow column at every width — the page is a single stack that a map can
// join later. The action slot (Start stevne / Meld på / Konsolider) sits under
// the tiles; fill it via heroActionSlot() once the html is in the DOM.

import { escHtml } from "@/utils/escHtml";
import { formatDateNumeric, formatTime } from "@/utils/shared";

export interface StevneHeroFact {
  label: string;
  /** Escaped or otherwise trusted HTML. */
  html: string;
}

export type StevneStatusVariant = "ok" | "warn" | "live";

export interface StevneHeroOptions {
  title: string;
  status: { text: string; variant: StevneStatusVariant };
  /** Joined with "·" under the title, e.g. "SNC Singel · Årdalen". */
  subtitle: string[];
  facts: StevneHeroFact[];
  methods: StevneHeroFact[];
  details: StevneHeroFact[];
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
  juryleder?: string | null;
  kastemetodeInnl?: NamedRow | null;
  kastemetodeAvsl?: NamedRow | null;
}

// ── Field derivation ──────────────────────────────────────────────────────────

/** Stevnetype and kategori read as one label: "SNC Singel". */
export function typeAndCategoryLabel(stevne: StevneInfoSource): string {
  return [stevne.stevnetype?.navn, stevne.kategori?.navn].filter(Boolean).join(" ") || "—";
}

export function contactName(stevne: StevneInfoSource): string {
  if (!stevne.kontakt) return "";
  return `${stevne.kontakt.fornavn ?? ""} ${stevne.kontakt.etternavn ?? ""}`.trim();
}

/** "SNC Singel · Årdalen" — the one-line summary under the name. */
export function stevneSubtitle(stevne: StevneInfoSource): string[] {
  return [typeAndCategoryLabel(stevne), stevne.sted ?? ""].filter((part) => part && part !== "—");
}

export function stevneKeyFacts(stevne: StevneInfoSource): StevneHeroFact[] {
  return [
    { label: "Dato", html: stevne.dato ? formatDateNumeric(stevne.dato) : "—" },
    { label: "Tid", html: stevne.tid ? formatTime(stevne.tid) : "—" },
    { label: "Stad", html: escHtml(stevne.sted ?? "—") },
    { label: "Type / kategori", html: escHtml(typeAndCategoryLabel(stevne)) },
  ];
}

export function stevneMethodFacts(stevne: StevneInfoSource): StevneHeroFact[] {
  return [
    { label: "Innleiande", html: escHtml(stevne.kastemetodeInnl?.navn ?? "—") },
    { label: "Avsluttande", html: escHtml(stevne.kastemetodeAvsl?.navn ?? "—") },
  ];
}

/**
 * Arrangør and kontaktperson — the details every stevne carries. Juryleiar joins
 * them when the stevne has one; most do not, so an empty row would be noise.
 */
export function stevneDetails(stevne: StevneInfoSource): StevneHeroFact[] {
  return [
    { label: "Arrangør", html: escHtml(stevne.klubb?.navn ?? "—") },
    { label: "Kontaktperson", html: escHtml(contactName(stevne) || "—") },
    ...(stevne.juryleder ? [{ label: "Juryleiar", html: escHtml(stevne.juryleder) }] : []),
  ];
}

// ── Markup ────────────────────────────────────────────────────────────────────

function tileHtml(fact: StevneHeroFact): string {
  return `
    <div class="stevne-hero__rute">
      <span class="stevne-hero__etikett">${escHtml(fact.label)}</span>
      <span class="stevne-hero__verdi">${fact.html}</span>
    </div>`;
}

function detailHtml(detail: StevneHeroFact): string {
  return `
    <div class="stevne-hero__detalj">
      <dt>${escHtml(detail.label)}</dt>
      <dd>${detail.html}</dd>
    </div>`;
}

export function stevneHeroHtml(options: StevneHeroOptions): string {
  const { title, status, subtitle, facts, methods, details } = options;
  return `
    <section class="stevne-hero">
      <div class="stevne-hero__topp">
        <h2 class="stevne-hero__tittel">${escHtml(title)}</h2>
        <span class="admin-badge admin-badge--${status.variant} stevne-hero__status">${escHtml(status.text)}</span>
        ${subtitle.length ? `<p class="stevne-hero__undertittel">${escHtml(subtitle.join(" · "))}</p>` : ""}
      </div>
      <div class="stevne-hero__handling" id="stevne-hero-handling"></div>
      <div class="stevne-hero__ruter">${facts.map(tileHtml).join("")}</div>
      ${methods.length ? `<div class="stevne-hero__ruter stevne-hero__ruter--brei">${methods.map(tileHtml).join("")}</div>` : ""}
      ${details.length ? `<dl class="stevne-hero__detaljar">${details.map(detailHtml).join("")}</dl>` : ""}
    </section>`;
}

/** The slot the page drops its primary action button into. */
export function heroActionSlot(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>("#stevne-hero-handling")!;
}
