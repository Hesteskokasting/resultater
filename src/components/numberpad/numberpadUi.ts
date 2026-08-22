import { createEl } from "@/utils/createEl";
import { holdReloads } from "@/utils/coalesceReload";

/**
 * Shared chrome for every score numberpad — the kamp pad (ScoreNumberpad), the
 * per-omgang wizard (XkastKongelagNumberpad) and the total pad (TotalNumberpad). The
 * three flows differ in what they collect and validate; the surface they draw
 * on is identical, so it lives here as `pad-*` parts on one theme-aware card.
 */

export interface NumberpadOverlay {
  overlay: HTMLDivElement;
  /** Removes the overlay and unwinds the history entry pushed on open. */
  close: () => void;
}

/**
 * Fullscreen overlay shell. Opening pushes a history entry so the device back
 * button closes the pad instead of leaving the page. `onClosed` runs however the
 * pad goes away — its own close button or the back button — so a caller can drop
 * listeners it set up for the pad's lifetime.
 *
 * Realtime reloads are held for as long as the pad is open; the view underneath
 * is not visible, and everyone else's writes would otherwise refetch it.
 */
export function createNumberpadOverlay(onClosed?: () => void): NumberpadOverlay {
  const overlay = document.createElement("div");
  overlay.className = "pad-overlay";
  const releaseReloads = holdReloads();

  history.pushState({ numberpad: true }, "");

  function teardown(): void {
    window.removeEventListener("popstate", handleClose);
    // A hash route change leaves no history entry to pop, so without this the
    // pad — and the reload hold it owns — would outlive the page it belongs to.
    window.removeEventListener("hashchange", handleClose);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    releaseReloads();
    onClosed?.();
  }

  function handleClose(): void {
    teardown();
  }

  function close(): void {
    teardown();
    if ((history.state as { numberpad?: boolean } | null)?.numberpad) history.back();
  }

  window.addEventListener("popstate", handleClose);
  window.addEventListener("hashchange", handleClose);
  return { overlay, close };
}

export interface PadShell {
  /** Fills the viewport; nothing is appended to it directly. */
  card: HTMLDivElement;
  /** Scrolling content column — everything above the action bar. */
  body: HTMLDivElement;
  /** Sticky action bar; collapses to nothing when a stage has no action. */
  footer: HTMLDivElement;
}

/**
 * The fullscreen card the pad parts stack in. Content goes in `body` and the
 * primary action in `footer`, so the action stays reachable at the bottom of a
 * tall pad without ever covering the keys.
 */
export function padCard(): PadShell {
  const card = createEl("div", null, "pad-card");
  const body = createEl("div", null, "pad-body");
  const footer = createEl("div", null, "pad-footer");
  card.append(body, footer);
  return { card, body, footer };
}

/**
 * Wraps one column per participant. The kamp pad puts every side side by side
 * on a wide screen; the other pads always pass a single column.
 */
export function padColumns(cols: HTMLElement[]): HTMLElement {
  const wrapper = createEl("div", null, "pad-cols");
  for (const col of cols) wrapper.appendChild(col);
  return wrapper;
}

/** One participant's stack — name, read-out and keys. */
export function padColumn(children: HTMLElement[]): HTMLElement {
  const col = createEl("div", null, "pad-col");
  for (const child of children) col.appendChild(child);
  return col;
}

export interface PadBack {
  label: string;
  onClick: () => void;
}

/**
 * Back left, close right. The back button is always rendered — hidden rather
 * than omitted — so the card keeps its height when a stage has no way back.
 */
export function padTopRow(onClose: () => void, back?: PadBack | null): HTMLElement {
  const row = createEl("div", null, "pad-toprow");

  const backBtn = createEl("button", back?.label ?? "", "pad-back");
  if (back) backBtn.addEventListener("click", back.onClick);
  else {
    backBtn.classList.add("pad-back-skjult");
    backBtn.disabled = true;
    backBtn.setAttribute("aria-hidden", "true");
  }
  row.appendChild(backBtn);

  const closeBtn = createEl("button", "×", "pad-close");
  closeBtn.setAttribute("aria-label", "Lukk");
  closeBtn.addEventListener("click", onClose);
  row.appendChild(closeBtn);

  return row;
}

/** Segmented bar showing how far through a multi-stage entry the pad is. */
export function padProgress(count: number, activeIndex: number): HTMLElement {
  const bar = createEl("div", null, "pad-progress");
  for (let i = 0; i < count; i++) {
    bar.appendChild(createEl("div", null, `pad-progress-seg${i <= activeIndex ? " active" : ""}`));
  }
  return bar;
}

/**
 * Where the entry belongs: bane as a pill, round line beside it. Either half may
 * be left out — a phase without courts, or a court without a round. A trailing
 * figure (e.g. the ring count) is pushed to the right edge of the same line, so
 * it lines up under the total badge instead of taking a line of its own.
 */
