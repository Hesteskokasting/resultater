import { getUser } from '../services/authService'
import { formaterDato } from '../utils/shared'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { hentStevneForPamelding, hentRelaterteStevner } from '../services/stevneService'
import { hentKastereListeAktive, hentKastereForKlubbar } from '../services/kasterService'
import {
  hentPameldingarForStevne,
  meldPaStevne,
  fjernPamelding,
} from '../services/pameldingService'
import type { PameldingMedKasterRow } from '../services/pameldingService'
import type { KasterListeRow } from '../services/kasterService'
import type { RelatertStevneRow } from '../services/stevneService'
import type { AuthUser } from '../types'

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function eigetSkjemaHtml(
  auth: AuthUser | null,
  erPrivilegert: boolean,
  erKobla: boolean,
  erPameldt: boolean,
  erfullfort: boolean,
  stevneId: number,
): string {
  if (!auth) {
    return `<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${stevneId}/pamelding">Logg inn</a> for å melde deg på.
    </div>`
  }
  if (!erKobla && !erPrivilegert) {
    return `<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`
  }
  if (erfullfort) {
    return `<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`
  }
  if (erKobla && erPameldt) {
    return `
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="avmeld-knapp" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`
  }
  if (erKobla) {
    return `
      <form id="pamelding-skjema" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="pm-feil" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`
  }
  return ''
}

function adminSkjemaHtml(
  erPrivilegert: boolean,
  erfullfort: boolean,
  pameldingar: PameldingMedKasterRow[],
  klubbKastere: KasterListeRow[],
): string {
  if (!erPrivilegert || erfullfort) return ''
  const allereie = new Set(pameldingar.map(p => p.kasterid))
  const tilgjengelige = klubbKastere.filter(k => !allereie.has(k.id))
  const kasterOpt = tilgjengelige.map(k =>
    `<option value="${k.id}">${escHtml(k.etternavn)}, ${escHtml(k.fornavn)} — ${escHtml(k.klubb?.navn ?? '')}</option>`
  ).join('')
  return `
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${kasterOpt}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`
}

function relaterteStevnerHtml(relaterte: RelatertStevneRow[]): string {
  if (!relaterte.length) return ''
  const items = relaterte.map(s => {
    const d = s.dato ? formaterDato(s.dato) : ''
    return `<li><a href="#/stevne/${s.id}/pamelding">${escHtml(s.navn ?? '')} — ${d}</a></li>`
  }).join('')
  return `
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">${items}</ul>
    </div>`
}

