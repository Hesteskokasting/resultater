import { createEl } from "@/utils/createEl";
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
  type PadBack,
  type PadShell,
} from "@/components/numberpad/numberpadUi";
import { renderRingStage } from "@/components/numberpad/XkastKongelagRingStage";
import { roundRowEl, type RoundRow } from "@/components/numberpad/XkastKongelagRoundRow";
import { showToast } from "@/components/Toast";
import { appendDigit, digitValue } from "@/utils/padInput";
import {
  isValidOmgangEntry,
  ringOptions,
  OMGANG_MAX_POENG,
} from "@/utils/xkastKongelag/omgangValidation";

/** One round of the end-of-round summary, as known when the pad opened. */
export interface XkastKongelagSummaryRow {
  /** Row label, e.g. the round number. */
  label: string;
  /** Matches XkastKongelagPadHeader.rundeKey, so this session's entries overlay it. */
  rundeKey: string;
  cellPoeng: (number | null)[];
  cellRinger: (number | null)[];
}

/**
 * Round breakdown shown instead of the keys once the pad has taken every
 * omgang it holds for a player, so the round is read back before the next
 * player starts. Omit to advance straight to the next step.
 */
export interface XkastKongelagSummary {
  rows: XkastKongelagSummaryRow[];
}

export interface XkastKongelagPadHeader {
  /** Pill left of the round line, e.g. "Bane 2". */
  baneLabel: string;
  /** Round line, e.g. "Runde 2 av 3" (X-kast) or "Omgang 3 av 10" (Kongelag). */
  rundeLabel: string;
  /** Cell labels of the round row — omgang numbers within the round. */
  cellLabels: string[];
  /** Poeng per cell as known when the pad opened; null = not entered. */
  cellPoeng: (number | null)[];
  /** Index in cellLabels of the omgang this step enters. */
  cellIndex: number;
  /** Player totals across all omganger as known when the pad opened. */
  totalPoeng: number;
  totalRinger: number;
  /** Identities used to overlay saves made in this pad session. */
  playerKey: string;
  rundeKey: string;
  /** Round breakdown shown when the pad leaves this player. */
  summary?: XkastKongelagSummary;
}

export interface XkastKongelagEntryStep {
  header: XkastKongelagPadHeader;
  playerName: string;
  /** Prefilled figures when editing an existing omgang (omit for a fresh entry). */
  initialPoeng?: number;
  initialRinger?: number | null;
  /**
   * Persists the completed omgang. Runs once per step, when both poeng and
   * ringere are entered. Return false to stay on the step (failed save).
   */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>;
}

/** The two figures an omgang carries — keyed alike wherever both behave the same. */
type PadField = "poeng" | "ringer";

interface PadState {
  stepIdx: number;
  stage: PadField;
  /** Typed poengsum as a string so leading state ("", "1", "12") is explicit. */
  poengInput: string;
  selectedRinger: number | null;
  isSaving: boolean;
  /** Showing the round summary for the current step's player instead of the keys. */
  showSummary: boolean;
}

/**
 * Sequential entry wizard for X-kast/Kongelag omganger. Each step is a
 * two-stage card — poengsum on a digit pad, then ringere as 0–4 buttons where
 * impossible counts (per the shoe model) are disabled and a single valid count
 * is auto-selected. Each completed omgang saves immediately so partial progress
 * survives interruption. The caller controls entry order and batch size via
 * `steps` (Kongelag passes one omgang at a time so the pad closes between them).
 */
