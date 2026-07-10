import { Capacitor } from '@capacitor/core'
import { throwerName, buildThrowerSlug } from '@/utils/kaster'
import { getUser } from '@/services/authService'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { showToast } from '@/components/Toast'
import { escHtml } from '@/utils/escHtml'
import { errorMessage } from '@/utils/errorMessage'
import { logError } from '@/utils/logError'
import { registerRefetch } from '@/utils/refetchRegistry'
import { formatDate } from '@/utils/shared'
import { getActiveThrowerList, getThrowerForLink } from '@/services/kasterService'
import { getMyRegistrations } from '@/services/pameldingService'
import { getMyMatches, getStartNumbersForTournaments } from '@/services/kampService'
import { sendProfileLinkRequest } from '@/services/brukerProfilService'
import { getNotificationPreferences, updateNotificationPreference } from '@/services/notificationPreferencesService'
import { ensurePushPermission } from '@/services/pushNotificationService'
import { createTabs } from '@/components/Tabs'
import type { Role, LinkStatus } from '@/types'
import type { RegistrationRow } from '@/services/pameldingService'
import type { MatchPlayerRow } from '@/services/kampService'
import type { ThrowerListRow } from '@/services/kasterService'
import type { NotificationPreferencesRow } from '@/services/notificationPreferencesService'

