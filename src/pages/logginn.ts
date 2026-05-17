import { getUser, erAdmin, signIn, signUp } from '../services/authService'
import { escHtml } from '../utils/escHtml'
import { createTabs } from '../components/Tabs'

function makePanel(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

export async function render(container: HTMLElement): Promise<void> {
  const auth = await getUser()
  if (auth) {
    container.innerHTML = `
      <div class="container py-4 konto-container">
        <p>Du er allereie innlogga som <strong>${escHtml(auth.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`
    return
  }

  const logginnPanel = makePanel(`
    <form id="logginn-skjema">
      <div class="mb-3">
        <label class="form-label" for="li-epost">E-post</label>
        <input type="email" class="form-control" id="li-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="li-passord">Passord</label>
        <input type="password" class="form-control" id="li-passord" required autocomplete="current-password">
      </div>
      <div id="li-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary w-100">Logg inn</button>
    </form>`)

  const registrerPanel = makePanel(`
    <form id="registrer-skjema">
      <div class="mb-3">
        <label class="form-label" for="reg-epost">E-post</label>
        <input type="email" class="form-control" id="reg-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord">Passord</label>
        <input type="password" class="form-control" id="reg-passord" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord2">Gjenta passord</label>
        <input type="password" class="form-control" id="reg-passord2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="reg-feil" class="alert alert-danger d-none"></div>
      <div id="reg-suksess" class="alert alert-success d-none">
        Konto oppretta! Du kan no logge inn.
      </div>
      <button type="submit" class="btn btn-success w-100">Opprett konto</button>
    </form>`)

  const outer = document.createElement('div')
  outer.className = 'container py-4 konto-container'
  const heading = document.createElement('h2')
  heading.className = 'mb-4'
  heading.textContent = 'Konto'
  outer.appendChild(heading)
  outer.appendChild(createTabs({
    tabs: [
      { id: 'logginn',   label: 'Logg inn',           panel: logginnPanel },
      { id: 'registrer', label: 'Registrer ny konto', panel: registrerPanel },
    ],
  }))
  container.replaceChildren(outer)

  // Logg inn
  container.querySelector('#logginn-skjema')!.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const feil = container.querySelector<HTMLElement>('#li-feil')!
    feil.classList.add('d-none')
    const knapp = form.querySelector<HTMLButtonElement>('[type=submit]')!
    knapp.disabled = true

    const { error } = await signIn(
      (container.querySelector<HTMLInputElement>('#li-epost')!).value.trim(),
      (container.querySelector<HTMLInputElement>('#li-passord')!).value,
    )

    if (error) {
      feil.textContent = error.message === 'Invalid login credentials'
        ? 'Feil e-post eller passord.'
        : error.message
      feil.classList.remove('d-none')
      knapp.disabled = false
      return
    }

    const redirect = new URLSearchParams(location.hash.split('?')[1] ?? '').get('redirect')
    if (redirect) {
      location.hash = `#${redirect}`
    } else {
      location.hash = (await erAdmin()) ? '#/admin' : '#/minside'
    }
  })

  // Registrer
  container.querySelector('#registrer-skjema')!.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const feil    = container.querySelector<HTMLElement>('#reg-feil')!
    const suksess = container.querySelector<HTMLElement>('#reg-suksess')!
    feil.classList.add('d-none')
    suksess.classList.add('d-none')

    const passord  = (container.querySelector<HTMLInputElement>('#reg-passord')!).value
    const passord2 = (container.querySelector<HTMLInputElement>('#reg-passord2')!).value
    if (passord !== passord2) {
      feil.textContent = 'Passorda er ikkje like.'
      feil.classList.remove('d-none')
      return
    }

    const knapp = form.querySelector<HTMLButtonElement>('[type=submit]')!
    knapp.disabled = true

    const email = (container.querySelector<HTMLInputElement>('#reg-epost')!).value.trim()

    const { error: signUpError } = await signUp(email, passord)
    if (signUpError) {
      feil.textContent = signUpError.message
      feil.classList.remove('d-none')
      knapp.disabled = false
      return
    }

    await signIn(email, passord)
    location.hash = '#/minside'
  })
}
