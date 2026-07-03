import { logError } from '@/utils/logError'
import { escHtml } from '@/utils/escHtml'
import { errMsg } from '@/utils/adminForms'
import { registerRefetch } from '@/utils/refetchRegistry'
import {
  getPendingLinks,
  getUserEmails,
  updateLinkStatus,
  getAllUsers,
  updateUserRole,
  getClubAdminUsers,
  getClubAdminAssignments,
  addClubAdminAccess,
  removeClubAdminAccess,
} from '@/services/adminService'
import { getClubs } from '@/services/klubbService'
import { getThrowersById } from '@/services/kasterService'
import { throwerName } from '@/utils/kaster'
import { getLiveTournaments } from '@/services/stevneService'
import type { LiveTournamentRow } from '@/services/stevneService'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { livePillHtml } from '@/components/LivePill'

type Tab = 'links' | 'users' | 'club-admin'

const TABS: Tab[] = ['links', 'users', 'club-admin']
const TAB_LABEL: Record<Tab, string> = {
  'links':      'Koblingforespørslar',
  'users':      'Brukarar',
  'club-admin': 'Klubbadmin-tilgang',
}

function liveCardHtml(s: LiveTournamentRow): string {
  const tab = s.stevne_fase === 'avsluttende' ? 'avsluttende' : 'innledende'
  return `
    <a class="live-card" href="#/stevne/${s.id}/${tab}">
      ${livePillHtml()}
      <span>${escHtml(s.navn)}</span>
    </a>`
}