export function showXkastKongelagNumberpad(steps: XkastKongelagEntryStep[]): void {
  if (steps.length === 0) return;

  const state: PadState = {
    stepIdx: 0,
    stage: "poeng",
    poengInput: "",
    selectedRinger: null,
    isSaving: false,
    showSummary: false,
  };
  /** Values saved during this pad session, so rows and totals stay live. */
  const saved: Record<PadField, Map<number, number>> = { poeng: new Map(), ringer: new Map() };
  const { overlay, close } = createNumberpadOverlay();

  const currentStep = (): XkastKongelagEntryStep => steps[state.stepIdx]!;
  const currentPoeng = (): number => digitValue(state.poengInput);

  function initialOf(step: XkastKongelagEntryStep, field: PadField): number | null {
    return (field === "poeng" ? step.initialPoeng : step.initialRinger) ?? null;
  }

  // ── Flow ────────────────────────────────────────────────────────────────────

  /** Resets the two-stage state for the current step, prefilling when editing. */
  function loadStepDefaults(): void {
    const step = steps[state.stepIdx];
    state.stage = "poeng";
    state.poengInput = step?.initialPoeng != null ? String(step.initialPoeng) : "";
    state.selectedRinger = step?.initialRinger ?? null;
    state.isSaving = false;
  }

  function nextStep(): void {
    state.stepIdx++;
    if (state.stepIdx >= steps.length) {
      close();
      return;
    }
    loadStepDefaults();
    render();
  }

  /**
   * A player who has thrown every omgang the pad holds gets the round summary
   * before it moves on. A single-step pad (an edit) has nothing to read back.
   */
  function advance(): void {
    const step = steps[state.stepIdx];
    const next = steps[state.stepIdx + 1];
    const leavesPlayer = !next || next.header.playerKey !== step?.header.playerKey;
    if (steps.length > 1 && step?.header.summary && leavesPlayer) {
      state.showSummary = true;
      render();
      return;
    }
    nextStep();
  }

  function edit(next: string): void {
    state.poengInput = next;
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
    if (await step.onSave(poeng, ringer)) {
      saved.poeng.set(state.stepIdx, poeng);
      saved.ringer.set(state.stepIdx, ringer);
      advance();
    } else {
      state.isSaving = false;
      render();
    }
  }

  // ── Live figures ────────────────────────────────────────────────────────────

  /** A step's figure: the saved one, or what is typed/picked while it is open. */
  function effective(idx: number, field: PadField): number | null {
    const value = saved[field].get(idx);
    if (value != null) return value;
    const step = steps[idx];
    if (!step || idx !== state.stepIdx) return null;
    const initial = initialOf(step, field);
    if (field === "ringer") return state.selectedRinger ?? initial;
    return state.poengInput === "" ? initial : currentPoeng();
  }

  /** Player total, adjusted by what this session has entered so far. */
  function liveTotal(field: PadField): number {
    const header = currentStep().header;
    const opening = field === "poeng" ? header.totalPoeng : header.totalRinger;
    return steps.reduce((total, step, idx) => {
      if (step.header.playerKey !== header.playerKey) return total;
      const value = effective(idx, field);
      return value == null ? total : total + value - (initialOf(step, field) ?? 0);
    }, opening);
  }

  /** Lays this session's entries over a round's opening cells. */
  function overlayRow(row: RoundRow): RoundRow {
    steps.forEach((step, idx) => {
      if (step.header.rundeKey !== row.rundeKey) return;
      const poeng = effective(idx, "poeng");
      if (poeng != null) row.poeng[step.header.cellIndex] = poeng;
      const ringer = effective(idx, "ringer");
      if (ringer != null) row.ringer[step.header.cellIndex] = ringer;
    });
    return row;
  }

  /** Every round of the current player, overlaid with this session's entries. */
  function roundRows(): RoundRow[] {
    return (currentStep().header.summary?.rows ?? []).map((row) =>
      overlayRow({
        label: row.label,
        rundeKey: row.rundeKey,
        labels: row.cellPoeng.map((_, i) => String(i + 1)),
        poeng: [...row.cellPoeng],
        ringer: [...row.cellRinger],
      }),
    );
  }

  /** The round being thrown — from the summary, or from the header (Kongelag). */
  function currentRow(): RoundRow {
    const header = currentStep().header;
    return (
      roundRows().find((row) => row.rundeKey === header.rundeKey) ??
      overlayRow({
        label: "",
        rundeKey: header.rundeKey,
        labels: header.cellLabels,
        poeng: [...header.cellPoeng],
        ringer: header.cellLabels.map(() => null),
      })
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  /** Close/back row, stage bar, name with the poeng badge, then the meta line. */
  function renderHead(
    body: HTMLElement,
    back: PadBack | null,
    seg: number,
    metaLine: string,
  ): void {
    const step = currentStep();
    body.append(
      padTopRow(close, back),
      padProgress(2, seg),
      padTitle(step.playerName, String(liveTotal("poeng"))),
      padMeta(step.header.baneLabel, metaLine, String(liveTotal("ringer"))),
    );
  }

  function statusLabel(rows: RoundRow[]): string {
    const done = rows.filter((row) => row.poeng.every((p) => p != null)).length;
    const prefix = done >= rows.length ? `Alle ${rows.length}` : `${done} av ${rows.length}`;
    return `${prefix} runder fullført`;
  }

  function renderSummary({ body, footer }: PadShell): void {
    const rows = roundRows();
    const next = steps[state.stepIdx + 1];

    renderHead(body, null, 1, statusLabel(rows));
    body.appendChild(createEl("div", "Oppsummering", "pad-summary-heading"));
    const list = createEl("div", null, "pad-summary-list");
    for (const row of rows) list.appendChild(roundRowEl(row, null));
    body.appendChild(list);

    footer.appendChild(
      padRegister({
        label: next ? `Neste spiller: ${next.playerName}` : "Ferdig",
        onClick: () => {
          state.showSummary = false;
          nextStep();
        },
      }),
    );
  }

  function renderEntry(shell: PadShell): void {
    const step = currentStep();
    const back: PadBack | null =
      state.stage === "ringer"
        ? {
            label: "← Poeng",
            onClick: () => {
              state.stage = "poeng";
              state.selectedRinger = null;
              render();
            },
          }
        : null;
    renderHead(shell.body, back, state.stage === "poeng" ? 0 : 1, step.header.rundeLabel);
    shell.body.appendChild(roundRowEl(currentRow(), step.header.cellIndex));

    const display = padDisplay("Poengsum", String(currentPoeng()), {
      placeholder: state.poengInput === "",
    });
    const keys: HTMLElement[] = [display];
    if (state.stage === "poeng") {
      keys.push(
        padDigitGrid({
          onDigit: (digit) => edit(appendDigit(state.poengInput, digit, OMGANG_MAX_POENG)),
          onClear: () => edit(""),
          action: {
            caption: "Bekreft",
            value: `${currentPoeng()} p`,
            label: "→",
            disabled: state.poengInput === "",
            onClick: goToRinger,
          },
        }),
      );
    }
    shell.body.appendChild(padColumns([padColumn(keys)]));

    if (state.stage === "ringer") {
      renderRingStage(shell, {
        poeng: currentPoeng(),
        selected: state.selectedRinger,
        isSaving: state.isSaving,
        onPick: (count) => {
          state.selectedRinger = count;
          render();
        },
        onRegister: () => void save(),
      });
    }
  }

  function render(): void {
    overlay.innerHTML = "";
    if (!steps[state.stepIdx]) return;
    const shell = padCard();
    if (state.showSummary) renderSummary(shell);
    else renderEntry(shell);
    overlay.appendChild(shell.card);
  }

  loadStepDefaults();
  render();
  document.body.appendChild(overlay);
}
