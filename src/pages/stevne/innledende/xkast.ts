import type { RealtimeChannel } from '@supabase/supabase-js'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { showOmgangNumberpad, type OmgangEntryStep } from '@/components/OmgangNumberpad'
import { escHtml } from '@/utils/escHtml'
import { throwerName } from '@/utils/kaster'
import { logError } from '@/utils/logError'
import { unsubscribeChannel } from '@/utils/realtime'
import {
  renderMainContent,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
} from '@/organizer/org-shared'
import {
  getCourts,
  getXkastConfig,
  saveOmgang,
  confirmCourt,
  subscribeToCourtChanges,
  type CourtRow,
  type CourtParticipantRow,
} from '@/services/xkastKongelagService'
import { buildXkastStanding } from '@/utils/xkastStilling'

const OMGANGER_PER_RUNDE = 5

// ── State ─────────────────────────────────────────────────────────────────────

interface XkastState {
  stevneid: number
  isAdmin: boolean
  antallOmganger: number
  courts: CourtRow[]
}

let state: XkastState | null = null
let channel: RealtimeChannel | null = null

// ── Pure helpers ──────────────────────────────────────────────────────────────

function sortedParticipants(court: CourtRow): CourtParticipantRow[] {
  return [...court.deltakarar].sort((a, b) => a.id - b.id)
}

function rundeSum(participant: CourtParticipantRow, runde: number): number | null {
  const from = (runde - 1) * OMGANGER_PER_RUNDE + 1
  const to = runde * OMGANGER_PER_RUNDE
  const rows = participant.omgangar.filter(o => o.omgang >= from && o.omgang <= to)
  if (!rows.length) return null
  return rows.reduce((sum, o) => sum + o.poeng, 0)
}

function totalSum(participant: CourtParticipantRow): number {
  return participant.omgangar.reduce((sum, o) => sum + o.poeng, 0)
}

function isCourtComplete(court: CourtRow, antallOmganger: number): boolean {
  return court.deltakarar.every(p => p.omgangar.length >= antallOmganger)
}

function courtStatus(court: CourtRow): string {
  if (court.er_bekreftet) return 'done'
  if (court.deltakarar.some(p => p.omgangar.length > 0)) return 'in-progress'
  return 'not-started'
}

// ── Entry wizard ──────────────────────────────────────────────────────────────

/**
 * X-kast entry order: within one court, a player throws a full runde
 * (5 omganger) before the pad switches to the next player, runde by runde.
 */
function buildEntrySteps(court: CourtRow, antallOmganger: number): OmgangEntryStep[] {
  const players = sortedParticipants(court)
  const recordedByPlayer = new Map(players.map(p => [p.id, new Set(p.omgangar.map(o => o.omgang))]))
  const totalRunder = Math.ceil(antallOmganger / OMGANGER_PER_RUNDE)
  const steps: OmgangEntryStep[] = []

  for (let runde = 1; runde <= totalRunder; runde++) {
    for (const player of players) {
      const recorded = recordedByPlayer.get(player.id)
      const from = (runde - 1) * OMGANGER_PER_RUNDE + 1
      const to = Math.min(runde * OMGANGER_PER_RUNDE, antallOmganger)
      for (let omgang = from; omgang <= to; omgang++) {
        if (recorded?.has(omgang)) continue
        steps.push({
          label: throwerName(player.kaster),
          omgang,
          onSave: async (poeng, antallRinger) => {
            const { error } = await saveOmgang(player.id, omgang, poeng, antallRinger)
            if (error) {
              showToast('Feil ved lagring av omgang.', 'error')
              return false
            }
            return true
          },
        })
      }
    }
  }
  return steps
}

// ── Rendering (same structure/classes as the kamp views) ─────────────────────

function courtActionTd(court: CourtRow): string {
  const s = state!
  if (court.er_bekreftet) {
    return `<td class="text-end pe-2" rowspan="${court.deltakarar.length}"><span class="match-confirmed-indicator">✓ Bekreftet</span></td>`
  }
  if (!s.isAdmin) {
    return `<td rowspan="${court.deltakarar.length}"></td>`
  }
  const canConfirm = isCourtComplete(court, s.antallOmganger)
  return `<td class="text-end pe-2 text-nowrap" rowspan="${court.deltakarar.length}">
      <button class="match-button match-button-primary" data-xk-register="${court.id}">Registrer</button>
      <button class="match-button${canConfirm ? ' match-button-success' : ''}" data-xk-confirm="${court.id}"${canConfirm ? '' : ' disabled'}>Bekreft</button>
    </td>`
}

function courtRowsHtml(court: CourtRow, totalRunder: number): string {
  return sortedParticipants(court).map((participant, i) => {
    const rundeCells = Array.from({ length: totalRunder }, (_, r) => {
      const sum = rundeSum(participant, r + 1)
      return `<td class="text-center">${sum ?? '—'}</td>`
    }).join('')
    const firstCells = i === 0
      ? `<td class="text-center align-middle fw-semibold" rowspan="${court.deltakarar.length}">${court.bane_nummer ?? ''}</td>`
      : ''
    const rowAttrs = i === 0 ? ` class="match-row-desktop" data-status="${courtStatus(court)}"` : ''
    return `<tr${rowAttrs}>
      ${firstCells}
      <td>${escHtml(throwerName(participant.kaster))}</td>
      ${rundeCells}
      <td class="text-center fw-semibold">${totalSum(participant)}</td>
      ${i === 0 ? courtActionTd(court) : ''}
    </tr>`
  }).join('')
}