function makePanel(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

const roleLabel: Record<Role, string> = {
  admin: 'Administrator',
  klubbadmin: 'Klubbadministrator',
  bruker: 'Brukar',
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function notificationSettingsHtml(prefs: NotificationPreferencesRow): string {
  return `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Varslingar</h5>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${prefs.varsle_stevne_start ? ' checked' : ''}>
          <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${prefs.varsle_kamp_opprettet ? ' checked' : ''}>
          <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
        </div>
      </div>
    </div>`
}

function unlinkedHtml(status: LinkStatus): string {
  return `
    ${status === 'avvist' ? '<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>' : ''}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="thrower-search" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`
}

function pendingHtml(): string {
  return '<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>'
}

async function linkedCardHtml(throwerId: number): Promise<string> {
  const { data, error } = await getThrowerForLink(throwerId)
  if (error || !data) return ''
  return `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${escHtml(throwerName(data))}</strong> · ${escHtml(data.klubb?.navn ?? '')}</p>
        <a href="#/kastere/${buildThrowerSlug(data)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`
}

async function registrationListHtml(userId: string): Promise<string> {
  const { data, error } = await getMyRegistrations(userId)
  if (error) return '<p class="text-muted">Kunne ikkje laste påmeldingar.</p>'
  if (!data.length) return '<p class="empty-state">Ingen påmeldingar enno.</p>'

  const sorted = [...data].sort((a: RegistrationRow, b: RegistrationRow) =>
    (a.stevne?.dato ?? '').localeCompare(b.stevne?.dato ?? ''),
  )

  const rows = sorted.map(p => {
    const date = formatDate(p.stevne?.dato)
    return `<tr>
      <td><a href="#/stevne/${p.stevne?.id ?? ''}/pamelding">${escHtml(p.stevne?.navn ?? '')}</a></td>
      <td>${escHtml(date)}</td>
      <td><a href="#/stevne/${p.stevne?.id ?? ''}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`
  }).join('')

  return `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`
}

type MatchPlayerInMatch = NonNullable<MatchPlayerRow['kamp']>['spelarar'][number]

/** Players in a match other than the given thrower, excluding anyone sharing the same start number (teammates). */
function findOpponents(
  players: MatchPlayerInMatch[],
  throwerId: number,
  tournamentId: number | null | undefined,
  startNrMap: Record<string, number>,
): MatchPlayerInMatch[] {
  const myStartNr = tournamentId != null ? startNrMap[`${tournamentId}:${throwerId}`] : undefined
  return players.filter(s => {
    if (s.kasterid == null || s.kasterid === throwerId) return false
    const opponentStartNr = tournamentId != null ? startNrMap[`${tournamentId}:${s.kasterid}`] : undefined
    return myStartNr == null || opponentStartNr == null || opponentStartNr !== myStartNr
  })
}

async function createMyMatches(throwerId: number): Promise<HTMLElement> {
  const { data, error } = await getMyMatches(throwerId)
  if (error) {
    const p = document.createElement('p')
    p.className = 'text-muted'
    p.textContent = 'Kunne ikkje laste kampar.'
    return p
  }

  const allMatches = data.filter(ks => !ks.kamp?.er_walkover)

  const tournamentIds = [...new Set(allMatches.map(ks => ks.kamp?.stevneid).filter((s): s is number => s != null))]
  const startNrMap = await getStartNumbersForTournaments(tournamentIds)

  const active = allMatches
    .filter(ks => ks.kamp?.stevne?.erfullfort === false)
    .sort((a, b) => (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0))

  const completed = allMatches
    .filter(ks => ks.kamp?.stevne?.erfullfort === true)
    .sort((a, b) => (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0))

  const tableHeader = `<thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead>`

  const makeMatchRow = (ks: MatchPlayerRow, button: string): string => {
    const match = ks.kamp
    const tournamentId = match?.stevneid
    const opponents = findOpponents(match?.spelarar ?? [], throwerId, tournamentId, startNrMap)
    const opponentNames = opponents.length
      ? opponents.map(m => escHtml(throwerName(m.kaster))).join(' / ')
      : '–'
    return `<tr>
      <td>R${match?.runde_nummer ?? ''} / B${match?.bane_nummer ?? ''}</td>
      <td>${opponentNames}</td>
      <td>${button}</td>
    </tr>`
  }

  const groupMatchesByTournament = (
    matches: MatchPlayerRow[],
    makeButton: (ks: MatchPlayerRow) => string,
  ): string | null => {
    if (!matches.length) return null
    const groups = new Map<number | string, { name: string; matches: MatchPlayerRow[] }>()
    for (const ks of matches) {
      const tournamentId = ks.kamp?.stevneid ?? 'unknown'
      const tournamentName = ks.kamp?.stevne?.navn ?? ''
      if (!groups.has(tournamentId)) groups.set(tournamentId, { name: tournamentName, matches: [] })
      groups.get(tournamentId)!.matches.push(ks)
    }
    return [...groups.values()].map(({ name, matches: group }) => `
      <p class="fw-semibold mb-1 mt-2">${escHtml(name)}</p>
      <table class="table table-sm mb-3">${tableHeader}<tbody>
        ${group.map(ks => makeMatchRow(ks, makeButton(ks))).join('')}
      </tbody></table>`
    ).join('')
  }

  const activeContent = groupMatchesByTournament(
    active,
    ks => {
      if (!ks.kamp?.er_bekreftet) {
        return `<a href="#/kamp/${ks.kamp?.id ?? ''}" class="btn btn-sm btn-primary" target="_blank" rel="noopener">Scoreboard</a>`
      }
      const tournamentId = ks.kamp.stevneid
      const myScore = ks.kamp.spelarar?.find(s => s.kasterid === throwerId)?.score_poeng
      const oppScore = findOpponents(ks.kamp.spelarar ?? [], throwerId, tournamentId, startNrMap)[0]?.score_poeng
      if (myScore == null || oppScore == null) return '–'
      return `<span class="fw-semibold">${myScore} – ${oppScore}</span>`
    },
  )
  const completedContent = groupMatchesByTournament(
    completed,
    ks => `<a href="#/kamp/${ks.kamp?.id ?? ''}" class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">Sjå kamp</a>`,
  )

  const card = document.createElement('div')
  card.className = 'card mb-4'
  card.id = 'my-matches-section'
  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'
  const title = document.createElement('h5')
  title.className = 'card-title'
  title.textContent = 'Mine kampar'
  cardBody.appendChild(title)
  cardBody.appendChild(createTabs({
    tabs: [
      { id: 'active',    label: `Aktive (${active.length})`,       panel: makePanel(activeContent    ?? '<p class="text-muted">Ingen aktive kampar.</p>') },
      { id: 'completed', label: `Ferdige (${completed.length})`,   panel: makePanel(completedContent ?? '<p class="text-muted">Ingen ferdige kampar enno.</p>') },
    ],
  }))
  card.appendChild(cardBody)
  return card
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindThrowerSearch(container: HTMLElement, userId: string): void {
  let timer: number | null = null
  let throwersCache: ThrowerListRow[] | null = null
  const searchInput = container.querySelector<HTMLInputElement>('#thrower-search')!
  const resultsDiv  = container.querySelector<HTMLElement>('#thrower-matches')!
  const errorDiv    = container.querySelector<HTMLElement>('#thrower-error')!

  searchInput.addEventListener('input', () => {
    if (timer !== null) clearTimeout(timer)
    const q = searchInput.value.trim().toLowerCase()
    if (q.length < 2) { resultsDiv.innerHTML = ''; return }

    timer = setTimeout(async () => {
      if (!throwersCache) {
        const { data } = await getActiveThrowerList()
        throwersCache = data
      }
      const results = throwersCache
        .filter(k => k.fornavn.toLowerCase().includes(q) || k.etternavn.toLowerCase().includes(q))
        .slice(0, 8)

      if (!results.length) {
        const el = createEmptyState('Ingen treff.')
        el.classList.add('small')
        resultsDiv.replaceChildren(el)
        return
      }
      resultsDiv.innerHTML = results.map(k =>
        `<button class="list-group-item list-group-item-action" data-id="${k.id}">
          ${escHtml(throwerName(k))} <span class="text-muted small">· ${escHtml(k.klubb?.navn ?? '')}</span>
        </button>`
      ).join('')
    }, 300)
  })

  resultsDiv.addEventListener('click', async e => {
    const button = (e.target as Element).closest<HTMLElement>('[data-id]')
    if (!button) return
    errorDiv.classList.add('d-none')

    const { error } = await sendProfileLinkRequest(userId, Number(button.dataset.id))
    if (error) {
      errorDiv.textContent = 'Kunne ikkje sende forespørsel.'
      errorDiv.classList.remove('d-none')
      return
    }
    location.reload()
  })
}

function bindNotificationToggles(container: HTMLElement, userId: string): void {
  const toggles: [string, keyof NotificationPreferencesRow][] = [
    ['varsle-stevne-start', 'varsle_stevne_start'],
    ['varsle-kamp-opprettet', 'varsle_kamp_opprettet'],
  ]
  for (const [elementId, field] of toggles) {
    const input = container.querySelector<HTMLInputElement>(`#${elementId}`)
    if (!input) continue
    input.addEventListener('change', async () => {
      const value = input.checked
      input.disabled = true
      if (value) await ensurePushPermission()
      const { error } = await updateNotificationPreference(userId, field, value)
      input.disabled = false
      if (error) {
        input.checked = !value
        showToast(`Kunne ikkje lagre varslingsinnstilling: ${errorMessage(error)}`, 'error')
      }
    })
  }
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  registerRefetch(() => render(container))
  container.replaceChildren(createLoadingState('Laster min side…'))

  try {
    const auth = await getUser()
    if (!auth) { location.hash = '#/logginn'; return }

    const { profil, user } = auth
    const status: LinkStatus = profil?.kobling_status ?? 'ingen'
    const roleName = profil ? roleLabel[profil.role] : 'Ukjent'

    // Push only works through the native OneSignal subscription — this page's bundle
    // is also served on the public website, where these toggles would do nothing.
    const showPushSettings = Capacitor.isNativePlatform()
    const notificationPrefs = showPushSettings ? (await getNotificationPreferences(user.id)).data : null

    let html = `
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${escHtml(user.email ?? '')} · <span class="badge bg-secondary">${escHtml(roleName)}</span></p>`

    if (notificationPrefs) html += notificationSettingsHtml(notificationPrefs)

    if (status === 'ingen' || status === 'avvist') {
      html += unlinkedHtml(status)
    } else if (status === 'venter') {
      html += pendingHtml()
    } else if (status === 'godkjent' && profil?.kasterid) {
      const throwerId = profil.kasterid
      const [throwerCardHtml, regListHtml, myMatchesEl] = await Promise.all([
        linkedCardHtml(throwerId),
        registrationListHtml(user.id),
        createMyMatches(throwerId),
      ])
      html += throwerCardHtml + regListHtml
      html += '</div>'
      container.innerHTML = html
      container.querySelector('.mypage-container')!.appendChild(myMatchesEl)
      if (notificationPrefs) bindNotificationToggles(container, user.id)
      return
    }

    html += '</div>'
    container.innerHTML = html

    if (status === 'ingen' || status === 'avvist') {
      bindThrowerSearch(container, user.id)
    }
    if (notificationPrefs) bindNotificationToggles(container, user.id)
  } catch (err) {
    logError('minside.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste min side.'))
  }
}
