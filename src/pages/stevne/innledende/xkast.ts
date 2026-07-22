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
  getCourts,
  getXkastConfig,
  saveOmgang,
  confirmCourt,
  subscribeToCourtChanges,
  type CourtRow,
  type CourtParticipantRow,
} from '@/services/xkastKongelagService'

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

// ── Rendering ─────────────────────────────────────────────────────────────────

function participantRowHtml(
  court: CourtRow,
  participant: CourtParticipantRow,
  isFirstRow: boolean,
  totalRunder: number,
): string {
  const s = state!
  const rowspan = court.deltakarar.length
  const confirmedMark = court.er_bekreftet ? ' ✓' : ''

  const baneCell = isFirstRow
    ? `<td class="xk-bane-cell" rowspan="${rowspan}">${court.bane_nummer ?? '–'}${confirmedMark}</td>`
    : ''

  const rundeCells = Array.from({ length: totalRunder }, (_, i) => {
    const sum = rundeSum(participant, i + 1)
    return `<td class="xk-runde-cell">${sum ?? '–'}</td>`
  }).join('')

  const actionCell = isFirstRow && s.isAdmin
    ? `<td class="xk-action-cell" rowspan="${rowspan}">${
        court.er_bekreftet
          ? ''
          : `<button class="btn btn-sm btn-outline-primary" data-xk-register="${court.id}">Registrer</button>
             <button class="btn btn-sm btn-success" data-xk-confirm="${court.id}"${isCourtComplete(court, s.antallOmganger) ? '' : ' disabled'}>Bekreft</button>`
      }</td>`
    : ''

  return `<tr class="xk-player-row">
    ${baneCell}
    <td class="xk-name-cell">${escHtml(throwerName(participant.kaster))}</td>
    ${rundeCells}
    <td class="xk-total-cell">${totalSum(participant)}</td>
    ${actionCell}
  </tr>`
}

function puljeTableHtml(courts: CourtRow[], puljeLabel: string): string {
  const s = state!
  const totalRunder = Math.ceil(s.antallOmganger / OMGANGER_PER_RUNDE)
  const rundeHeaders = Array.from({ length: totalRunder }, (_, i) => `<th class="xk-runde-cell">R${i + 1}</th>`).join('')
  const actionHeader = s.isAdmin ? '<th></th>' : ''

  const bodyRows = courts.map(court =>
    sortedParticipants(court)
      .map((participant, i) => participantRowHtml(court, participant, i === 0, totalRunder))
      .join(''),
  ).join('')

  return `
    <h3 class="xk-pulje-title">${escHtml(puljeLabel)}</h3>
    <div class="standing-table-wrap">
      <table class="table table-sm match-table xk-table">
        <thead class="org-thead">
          <tr><th>Bane</th><th>Namn</th>${rundeHeaders}<th>Tot</th>${actionHeader}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
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

  const sections = [...byPulje.entries()]
    .sort(([a], [b]) => a - b)
    .map(([pulje, courts]) => puljeTableHtml(courts, pulje === 0 ? 'Utan pulje' : `Pulje ${pulje}`))
    .join('')

  container.innerHTML = `<div class="xk-view">${sections}</div>`
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
        message: `Bekrefte resultata for bane ${court.bane_nummer ?? '?'} i pulje ${court.pulje ?? '?'}? Dette låser bana.`,
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