export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div class="content-page">
      <div id="live-section"></div>
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-tabs">
        ${TABS.map((t, i) => `<li class="nav-item">
          <button class="nav-link${i === 0 ? ' active' : ''}" data-tab="${t}">${TAB_LABEL[t]}</button>
        </li>`).join('')}
      </ul>
      <div id="admin-content"></div>
    </div>`

  const content = container.querySelector<HTMLElement>('#admin-content')!

  let activeTab: Tab = 'links'

  async function showTab(tab: Tab): Promise<void> {
    activeTab = tab
    container.querySelectorAll<HTMLElement>('[data-tab]').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab)
    })
    createLoadingState('Laster...')
    if (tab === 'links')      await _renderLinks(content)
    if (tab === 'users')      await _renderUsers(content)
    if (tab === 'club-admin') await _renderClubAdmin(content)
  }

  registerRefetch(() => showTab(activeTab))

  container.querySelector('#admin-tabs')!.addEventListener('click', e => {
    const button = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]')
    if (button?.dataset.tab) showTab(button.dataset.tab as Tab)
  })

  const [, { data: liveTournamentsData }] = await Promise.all([
    showTab('links'),
    getLiveTournaments(),
  ])

  const liveTournaments = (liveTournamentsData ?? []).filter(s => !s.erfullfort)
  if (liveTournaments.length) {
    container.querySelector<HTMLElement>('#live-section')!.innerHTML =
      `<div class="live-banner">${liveTournaments.map(liveCardHtml).join('')}</div>`
  }
}

// ── Link requests ─────────────────────────────────────────────

async function _renderLinks(el: HTMLElement): Promise<void> {
  const { data, error } = await getPendingLinks()

  const tabBtn = el.closest('.content-page')?.querySelector<HTMLElement>('[data-tab="links"]')
  if (tabBtn) tabBtn.textContent = error || !data.length
    ? TAB_LABEL['links']
    : `${TAB_LABEL['links']} (${data.length})`

  if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
  if (!data.length) { el.replaceChildren(createEmptyState('Ingen ventande forespørslar.')); return }

  const userIds    = data.map(r => r.id)
  const throwerIds = data.map(r => r.kobling_kasterid).filter((x): x is number => x !== null)

  const [{ data: emails }, { data: throwers }] = await Promise.all([
    getUserEmails(userIds),
    getThrowersById(throwerIds),
  ])

  const emailMap   = Object.fromEntries((emails   ?? []).map(r => [r.id, r.epost]))
  const throwerMap = new Map((throwers ?? []).map(k => [k.id, k] as const))

  el.innerHTML = `<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${data.map(r => {
        const thrower = r.kobling_kasterid ? throwerMap.get(r.kobling_kasterid) : null
        const club = thrower?.klubb as { navn: string } | null | undefined
        const throwerDisplayName = thrower
          ? `${escHtml(thrower.fornavn)} ${escHtml(thrower.etternavn)} (${escHtml(club?.navn ?? '')})`
          : '—'
        return `<tr data-id="${r.id}" data-thrower-id="${r.kobling_kasterid ?? ''}">
          <td>${escHtml(emailMap[r.id] ?? r.id)}</td>
          <td>${throwerDisplayName}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`
      }).join('')}
    </tbody>
  </table>`

  el.querySelectorAll<HTMLButtonElement>('.approve-button').forEach(button => {
    button.addEventListener('click', async () => {
      const row      = button.closest<HTMLElement>('tr')!
      const kasterid = row.dataset.throwerId ? Number(row.dataset.throwerId) : null
      const { error } = await updateLinkStatus(row.dataset.id!, kasterid, 'godkjent')
      if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
      _renderLinks(el)
    })
  })
  el.querySelectorAll<HTMLButtonElement>('.reject-button').forEach(button => {
    button.addEventListener('click', async () => {
      const row = button.closest<HTMLElement>('tr')!
      const { error } = await updateLinkStatus(row.dataset.id!, null, 'avvist')
      if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
      _renderLinks(el)
    })
  })
}

// ── Users ─────────────────────────────────────────────────────

async function _getEmailMap(ids: string[]): Promise<Record<string, string>> {
  const { data: emails } = await getUserEmails(ids)
  return Object.fromEntries((emails ?? []).map(r => [r.id, r.epost]))
}

async function _renderUsers(el: HTMLElement): Promise<void> {
  const { data, error } = await getAllUsers()
  if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
  if (!data.length) { el.replaceChildren(createEmptyState('Ingen brukarar.')); return }

  const throwerIds = data.map(r => r.kobling_kasterid).filter((x): x is number => x !== null)

  const [emailMap, { data: throwers }] = await Promise.all([
    _getEmailMap(data.map(r => r.id)),
    getThrowersById(throwerIds),
  ])
  const throwerMap = new Map((throwers ?? []).map(k => [k.id, k] as const))

  const roleOptions = ['bruker', 'klubbadmin', 'admin']
    .map(r => `<option value="${r}">${r}</option>`).join('')

  el.innerHTML = `
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${data.map(r => {
          const thrower = r.kobling_kasterid ? throwerMap.get(r.kobling_kasterid) : null
          const nameCell = thrower ? ` <span class="text-muted small">(${escHtml(throwerName(thrower))})</span>` : ''
          return `<tr data-id="${r.id}">
          <td>${escHtml(emailMap[r.id] ?? r.id)}${nameCell}</td>
          <td>
            <select id="role-select-${r.id}" class="form-select form-select-sm role-select sel-auto">
              ${roleOptions}
            </select>
          </td>
          <td><span class="badge bg-secondary">${escHtml(r.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`
        }).join('')}
      </tbody>
    </table>`

  data.forEach(r => {
    const row = el.querySelector<HTMLElement>(`tr[data-id="${r.id}"]`)
    if (row) row.querySelector<HTMLSelectElement>('.role-select')!.value = r.rolle
  })

  el.querySelectorAll<HTMLButtonElement>('.save-role').forEach(button => {
    button.addEventListener('click', async () => {
      const row     = button.closest<HTMLElement>('tr')!
      const newRole = row.querySelector<HTMLSelectElement>('.role-select')!.value
      const errorEl = el.querySelector<HTMLElement>('#user-error')!
      errorEl.classList.add('d-none')
      const { error } = await updateUserRole(row.dataset.id!, newRole)
      if (error) {
        errorEl.textContent = errMsg(error)
        errorEl.classList.remove('d-none')
      } else {
        button.textContent = '✓'
        setTimeout(() => { button.textContent = 'Lagre' }, 2000)
      }
    })
  })
}

// ── Club admin access ──────────────────────────────────────────

async function _renderClubAdmin(el: HTMLElement): Promise<void> {
  let users: { id: string }[]
  let clubs: { id: number; navn: string; logourl: string | null }[]
  let assignments: { bruker_id: string; klubbid: number }[]

  try {
    const results = await Promise.all([
      getClubAdminUsers(),
      getClubs(),
      getClubAdminAssignments(),
    ])
    users       = results[0].data
    clubs       = results[1].data
    assignments = results[2].data
  } catch (err) {
    logError('admin._renderClubAdmin', err)
    el.innerHTML = `<div class="alert alert-danger">Kunne ikkje laste data.</div>`
    return
  }

  if (!users.length) { el.replaceChildren(createEmptyState('Ingen brukarar med rolle "klubbadmin".')); return }

  const emailMap = await _getEmailMap(users.map(r => r.id))

  const assignmentMap: Record<string, Set<number>> = {}
  assignments.forEach(r => {
    const clubSet = (assignmentMap[r.bruker_id] ??= new Set())
    clubSet.add(r.klubbid)
  })

  const clubOptions = clubs.map(k =>
    `<option value="${k.id}">${escHtml(k.navn)}</option>`,
  ).join('')

  el.innerHTML = `
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${users.map(u => {
      const assigned = [...(assignmentMap[u.id] ?? [])]
      const assignedBadges = assigned.map(clubId => {
        const club = clubs.find(x => x.id === clubId)
        return club
          ? `<span class="badge bg-primary me-1" data-club-id="${clubId}">${escHtml(club.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`
          : ''
      }).join('')
      return `<div class="card mb-3" data-user="${u.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${escHtml(emailMap[u.id] ?? u.id)}</h6>
          <div class="club-admin-clubs mb-2">${assignedBadges || '<span class="text-muted small">Ingen klubbar tildelt</span>'}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${u.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${clubOptions}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`
    }).join('')}`

  el.querySelectorAll<HTMLButtonElement>('.add-club-button').forEach(button => {
    button.addEventListener('click', async () => {
      const card    = button.closest<HTMLElement>('[data-user]')!
      const select  = card.querySelector<HTMLSelectElement>('.add-club-select')!
      const clubId  = Number(select.value)
      if (!clubId) return
      const errorEl = el.querySelector<HTMLElement>('#club-admin-error')!
      errorEl.classList.add('d-none')
      const { error } = await addClubAdminAccess(card.dataset.user!, clubId)
      if (error) { errorEl.textContent = errMsg(error); errorEl.classList.remove('d-none'); return }
      _renderClubAdmin(el)
    })
  })

  el.querySelectorAll<HTMLButtonElement>('.remove-club').forEach(button => {
    button.addEventListener('click', async e => {
      e.stopPropagation()
      const badge   = button.closest<HTMLElement>('[data-club-id]')!
      const card    = button.closest<HTMLElement>('[data-user]')!
      const errorEl = el.querySelector<HTMLElement>('#club-admin-error')!
      errorEl.classList.add('d-none')
      const { error } = await removeClubAdminAccess(card.dataset.user!, Number(badge.dataset.clubId))
      if (error) { errorEl.textContent = errMsg(error); errorEl.classList.remove('d-none'); return }
      _renderClubAdmin(el)
    })
  })
}