function pameldingListeHtml(pameldingar: PameldingMedKasterRow[], erPrivilegert: boolean): string {
  if (!pameldingar.length) return '<p class="empty-state">Ingen påmeldingar enno.</p>'
  const rader = pameldingar.map(p => `<tr>
    <td>${p.kaster
      ? `<a href="#/kastere/${p.kaster.id}">${escHtml(p.kaster.fornavn)} ${escHtml(p.kaster.etternavn)}</a>`
      : '—'
    }</td>
    <td>${escHtml(p.kaster?.klubb?.navn ?? '')}</td>
    ${erPrivilegert ? `<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${p.id}">Fjern</button></td>` : ''}
  </tr>`).join('')
  return `<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${erPrivilegert ? '<th></th>' : ''}</tr></thead>
    <tbody>${rader}</tbody>
  </table>`
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindEventHandlers(
  container: HTMLElement,
  params: Record<string, string>,
  pameldingar: PameldingMedKasterRow[],
  kasterid: number | null,
  brukerId: string,
  stevneId: number,
): void {
  const pmSkjema = container.querySelector<HTMLFormElement>('#pamelding-skjema')
  pmSkjema?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const feil = container.querySelector<HTMLElement>('#pm-feil')!
    feil.classList.add('d-none')
    if (kasterid == null) return
    const { error } = await meldPaStevne(stevneId, kasterid, brukerId)
    if (error) {
      feil.textContent = 'Feil ved påmelding.'
      feil.classList.remove('d-none')
      return
    }
    render(container, params)
  })

  const adminSkjema = container.querySelector<HTMLFormElement>('#admin-pamelding-skjema')
  adminSkjema?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const feil = container.querySelector<HTMLElement>('#admin-pm-feil')!
    feil.classList.add('d-none')
    const fd = new FormData(adminSkjema)
    const velgtKasterid = Number(fd.get('admin_kasterid'))
    if (!velgtKasterid) {
      feil.textContent = 'Vel ein utøvar.'
      feil.classList.remove('d-none')
      return
    }
    const { error } = await meldPaStevne(stevneId, velgtKasterid, brukerId)
    if (error) {
      feil.textContent = 'Feil ved påmelding.'
      feil.classList.remove('d-none')
      return
    }
    render(container, params)
  })

  container.querySelector<HTMLButtonElement>('#avmeld-knapp')?.addEventListener('click', async () => {
    if (kasterid == null) return
    const min = pameldingar.find(p => p.kasterid === kasterid)
    if (!min || !confirm('Vil du melde deg av?')) return
    const { error } = await fjernPamelding(min.id)
    if (error) return
    render(container, params)
  })

  container.querySelectorAll<HTMLButtonElement>('.fjern-pm').forEach(knapp => {
    knapp.addEventListener('click', async () => {
      if (!confirm('Fjern påmelding?')) return
      const id = Number(knapp.dataset.id)
      if (!id) return
      const { error } = await fjernPamelding(id)
      if (error) return
      render(container, params)
    })
  })
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement, params: Record<string, string> = {}): Promise<void> {
  const rawId = params.id
  if (!rawId) {
    container.replaceChildren(createErrorBanner('Manglande stevne-ID.'))
    return
  }
  const stevneId = Number(rawId)

  container.replaceChildren(createLoadingState('Laster påmelding…'))

  try {
    const [auth, stevneRes] = await Promise.all([
      getUser(),
      hentStevneForPamelding(stevneId),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevnet finst ikkje.'))
      return
    }
    const stevne = stevneRes.data

    const erAdminRolle      = auth?.profil?.rolle === 'admin'
    const erKlubbadminRolle = auth?.profil?.rolle === 'klubbadmin'
    const erPrivilegert     = erAdminRolle || erKlubbadminRolle

    const datoVindu = stevne.dato
      ? {
          fraDato: new Date(new Date(stevne.dato + 'T12:00:00').getTime() - 2 * 864e5).toISOString().slice(0, 10),
          tilDato: new Date(new Date(stevne.dato + 'T12:00:00').getTime() + 2 * 864e5).toISOString().slice(0, 10),
        }
      : null

    const kasterFetch: Promise<{ data: KasterListeRow[]; error: unknown }> = (() => {
      if (!erPrivilegert) return Promise.resolve({ data: [], error: null })
      if (erAdminRolle) return hentKastereListeAktive()
      if (auth && auth.klubber.length) return hentKastereForKlubbar(auth.klubber)
      return Promise.resolve({ data: [], error: null })
    })()

    const [pamRes, relatertRes, kasterRes] = await Promise.all([
      hentPameldingarForStevne(stevneId),
      stevne.klubbid != null && datoVindu
        ? hentRelaterteStevner(stevne.klubbid, datoVindu.fraDato, datoVindu.tilDato, stevneId)
        : Promise.resolve({ data: [] as RelatertStevneRow[], error: null }),
      kasterFetch,
    ])

    const pameldingar  = pamRes.data
    const relaterte    = relatertRes.data
    const klubbKastere = kasterRes.data

    const kasterid  = auth?.profil?.kasterid ?? null
    const erKobla   = auth?.profil?.kobling_status === 'godkjent'
    const erPameldt = kasterid != null && pameldingar.some(p => p.kasterid === kasterid)
    const dato      = stevne.dato ? formaterDato(stevne.dato) : ''

    container.innerHTML = `
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${escHtml(stevne.navn ?? '')}</h2>
        <p class="text-muted mb-4">${dato}${stevne.sted ? ' · ' + escHtml(stevne.sted) : ''}</p>
        ${eigetSkjemaHtml(auth, erPrivilegert, erKobla, erPameldt, stevne.erfullfort ?? false, stevneId)}
        ${adminSkjemaHtml(erPrivilegert, stevne.erfullfort ?? false, pameldingar, klubbKastere)}
        ${relaterteStevnerHtml(relaterte)}
        <h5 class="mt-4 mb-2">Påmeldingar (${pameldingar.length})</h5>
        ${pameldingListeHtml(pameldingar, erPrivilegert)}
      </div>`

    if (auth) {
      bindEventHandlers(container, params, pameldingar, kasterid, auth.user.id, stevneId)
    }
  } catch (err) {
    logError('pamelding.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste påmelding.'))
  }
}
