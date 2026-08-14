// The season-long standings — Norgescupen and Norgesranking — rendered in the
// same visual language as a stevne's own result list: cards below 700px, one
// table above it, both built from a single column spec so the two cannot drift.
// Where a stevne result spells its detail out in stat boxes, a season standing
// has one row per counting stevne, so the panel here holds a compact table
// instead. The panel markup itself is shared by card and table row.

import { escHtml } from "@/utils/escHtml";

export interface RankingKolonne<T> {
  label: string;
  title?: string;
  /** Extra cell classes — `res-tal` centres, `res-tal--dempa` dims. */
  klasse?: string;
  verdi: (row: T) => string;
}

export interface RankingListeSpec<T> {
  /** Unique per list on the page: the detail panels are addressed by it. */
  idPrefix: string;
  pl: (row: T) => string;
  /** Header over the name column — a team list heads it "KLUBB" instead. */
  namnLabel?: string;
  namn: (row: T) => string;
  /** Second line on the card and a column of its own; omit for team lists. */
  klubb?: (row: T) => string;
  /** Extra line under the club on the card, e.g. how many stevner counted. */
  meta?: (row: T) => string;
  /** Columns between the club and the leading figure. */
  kolonnar?: RankingKolonne<T>[];
  /** The figure the list is ranked by — the card leads with it. */
  hovudLabel: string;
  hovud: (row: T) => string;
  /** Detail panel markup, shared by card and table row. */
  detalj?: (row: T) => string;
  radKlasse?: (row: T) => string | undefined;
}

export interface DetaljKolonne<D> {
  label: string;
  klasse?: string;
  verdi: (row: D) => string;
}

/**
 * The detail panel of a season standing: the stevner that counted, one per line.
 * Scrolls inside its own box so a wide detail never widens the card.
 */
