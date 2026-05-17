export interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

let _el: HTMLElement | null = null
let _backdrop: HTMLElement | null = null
let _resolve: ((value: boolean) => void) | null = null
let _onKeydown: ((e: KeyboardEvent) => void) | null = null

function getEl(): HTMLElement {
  if (_el) return _el

  _el = document.createElement('div')
  _el.className = 'modal'
  _el.style.display = 'none'
  _el.setAttribute('role', 'alertdialog')
  _el.setAttribute('aria-modal', 'true')
  _el.setAttribute('aria-labelledby', 'cd-title')
  _el.setAttribute('aria-describedby', 'cd-message')
  _el.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="cd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <p class="mb-0" id="cd-message"></p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="cd-cancel"></button>
          <button type="button" class="btn btn-primary" id="cd-confirm"></button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(_el)
  _el.querySelector('#cd-cancel')!.addEventListener('click', () => { dismiss(false) })
  _el.querySelector('#cd-confirm')!.addEventListener('click', () => { dismiss(true) })
  return _el
}

function openModal(el: HTMLElement): void {
  _backdrop = document.createElement('div')
  _backdrop.className = 'modal-backdrop show'
  document.body.appendChild(_backdrop)
  document.body.classList.add('modal-open')

  el.style.display = 'block'
  el.classList.add('show')
  el.querySelector<HTMLButtonElement>('#cd-confirm')?.focus()

  _onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); dismiss(false) } }
  document.addEventListener('keydown', _onKeydown)
}

function closeModal(el: HTMLElement): void {
  el.classList.remove('show')
  el.style.display = 'none'
  _backdrop?.remove()
  _backdrop = null
  document.body.classList.remove('modal-open')
  if (_onKeydown) { document.removeEventListener('keydown', _onKeydown); _onKeydown = null }
}

function dismiss(value: boolean): void {
  if (!_el || !_resolve) return
  const resolve = _resolve
  _resolve = null
  closeModal(_el)
  resolve(value)
}

export function confirmDialog(props: ConfirmDialogProps): Promise<boolean> {
  const { title, message, confirmText = 'OK', cancelText = 'Avbryt', danger = false } = props
  const el = getEl()

  el.querySelector<HTMLElement>('#cd-title')!.textContent = title
  el.querySelector<HTMLElement>('#cd-message')!.textContent = message
  el.querySelector<HTMLButtonElement>('#cd-cancel')!.textContent = cancelText
  const confirmBtn = el.querySelector<HTMLButtonElement>('#cd-confirm')!
  confirmBtn.textContent = confirmText
  confirmBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`

  return new Promise(resolve => {
    _resolve = resolve
    openModal(el)
  })
}
