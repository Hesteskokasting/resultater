import { createEl } from "@/utils/createEl";
import { createEmptyState } from "@/components/EmptyState";
import { seriesColor } from "./_adminCharts";
import type { LabelCount } from "@/utils/adminStats";

/**
 * Shared building blocks for the admin page. Everything here is built with DOM
 * APIs rather than innerHTML: the admin page renders user-supplied names, emails
 * and club names, and this way none of it can be interpreted as markup.
 */

export type BadgeTone = "ok" | "warn" | "danger" | "muted" | "live";

export interface AdminBadge {
  text: string;
  tone?: BadgeTone;
}

export interface AdminAction {
  label: string;
  /** Renders an <a>; mutually exclusive with `onClick`, which renders a <button>. */
  href?: string;
  /** Gets its own button back, so handlers can show progress on it without a lookup. */
  onClick?: (button: HTMLButtonElement) => void;
  /** Bootstrap button suffix, e.g. "outline-secondary" (default) or "primary". */
  variant?: string;
  title?: string;
}

export interface AdminListItem {
  title: string;
  /** Secondary line, joined with middots. Empty entries are dropped. */
  meta?: (string | null | undefined)[];
  badges?: AdminBadge[];
  /** Small stacked block on the left, e.g. weekday over day-of-month. */
  lead?: { top: string; bottom: string };
  actions?: AdminAction[];
  /** Extra control (e.g. a role <select>) placed before the actions. */
  control?: HTMLElement;
  /** Colour of the row's left stripe; omit for the neutral default. */
  stripe?: BadgeTone;
}

export interface StatTile {
  label: string;
  value: number | string;
  sub?: string;
  /** Makes the whole tile a link (used to jump into the matching tab). */
  href?: string;
  /** Highlights the tile — used for "needs attention" figures. */
  tone?: "warn" | "live";
}

export interface QuickAction {
  label: string;
  /** Renders an <a>; mutually exclusive with `onClick`, which renders a <button>. */
  href?: string;
  onClick?: () => void;
  /** Single glyph shown before the label. */
  icon: string;
  variant?: "primary" | "plain";
}

// ── Headings ─────────────────────────────────────────────────────────────────

export function createSectionTitle(text: string): HTMLElement {
  return createEl("h3", text, "admin-section-title");
}

// ── Badges ───────────────────────────────────────────────────────────────────

export function createBadge({ text, tone = "muted" }: AdminBadge): HTMLElement {
  return createEl("span", text, `admin-badge admin-badge--${tone}`);
}

// ── Stat tiles ───────────────────────────────────────────────────────────────

export function createStatTile(tile: StatTile): HTMLElement {
  const cls = `admin-stat${tile.tone ? ` admin-stat--${tile.tone}` : ""}`;
  const el = tile.href ? createEl("a", null, cls) : createEl("div", null, cls);
  if (tile.href && el instanceof HTMLAnchorElement) el.href = tile.href;

  el.appendChild(createEl("span", tile.label, "admin-stat__label"));
  el.appendChild(createEl("span", String(tile.value), "admin-stat__value"));
  if (tile.sub) el.appendChild(createEl("span", tile.sub, "admin-stat__sub"));
  return el;
}

export function createStatGrid(tiles: StatTile[], compact = false): HTMLElement {
  const grid = createEl("div", null, `admin-stats${compact ? " admin-stats--compact" : ""}`);
  tiles.forEach((t) => grid.appendChild(createStatTile(t)));
  return grid;
}

/** Same footprint as the real tiles, so the grid doesn't jump when data lands. */
export function createStatGridSkeleton(count: number): HTMLElement {
  const grid = createEl("div", null, "admin-stats");
  for (let i = 0; i < count; i++) {
    grid.appendChild(createEl("div", null, "admin-stat admin-stat--skeleton"));
  }
  return grid;
}

// ── Chart cards ──────────────────────────────────────────────────────────────

export interface ChartCard {
  card: HTMLElement;
  canvas: HTMLCanvasElement;
  legend: HTMLElement;
  /** Replaces the canvas with a message when there is nothing to plot. */
  showEmpty: (message: string) => void;
}

export function createChartCard(title: string, subtitle?: string): ChartCard {
  const card = createEl("section", null, "admin-chart");
  card.appendChild(createEl("h4", title, "admin-chart__title"));
  if (subtitle) card.appendChild(createEl("p", subtitle, "admin-chart__subtitle"));

  const wrap = createEl("div", null, "admin-chart__canvas");
  const canvas = createEl("canvas", null);
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", title);
  wrap.appendChild(canvas);
  card.appendChild(wrap);

  const legend = createEl("div", null, "admin-legend");
  card.appendChild(legend);

  return {
    card,
    canvas,
    legend,
    showEmpty: (message: string) => {
      wrap.replaceChildren(createEmptyState(message));
      legend.replaceChildren();
    },
  };
}

export function createChartGrid(cards: ChartCard[]): HTMLElement {
  const grid = createEl("div", null, "admin-charts");
  cards.forEach((c) => grid.appendChild(c.card));
  return grid;
}

/**
 * Legend doubling as the value table: swatch, label, count and share. Share-bar
 * fills sit below 3:1 against the light surface, so these labels — not the
 * colours — are what carry the numbers.
 */
