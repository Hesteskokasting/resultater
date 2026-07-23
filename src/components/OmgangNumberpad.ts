import { createEl } from '@/utils/createEl'
import { createNumberpadOverlay } from '@/components/ScoreNumberpad'
import { showToast } from '@/components/Toast'
import {
  isValidOmgangEntry,
  ringOptions,
  OMGANG_MAX_POENG,
  OMGANG_MAX_RINGER,
} from '@/utils/omgangValidation'

export interface OmgangEntryStep {
  /** Small teal context line above the name, e.g. "Bane 1 · Runde 2". */
  contextLabel: string
  /** Player throwing this omgang. */
  playerName: string
  /**
   * Persists the completed omgang. Runs once per step, when both poeng and
   * ringere are entered. Return false to stay on the step (failed save).
   */
  onSave: (poeng: number, antallRinger: number) => Promise<boolean>
}

interface PadState {
  stepIdx: number
  stage: 'poeng' | 'ringer'
  /** Typed poengsum as a string so leading state ("", "1", "12") is explicit. */
  poengInput: string
  selectedRinger: number | null
  isSaving: boolean
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
  if (steps.length === 0) return

  const state: PadState = { stepIdx: 0, stage: 'poeng', poengInput: '', selectedRinger: null, isSaving: false }
  const { overlay, close } = createNumberpadOverlay('onp-overlay')

  function currentPoeng(): number {
    return Math.min(OMGANG_MAX_POENG, parseInt(state.poengInput || '0'))
  }

  function advance(): void {
    state.stepIdx++
    state.stage = 'poeng'
    state.poengInput = ''
    state.selectedRinger = null
    state.isSaving = false
    if (state.stepIdx >= steps.length) {
      close()
      return
    }
    render()
  }

  function appendDigit(digit: string): void {
    const next = state.poengInput + digit
    if (parseInt(next) > OMGANG_MAX_POENG) return
    state.poengInput = state.poengInput === '0' ? digit : next
    render()
  }

  function goToRinger(): void {
    const poeng = currentPoeng()
    const { allowed, autoSelected } = ringOptions(poeng)
    if (!allowed.length) {
      showToast(`${poeng} poeng er ikkje mogleg i éin omgang.`, 'error')
      return
    }
    state.stage = 'ringer'
    state.selectedRinger = autoSelected
    render()
  }

  async function save(): Promise<void> {
    const step = steps[state.stepIdx]
    const ringer = state.selectedRinger
    if (!step || ringer == null || state.isSaving) return
    const poeng = currentPoeng()
    if (!isValidOmgangEntry(poeng, ringer)) {
      showToast(`${poeng} poeng med ${ringer} ringar er ikkje mogleg.`, 'error')
      return
    }
    state.isSaving = true
    render()
    const saved = await step.onSave(poeng, ringer)
    if (saved) {
      advance()
    } else {
      state.isSaving = false
      render()
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  function headerEls(): HTMLElement[] {
    const step = steps[state.stepIdx]!
    const handle = createEl('div', null, 'onp-handle')

    const closeBtn = createEl('button', '×', 'onp-close')
    closeBtn.addEventListener('click', close)

    const progress = createEl('div', null, 'onp-progress')
    progress.appendChild(createEl('div', null, 'onp-progress-seg active'))
    progress.appendChild(createEl('div', null, `onp-progress-seg${state.stage === 'ringer' ? ' active' : ''}`))

    const els = [handle, closeBtn, progress]

    if (state.stage === 'ringer') {
      const back = createEl('button', '← Poeng', 'onp-back')
      back.addEventListener('click', () => { state.stage = 'poeng'; state.selectedRinger = null; render() })
      els.push(back)
    }

    els.push(createEl('div', step.contextLabel, 'onp-context'))
    els.push(createEl('h3', step.playerName, 'onp-name'))
    return els
  }

  function displayBoxEl(): HTMLElement {
    const box = createEl('div', null, 'onp-display')
    box.appendChild(createEl('div', state.stage === 'poeng' ? 'Poengsum' : 'Poengsum registrert', 'onp-display-label'))
    box.appendChild(createEl('div', String(currentPoeng()), 'onp-display-value'))
    return box
  }

  function poengGridEl(): HTMLElement {
    const grid = createEl('div', null, 'onp-grid')
    for (let digit = 1; digit <= 9; digit++) {
      const btn = createEl('button', String(digit), 'onp-key')
      btn.addEventListener('click', () => appendDigit(String(digit)))
      grid.appendChild(btn)
    }
    const backspace = createEl('button', '⌫', 'onp-key onp-key-muted')
    backspace.addEventListener('click', () => { state.poengInput = state.poengInput.slice(0, -1); render() })
    grid.appendChild(backspace)

    const zero = createEl('button', '0', 'onp-key')
    zero.addEventListener('click', () => appendDigit('0'))
    grid.appendChild(zero)

    const next = createEl('button', '→', 'onp-key onp-key-action')
    next.addEventListener('click', goToRinger)
    grid.appendChild(next)
    return grid
  }

  function ringButtonEl(count: number, isAllowed: boolean): HTMLButtonElement {
    const label = count === 0 ? 'ingen ringer' : count === 1 ? 'ring' : 'ringer'
    const btn = createEl('button', null, `onp-ring-btn${count === 0 ? ' onp-ring-zero' : ''}`) as HTMLButtonElement
    btn.appendChild(createEl('span', String(count), 'onp-ring-value'))
    btn.appendChild(createEl('span', label, 'onp-ring-label'))
    btn.disabled = !isAllowed
    btn.classList.toggle('selected', state.selectedRinger === count)
    btn.addEventListener('click', () => { state.selectedRinger = count; render() })
    return btn
  }

  function ringStageEls(): HTMLElement[] {
    const { allowed } = ringOptions(currentPoeng())

    const heading = createEl('div', null, 'onp-ring-heading')
    heading.appendChild(createEl('span', 'Antall ringer', 'onp-ring-heading-main'))
    heading.appendChild(createEl('span', `(maks ${OMGANG_MAX_RINGER})`, 'onp-ring-heading-sub'))

    const grid = createEl('div', null, 'onp-ring-grid')
    for (let count = 1; count <= OMGANG_MAX_RINGER; count++) {
      grid.appendChild(ringButtonEl(count, allowed.includes(count)))
    }
    grid.appendChild(ringButtonEl(0, allowed.includes(0)))

    const register = createEl('button', state.isSaving ? 'Lagrer…' : 'Registrer og fullfør ✓', 'onp-register') as HTMLButtonElement
    register.disabled = state.selectedRinger == null || state.isSaving
    register.addEventListener('click', () => { void save() })

    return [heading, grid, register]
  }

  function render(): void {
    overlay.innerHTML = ''
    if (!steps[state.stepIdx]) return

    const card = createEl('div', null, 'onp-card')
    for (const el of headerEls()) card.appendChild(el)
    card.appendChild(displayBoxEl())
    if (state.stage === 'poeng') {
      card.appendChild(poengGridEl())
    } else {
      for (const el of ringStageEls()) card.appendChild(el)
    }
    overlay.appendChild(card)
  }

  render()
  document.body.appendChild(overlay)
}