function puljeSectionHtml(courts: CourtRow[], puljeLabel: string): string {
  const s = state!
  const totalRunder = Math.ceil(s.antallOmganger / OMGANGER_PER_RUNDE)
  const rundeHeaders = Array.from({ length: totalRunder }, (_, i) => `<th class="text-center th-36">R${i + 1}</th>`).join('')

  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">${escHtml(puljeLabel)}</h6>
      <table class="table table-sm match-table mb-0">
        <thead class="org-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>NAMN</th>
            ${rundeHeaders}
            <th class="text-center th-44">TOT</th>
            ${s.isAdmin ? '<th class="th-148"></th>' : '<th class="th-80"></th>'}
          </tr>
        </thead>
        <tbody>${courts.map(court => courtRowsHtml(court, totalRunder)).join('')}</tbody>
      </table>
    </div>`
}

function standingHtml(): string {
  const s = state!
  const standing = buildXkastStanding(
    s.courts.flatMap(court => court.deltakarar.map(p => ({
      kasterid: p.kasterid,
      navn: throwerName(p.kaster),
      omganger: p.omgangar,
    }))),
  )
  if (!standing.length) return ''

  const rows = standing.map(row => `<tr class="standing-player-row" data-kasterid="${row.kasterid}">
    <td class="standing-dim-cell">${row.plassering}</td>
    <td>${escHtml(row.navn)}</td>
    <td class="standing-number standing-dim-cell">${row.antallOmganger}</td>
    <td class="standing-number standing-kp-cell">${row.antallRinger}</td>
    <td class="standing-number standing-sp-cell">${row.poeng}</td>
  </tr>`).join('')

  return `
    <div class="standing-table-wrap">
      <h6 class="text-center fw-bold mb-1">${standing.length} spelarar</h6>
      <table class="table table-sm match-table mb-0">
        <thead class="org-thead">
          <tr>
            <th class="th-32">#</th>
            <th>NAMN</th>
            <th class="th-50 standing-number">O</th>
            <th class="th-44 standing-number standing-kp-th">R</th>
            <th class="th-44 standing-number standing-sp-th">P</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

function renderView(container: HTMLElement): void {
  const s = state
  if (!s) return

  if (!s.courts.length) {
    const hint = s.isAdmin
      ? 'Ingen puljar er genererte enno. Start stevnet frå Info-fana.'
      : 'Ingen puljar er genererte enno.'
    container.replaceChildren(createEmptyState(hint))
    return
  }

  const byPulje = new Map<number, CourtRow[]>()
  for (const court of s.courts) {
    const key = court.pulje ?? 0
    byPulje.set(key, [...(byPulje.get(key) ?? []), court])
  }

  const courtsHtml = [...byPulje.entries()]
    .sort(([a], [b]) => a - b)
    .map(([pulje, courts]) => puljeSectionHtml(courts, pulje === 0 ? 'Utan pulje' : `Pulje ${pulje}`))
    .join('')

  const activeTab = getActiveTab(container)
  container.innerHTML = renderMainContent(courtsHtml, standingHtml())
  bindTabToggle(container)
  if (activeTab === 'standing') setActiveTab(container, 'standing')
}

// ── Events ────────────────────────────────────────────────────────────────────

const boundContainers = new WeakSet<HTMLElement>()

function bindActions(container: HTMLElement): void {
  if (boundContainers.has(container)) return
  boundContainers.add(container)
  container.addEventListener('click', async e => {
    const s = state
    if (!s) return
    const target = e.target as Element

    const registerBtn = target.closest<HTMLElement>('[data-xk-register]')
    if (registerBtn) {
      const court = s.courts.find(c => c.id === Number(registerBtn.dataset.xkRegister))
      if (!court) return
      const steps = buildEntrySteps(court, s.antallOmganger)
      if (!steps.length) {
        showToast('Alle omganger er registrerte for denne bana.', 'info')
        return
      }
      showOmgangNumberpad(steps)
      return
    }

    const confirmBtn = target.closest<HTMLButtonElement>('[data-xk-confirm]')
    if (confirmBtn && !confirmBtn.disabled) {
      const court = s.courts.find(c => c.id === Number(confirmBtn.dataset.xkConfirm))
      if (!court) return
      const ok = await confirmDialog({
        title: 'Bekreft resultat',
        message: `Bekrefte resultata for bane ${court.bane_nummer ?? '?'}? Dette låser bana.`,
      })
      if (!ok) return
      const { error } = await confirmCourt(court.id)
      if (error) {
        showToast('Feil ved bekrefting av resultat.', 'error')
        return
      }
      showToast('Resultata er bekrefta.', 'success')
    }
  })
}

// ── Data / lifecycle ──────────────────────────────────────────────────────────

async function reload(container: HTMLElement): Promise<void> {
  const s = state
  if (!s) return
  const { data, error } = await getCourts(s.stevneid, 'innledende')
  if (error) return // logError already done in the service; keep the last good view
  s.courts = data
  renderView(container)
}

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  _bannerSlot: HTMLElement | null = null,
): Promise<void> {
  if (channel) {
    void unsubscribeChannel(channel)
    channel = null
  }
  container.replaceChildren(createLoadingState())

  try {
    const [configRes, courtsRes] = await Promise.all([
      getXkastConfig(id),
      getCourts(id, 'innledende'),
    ])
    if (configRes.error || courtsRes.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste X-kast-data.'))
      return
    }
    const antallOmganger = configRes.data?.antallOmganger
    if (!antallOmganger) {
      container.replaceChildren(createErrorBanner('Kastemetoden manglar antal omganger — sjekk kastemetode-oppsettet.'))
      return
    }

    state = { stevneid: id, isAdmin, antallOmganger, courts: courtsRes.data }
    renderView(container)
    bindActions(container)
    channel = subscribeToCourtChanges(id, `xkast-innledende-${id}`, () => { void reload(container) })
  } catch (err) {
    logError('xkast.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste X-kast-data.'))
  }
}