export function detaljTabellHtml<D>(kolonnar: DetaljKolonne<D>[], rader: D[]): string {
  if (!rader.length) return "";
  const head = kolonnar
    .map((k) => `<th class="${k.klasse ?? ""}">${escHtml(k.label)}</th>`)
    .join("");
  const body = rader
    .map(
      (r) =>
        `<tr>${kolonnar.map((k) => `<td class="${k.klasse ?? ""}">${escHtml(k.verdi(r))}</td>`).join("")}</tr>`,
    )
    .join("");
  return `
    <div class="rank-detalj-boks">
      <table class="rank-detalj-tabell">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

// ── Column spec ───────────────────────────────────────────────────────────────

interface Kol<T> {
  label: string;
  klasse: string;
  title?: string;
  verdi: (row: T) => string;
}

function byggKolonnar<T>(spec: RankingListeSpec<T>): Kol<T>[] {
  const kolonnar: Kol<T>[] = [
    { label: "PL", klasse: "res-td-pl", verdi: (r) => `${spec.pl(r)}.` },
    { label: spec.namnLabel ?? "NAMN", klasse: "res-td-navn", verdi: spec.namn },
  ];
  if (spec.klubb) kolonnar.push({ label: "KLUBB", klasse: "res-td-klubb", verdi: spec.klubb });
  for (const k of spec.kolonnar ?? []) {
    const kol: Kol<T> = { label: k.label, klasse: k.klasse ?? "res-tal", verdi: k.verdi };
    if (k.title != null) kol.title = k.title;
    kolonnar.push(kol);
  }
  kolonnar.push({
    label: spec.hovudLabel,
    klasse: "res-tal res-td-tot",
    verdi: spec.hovud,
  });
  return kolonnar;
}

// ── Desktop table ─────────────────────────────────────────────────────────────

function radHtml<T>(row: T, i: number, kolonnar: Kol<T>[], spec: RankingListeSpec<T>): string {
  const detaljar = spec.detalj?.(row) ?? "";
  const panelId = `${spec.idPrefix}-detalj-${i}`;
  const ekstra = spec.radKlasse?.(row);
  const klasser = ["rank-rad", i % 2 === 1 ? "rank-rad--stripe" : "", ekstra ?? ""]
    .filter(Boolean)
    .join(" ");
  const siste = kolonnar.length - 1;

  const celler = kolonnar
    .map((k, ki) => {
      const pil =
        ki === siste && detaljar ? `<span class="rank-pil" aria-hidden="true">▾</span>` : "";
      return `<td class="${k.klasse}">${escHtml(k.verdi(row))}${pil}</td>`;
    })
    .join("");

  const klikk = detaljar
    ? ` role="button" tabindex="0" aria-expanded="false" aria-controls="${panelId}"`
    : "";
  const rad = `<tr class="${klasser}${detaljar ? " rank-rad--klikk" : ""}"${klikk}>${celler}</tr>`;
  if (!detaljar) return rad;
  return `${rad}<tr class="rank-detalj-rad" id="${panelId}" hidden><td colspan="${kolonnar.length}">${detaljar}</td></tr>`;
}

export function rankingTabellHtml<T>(rows: T[], spec: RankingListeSpec<T>): string {
  const kolonnar = byggKolonnar(spec);
  const head = kolonnar
    .map(
      (k) =>
        `<th class="${k.klasse}"${k.title ? ` title="${escHtml(k.title)}"` : ""}>${escHtml(k.label)}</th>`,
    )
    .join("");
  const body = rows.map((r, i) => radHtml(r, i, kolonnar, spec)).join("");
  return `
    <div class="res-tabell-boks">
      <table class="res-table res-table--gruppert rank-table">
        <thead><tr class="res-thead-columns">${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

// ── Mobile cards ──────────────────────────────────────────────────────────────

function kortHtml<T>(row: T, i: number, spec: RankingListeSpec<T>): string {
  const detaljar = spec.detalj?.(row) ?? "";
  const panelId = `${spec.idPrefix}-kort-${i}`;
  const klubb = spec.klubb?.(row);
  const meta = spec.meta?.(row);
  const ekstra = spec.radKlasse?.(row);
  return `
    <div class="res-row res-row--detalj${ekstra ? ` ${ekstra}` : ""}">
      <span class="res-pl">${escHtml(spec.pl(row))}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(spec.namn(row))}</span>
        ${klubb ? `<span class="res-klubb">${escHtml(klubb)}</span>` : ""}
        ${meta ? `<span class="res-meta">${escHtml(meta)}</span>` : ""}
        ${
          detaljar
            ? `<button type="button" class="res-detalj-btn" aria-expanded="false" aria-controls="${panelId}">
                 <span class="res-detalj-tekst">Vis detaljar</span><span class="res-detalj-pil" aria-hidden="true">▾</span>
               </button>`
            : ""
        }
      </div>
      <div class="res-tot">
        <span class="res-tot-label">${escHtml(spec.hovudLabel)}</span>
        <span class="res-tot-verdi">${escHtml(spec.hovud(row))}</span>
      </div>
      ${detaljar ? `<div class="res-detalj" id="${panelId}" hidden>${detaljar}</div>` : ""}
    </div>`;
}

/** Cards below the breakpoint, the table above it — both always in the DOM. */
export function rankingListeHtml<T>(rows: T[], spec: RankingListeSpec<T>): string {
  const kort = rows.map((r, i) => kortHtml(r, i, spec)).join("");
  return `
    <div class="res-mobil-blokk">
      <div class="res-group"><div class="res-group-rows">${kort}</div></div>
    </div>
    <div class="res-desktop-blokk">${rankingTabellHtml(rows, spec)}</div>`;
}

// ── Toggling ──────────────────────────────────────────────────────────────────

function toggle(trigger: HTMLElement, panel: HTMLElement): void {
  const open = Boolean(panel.hidden);
  panel.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
  trigger.classList.toggle("rank-rad--open", open);
  const text = trigger.querySelector(".res-detalj-tekst");
  if (text) text.textContent = open ? "Skjul detaljar" : "Vis detaljar";
  const arrow = trigger.querySelector(".res-detalj-pil, .rank-pil");
  if (arrow) arrow.textContent = open ? "▴" : "▾";
}

function panelFor(target: HTMLElement): { trigger: HTMLElement; panel: HTMLElement } | null {
  const btn = target.closest<HTMLElement>(".res-detalj-btn");
  if (btn) {
    const panel = btn.closest(".res-row")?.querySelector<HTMLElement>(".res-detalj");
    return panel ? { trigger: btn, panel } : null;
  }
  const rad = target.closest<HTMLElement>(".rank-rad--klikk");
  if (rad) {
    const panel = rad.nextElementSibling;
    if (panel instanceof HTMLElement && panel.classList.contains("rank-detalj-rad")) {
      return { trigger: rad, panel };
    }
  }
  return null;
}

/** One delegated listener covers both the cards and the table rows. */
export function bindRankingDetaljar(container: HTMLElement): void {
  container.addEventListener("click", (event) => {
    const found = panelFor(event.target as HTMLElement);
    if (found) toggle(found.trigger, found.panel);
  });
  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const found = panelFor(event.target as HTMLElement);
    if (!found || found.trigger.tagName === "BUTTON") return;
    event.preventDefault();
    toggle(found.trigger, found.panel);
  });
}