export function fillShareLegend(
  legend: HTMLElement,
  data: LabelCount[],
  host: Element,
  labelOf: (label: string) => string = (l) => l,
): void {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  legend.replaceChildren();

  data.forEach((entry, i) => {
    const item = createEl("div", null, "admin-legend__item");
    const swatch = createEl("span", null, "admin-legend__swatch");
    swatch.style.background = seriesColor(host, i + 1);
    item.appendChild(swatch);
    item.appendChild(createEl("span", labelOf(entry.label), "admin-legend__label"));
    item.appendChild(createEl("span", String(entry.count), "admin-legend__value"));
    const share = total ? Math.round((entry.count / total) * 100) : 0;
    item.appendChild(createEl("span", `${share} %`, "admin-legend__share"));
    legend.appendChild(item);
  });
}

// ── Quick actions ────────────────────────────────────────────────────────────

export function createQuickActions(actions: QuickAction[]): HTMLElement {
  const wrap = createEl("div", null, "admin-actions");
  for (const action of actions) {
    const cls = `admin-action${action.variant === "primary" ? " admin-action--primary" : ""}`;
    // Create actions open the overlay (a button); navigation actions are links.
    const el = action.href ? createEl("a", null, cls) : createEl("button", null, cls);
    if (el instanceof HTMLAnchorElement) {
      el.href = action.href!;
    } else if (el instanceof HTMLButtonElement) {
      el.type = "button";
      el.addEventListener("click", () => action.onClick?.());
    }
    const icon = createEl("span", action.icon, "admin-action__icon");
    icon.setAttribute("aria-hidden", "true");
    el.appendChild(icon);
    el.appendChild(createEl("span", action.label, "admin-action__label"));
    wrap.appendChild(el);
  }
  return wrap;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

/** Filter row above a list: search input, selects, and a trailing action slot. */
export function createToolbar(children: (HTMLElement | null)[]): HTMLElement {
  const bar = createEl("div", null, "admin-toolbar");
  children.forEach((c) => {
    if (c) bar.appendChild(c);
  });
  return bar;
}

export function createLabelledSelect(
  label: string,
  options: { value: string; text: string }[],
  selected: string,
): HTMLSelectElement {
  const select = createEl("select", null, "tl-select admin-select");
  select.setAttribute("aria-label", label);
  for (const opt of options) {
    const optionEl = createEl("option", opt.text);
    optionEl.value = opt.value;
    if (opt.value === selected) optionEl.selected = true;
    select.appendChild(optionEl);
  }
  return select;
}

// ── Rows ─────────────────────────────────────────────────────────────────────

function createActionEl(action: AdminAction): HTMLElement {
  const cls = `btn btn-sm btn-${action.variant ?? "outline-secondary"}`;
  if (action.href) {
    const link = createEl("a", action.label, cls);
    link.href = action.href;
    if (action.title) link.title = action.title;
    return link;
  }
  const button = createEl("button", action.label, cls);
  button.type = "button";
  if (action.title) button.title = action.title;
  button.addEventListener("click", () => action.onClick?.(button));
  return button;
}

export function createAdminRow(item: AdminListItem): HTMLElement {
  const row = createEl("div", null, "admin-row");
  if (item.stripe) row.classList.add(`admin-row--${item.stripe}`);

  if (item.lead) {
    const lead = createEl("div", null, "admin-row__lead");
    lead.appendChild(createEl("span", item.lead.top, "admin-row__lead-top"));
    lead.appendChild(createEl("span", item.lead.bottom, "admin-row__lead-bottom"));
    row.appendChild(lead);
  }

  const main = createEl("div", null, "admin-row__main");
  const titleRow = createEl("div", null, "admin-row__title-row");
  titleRow.appendChild(createEl("span", item.title, "admin-row__title"));
  (item.badges ?? []).forEach((b) => titleRow.appendChild(createBadge(b)));
  main.appendChild(titleRow);

  const meta = (item.meta ?? []).filter((m): m is string => Boolean(m && m.trim()));
  if (meta.length) main.appendChild(createEl("span", meta.join(" · "), "admin-row__meta"));
  row.appendChild(main);

  if (item.control) {
    const slot = createEl("div", null, "admin-row__control");
    slot.appendChild(item.control);
    row.appendChild(slot);
  }

  if (item.actions?.length) {
    const actions = createEl("div", null, "admin-row__actions");
    item.actions.forEach((a) => actions.appendChild(createActionEl(a)));
    row.appendChild(actions);
  }

  return row;
}

export function createAdminList(items: AdminListItem[]): HTMLElement {
  const list = createEl("div", null, "admin-list");
  items.forEach((item) => list.appendChild(createAdminRow(item)));
  return list;
}

// ── Inline feedback ──────────────────────────────────────────────────────────

/**
 * A hidden alert placed at the top of a panel. Panels keep a reference and call
 * `show`/`hide` instead of replacing their own markup on every failed write.
 */
export interface InlineAlert {
  el: HTMLElement;
  show: (message: string) => void;
  hide: () => void;
}

export function createInlineAlert(variant: "danger" | "success" = "danger"): InlineAlert {
  const el = createEl("div", null, `alert alert-${variant} d-none`);
  el.setAttribute("role", "alert");
  return {
    el,
    show: (message: string) => {
      el.textContent = message;
      el.classList.remove("d-none");
    },
    hide: () => {
      el.classList.add("d-none");
    },
  };
}

/** Flashes a "✓" on a button for a moment after a successful save. */
export function flashSaved(button: HTMLButtonElement, restore = button.textContent ?? ""): void {
  button.textContent = "✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = restore;
    button.disabled = false;
  }, 1500);
}
