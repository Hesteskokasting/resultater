import { confirmDialog } from "@/components/ConfirmDialog";
import { showNumberpad } from "@/components/ScoreNumberpad";
import { showToast } from "@/components/Toast";
import { deleteMatchRounds } from "@/services/kampService";
import { logError } from "@/utils/logError";

export interface ScoreEditorOptions {
  /** Display name/HTML for side 1 (left numberpad). */
  side1Name: string;
  /** Display name/HTML for side 2 (right numberpad). */
  side2Name: string;
  /** Score prefilled for side 1. */
  currentS1: number;
  /** Score prefilled for side 2. */
  currentS2: number;
  /** Court pill above the pads, e.g. "Bane 3". */
  baneLabel?: string;
  /** Round line beside the pill, e.g. "Runde 2" or "Semifinale". */
  rundeLabel?: string;
  /** kamp_spelar ids whose omgangar are cleared before a direct score is written. */
  playerIds: number[];
  /** True when a side has live omgangar — gates the delete-warning dialog. */
  hasRounds: boolean;
  /**
   * Rejects a score pair before anything is written or deleted. Returns the
   * message to show, or null to accept.
   */
  validate?: (s1: number, s2: number) => string | null;
  /** Persists the entered side scores. Return a non-null error to abort. */
  onSave: (s1: number, s2: number) => Promise<{ error: unknown } | null>;
  /** Re-renders after a successful save. */
  onSaved: () => Promise<void>;
  /** logError context prefix for the owning variant. */
  logPrefix: string;
}

/**
 * Direct score entry that warns before discarding live omgang detail.
 * Shared by innledende and avsluttende: confirm → numberpad → clear omgangar → save.
 * Writing a flat score can't coexist with per-omgang rows, so the rounds are
 * deleted on save rather than left to silently contradict the new total.
 */
export async function showScoreEditor(opts: ScoreEditorOptions): Promise<void> {
  if (
    opts.hasRounds &&
    !(await confirmDialog({
      title: "Slett detaljar",
      message: "Dette sletter detaljar for denne kampen. Er du sikker?",
    }))
  )
    return;

  showNumberpad(
    [
      { name: opts.side1Name, score: opts.currentS1 },
      { name: opts.side2Name, score: opts.currentS2 },
    ],
    async ([s1 = 0, s2 = 0]) => {
      const invalid = opts.validate?.(s1, s2);
      if (invalid) {
        showToast(invalid, "error");
        return false;
      }
      try {
        if (opts.hasRounds && opts.playerIds.length) {
          const { error } = await deleteMatchRounds(opts.playerIds);
          if (error) {
            showToast("DB-feil ved sletting av omgangar", "error");
            return false;
          }
        }
        const result = await opts.onSave(s1, s2);
        if (result?.error) {
          showToast("Feil ved lagring av score", "error");
          return false;
        }
      } catch (err) {
        logError(`${opts.logPrefix}:showScoreEditor`, err);
        showToast("Feil ved lagring av score", "error");
        return false;
      }
      await opts.onSaved();
      return true;
    },
    { baneLabel: opts.baneLabel, rundeLabel: opts.rundeLabel },
  );
}
