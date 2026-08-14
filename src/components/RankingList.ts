// The season-long standings — Norgescupen and Norgesranking — rendered in the
// same visual language as a stevne's own result list: cards below 700px, one
// table above it, both built from a single column spec so the two cannot drift.
// Where a stevne result spells its detail out in stat boxes, a season standing
// has one row per counting stevne, so the panel here holds a compact table
// instead. The panel markup itself is shared by card and table row.

import { escHtml } from "@/utils/escHtml";

export interface RankingColumn<T> {
  label: string;
  title?: string;
  /** Extra cell classes — `res-tal` centres, `res-tal--dempa` dims. */
  cellClass?: string;
  value: (row: T) => string;
}

export interface RankingListSpec<T> {
  /** Unique per list on the page: the detail panels are addressed by it. */
  idPrefix: string;
  placement: (row: T) => string;
  /** Header over the name column — a team list heads it "KLUBB" instead. */
  nameLabel?: string;
  name: (row: T) => string;
  /** Second line on the card and a column of its own; omit for team lists. */
  club?: (row: T) => string;
  /** Extra line under the club on the card, e.g. how many stevner counted. */
  meta?: (row: T) => string;
  /** Columns between the club and the leading figure. */
  columns?: RankingColumn<T>[];
  /** The figure the list is ranked by — the card leads with it. */
  mainLabel: string;
  main: (row: T) => string;
  /** Detail panel markup, shared by card and table row. */
  detail?: (row: T) => string;
  rowClass?: (row: T) => string | undefined;
}

export interface DetailColumn<D> {
  label: string;
  cellClass?: string;
  value: (row: D) => string;
}

/**
 * The detail panel of a season standing: the stevner that counted, one per line.
 * Scrolls inside its own box so a wide detail never widens the card.
 */
export function detailTableHtml<D>(columns: DetailColumn<D>[], rows: D[]): string {
  if (!rows.length) return "";
  const head = columns
    .map((c) => `<th class="${c.cellClass ?? ""}">${escHtml(c.label)}</th>`)
    .join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td class="${c.cellClass ?? ""}">${escHtml(c.value(r))}</td>`).join("")}</tr>`,
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

interface Col<T> {
  label: string;
  cellClass: string;
  title?: string;
  value: (row: T) => string;
}

function buildColumns<T>(spec: RankingListSpec<T>): Col<T>[] {
  const columns: Col<T>[] = [
    { label: "PL", cellClass: "res-td-pl", value: (r) => `${spec.placement(r)}.` },
    { label: spec.nameLabel ?? "NAMN", cellClass: "res-td-navn", value: spec.name },
  ];
  if (spec.club) columns.push({ label: "KLUBB", cellClass: "res-td-klubb", value: spec.club });
  for (const c of spec.columns ?? []) {
    const col: Col<T> = { label: c.label, cellClass: c.cellClass ?? "res-tal", value: c.value };
    if (c.title != null) col.title = c.title;
    columns.push(col);
  }
  columns.push({
    label: spec.mainLabel,
    cellClass: "res-tal res-td-tot",
    value: spec.main,
  });
  return columns;
}

// ── Desktop table ─────────────────────────────────────────────────────────────

function rowHtml<T>(row: T, i: number, columns: Col<T>[], spec: RankingListSpec<T>): string {
  const detail = spec.detail?.(row) ?? "";
  const panelId = `${spec.idPrefix}-detalj-${i}`;
  const extra = spec.rowClass?.(row);
  const classes = ["rank-rad", i % 2 === 1 ? "rank-rad--stripe" : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");
  const last = columns.length - 1;

  const cells = columns
    .map((c, ci) => {
      const chevron =
        ci === last && detail ? `<span class="rank-pil" aria-hidden="true">▾</span>` : "";
      return `<td class="${c.cellClass}">${escHtml(c.value(row))}${chevron}</td>`;
    })
    .join("");

  const clickAttrs = detail
    ? ` role="button" tabindex="0" aria-expanded="false" aria-controls="${panelId}"`
    : "";
  const tr = `<tr class="${classes}${detail ? " rank-rad--klikk" : ""}"${clickAttrs}>${cells}</tr>`;
  if (!detail) return tr;
  return `${tr}<tr class="rank-detalj-rad" id="${panelId}" hidden><td colspan="${columns.length}">${detail}</td></tr>`;
}

export function rankingTableHtml<T>(rows: T[], spec: RankingListSpec<T>): string {
  const columns = buildColumns(spec);
  const head = columns
    .map(
      (c) =>
        `<th class="${c.cellClass}"${c.title ? ` title="${escHtml(c.title)}"` : ""}>${escHtml(c.label)}</th>`,
    )
    .join("");
  const body = rows.map((r, i) => rowHtml(r, i, columns, spec)).join("");
  return `
    <div class="res-tabell-boks">
      <table class="res-table res-table--gruppert rank-table">
        <thead><tr class="res-thead-columns">${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

// ── Mobile cards ──────────────────────────────────────────────────────────────

function cardHtml<T>(row: T, i: number, spec: RankingListSpec<T>): string {
  const detail = spec.detail?.(row) ?? "";
  const panelId = `${spec.idPrefix}-kort-${i}`;
  const club = spec.club?.(row);
  const meta = spec.meta?.(row);
  const extra = spec.rowClass?.(row);
  return `
    <div class="res-row res-row--detalj${extra ? ` ${extra}` : ""}">
      <span class="res-pl">${escHtml(spec.placement(row))}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(spec.name(row))}</span>
        ${club ? `<span class="res-klubb">${escHtml(club)}</span>` : ""}
        ${meta ? `<span class="res-meta">${escHtml(meta)}</span>` : ""}
        ${
          detail
            ? `<button type="button" class="res-detalj-btn" aria-expanded="false" aria-controls="${panelId}">
                 <span class="res-detalj-tekst">Vis detaljar</span><span class="res-detalj-pil" aria-hidden="true">▾</span>
               </button>`
            : ""
        }
      </div>
      <div class="res-tot">
        <span class="res-tot-label">${escHtml(spec.mainLabel)}</span>
        <span class="res-tot-verdi">${escHtml(spec.main(row))}</span>
      </div>
      ${detail ? `<div class="res-detalj" id="${panelId}" hidden>${detail}</div>` : ""}
    </div>`;
}

/** Cards below the breakpoint, the table above it — both always in the DOM. */
export function rankingListHtml<T>(rows: T[], spec: RankingListSpec<T>): string {
  const cards = rows.map((r, i) => cardHtml(r, i, spec)).join("");
  return `
    <div class="res-mobil-blokk">
      <div class="res-group"><div class="res-group-rows">${cards}</div></div>
    </div>
    <div class="res-desktop-blokk">${rankingTableHtml(rows, spec)}</div>`;
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
  const row = target.closest<HTMLElement>(".rank-rad--klikk");
  if (row) {
    const panel = row.nextElementSibling;
    if (panel instanceof HTMLElement && panel.classList.contains("rank-detalj-rad")) {
      return { trigger: row, panel };
    }
  }
  return null;
}

/** One delegated listener covers both the cards and the table rows. */
export function bindRankingDetails(container: HTMLElement): void {
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
