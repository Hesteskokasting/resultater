import { kasterNavn, lagKasterSlug } from '../utils/kaster'
import { getUser } from '../services/authService'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { createEmptyState } from '../components/EmptyState'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { formaterDato } from '../utils/shared'
import { hentKastereListeAktive, hentKasterForKobling } from '../services/kasterService'
import { hentMinePameldingar } from '../services/pameldingService'
import { hentMineKampar } from '../services/kampService'
import { sendKoblingForespørsel } from '../services/brukerProfilService'
import type { Rolle, KoblingStatus } from '../types'
import type { PameldingRow } from '../services/pameldingService'
import type { KampSpelarRow } from '../services/kampService'
import type { KasterListeRow } from '../services/kasterService'

const rolleLabel: Record<Rolle, string> = {
  admin: 'Administrator',
  klubbadmin: 'Klubbadministrator',
  bruker: 'Brukar',
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function ikkjeKoblaHtml(status: KoblingStatus): string {
  return `
    ${status === 'avvist' ? '<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>' : ''}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på namn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`
}

function ventarHtml(): string {
  return '<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>'
}

async function koblaKortHtml(kasterid: number): Promise<string> {
  const { data, error } = await hentKasterForKobling(kasterid)
  if (error || !data) return ''
  return `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${escHtml(kasterNavn(data))}</strong> · ${escHtml(data.klubb?.navn ?? '')}</p>
        <a href="#/kastere/${lagKasterSlug(data)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`
}

async function pameldingListeHtml(brukerId: string): Promise<string> {
  const { data, error } = await hentMinePameldingar(brukerId)
  if (error) return '<p class="text-muted">Kunne ikkje laste påmeldingar.</p>'
  if (!data.length) return '<p class="empty-state">Ingen påmeldingar enno.</p>'

  const sortert = [...data].sort((a: PameldingRow, b: PameldingRow) =>
    (a.stevne?.dato ?? '').localeCompare(b.stevne?.dato ?? ''),
  )

  const rader = sortert.map(p => {
    const dato = formaterDato(p.stevne?.dato)
    return `<tr>
      <td><a href="#/stevne/${p.stevne?.id ?? ''}/pamelding">${escHtml(p.stevne?.navn ?? '')}</a></td>
      <td>${escHtml(dato)}</td>
      <td><a href="#/stevne/${p.stevne?.id ?? ''}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`
  }).join('')

  return `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${rader}</tbody>
        </table>
      </div>
    </div>`
}

async function mineKamparHtml(kasterid: number): Promise<string> {
  const { data, error } = await hentMineKampar(kasterid)
  if (error) return '<p class="text-muted">Kunne ikkje laste kampar.</p>'

  const alleKampar = data.filter(ks => !ks.kamp?.er_walkover)

  const kommande = alleKampar
    .filter(ks => ks.kamp?.stevne?.erfullfort === false && !ks.kamp?.er_bekreftet)
    .sort((a, b) => (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0))

  const ferdige = alleKampar
    .filter(ks => ks.kamp?.er_bekreftet)
    .sort((a, b) => (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0))

  const tabellHoaude = `<thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead>`

  const lagKampRad = (ks: KampSpelarRow, knapp: string): string => {
    const kamp = ks.kamp
    const motstandar = (kamp?.spelarar ?? []).find(s => s.kasterid !== kasterid)
    const motstandarNamn = motstandar?.kaster
      ? escHtml(`${motstandar.kaster.fornavn} ${motstandar.kaster.etternavn}`)
      : '–'
    return `<tr>
      <td>R${kamp?.runde_nummer ?? ''} / B${kamp?.bane_nummer ?? ''}</td>
      <td>${motstandarNamn}</td>
      <td>${knapp}</td>
    </tr>`
  }

  const grupperPerStevne = (
    kampar: KampSpelarRow[],
    lagKnapp: (ks: KampSpelarRow) => string,
  ): string | null => {
    if (!kampar.length) return null
    const grupper = new Map<number | string, { namn: string; kampar: KampSpelarRow[] }>()
    for (const ks of kampar) {
      const stevneId = ks.kamp?.stevneid ?? 'ukjent'
      const stevneNamn = ks.kamp?.stevne?.navn ?? ''
      if (!grupper.has(stevneId)) grupper.set(stevneId, { namn: stevneNamn, kampar: [] })
      grupper.get(stevneId)!.kampar.push(ks)
    }
    return [...grupper.values()].map(({ namn, kampar: grp }) => `
      <p class="fw-semibold mb-1 mt-2">${escHtml(namn)}</p>
      <table class="table table-sm mb-3">${tabellHoaude}<tbody>
        ${grp.map(ks => lagKampRad(ks, lagKnapp(ks))).join('')}
      </tbody></table>`
    ).join('')
  }

  const kommandeInnhald = grupperPerStevne(
    kommande,
    ks => `<a href="#/kamp/${ks.kamp?.id ?? ''}" class="btn btn-sm btn-primary">Scoreboard</a>`,
  )
  const ferdigeInnhald = grupperPerStevne(
    ferdige,
    ks => `<a href="#/kamp/${ks.kamp?.id ?? ''}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`,
  )

  return `
    <div class="card mb-4" id="mine-kampar-seksjon">
      <div class="card-body">
        <h5 class="card-title">Mine kampar</h5>
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" data-fane="kommande">Kommande (${kommande.length})</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-fane="ferdige">Ferdige (${ferdige.length})</button>
          </li>
        </ul>
        <div id="fane-kommande">
          ${kommandeInnhald ?? '<p class="text-muted">Ingen kommande kampar.</p>'}
        </div>
        <div id="fane-ferdige" class="d-none">
          ${ferdigeInnhald ?? '<p class="text-muted">Ingen ferdige kampar enno.</p>'}
        </div>
      </div>
    </div>`
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindMineKampar(container: HTMLElement): void {
  container.querySelectorAll<HTMLButtonElement>('[data-fane]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-fane]').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const fane = btn.dataset.fane
      container.querySelector('#fane-kommande')!.classList.toggle('d-none', fane !== 'kommande')
      container.querySelector('#fane-ferdige')!.classList.toggle('d-none', fane !== 'ferdige')
    })
  })
}

