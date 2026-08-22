import {
  createNumberpadOverlay,
  padCard,
  padColumn,
  padColumns,
  padDigitGrid,
  padDisplay,
  padMeta,
  padProgress,
  padRegister,
  padTitle,
  padTopRow,
} from "@/components/numberpad/numberpadUi";
import { appendDigit, digitValue } from "@/utils/padInput";

/** Highest flat score the pad accepts — three digits is well past any real kamp. */
const MAX_SCORE = 999;

/** Below 750px the sides are entered one at a time; from 750px they sit side by side. */
const STEPWISE_MAX_WIDTH = "(max-width: 749px)";

export interface NumberpadEntry {
  /** Display name shown above the pad. */
  name: string;
  /** Prefilled score. */
  score: number;
}

/** Where the kamp sits — same header line the X-kast pad shows. */
export interface NumberpadContext {
  /** Pill above the pads, e.g. "Bane 3". */
  baneLabel?: string;
  /** Round line beside the pill, e.g. "Runde 2" or "Semifinale". */
  rundeLabel?: string;
}

/**
 * Numberpad for direct score entry. Supports any number of participants (kamp
 * uses 2 sides, X-kast courts have 1–3 players). Mobile shows one participant
 * at a time (the footer advances, Lagre on the last); wider screens show every
 * pad side by side with a single Lagre below. `onSave` returns false to keep
 * the pad open — a failed write must not take the typed scores with it.
 */
export function showNumberpad(
  entries: NumberpadEntry[],
  onSave: (scores: number[]) => Promise<boolean>,
  context: NumberpadContext = {},
): void {
  if (entries.length === 0) return;

  /** Typed score per entry as a string so "" (untouched) stays distinguishable. */
  const inputs = entries.map((e) => (e.score !== 0 ? String(e.score) : ""));
  let step = 0;
  let isSaving = false;

  // Rotating a phone or resizing a window crosses the layout threshold with the
  // pad open, so the layout follows it instead of waiting for the next open.
  const stepwiseQuery = window.matchMedia(STEPWISE_MAX_WIDTH);
  const onViewportChange = (): void => render();

  const { overlay, close } = createNumberpadOverlay(() =>
    stepwiseQuery.removeEventListener("change", onViewportChange),
  );
  stepwiseQuery.addEventListener("change", onViewportChange);

  const valueOf = (idx: number): number => digitValue(inputs[idx] ?? "");

  function edit(idx: number, next: string): void {
    inputs[idx] = next;
    render();
  }

  async function save(): Promise<void> {
    if (isSaving) return;
    isSaving = true;
    render();
    const saved = await onSave(entries.map((_, idx) => valueOf(idx)));
    if (saved) close();
    else {
      isSaving = false;
      render();
    }
  }

  /** One entry's name, read-out and keys — the same stack as the X-kast pad. */
  function columnEl(idx: number): HTMLElement {
    // The handlers read `inputs` when clicked, not when built, so a key that
    // outlives its render still edits the current value.
    return padColumn([
      padTitle(entries[idx]?.name ?? ""),
      padDisplay("Poengsum", String(valueOf(idx)), { placeholder: inputs[idx] === "" }),
      padDigitGrid({
        onDigit: (digit) => edit(idx, appendDigit(inputs[idx] ?? "", digit, MAX_SCORE)),
        onClear: () => edit(idx, ""),
      }),
    ]);
  }

  function render(): void {
    overlay.innerHTML = "";
    const stepwise = stepwiseQuery.matches && entries.length > 1;

    const { card, body, footer } = padCard();
    body.appendChild(
      padTopRow(
        close,
        stepwise && step > 0
          ? {
              label: `← ${entries[step - 1]?.name ?? "Førre"}`,
              onClick: () => {
                step--;
                render();
              },
            }
          : null,
      ),
    );
    if (stepwise) body.appendChild(padProgress(entries.length, step));
    if (context.baneLabel != null || context.rundeLabel != null) {
      body.appendChild(padMeta(context.baneLabel, context.rundeLabel));
    }

    body.appendChild(
      padColumns(stepwise ? [columnEl(step)] : entries.map((_, idx) => columnEl(idx))),
    );

    // The footer action advances while a later side is still unentered, and
    // saves once every side is on screen (wide) or reached (stepwise). Either
    // way it stays blocked until the sides it covers have a typed score — a 0
    // must be pressed, not assumed.
    const nextName = stepwise ? entries[step + 1]?.name : undefined;
    footer.appendChild(
      nextName != null
        ? padRegister({
            label: `Neste: ${nextName} →`,
            disabled: inputs[step] === "",
            onClick: () => {
              step++;
              render();
            },
          })
        : padRegister({
            label: isSaving ? "Lagrer…" : "Lagre",
            disabled: isSaving || (stepwise ? inputs[step] === "" : inputs.includes("")),
            onClick: () => void save(),
          }),
    );

    overlay.appendChild(card);
  }

  render();
  document.body.appendChild(overlay);
}
