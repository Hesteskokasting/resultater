import { createEl } from "@/utils/createEl";
import { confirmDialog } from "@/components/ConfirmDialog";

/**
 * The DOM both scoreboards are built from: the player panel, the point keys,
 * and the two actions under them. Stateless — the boards own the selection and
 * hand it in on every draw.
 */

export interface PlayerPanel {
  label: string;
  /** Par/Mix labels hold two names and get smaller type. */
  isPairLabel: boolean;
  isStarter: boolean;
  total: number;
  /** Line under the score: ring stats in a duel, placement in a three-way. */
  detail?: HTMLElement | null;
  /** Three-player board only: the panel of a side that is already placed. */
  hasFinished?: boolean;
  buttons?: HTMLElement | null;
}

export function playerPanelEl(panel: PlayerPanel): HTMLElement {
  const el = createEl(
    "div",
    null,
    `sb-spelar-panel${panel.hasFinished ? " sb-spelar-panel--vann" : ""}`,
  );

  let navnClass = panel.isPairLabel ? "sb-spelar-navn sb-spelar-navn--par" : "sb-spelar-navn";
  if (panel.isStarter) navnClass += " sb-spelar-navn--starter";
  el.appendChild(createEl("div", panel.label, navnClass));
  el.appendChild(createEl("div", String(panel.total), "sb-score"));

  if (panel.detail) el.appendChild(panel.detail);
  if (panel.buttons) el.appendChild(panel.buttons);
  return el;
}

export function ringInfoEl(ringer: number, maxRinger: number): HTMLElement {
  const pct = maxRinger > 0 ? Math.round((ringer / maxRinger) * 100) : 0;
  return createEl("p", `Ring: ${ringer} av ${maxRinger} ( ${pct}% )`, "sb-ringer-info");
}

export function placeBadgeEl(place: number): HTMLElement {
  return createEl("div", `${place}. plass`, "sb-plass-badge");
}

/** Keys for one side. `index` is the side, read back by bindPointButtons. */
export function pointButtonsEl(opts: {
  values: number[];
  index: number;
  selected: number | null;
  locked?: Set<number> | undefined;
}): HTMLElement {
  const knappar = createEl("div", null, "sb-knappar");
  for (const n of opts.values) {
    const btn = createEl("button", String(n), "sb-poeng-btn");
    btn.dataset.side = String(opts.index);
    btn.dataset.value = String(n);
    if (opts.locked?.has(n)) btn.disabled = true;
    if (opts.selected === n) btn.classList.add("sb-valgt");
    knappar.appendChild(btn);
  }
  return knappar;
}

/** Bound after every draw — the board redraws itself on each pick. */
export function bindPointButtons(
  container: HTMLElement,
  onPick: (index: number, value: number) => void,
): void {
  container.querySelectorAll<HTMLButtonElement>("[data-side]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onPick(parseInt(btn.dataset.side ?? "0"), parseInt(btn.dataset.value ?? "0"));
    });
  });
}

export function asyncButton(
  label: string,
  klasse: string,
  onClick: () => Promise<void>,
  busyLabel = "Lagrer…",
): HTMLButtonElement {
  const btn = createEl("button", label, klasse);
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = busyLabel;
    try {
      await onClick();
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
  return btn;
}

export function nextButtonEl(disabled: boolean, onClick: () => Promise<void>): HTMLButtonElement {
  const btn = asyncButton("Neste omgang", "sb-neste-btn", onClick);
  btn.disabled = disabled;
  return btn;
}

export function confirmButtonEl(onBekreft: () => Promise<void>): HTMLButtonElement {
  return asyncButton("Bekreft kamp", "sb-neste-btn sb-neste-btn--bekreft", onBekreft);
}

/**
 * Deletes the last omgang after a confirm, so the board falls back to entering
 * it from scratch. It replaced an in-place edit mode: scorers reported not
 * understanding that they had to unselect the wrong score before picking the
 * right one, and re-throwing the round is the motion they already know.
 */
export function undoRowEl(hasOmgangar: boolean, onUndo: () => Promise<void>): HTMLElement {
  const rad = createEl("div", null, "sb-angre-rad");
  const btn = asyncButton("↩ Angre siste omgang", "sb-angre-btn", onUndo, "Angrer…");
  btn.title = "Slett siste omgang og legg den inn på nytt";
  btn.disabled = !hasOmgangar;
  rad.appendChild(btn);
  return rad;
}

/** Names the round and the scores being discarded — the numbers are the check, not the word "siste". */
export function confirmUndo(omgang: number, scorar: number[]): Promise<boolean> {
  return confirmDialog({
    title: `Angre omgang ${omgang}?`,
    message: `Omgang ${omgang} (${scorar.join(" – ")}) blir sletta. Du legg den inn på nytt etterpå.`,
    confirmText: "Angre omgangen",
    danger: true,
  });
}

export function setOmgangTitle(
  el: HTMLElement | null,
  state: { confirmed: boolean; finished: boolean; next: number },
): void {
  if (!el) return;
  el.textContent = state.confirmed
    ? "Fullført"
    : state.finished
      ? "Ferdig"
      : `Omgang ${state.next}`;
}
