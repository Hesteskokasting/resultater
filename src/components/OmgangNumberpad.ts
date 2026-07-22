import { createEl } from '@/utils/createEl'
import { createPad, bindPadButtons } from '@/components/ScoreNumberpad'
import { showToast } from '@/components/Toast'
import {
  isValidOmgangEntry,
  OMGANG_MAX_POENG,
  OMGANG_MAX_RINGER,
} from '@/utils/omgangValidation'

export interface OmgangEntryStep {
  /** Display name shown above the pad, e.g. the player's name. */
  label: string
  /** Omgang number being entered (1-based, shown in the pad heading). */
  omgang: number
  /**
   * Persists the completed omgang. Runs once per step, when both poeng and
   * ringere are entered. Return false to stay on the step (failed save).
   */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>
}

/**
 * Sequential entry wizard for X-kast/Kongelag omganger. Each step is a
 * two-stage pad — poeng (0–20) first, then ringere (0–4) — saved immediately
 * so partial progress survives interruption. The caller controls entry order
 * by the order of `steps` (X-kast: player-by-player within a court;
 * Kongelag: court-by-court within an omgang).
 */
export function showOmgangNumberpad(steps: OmgangEntryStep[]): void {
  if (steps.length === 0) return

  let stepIdx = 0
  let stage: 'poeng' | 'ringer' = 'poeng'
  let poeng = 0
  let ringer = 0

  const overlay = document.createElement('div')
  overlay.className = 'np-overlay'

  history.pushState({ numberpad: true }, '')

  function closeOverlay(): void {
    window.removeEventListener('popstate', handlePopState)
    if (document.body.contains(overlay)) document.body.removeChild(overlay)
    if ((history.state as { numberpad?: boolean } | null)?.numberpad) history.back()
  }

  function handlePopState(): void {
    window.removeEventListener('popstate', handlePopState)
    if (document.body.contains(overlay)) document.body.removeChild(overlay)
  }

  window.addEventListener('popstate', handlePopState)

  function advance(): void {
    stepIdx++
    stage = 'poeng'
    poeng = 0
    ringer = 0
    if (stepIdx >= steps.length) {
      closeOverlay()
      return
    }
    render()
  }

  function render(): void {
    overlay.innerHTML = ''
    const step = steps[stepIdx]
    if (!step) return

    const wrap = createEl('div', null, 'np-wrap')
    overlay.appendChild(wrap)

    const closeBtn = createEl('button', '×', 'np-num-btn np-grid-btn np-grid-close-btn')
    closeBtn.addEventListener('click', closeOverlay)

    let actionBtn: HTMLButtonElement
    if (stage === 'poeng') {
      actionBtn = createEl('button', '→', 'np-num-btn') as HTMLButtonElement
      actionBtn.addEventListener('click', () => { stage = 'ringer'; render() })
    } else {
      actionBtn = createEl('button', 'Lagre', 'np-num-btn') as HTMLButtonElement
      actionBtn.addEventListener('click', async () => {
        if (!isValidOmgangEntry(poeng, ringer)) {
          showToast(`${poeng} poeng med ${ringer} ringarar er ikkje mogleg.`, 'error')
          return
        }
        actionBtn.disabled = true
        actionBtn.textContent = 'Lagrer…'
        const saved = await step.onSave(poeng, ringer)
        if (saved) {
          advance()
        } else {
          actionBtn.disabled = false
          actionBtn.textContent = 'Lagre'
        }
      })
    }

    const stageLabel = stage === 'poeng' ? 'poeng' : 'ringarar'
    const heading = `${step.label} · omgang ${step.omgang} · ${stageLabel}`
    const current = stage === 'poeng' ? poeng : ringer
    const max = stage === 'poeng' ? OMGANG_MAX_POENG : OMGANG_MAX_RINGER

    const pad = createPad(heading, current, closeBtn, actionBtn)
    wrap.appendChild(pad)
    bindPadButtons(
      pad,
      () => (stage === 'poeng' ? poeng : ringer),
      v => { if (stage === 'poeng') poeng = v; else ringer = v },
      max,
    )
  }

  render()
  document.body.appendChild(overlay)
}
