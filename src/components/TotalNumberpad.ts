import { createEl } from '@/utils/createEl'
import { createNumberpadOverlay } from '@/components/ScoreNumberpad'
import { showToast } from '@/components/Toast'
import {
  isValidTotalEntry,
  totalMaxPoeng,
  totalMaxRinger,
} from '@/utils/omgangValidation'

export interface TotalEntry {
  /** Small teal context line, e.g. "Bane 1 · Totalsum". */
  contextLabel: string
  playerName: string
  /** Omgang count for the format — drives the max poeng/ringere and validity. */
  antallOmganger: number
  initialPoeng?: number
  initialRinger?: number
  /** Persists the total. Return false to stay open (failed save). */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>
}

/**
 * Two-stage digit pad for a directly-entered X-kast/Kongelag total: poengsum
 * first (0..antallOmganger×20), then ringere (0..×4). Unlike the per-omgang
 * pad, ringere is digit entry — a full total can hold far more than 4 rings.
 * The pair is validated against the aggregate shoe model before saving.
 */
export function showTotalNumberpad(entry: TotalEntry): void {
  const maxPoeng = totalMaxPoeng(entry.antallOmganger)
  const maxRinger = totalMaxRinger(entry.antallOmganger)

  let stage: 'poeng' | 'ringer' = 'poeng'
  let poengInput = entry.initialPoeng != null ? String(entry.initialPoeng) : ''
  let ringerInput = entry.initialRinger != null ? String(entry.initialRinger) : ''
  let isSaving = false

  const { overlay, close } = createNumberpadOverlay('onp-overlay')

  const currentMax = (): number => (stage === 'poeng' ? maxPoeng : maxRinger)
  const currentInput = (): string => (stage === 'poeng' ? poengInput : ringerInput)
  const currentValue = (): number => parseInt(currentInput() || '0')

  function appendDigit(digit: string): void {
    const next = currentInput() + digit
    if (parseInt(next) > currentMax()) return
    const normalized = currentInput() === '0' ? digit : next
    if (stage === 'poeng') poengInput = normalized
    else ringerInput = normalized
    render()
  }

  function backspace(): void {
    if (stage === 'poeng') poengInput = poengInput.slice(0, -1)
    else ringerInput = ringerInput.slice(0, -1)
    render()
  }

  async function save(): Promise<void> {
    if (isSaving) return
    const poeng = parseInt(poengInput || '0')
    const ringer = parseInt(ringerInput || '0')
    if (!isValidTotalEntry(poeng, ringer, entry.antallOmganger)) {
      showToast(`${poeng} poeng med ${ringer} ringar er ikkje mogleg.`, 'error')
      return
    }
    isSaving = true
    render()
    const saved = await entry.onSave(poeng, ringer)
    if (saved) close()
    else { isSaving = false; render() }
  }

  function digitGridEl(actionLabel: string, onAction: () => void): HTMLElement {
    const grid = createEl('div', null, 'onp-grid')
    for (let digit = 1; digit <= 9; digit++) {
      const btn = createEl('button', String(digit), 'onp-key')
      btn.addEventListener('click', () => appendDigit(String(digit)))
      grid.appendChild(btn)
    }
    const back = createEl('button', '⌫', 'onp-key onp-key-muted')
    back.addEventListener('click', backspace)
    grid.appendChild(back)

    const zero = createEl('button', '0', 'onp-key')
    zero.addEventListener('click', () => appendDigit('0'))
    grid.appendChild(zero)

    const action = createEl('button', actionLabel, 'onp-key onp-key-action') as HTMLButtonElement
    action.disabled = isSaving
    action.addEventListener('click', onAction)
    grid.appendChild(action)
    return grid
  }

  function render(): void {
    overlay.innerHTML = ''
    const card = createEl('div', null, 'onp-card')

    card.appendChild(createEl('div', null, 'onp-handle'))
    const closeBtn = createEl('button', '×', 'onp-close')
    closeBtn.addEventListener('click', close)
    card.appendChild(closeBtn)

    const progress = createEl('div', null, 'onp-progress')
    progress.appendChild(createEl('div', null, 'onp-progress-seg active'))
    progress.appendChild(createEl('div', null, `onp-progress-seg${stage === 'ringer' ? ' active' : ''}`))
    card.appendChild(progress)

    if (stage === 'ringer') {
      const backLink = createEl('button', '← Poeng', 'onp-back')
      backLink.addEventListener('click', () => { stage = 'poeng'; render() })
      card.appendChild(backLink)
    }

    card.appendChild(createEl('div', entry.contextLabel, 'onp-context'))
    card.appendChild(createEl('h3', entry.playerName, 'onp-name'))

    const box = createEl('div', null, 'onp-display')
    box.appendChild(createEl('div', stage === 'poeng' ? `Poengsum (maks ${maxPoeng})` : `Ringere (maks ${maxRinger})`, 'onp-display-label'))
    box.appendChild(createEl('div', String(currentValue()), 'onp-display-value'))
    card.appendChild(box)

    if (stage === 'poeng') {
      card.appendChild(digitGridEl('→', () => { stage = 'ringer'; render() }))
    } else {
      card.appendChild(digitGridEl(isSaving ? '…' : '✓', () => { void save() }))
    }

    overlay.appendChild(card)
  }

  render()
  document.body.appendChild(overlay)
}
