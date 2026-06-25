import { createModalEl, createModalLifecycle } from '@/components/ModalBase'
import { signIn, getLastKnownEmail } from '@/services/authService'
import { showToast } from '@/components/Toast'

let _el: HTMLElement | null = null
let _isOpen = false
const _modal = createModalLifecycle()

function getEl(): HTMLElement {
  if (_el) return _el

  _el = createModalEl({
    role: 'dialog',
    labelledBy: 'reauth-title',
    describedBy: 'reauth-message',
    html: `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="reauth-title">Sesjonen din er utløpt</h5>
        </div>
        <form id="reauth-skjema">
          <div class="modal-body pt-2">
            <p class="mb-3" id="reauth-message">Logg inn igjen for å halde fram. Arbeidet ditt på sida er teke vare på.</p>
            <div class="mb-3">
              <label class="form-label" for="reauth-epost">E-post</label>
              <input type="email" class="form-control" id="reauth-epost" required autocomplete="email">
            </div>
            <div class="mb-3">
              <label class="form-label" for="reauth-passord">Passord</label>
              <input type="password" class="form-control" id="reauth-passord" required autocomplete="current-password">
            </div>
            <div id="reauth-feil" class="alert alert-danger d-none" role="alert"></div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" id="reauth-avbryt">Hald fram utan innlogging</button>
            <button type="submit" class="btn btn-primary" id="reauth-logginn">Logg inn</button>
          </div>
        </form>
      </div>
    </div>
  `,
  })

  _el.querySelector('#reauth-avbryt')!.addEventListener('click', () => { dismiss() })
  _el.querySelector('#reauth-skjema')!.addEventListener('submit', (e) => {
    e.preventDefault()
    void handleSubmit()
  })
  return _el
}

async function handleSubmit(): Promise<void> {
  if (!_el) return
  const feil = _el.querySelector<HTMLElement>('#reauth-feil')!
  const knapp = _el.querySelector<HTMLButtonElement>('#reauth-logginn')!
  const epost = _el.querySelector<HTMLInputElement>('#reauth-epost')!.value.trim()
  const passord = _el.querySelector<HTMLInputElement>('#reauth-passord')!.value

  feil.classList.add('d-none')
  knapp.disabled = true

  const { error } = await signIn(epost, passord)

  if (error) {
    feil.textContent = error.message === 'Invalid login credentials'
      ? 'Feil e-post eller passord.'
      : error.message
    feil.classList.remove('d-none')
    knapp.disabled = false
    return
  }

  knapp.disabled = false
  close()
  showToast('Du er logga inn igjen.', 'success')
}

/** Dismisses without re-authenticating (e.g. a logged-out viewer just browsing). */
function dismiss(): void {
  close()
}

function close(): void {
  if (!_el || !_isOpen) return
  _isOpen = false
  _el.querySelector<HTMLInputElement>('#reauth-passord')!.value = ''
  _el.querySelector<HTMLElement>('#reauth-feil')!.classList.add('d-none')
  _modal.close(_el)
}

/** Opens the in-place re-auth modal. Idempotent: a no-op while already open. */
export function showReauthModal(): void {
  if (_isOpen) return
  const el = getEl()
  el.querySelector<HTMLInputElement>('#reauth-epost')!.value = getLastKnownEmail() ?? ''
  _isOpen = true
  _modal.open(el, { focus: '#reauth-passord', onEscape: () => { dismiss() } })
}
