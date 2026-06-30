import { getUser, isAdmin, signIn, signUp } from '@/services/authService'
import { escHtml } from '@/utils/escHtml'
import { createTabs } from '@/components/Tabs'

function makePanel(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

export async function render(container: HTMLElement): Promise<void> {
  const auth = await getUser()
  if (auth) {
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
  outer.appendChild(createTabs({
    tabs: [
      { id: 'login',    label: 'Logg inn',           panel: loginPanel },
      { id: 'register', label: 'Registrer ny konto', panel: registerPanel },
    ],
  }))
  container.replaceChildren(outer)

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

    const redirect = new URLSearchParams(location.hash.split('?')[1] ?? '').get('redirect')
    if (redirect) {
      location.hash = `#${redirect}`
    } else {
      location.hash = (await isAdmin()) ? '#/admin' : '#/minside'
    }
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
