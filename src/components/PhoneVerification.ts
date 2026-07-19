import { invalidateUserCache, updatePhone, verifyPhoneChange } from '@/services/authService'
import { showToast } from '@/components/Toast'
import { normalizePhoneE164 } from '@/utils/phone'
import { escHtml } from '@/utils/escHtml'

export interface PhoneVerificationProps {
  heading?: string
  description?: string
  onVerified: () => void
}

const RESEND_COOLDOWN_SECONDS = 60

function errorMessage(error: unknown): string {
  const code = error !== null && typeof error === 'object' && 'code' in error ? (error as { code?: unknown }).code : null
  switch (code) {
    case 'otp_expired': return 'Feil eller utgått kode. Prøv igjen eller be om ny kode.'
    case 'phone_exists': return 'Dette telefonnummeret er allereie i bruk på ein annan konto.'
    case 'over_sms_send_rate_limit': return 'For mange SMS-forsøk. Vent litt før du prøver igjen.'
    case 'sms_send_failed': return 'Klarte ikkje å sende SMS. Prøv igjen seinare.'
    default: return 'Noko gjekk gale. Prøv igjen.'
  }
}

let instanceCounter = 0

/**
 * Two-step phone verification card: enter a number, then confirm the SMS code
 * (GoTrue phone_change flow). Calls onVerified after the number is confirmed.
 */
export function createPhoneVerification(props: PhoneVerificationProps): HTMLElement {
  const idPrefix = `pv-${++instanceCounter}`
  const el = document.createElement('div')
  el.className = 'card phone-verify mb-4'
  el.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${escHtml(props.heading ?? 'Verifiser telefonnummer')}</h5>
      ${props.description ? `<p class="card-text text-muted">${escHtml(props.description)}</p>` : ''}
      <div class="phone-verify__step" data-step="phone">
        <label class="form-label" for="${idPrefix}-phone">Telefonnummer</label>
        <input type="tel" class="form-control mb-2" id="${idPrefix}-phone" autocomplete="tel" placeholder="912 34 567">
        <button type="button" class="btn btn-primary" data-action="send">Send kode</button>
      </div>
      <div class="phone-verify__step d-none" data-step="code">
        <p class="mb-2">Vi har sendt ein kode på SMS til <strong data-role="phone-label"></strong>.</p>
        <label class="form-label" for="${idPrefix}-code">Kode</label>
        <input type="text" class="form-control mb-2 phone-verify__code" id="${idPrefix}-code"
               inputmode="numeric" autocomplete="one-time-code" maxlength="6">
        <div class="phone-verify__actions">
          <button type="button" class="btn btn-primary" data-action="verify">Stadfest</button>
          <button type="button" class="btn btn-link" data-action="resend">Send ny kode</button>
          <button type="button" class="btn btn-link" data-action="change">Endre nummer</button>
        </div>
      </div>
      <div class="alert alert-danger mt-2 d-none" data-role="error"></div>
    </div>`

  const phoneStep = el.querySelector<HTMLElement>('[data-step="phone"]')!
  const codeStep = el.querySelector<HTMLElement>('[data-step="code"]')!
  const phoneInput = el.querySelector<HTMLInputElement>(`#${idPrefix}-phone`)!
  const codeInput = el.querySelector<HTMLInputElement>(`#${idPrefix}-code`)!
  const phoneLabel = el.querySelector<HTMLElement>('[data-role="phone-label"]')!
  const errorBox = el.querySelector<HTMLElement>('[data-role="error"]')!
  const sendBtn = el.querySelector<HTMLButtonElement>('[data-action="send"]')!
  const verifyBtn = el.querySelector<HTMLButtonElement>('[data-action="verify"]')!
  const resendBtn = el.querySelector<HTMLButtonElement>('[data-action="resend"]')!
  const changeBtn = el.querySelector<HTMLButtonElement>('[data-action="change"]')!

  let currentPhone = ''
  let cooldownTimer: number | null = null

  function showError(message: string): void {
    errorBox.textContent = message
    errorBox.classList.remove('d-none')
  }

  function clearError(): void {
    errorBox.classList.add('d-none')
  }

  function stopCooldown(): void {
    if (cooldownTimer !== null) { clearInterval(cooldownTimer); cooldownTimer = null }
    resendBtn.disabled = false
    resendBtn.textContent = 'Send ny kode'
  }

  function startCooldown(): void {
    let remaining = RESEND_COOLDOWN_SECONDS
    resendBtn.disabled = true
    resendBtn.textContent = `Send ny kode (${remaining}s)`
    cooldownTimer = window.setInterval(() => {
      if (!el.isConnected) { stopCooldown(); return }
      remaining -= 1
      if (remaining <= 0) { stopCooldown(); return }
      resendBtn.textContent = `Send ny kode (${remaining}s)`
    }, 1000)
  }

  async function sendCode(): Promise<void> {
    clearError()
    const normalized = normalizePhoneE164(phoneInput.value)
    if (!normalized) {
      showError('Ugyldig telefonnummer.')
      return
    }
    sendBtn.disabled = true
    resendBtn.disabled = true
    const { error } = await updatePhone(normalized)
    sendBtn.disabled = false
    if (error) {
      resendBtn.disabled = false
      showError(errorMessage(error))
      return
    }
    currentPhone = normalized
    phoneLabel.textContent = normalized
    phoneStep.classList.add('d-none')
    codeStep.classList.remove('d-none')
    codeInput.value = ''
    codeInput.focus()
    startCooldown()
  }

  async function verifyCode(): Promise<void> {
    clearError()
    const token = codeInput.value.trim()
    if (!/^\d{6}$/.test(token)) {
      showError('Koden er på 6 siffer.')
      return
    }
    verifyBtn.disabled = true
    const { error } = await verifyPhoneChange(currentPhone, token)
    verifyBtn.disabled = false
    if (error) {
      showError(errorMessage(error))
      return
    }
    stopCooldown()
    invalidateUserCache()
    showToast('Telefonnummeret er verifisert.', 'success')
    props.onVerified()
  }

  sendBtn.addEventListener('click', () => { void sendCode() })
  verifyBtn.addEventListener('click', () => { void verifyCode() })
  resendBtn.addEventListener('click', () => { void sendCode() })
  changeBtn.addEventListener('click', () => {
    clearError()
    stopCooldown()
    codeStep.classList.add('d-none')
    phoneStep.classList.remove('d-none')
    phoneInput.focus()
  })
  phoneInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); void sendCode() }
  })
  codeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); void verifyCode() }
  })

  return el
}