export function padMeta(
  baneLabel?: string | null,
  rundeLabel?: string | null,
  trailing?: string | null,
): HTMLElement {
  const row = createEl("div", null, "pad-meta");
  if (baneLabel) row.appendChild(createEl("span", baneLabel, "pad-bane"));
  if (rundeLabel) row.appendChild(createEl("span", rundeLabel, "pad-runde"));
  if (trailing != null) row.appendChild(createEl("div", trailing, "pad-total-sub"));
  return row;
}

/** Small uppercase accent line, e.g. "Bane 1 · Totalsum". */
export function padContext(label: string): HTMLElement {
  return createEl("div", label, "pad-context");
}

/** Player name, optionally with a running figure badged to the right. */
export function padTitle(name: string, trailing?: string | null): HTMLElement {
  const row = createEl("div", null, "pad-title");
  row.appendChild(createEl("h3", name, "pad-name"));
  if (trailing != null) row.appendChild(createEl("div", trailing, "pad-total"));
  return row;
}

export interface PadDisplayOptions {
  /** Dims the value as a placeholder — nothing typed yet. */
  placeholder?: boolean;
}

/** The big read-out box above the keys. */
export function padDisplay(
  label: string,
  value: string,
  opts: PadDisplayOptions = {},
): HTMLDivElement {
  const box = createEl("div", null, "pad-display");
  box.appendChild(createEl("div", label, "pad-display-label"));
  box.appendChild(createEl("div", value, `pad-display-value${opts.placeholder ? " tom" : ""}`));
  return box;
}

export interface PadKey {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Word above the label, for a key whose glyph alone doesn't say what it does. */
  caption?: string;
  /** Live figure between caption and glyph, e.g. the score being confirmed. */
  value?: string;
}

export interface PadGridOptions {
  onDigit: (digit: string) => void;
  /** Wipes the whole figure — one press, back to an empty pad. */
  onClear: () => void;
  /** Bottom-right key — the stage's primary action. Omit to leave the slot empty. */
  action?: PadKey | null;
}

/**
 * Press feedback for the score keys, shared by every pad. The key marks itself
 * on pointerdown — before the pad repaints on the click that follows — and taps
 * the device where the platform supports it, so a touch that lands is felt as
 * well as seen. Ring keys are left out: picking one already shows as selected.
 */
function bindPressFeedback(btn: HTMLButtonElement): void {
  btn.classList.add("pad-key-press");
  const release = (): void => btn.classList.remove("is-pressed");
  btn.addEventListener("pointerdown", () => {
    btn.classList.add("is-pressed");
    if (typeof navigator.vibrate === "function") navigator.vibrate(12);
  });
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
}

/** 1–9, clear, 0 and the stage action in the bottom-right thumb position. */
export function padDigitGrid(opts: PadGridOptions): HTMLElement {
  const grid = createEl("div", null, "pad-grid");

  for (let digit = 1; digit <= 9; digit++) {
    const btn = createEl("button", String(digit), "pad-key");
    btn.addEventListener("click", () => opts.onDigit(String(digit)));
    bindPressFeedback(btn);
    grid.appendChild(btn);
  }

  const clear = createEl("button", "⌫", "pad-key pad-key-muted");
  clear.setAttribute("aria-label", "Slett heile talet");
  clear.addEventListener("click", opts.onClear);
  bindPressFeedback(clear);
  grid.appendChild(clear);

  const zero = createEl("button", "0", "pad-key");
  zero.addEventListener("click", () => opts.onDigit("0"));
  bindPressFeedback(zero);
  grid.appendChild(zero);

  if (opts.action) grid.appendChild(padKeyEl(opts.action, "pad-key pad-key-action"));
  else grid.appendChild(createEl("div", null, "pad-key-tom"));

  return grid;
}

/** A single key outside the digit grid, drawn exactly like the digits. */
export function padKey(key: PadKey, extraClass?: string): HTMLButtonElement {
  return padKeyEl(key, extraClass ? `pad-key ${extraClass}` : "pad-key");
}

/** Full-width primary button below the keys. */
export function padRegister(key: PadKey): HTMLButtonElement {
  return padKeyEl(key, "pad-register");
}

function padKeyEl(key: PadKey, className: string): HTMLButtonElement {
  const btn = createEl("button", key.caption ? null : key.label, className);
  if (key.caption) {
    btn.classList.add("pad-key-stacked");
    btn.appendChild(createEl("span", key.caption, "pad-key-caption"));
    if (key.value) btn.appendChild(createEl("span", key.value, "pad-key-value"));
    btn.appendChild(createEl("span", key.label, "pad-key-glyph"));
    btn.setAttribute("aria-label", key.value ? `${key.caption} ${key.value}` : key.caption);
  }
  btn.disabled = key.disabled === true;
  btn.addEventListener("click", key.onClick);
  return btn;
}
