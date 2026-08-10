import { createEl } from "@/utils/createEl";
import {
  createNumberpadOverlay,
  padCard,
  padDigitGrid,
  padDisplay,
  padProgress,
  padRegister,
  padTitle,
  padTopRow,
} from "@/components/numberpadUi";
import { showToast } from "@/components/Toast";
import {
  isValidOmgangEntry,
  ringOptions,
  OMGANG_MAX_POENG,
  OMGANG_MAX_RINGER,
} from "@/utils/omgangValidation";

export interface OmgangPadHeader {
  /** Pill left of the round line, e.g. "Bane 2". */
  baneLabel: string;
  /** Round line, e.g. "Runde 2 av 3" (X-kast) or "Omgang 3 av 10" (Kongelag). */
  rundeLabel: string;
  /** Column labels of the round strip — omgang numbers within the round. */
  cellLabels: string[];
  /** Poeng per strip cell as known when the pad opened; null = not entered. */
  cellPoeng: (number | null)[];
  /** Index in cellLabels of the omgang this step enters. */
  cellIndex: number;
  /** Player total across all omganger as known when the pad opened. */
  totalPoeng: number;
  /** Identity used to overlay saves made in this pad session. */
  playerKey: string;
  /** Identity of the strip (player + round) for the same overlay. */
  rundeKey: string;
}

export interface OmgangEntryStep {
  /** Bane, round and strip context shown above the display box. */
  header: OmgangPadHeader;
  /** Player throwing this omgang. */
  playerName: string;
  /** Prefilled poeng when editing an existing omgang (omit for a fresh entry). */
  initialPoeng?: number;
  /** Prefilled ringere when editing an existing omgang. */
  initialRinger?: number | null;
  /**
   * Persists the completed omgang. Runs once per step, when both poeng and
   * ringere are entered. Return false to stay on the step (failed save).
   */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>;
}

interface PadState {
  stepIdx: number;
  stage: "poeng" | "ringer";
  /** Typed poengsum as a string so leading state ("", "1", "12") is explicit. */
  poengInput: string;
  selectedRinger: number | null;
  isSaving: boolean;
}

/**
 * Sequential entry wizard for X-kast/Kongelag omganger. Each step is a
 * two-stage card — poengsum on a digit pad, then ringere as 0–4 buttons where
 * impossible counts (per the shoe model) are disabled and a single valid
 * count is auto-selected. Each completed omgang saves immediately so partial
 * progress survives interruption. The caller controls entry order and batch
 * size via `steps` (Kongelag passes one omgang at a time so the pad closes
 * between omganger).
 */
