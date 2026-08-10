import { createEl } from "@/utils/createEl";
import {
  createNumberpadOverlay,
  padCard,
  padContext,
  padDigitGrid,
  padDisplay,
  padProgress,
  padRegister,
  padTopRow,
} from "@/components/numberpadUi";

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

/**
 * Numberpad for direct score entry. Supports any number of participants (kamp
 * uses 2 sides, X-kast courts have 1–3 players). Mobile shows one participant
 * at a time ("→" advances, Lagre on the last); wider screens show every pad
 * side by side with a single Lagre below.
 */
export function showNumberpad(
  entries: NumberpadEntry[],
  onSave: (scores: number[]) => Promise<void>,
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

  const valueOf = (idx: number): number => parseInt(inputs[idx] || "0");

  function appendDigit(idx: number, digit: string): void {
    const current = inputs[idx] ?? "";
    const next = current === "0" ? digit : current + digit;
    if (parseInt(next) > MAX_SCORE) return;
    inputs[idx] = next;
    render();
  }

  function backspace(idx: number): void {
    inputs[idx] = (inputs[idx] ?? "").slice(0, -1);
    render();
  }

  async function save(): Promise<void> {
    if (isSaving) return;
    isSaving = true;
    render();
    await onSave(entries.map((_, idx) => valueOf(idx)));
    close();
  }

  /** One entry's read-out plus its keys. `action` fills the grid's thumb slot. */
  function columnEl(
    idx: number,
    action: Parameters<typeof padDigitGrid>[0]["action"],
  ): HTMLElement {
    const col = createEl("div", null, "pad-col");
    col.appendChild(
      padDisplay(entries[idx]?.name ?? "", String(valueOf(idx)), {
        placeholder: inputs[idx] === "",
      }),
    );
    col.appendChild(
      padDigitGrid({
        onDigit: (digit) => appendDigit(idx, digit),
        onBackspace: () => backspace(idx),
        action,
      }),
    );
    return col;
  }

  function render(): void {
    overlay.innerHTML = "";
    const stepwise = stepwiseQuery.matches && entries.length > 1;

    const card = padCard();
    card.appendChild(
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
    if (stepwise) card.appendChild(padProgress(entries.length, step));
    card.appendChild(padContext("Registrer score"));

    const cols = createEl("div", null, "pad-cols");
    if (stepwise) {
      const isLast = step === entries.length - 1;
      cols.appendChild(
        columnEl(step, {
          label: isLast ? (isSaving ? "…" : "✓") : "→",
          disabled: isSaving,
          onClick: isLast
            ? () => void save()
            : () => {
                step++;
                render();
              },
        }),
      );
    } else {
      entries.forEach((_, idx) => cols.appendChild(columnEl(idx, null)));
    }
    card.appendChild(cols);

    if (!stepwise) {
      card.appendChild(
        padRegister({
          label: isSaving ? "Lagrer…" : "Lagre",
          disabled: isSaving,
          onClick: () => void save(),
        }),
      );
    }

    overlay.appendChild(card);
  }

  render();
  document.body.appendChild(overlay);
}
