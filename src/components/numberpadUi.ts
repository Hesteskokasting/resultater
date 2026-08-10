import { createEl } from "@/utils/createEl";

/**
 * Shared chrome for every score numberpad — the kamp pad (ScoreNumberpad), the
 * per-omgang wizard (OmgangNumberpad) and the total pad (TotalNumberpad). The
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
 */
export function createNumberpadOverlay(onClosed?: () => void): NumberpadOverlay {
  const overlay = document.createElement("div");
  overlay.className = "pad-overlay";

  history.pushState({ numberpad: true }, "");

  function teardown(): void {
    window.removeEventListener("popstate", handlePopState);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    onClosed?.();
  }

  function handlePopState(): void {
    teardown();
  }

  function close(): void {
    teardown();
    if ((history.state as { numberpad?: boolean } | null)?.numberpad) history.back();
  }

  window.addEventListener("popstate", handlePopState);
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
}

export interface PadGridOptions {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  /** Bottom-right key — the stage's primary action. Omit to leave the slot empty. */
  action?: PadKey | null;
}

/** 1–9, backspace, 0 and the stage action in the bottom-right thumb position. */
export function padDigitGrid(opts: PadGridOptions): HTMLElement {
  const grid = createEl("div", null, "pad-grid");

  for (let digit = 1; digit <= 9; digit++) {
    const btn = createEl("button", String(digit), "pad-key");
    btn.addEventListener("click", () => opts.onDigit(String(digit)));
    grid.appendChild(btn);
  }

  const back = createEl("button", "⌫", "pad-key pad-key-muted");
  back.setAttribute("aria-label", "Slett siste siffer");
  back.addEventListener("click", opts.onBackspace);
  grid.appendChild(back);

  const zero = createEl("button", "0", "pad-key");
  zero.addEventListener("click", () => opts.onDigit("0"));
  grid.appendChild(zero);

  if (opts.action) grid.appendChild(padKeyEl(opts.action, "pad-key pad-key-action"));
  else grid.appendChild(createEl("div", null, "pad-key-tom"));

  return grid;
}

/** Full-width primary button below the keys. */
export function padRegister(key: PadKey): HTMLButtonElement {
  return padKeyEl(key, "pad-register");
}

function padKeyEl(key: PadKey, className: string): HTMLButtonElement {
  const btn = createEl("button", key.label, className);
  btn.disabled = key.disabled === true;
  btn.addEventListener("click", key.onClick);
  return btn;
}
