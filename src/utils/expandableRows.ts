// Three lists let a row open a panel beneath it — a stevne's result cards, the
// season standings, and the live stilling. What they share is only the
// mechanics: one delegated listener per container, Enter and Space reaching the
// rows that are not buttons, and `hidden` kept in step with `aria-expanded`.
// Where they genuinely differ is how a trigger reaches its panel and what else
// has to follow, so those two stay with the caller.

export interface ExpandableRowsOptions {
  /** Selector for what a click or Enter/Space expands from. */
  trigger: string;
  /** The panel that trigger owns, or null when it has none. */
  panel: (trigger: HTMLElement) => HTMLElement | null;
  /** Runs once the panel has flipped, for whatever else the caller keeps in step. */
  onToggle?: (trigger: HTMLElement, open: boolean) => void;
}

function toggle(trigger: HTMLElement, panel: HTMLElement, opts: ExpandableRowsOptions): void {
  const open = Boolean(panel.hidden);
  panel.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
  opts.onToggle?.(trigger, open);
}

function resolve(
  event: Event,
  opts: ExpandableRowsOptions,
): { trigger: HTMLElement; panel: HTMLElement } | null {
  const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>(opts.trigger);
  if (!trigger) return null;
  const panel = opts.panel(trigger);
  return panel ? { trigger, panel } : null;
}

/**
 * Binds one trigger kind on a container. Call it once per kind — the mobile card
 * button and the desktop row are two kinds on the same container.
 */
export function bindExpandableRows(container: HTMLElement, opts: ExpandableRowsOptions): void {
  container.addEventListener("click", (event) => {
    const found = resolve(event, opts);
    if (found) toggle(found.trigger, found.panel, opts);
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const found = resolve(event, opts);
    // A button already turns Enter and Space into a click; acting again would
    // toggle twice and land back where it started.
    if (!found || found.trigger.tagName === "BUTTON") return;
    event.preventDefault();
    toggle(found.trigger, found.panel, opts);
  });
}

/** Makes rows that are not buttons reachable by keyboard. */
export function makeRowsFocusable(container: HTMLElement, selector: string): void {
  container.querySelectorAll<HTMLElement>(selector).forEach((row) => {
    row.setAttribute("tabindex", "0");
    if (!row.hasAttribute("aria-expanded")) row.setAttribute("aria-expanded", "false");
  });
}
