import {
  createNumberpadOverlay,
  padCard,
  padColumn,
  padColumns,
  padContext,
  padDigitGrid,
  padDisplay,
  padProgress,
  padTitle,
  padTopRow,
} from "@/components/numberpad/numberpadUi";
import { appendDigit, digitValue } from "@/utils/padInput";
import { showToast } from "@/components/Toast";
import { isValidTotalEntry, totalMaxPoeng, totalMaxRinger } from "@/utils/omgangValidation";

export interface TotalEntry {
  /** Small accent context line, e.g. "Bane 1 · Totalsum". */
  contextLabel: string;
  playerName: string;
  /** Omgang count for the format — drives the max poeng/ringere and validity. */
  antallOmganger: number;
  initialPoeng?: number;
  initialRinger?: number;
  /** Persists the total. Return false to stay open (failed save). */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>;
}

/**
 * Two-stage digit pad for a directly-entered X-kast/Kongelag total: poengsum
 * first (0..antallOmganger×20), then ringere (0..×4). Unlike the per-omgang
 * pad, ringere is digit entry — a full total can hold far more than 4 rings.
 * The pair is validated against the aggregate shoe model before saving.
 */
export function showTotalNumberpad(entry: TotalEntry): void {
  const maxPoeng = totalMaxPoeng(entry.antallOmganger);
  const maxRinger = totalMaxRinger(entry.antallOmganger);

  let stage: "poeng" | "ringer" = "poeng";
  let poengInput = entry.initialPoeng != null ? String(entry.initialPoeng) : "";
  let ringerInput = entry.initialRinger != null ? String(entry.initialRinger) : "";
  let isSaving = false;

  const { overlay, close } = createNumberpadOverlay();

  const currentMax = (): number => (stage === "poeng" ? maxPoeng : maxRinger);
  const currentInput = (): string => (stage === "poeng" ? poengInput : ringerInput);
  const currentValue = (): number => digitValue(currentInput());

  /** Writes back to whichever figure the open stage is collecting. */
  function edit(next: string): void {
    if (stage === "poeng") poengInput = next;
    else ringerInput = next;
    render();
  }

  async function save(): Promise<void> {
    if (isSaving) return;
    const poeng = parseInt(poengInput || "0");
    const ringer = parseInt(ringerInput || "0");
    if (!isValidTotalEntry(poeng, ringer, entry.antallOmganger)) {
      showToast(`${poeng} poeng med ${ringer} ringar er ikkje mogleg.`, "error");
      return;
    }
    isSaving = true;
    render();
    const saved = await entry.onSave(poeng, ringer);
    if (saved) close();
    else {
      isSaving = false;
      render();
    }
  }

  function render(): void {
    overlay.innerHTML = "";

    const { card, body } = padCard();
    body.appendChild(
      padTopRow(
        close,
        stage === "ringer"
          ? {
              label: "← Poeng",
              onClick: () => {
                stage = "poeng";
                render();
              },
            }
          : null,
      ),
    );
    body.appendChild(padProgress(2, stage === "poeng" ? 0 : 1));
    body.appendChild(padContext(entry.contextLabel));
    body.appendChild(padTitle(entry.playerName));

    const col = padColumn([
      padDisplay(
        stage === "poeng" ? `Poengsum (maks ${maxPoeng})` : `Ringere (maks ${maxRinger})`,
        String(currentValue()),
        { placeholder: currentInput() === "" },
      ),
      padDigitGrid({
        onDigit: (digit) => edit(appendDigit(currentInput(), digit, currentMax())),
        onClear: () => edit(""),
        action:
          stage === "poeng"
            ? {
                caption: "Neste",
                label: "→",
                onClick: () => {
                  stage = "ringer";
                  render();
                },
              }
            : {
                caption: "Lagre",
                label: isSaving ? "…" : "✓",
                disabled: isSaving,
                onClick: () => void save(),
              },
      }),
    ]);
    body.appendChild(padColumns([col]));

    overlay.appendChild(card);
  }

  render();
  document.body.appendChild(overlay);
}
