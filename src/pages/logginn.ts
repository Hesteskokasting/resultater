import { Capacitor } from '@capacitor/core'
import { GOOGLE_SIGN_IN_PENDING_KEY, getUser, isAdmin, signIn, signInWithApple, signInWithGoogle, signUp } from '@/services/authService'
import { escHtml } from '@/utils/escHtml'
import { createTabs } from '@/components/Tabs'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'

function makePanel(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

function getHashQueryParam(name: string): string | null {
  return new URLSearchParams(location.hash.split('?')[1] ?? '').get(name)
}

function getRedirectParam(): string | null {
  return getHashQueryParam('redirect')
}

async function resolvePostLoginDestination(redirect: string | null): Promise<string> {
  return redirect ? `#${redirect}` : ((await isAdmin()) ? '#/admin' : '#/minside')
}

export async function render(container: HTMLElement): Promise<void> {
  const oauthParams = new URLSearchParams(window.location.search)
  const oauthError = oauthParams.get('error_description') ?? oauthParams.get('error')
  if (oauthError) {
    showToast(oauthError, 'error')
    const url = new URL(window.location.href)
    url.search = ''
    window.history.replaceState(null, '', url.toString())
  }

  const auth = await getUser()
  if (auth) {
    const redirect = getRedirectParam()
    const returningFromGoogle = sessionStorage.getItem(GOOGLE_SIGN_IN_PENDING_KEY) === '1'
    if (returningFromGoogle) sessionStorage.removeItem(GOOGLE_SIGN_IN_PENDING_KEY)
    if (redirect || returningFromGoogle) {
      location.hash = await resolvePostLoginDestination(redirect)
      return
    }
    container.innerHTML = `
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${escHtml(auth.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`
    return
  }

  const loginPanel = makePanel(`
    <form id="login-form">
      <div class="mb-3">
        <label class="form-label" for="li-email">E-post</label>
        <input type="email" class="form-control" id="li-email" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="li-password">Passord</label>
        <input type="password" class="form-control" id="li-password" required autocomplete="current-password">
      </div>
      <div id="li-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary w-100">Logg inn</button>
    </form>`)

  const registerPanel = makePanel(`
    <form id="register-form">
      <div class="mb-3">
        <label class="form-label" for="reg-email">E-post</label>
        <input type="email" class="form-control" id="reg-email" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-password">Passord</label>
        <input type="password" class="form-control" id="reg-password" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-password2">Gjenta passord</label>
        <input type="password" class="form-control" id="reg-password2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="reg-error" class="alert alert-danger d-none"></div>
      <div id="reg-success" class="alert alert-success d-none">
        Konto oppretta! Du kan no logge inn.
      </div>
      <button type="submit" class="btn btn-success w-100">Opprett konto</button>
    </form>`)

  const outer = document.createElement('div')
  outer.className = 'container py-4 account-container'
  const heading = document.createElement('h2')
  heading.className = 'mb-4'
  heading.textContent = 'Konto'
  outer.appendChild(heading)

  function createSocialLoginButton(label: string, className: string, signInFn: () => Promise<{ error: { message: string } | null }>): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `btn ${className} w-100`
    button.textContent = label
    button.addEventListener('click', async () => {
      button.disabled = true
      const { error } = await signInFn()
      if (error) {
        logError('logginn.socialLogin', error)
        showToast(error.message, 'error')
        button.disabled = false
        return
      }
      // Web: signInWithOAuth already navigated the browser away, so this line never
      // runs there. Native: the sign-in resolved a session directly with no
      // redirect to hang navigation off, so this handler must navigate itself.
      if (Capacitor.isNativePlatform()) {
        location.hash = await resolvePostLoginDestination(getRedirectParam())
      }
    })
    return button
  }

  outer.appendChild(createSocialLoginButton(
    'Logg inn med Google', 'btn-google', () => signInWithGoogle(getRedirectParam() ?? undefined),
  ))
  // App Store guideline 4.8: offering Google sign-in on iOS requires offering
  // Apple sign-in too. Native-only flow, so the button is iOS-only.
  if (Capacitor.getPlatform() === 'ios') {
    outer.appendChild(createSocialLoginButton(' Logg inn med Apple', 'btn-apple mt-2', signInWithApple))
  }

  const divider = document.createElement('div')
  divider.className = 'account-divider'
  divider.textContent = 'eller'
  outer.appendChild(divider)

  outer.appendChild(createTabs({
    tabs: [
      { id: 'login',    label: 'Logg inn',           panel: loginPanel },
      { id: 'register', label: 'Registrer ny konto', panel: registerPanel },
    ],
  }))
  container.replaceChildren(outer)

  const prefillEmail = getHashQueryParam('email')
  if (prefillEmail) {
    container.querySelector<HTMLInputElement>('#li-email')!.value = prefillEmail
    container.querySelector<HTMLInputElement>('#li-password')!.focus()
  }

  container.querySelector('#login-form')!.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const error = container.querySelector<HTMLElement>('#li-error')!
    error.classList.add('d-none')
    const button = form.querySelector<HTMLButtonElement>('[type=submit]')!
    button.disabled = true

    const { error: signInError } = await signIn(
      (container.querySelector<HTMLInputElement>('#li-email')!).value.trim(),
      (container.querySelector<HTMLInputElement>('#li-password')!).value,
    )

    if (signInError) {
      error.textContent = signInError.message === 'Invalid login credentials'
        ? 'Feil e-post eller passord.'
        : signInError.message
      error.classList.remove('d-none')
      button.disabled = false
      return
    }

    location.hash = await resolvePostLoginDestination(getRedirectParam())
  })

  container.querySelector('#register-form')!.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const error   = container.querySelector<HTMLElement>('#reg-error')!
    const success = container.querySelector<HTMLElement>('#reg-success')!
    error.classList.add('d-none')
    success.classList.add('d-none')

    const password  = (container.querySelector<HTMLInputElement>('#reg-password')!).value
    const password2 = (container.querySelector<HTMLInputElement>('#reg-password2')!).value
    if (password !== password2) {
      error.textContent = 'Passorda er ikkje like.'
      error.classList.remove('d-none')
      return
    }

    const button = form.querySelector<HTMLButtonElement>('[type=submit]')!
    button.disabled = true

    const email = (container.querySelector<HTMLInputElement>('#reg-email')!).value.trim()

    const { error: signUpError } = await signUp(email, password)
    if (signUpError) {
      error.textContent = signUpError.message
      error.classList.remove('d-none')
      button.disabled = false
      return
    }

    await signIn(email, password)
    location.hash = '#/minside'
  })
}
