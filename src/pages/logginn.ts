import { getUser, erAdmin } from '../utils/auth'
import { signIn, signUp } from '../services/authService'
import { escHtml } from '../utils/escHtml'

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

  container.innerHTML = `
    <div class="container py-4 konto-container">
      <h2 class="mb-4">Konto</h2>
      <ul class="nav nav-tabs mb-3" id="logginn-faner">
        <li class="nav-item">
          <button class="nav-link active" data-fane="logginn">Logg inn</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-fane="registrer">Registrer ny konto</button>
        </li>
      </ul>

      <!-- Logg inn -->
      <div id="fane-logginn">
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
        </form>
      </div>

      <!-- Registrer -->
      <div id="fane-registrer" class="d-none">
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
        </form>
      </div>
    </div>`

  // Fane-toggle
  container.querySelectorAll<HTMLElement>('[data-fane]').forEach(knapp => {
    knapp.addEventListener('click', () => {
      container.querySelectorAll('[data-fane]').forEach(k => k.classList.remove('active'))
      knapp.classList.add('active')
      const erLogginn = knapp.dataset.fane === 'logginn'
      container.querySelector('#fane-logginn')!.classList.toggle('d-none', !erLogginn)
      container.querySelector('#fane-registrer')!.classList.toggle('d-none', erLogginn)
    })
  })

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
