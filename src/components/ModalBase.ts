export interface ModalElProps {
  role: string
  labelledBy: string
  describedBy?: string
  html: string
}

/** Creates the lazily-instantiated modal root used by the dialog components. */
export function createModalEl({ role, labelledBy, describedBy, html }: ModalElProps): HTMLElement {
  const el = document.createElement('div')
  el.className = 'modal'
  el.style.display = 'none'
  el.setAttribute('role', role)
  el.setAttribute('aria-modal', 'true')
  el.setAttribute('aria-labelledby', labelledBy)
  if (describedBy) el.setAttribute('aria-describedby', describedBy)
  el.innerHTML = html
  document.body.appendChild(el)
  return el
}

export interface ModalLifecycle {
  open(el: HTMLElement, opts: { focus?: string; onEscape: () => void }): void
  close(el: HTMLElement): void
}

/** Backdrop + show/hide + Escape-key handling shared by the dialog components. */
export function createModalLifecycle(): ModalLifecycle {
  let backdrop: HTMLElement | null = null
  let onKeydown: ((e: KeyboardEvent) => void) | null = null

  return {
    open(el, { focus, onEscape }) {
      backdrop = document.createElement('div')
      backdrop.className = 'modal-backdrop show'
      document.body.appendChild(backdrop)
      document.body.classList.add('modal-open')

      el.style.display = 'block'
      el.classList.add('show')
      if (focus) el.querySelector<HTMLElement>(focus)?.focus()

      onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onEscape() } }
      document.addEventListener('keydown', onKeydown)
    },
    close(el) {
      el.classList.remove('show')
      el.style.display = 'none'
      backdrop?.remove()
      backdrop = null
      document.body.classList.remove('modal-open')
      if (onKeydown) { document.removeEventListener('keydown', onKeydown); onKeydown = null }
    },
  }
}