export function showOmgangNumberpad(steps: OmgangEntryStep[]): void {
  if (steps.length === 0) return;

  const state: PadState = {
    stepIdx: 0,
    stage: "poeng",
    poengInput: "",
    selectedRinger: null,
    isSaving: false,
  };
  /** Poeng saved during this pad session, so the strip and total stay live. */
  const savedPoeng = new Map<number, number>();
  const { overlay, close } = createNumberpadOverlay();

  /** Resets the two-stage state for the current step, prefilling when editing. */
  function loadStepDefaults(): void {
    const step = steps[state.stepIdx];
    state.stage = "poeng";
    state.poengInput = step?.initialPoeng != null ? String(step.initialPoeng) : "";
    state.selectedRinger = step?.initialRinger ?? null;
    state.isSaving = false;
  }

  function currentPoeng(): number {
    return Math.min(OMGANG_MAX_POENG, parseInt(state.poengInput || "0"));
  }

  function advance(): void {
    state.stepIdx++;
    if (state.stepIdx >= steps.length) {
      close();
      return;
    }
    loadStepDefaults();
    render();
  }

  function appendDigit(digit: string): void {
    const next = state.poengInput + digit;
    if (parseInt(next) > OMGANG_MAX_POENG) return;
    state.poengInput = state.poengInput === "0" ? digit : next;
    render();
  }

  function goToRinger(): void {
    const poeng = currentPoeng();
    const { allowed, autoSelected } = ringOptions(poeng);
    if (!allowed.length) {
      showToast(`${poeng} poeng er ikkje mogleg i éin omgang.`, "error");
      return;
    }
    state.stage = "ringer";
    state.selectedRinger = autoSelected;
    render();
  }

  async function save(): Promise<void> {
    const step = steps[state.stepIdx];
    const ringer = state.selectedRinger;
    if (!step || ringer == null || state.isSaving) return;
    const poeng = currentPoeng();
    if (!isValidOmgangEntry(poeng, ringer)) {
      showToast(`${poeng} poeng med ${ringer} ringar er ikkje mogleg.`, "error");
      return;
    }
    state.isSaving = true;
    render();
    const saved = await step.onSave(poeng, ringer);
    if (saved) {
      savedPoeng.set(state.stepIdx, poeng);
      advance();
    } else {
      state.isSaving = false;
      render();
    }
  }

  // ── Live header figures ─────────────────────────────────────────────────────

  /** Poeng for a step: saved value, or the typed value while it is the open step. */
  function effectivePoeng(idx: number): number | null {
    const saved = savedPoeng.get(idx);
    if (saved != null) return saved;
    if (idx !== state.stepIdx) return null;
    if (state.poengInput === "") return steps[idx]?.initialPoeng ?? null;
    return currentPoeng();
  }

  /** Total for the player, adjusted by what this session has entered so far. */
  function liveTotal(): number {
    const header = steps[state.stepIdx]!.header;
    let total = header.totalPoeng;
    steps.forEach((step, idx) => {
      if (step.header.playerKey !== header.playerKey) return;
      const poeng = effectivePoeng(idx);
      if (poeng == null) return;
      total += poeng - (step.initialPoeng ?? 0);
    });
    return total;
  }

  /** Strip cells for the current round, overlaid with this session's entries. */
  function liveCells(): (number | null)[] {
    const header = steps[state.stepIdx]!.header;
    const cells = [...header.cellPoeng];
    steps.forEach((step, idx) => {
      if (step.header.rundeKey !== header.rundeKey) return;
      const poeng = effectivePoeng(idx);
      if (poeng != null) cells[step.header.cellIndex] = poeng;
    });
    return cells;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  function metaEl(): HTMLElement {
    const header = steps[state.stepIdx]!.header;
    const row = createEl("div", null, "pad-meta");
    row.appendChild(createEl("span", header.baneLabel, "pad-bane"));
    row.appendChild(createEl("span", header.rundeLabel, "pad-runde"));
    return row;
  }

  function stripEl(): HTMLElement {
    const header = steps[state.stepIdx]!.header;
    const cells = liveCells();

    const strip = createEl("div", null, "pad-strip");
    strip.style.gridTemplateColumns = `repeat(${header.cellLabels.length}, minmax(0, 1fr)) auto`;

    header.cellLabels.forEach((label, i) => {
      strip.appendChild(
        createEl("div", label, `pad-strip-head${i === header.cellIndex ? " current" : ""}`),
      );
    });
    strip.appendChild(createEl("div", "SUM", "pad-strip-head pad-strip-sum"));

    header.cellLabels.forEach((_, i) => {
      const poeng = cells[i];
      const value = createEl(
        "div",
        poeng != null ? String(poeng) : "–",
        `pad-strip-cell${i === header.cellIndex ? " current" : ""}${poeng == null ? " empty" : ""}`,
      );
      strip.appendChild(value);
    });
    const sum = cells.reduce<number>((acc, p) => acc + (p ?? 0), 0);
    strip.appendChild(createEl("div", String(sum), "pad-strip-cell pad-strip-sum"));

    return strip;
  }

  function poengGridEl(): HTMLElement {
    return padDigitGrid({
      onDigit: appendDigit,
      onBackspace: () => {
        state.poengInput = state.poengInput.slice(0, -1);
        render();
      },
      action: { label: "→", disabled: state.poengInput === "", onClick: goToRinger },
    });
  }

  function ringButtonEl(count: number, isAllowed: boolean): HTMLButtonElement {
    const label = count === 0 ? "ingen ringer" : count === 1 ? "ring" : "ringer";
    const btn = createEl("button", null, `pad-ring-btn${count === 0 ? " pad-ring-zero" : ""}`);
    btn.appendChild(createEl("span", String(count), "pad-ring-value"));
    btn.appendChild(createEl("span", label, "pad-ring-label"));
    btn.disabled = !isAllowed;
    btn.classList.toggle("selected", state.selectedRinger === count);
    btn.addEventListener("click", () => {
      state.selectedRinger = count;
      render();
    });
    return btn;
  }

  /** Ring-stage parts, split by where they belong: content and footer action. */
  function ringStageEls(): { content: HTMLElement[]; register: HTMLElement } {
    const { allowed } = ringOptions(currentPoeng());

    const heading = createEl("div", null, "pad-ring-heading");
    heading.appendChild(createEl("span", "Antall ringer", "pad-ring-heading-main"));
    heading.appendChild(createEl("span", `(maks ${OMGANG_MAX_RINGER})`, "pad-ring-heading-sub"));

    const grid = createEl("div", null, "pad-ring-grid");
    for (let count = 1; count <= OMGANG_MAX_RINGER; count++) {
      grid.appendChild(ringButtonEl(count, allowed.includes(count)));
    }
    grid.appendChild(ringButtonEl(0, allowed.includes(0)));

    const register = padRegister({
      label: state.isSaving ? "Lagrer…" : "Registrer og fullfør ✓",
      disabled: state.selectedRinger == null || state.isSaving,
      onClick: () => void save(),
    });

    return { content: [heading, grid], register };
  }

  function render(): void {
    overlay.innerHTML = "";
    const step = steps[state.stepIdx];
    if (!step) return;

    const { card, body, footer } = padCard();
    body.appendChild(
      padTopRow(
        close,
        state.stage === "ringer"
          ? {
              label: "← Poeng",
              onClick: () => {
                state.stage = "poeng";
                state.selectedRinger = null;
                render();
              },
            }
          : null,
      ),
    );
    body.appendChild(padProgress(2, state.stage === "poeng" ? 0 : 1));
    body.appendChild(padTitle(step.playerName, String(liveTotal())));
    body.appendChild(metaEl());
    body.appendChild(stripEl());

    const cols = createEl("div", null, "pad-cols");
    const col = createEl("div", null, "pad-col");
    col.appendChild(
      padDisplay(
        state.stage === "poeng" ? "Poengsum" : "Poengsum registrert",
        String(currentPoeng()),
        { placeholder: state.poengInput === "" },
      ),
    );
    if (state.stage === "poeng") col.appendChild(poengGridEl());
    cols.appendChild(col);
    body.appendChild(cols);

    if (state.stage === "ringer") {
      const { content, register } = ringStageEls();
      for (const el of content) body.appendChild(el);
      footer.appendChild(register);
    }

    overlay.appendChild(card);
  }

  loadStepDefaults();
  render();
  document.body.appendChild(overlay);
}
