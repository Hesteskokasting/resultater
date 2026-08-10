import { createEl } from "@/utils/createEl";
import {
  createNumberpadOverlay,
  padCard,
  padContext,
  padDigitGrid,
  padDisplay,
  padProgress,
  padTitle,
  padTopRow,
} from "@/components/numberpadUi";
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
  const currentValue = (): number => parseInt(currentInput() || "0");

  function appendDigit(digit: string): void {
    const next = currentInput() + digit;
    if (parseInt(next) > currentMax()) return;
    const normalized = currentInput() === "0" ? digit : next;
    if (stage === "poeng") poengInput = normalized;
    else ringerInput = normalized;
    render();
  }

  function backspace(): void {
    if (stage === "poeng") poengInput = poengInput.slice(0, -1);
    else ringerInput = ringerInput.slice(0, -1);
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

    const card = padCard();
    card.appendChild(
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
    card.appendChild(padProgress(2, stage === "poeng" ? 0 : 1));
    card.appendChild(padContext(entry.contextLabel));
    card.appendChild(padTitle(entry.playerName));

    const cols = createEl("div", null, "pad-cols");
    const col = createEl("div", null, "pad-col");
    col.appendChild(
      padDisplay(
        stage === "poeng" ? `Poengsum (maks ${maxPoeng})` : `Ringere (maks ${maxRinger})`,
        String(currentValue()),
        { placeholder: currentInput() === "" },
      ),
    );
    col.appendChild(
      padDigitGrid({
        onDigit: appendDigit,
        onBackspace: backspace,
        action:
          stage === "poeng"
            ? {
                label: "→",
                onClick: () => {
                  stage = "ringer";
                  render();
                },
              }
            : { label: isSaving ? "…" : "✓", disabled: isSaving, onClick: () => void save() },
      }),
    );
    cols.appendChild(col);
    card.appendChild(cols);

    overlay.appendChild(card);
  }

  render();
  document.body.appendChild(overlay);
}
