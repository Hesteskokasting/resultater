import { confirmDialog } from '@/components/ConfirmDialog'
import { showNumberpad } from '@/components/ScoreNumberpad'
import { showToast } from '@/components/Toast'
import { slettKampOmgangar } from '@/services/kampService'
import { logError } from '@/utils/logError'

export interface ScoreEditorOptions {
  /** Display name/HTML for side 1 (left numberpad). */
  side1Name: string
  /** Display name/HTML for side 2 (right numberpad). */
  side2Name: string
  /** Score prefilled for side 1. */
  currentS1: number
  /** Score prefilled for side 2. */
  currentS2: number
  /** kamp_spelar ids whose omgangar are cleared before a direct score is written. */
  spelarIds: number[]
  /** True when a side has live omgangar — gates the delete-warning dialog. */
  hasOmgangar: boolean
  /** Persists the entered side scores. Return a non-null error to abort. */
  onSave: (s1: number, s2: number) => Promise<{ error: unknown } | null>
  /** Re-renders after a successful save. */
  onSaved: () => Promise<void>
  /** logError context prefix for the owning variant. */
  logPrefix: string
}

/**
 * Direct score entry that warns before discarding live omgang detail.
 * Shared by innledende and avsluttende: confirm → numberpad → clear omgangar → save.
 * Writing a flat score can't coexist with per-omgang rows, so the rounds are
 * deleted on save rather than left to silently contradict the new total.
 */
export async function showScoreEditor(opts: ScoreEditorOptions): Promise<void> {
  if (opts.hasOmgangar && !await confirmDialog({
    title: 'Slett detaljar',
    message: 'Dette sletter detaljar for denne kampen. Er du sikker?',
  })) return

  showNumberpad(opts.side1Name, opts.side2Name, opts.currentS1, opts.currentS2, async (s1, s2) => {
    try {
      if (opts.hasOmgangar && opts.spelarIds.length) {
        const { error } = await slettKampOmgangar(opts.spelarIds)
        if (error) { showToast('DB-feil ved sletting av omgangar', 'error'); return }
      }
      const result = await opts.onSave(s1, s2)
      if (result?.error) { showToast('Feil ved lagring av score', 'error'); return }
    } catch (err) {
      logError(`${opts.logPrefix}:showScoreEditor`, err)
      showToast('Feil ved lagring av score', 'error')
      return
    }
    await opts.onSaved()
  })
}