function bindKasterSok(container: HTMLElement, brukerId: string): void {
  let timer: number | null = null
  let kastereCache: KasterListeRow[] | null = null
  const sokInput = container.querySelector<HTMLInputElement>('#kaster-sok')!
  const treffDiv = container.querySelector<HTMLElement>('#kaster-treff')!
  const feilDiv  = container.querySelector<HTMLElement>('#kasting-feil')!

  sokInput.addEventListener('input', () => {
    if (timer !== null) clearTimeout(timer)
    const q = sokInput.value.trim().toLowerCase()
    if (q.length < 2) { treffDiv.innerHTML = ''; return }

    timer = setTimeout(async () => {
      if (!kastereCache) {
        const { data } = await hentKastereListeAktive()
        kastereCache = data
      }
      const treff = kastereCache
        .filter(k => k.fornavn.toLowerCase().includes(q) || k.etternavn.toLowerCase().includes(q))
        .slice(0, 8)

      if (!treff.length) {
        const el = createEmptyState('Ingen treff.')
        el.classList.add('small')
        treffDiv.replaceChildren(el)
        return
      }
      treffDiv.innerHTML = treff.map(k =>
        `<button class="list-group-item list-group-item-action" data-id="${k.id}">
          ${escHtml(kasterNavn(k))} <span class="text-muted small">· ${escHtml(k.klubb?.navn ?? '')}</span>
        </button>`
      ).join('')
    }, 300)
  })

  treffDiv.addEventListener('click', async e => {
    const knapp = (e.target as Element).closest<HTMLElement>('[data-id]')
    if (!knapp) return
    feilDiv.classList.add('d-none')

    const { error } = await sendKoblingForespørsel(brukerId, Number(knapp.dataset.id))
    if (error) {
      feilDiv.textContent = 'Kunne ikkje sende forespørsel.'
      feilDiv.classList.remove('d-none')
      return
    }
    location.reload()
  })
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState('Laster min side…'))

  try {
    const auth = await getUser()
    if (!auth) { location.hash = '#/logginn'; return }

    const { profil, user } = auth
    const status: KoblingStatus = profil?.kobling_status ?? 'ingen'
    const rolleNamn = profil ? rolleLabel[profil.rolle] : 'Ukjent'

    let html = `
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${escHtml(user.email ?? '')} · <span class="badge bg-secondary">${escHtml(rolleNamn)}</span></p>`

    if (status === 'ingen' || status === 'avvist') {
      html += ikkjeKoblaHtml(status)
    } else if (status === 'venter') {
      html += ventarHtml()
    } else if (status === 'godkjent' && profil?.kasterid) {
      const kasterid = profil.kasterid
      const [kasterHtml, pamHtml, kampHtml] = await Promise.all([
        koblaKortHtml(kasterid),
        pameldingListeHtml(user.id),
        mineKamparHtml(kasterid),
      ])
      html += kasterHtml + pamHtml + kampHtml
    }

    html += '</div>'
    container.innerHTML = html

    if (status === 'ingen' || status === 'avvist') {
      bindKasterSok(container, user.id)
    }
    if (status === 'godkjent' && profil?.kasterid) {
      bindMineKampar(container)
    }
  } catch (err) {
    logError('minside.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste min side.'))
  }
}
