export interface PromptDialogProps {
  title: string
  message: string
  defaultValue?: string
  inputType?: string
}

let _el: HTMLElement | null = null
let _backdrop: HTMLElement | null = null
let _resolve: ((value: string | null) => void) | null = null
let _onKeydown: ((e: KeyboardEvent) => void) | null = null

function getEl(): HTMLElement {
  if (_el) return _el

  _el = document.createElement('div')
  _el.className = 'modal'
  _el.style.display = 'none'
  _el.setAttribute('role', 'dialog')
  _el.setAttribute('aria-modal', 'true')
  _el.setAttribute('aria-labelledby', 'pd-title')
  _el.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="pd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <label class="form-label" id="pd-message" for="pd-input"></label>
          <input type="text" class="form-control" id="pd-input" autocomplete="off" />
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="pd-cancel">Avbryt</button>
          <button type="button" class="btn btn-primary" id="pd-confirm">OK</button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(_el)
  _el.querySelector('#pd-cancel')!.addEventListener('click', () => { dismiss(null) })
  _el.querySelector('#pd-confirm')!.addEventListener('click', () => { confirm() })
  _el.querySelector('#pd-input')!.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') { e.preventDefault(); confirm() }
  })
  return _el
}

function openModal(el: HTMLElement): void {
  _backdrop = document.createElement('div')
  _backdrop.className = 'modal-backdrop show'
  document.body.appendChild(_backdrop)
  document.body.classList.add('modal-open')

  el.style.display = 'block'
  el.classList.add('show')
  el.querySelector<HTMLInputElement>('#pd-input')?.focus()

  _onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); dismiss(null) } }
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

function confirm(): void {
  const value = _el?.querySelector<HTMLInputElement>('#pd-input')?.value ?? ''
  dismiss(value)
}

function dismiss(value: string | null): void {
  if (!_el || !_resolve) return
  const resolve = _resolve
  _resolve = null
  closeModal(_el)
  resolve(value)
}

export function promptDialog(props: PromptDialogProps): Promise<string | null> {
  const { title, message, defaultValue = '', inputType = 'text' } = props
  const el = getEl()

  el.querySelector<HTMLElement>('#pd-title')!.textContent = title
  el.querySelector<HTMLElement>('#pd-message')!.textContent = message
  const input = el.querySelector<HTMLInputElement>('#pd-input')!
  input.type = inputType
  input.value = defaultValue

  return new Promise(resolve => {
    _resolve = resolve
    openModal(el)
  })
}
