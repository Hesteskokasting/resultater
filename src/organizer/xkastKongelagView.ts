// ── Shared court view for X-kast (innledende) and Kongelag (avsluttende) ──────
//
// Usage: call createCourtPhaseRenderer(variant) once at module level in each
// kastemetode file, mirroring createFinalPhaseRenderer in avsluttendeBase.
// The factory owns state, realtime channel, rendering, and the shared
// register/confirm/complete actions; the variant supplies fase, column
// layout, and numberpad entry order.
//
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
  saveOmgang,
  confirmCourt,
  subscribeToCourtChanges,
  type CourtRow,
  type CourtParticipantRow,
  type CourtFase,
  type CourtPhaseConfig,
} from '@/services/xkastKongelagService'
import { writePlacements } from '@/services/resultatService'
import { setTournamentCompleted } from '@/services/stevneService'
import { autoCompleteCourts } from '@/services/testDataService'
import { buildXkastStanding, type XkastStandingRow } from '@/utils/xkastStilling'
import { buildKongelagStanding, type KongelagStandingRow } from '@/utils/kongelagStilling'

// ── Variant contract ──────────────────────────────────────────────────────────

/** One numberpad step before recorded-omgang filtering: who throws which omgang. */
export interface EntrySlot {
  participant: CourtParticipantRow
  omgang: number
  label: string
}

export interface CourtPhaseContext {
  stevneid: number
  isAdmin: boolean
  config: CourtPhaseConfig
  antallOmganger: number
  courts: CourtRow[]
  reload: () => Promise<void>
}

export interface CourtPhaseVariant {
  fase: CourtFase
  channelName: (stevneid: number) => string
  loadConfig: (stevneid: number) => Promise<{ data: CourtPhaseConfig | null; error: unknown }>
  /** Header labels for the score columns between NAMN and TOT (e.g. R1–R3, or 1–10). */
  scoreColumnHeaders: (antallOmganger: number) => string[]
  /** One value per score column for a participant; null renders as "—". */
  scoreCellValues: (participant: CourtParticipantRow, antallOmganger: number) => (number | null)[]
  /** 'court': Registrer per court (X-kast). 'pulje': one Registrer per pulje (Kongelag). */
  registerScope: 'court' | 'pulje'
  /** Numberpad entry order over the given courts (recorded omganger are filtered out later). */
  entryOrder: (courts: CourtRow[], antallOmganger: number) => EntrySlot[]
  emptyHint: (isAdmin: boolean) => string
  /** Optional replacement for the empty state (e.g. Kongelag's admin start panel). */
  renderNoCourts?: (ctx: CourtPhaseContext) => HTMLElement | null
  /**
   * Optional innledende carry-over per kasterid (Kongelag Phases 3/4). When
   * it resolves non-null, the standing gains I/TOT columns and ranks by
   * poeng + carry-over; placements on Fullfør use the same ranking.
   */
  loadCarryOver?: (stevneid: number) => Promise<{ data: Record<number, number> | null; error: unknown }>
}

// ── Shared pure helpers ───────────────────────────────────────────────────────

export function sortedParticipants(court: CourtRow): CourtParticipantRow[] {
  return [...court.deltakarar].sort((a, b) => a.id - b.id)
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

function hasOpenEntries(courts: CourtRow[], antallOmganger: number): boolean {
  return courts.some(c => !c.er_bekreftet && !isCourtComplete(c, antallOmganger))
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createCourtPhaseRenderer(variant: CourtPhaseVariant) {
  interface CourtPhaseState {
    stevneid: number
    isAdmin: boolean
    config: CourtPhaseConfig
    antallOmganger: number
    courts: CourtRow[]
    /** Innledende carry-over per kasterid; null = no carry-over columns. */
    carryOver: Record<number, number> | null
  }

  let state: CourtPhaseState | null = null
  let channel: RealtimeChannel | null = null
  let bannerSlot: HTMLElement | null = null
  const boundContainers = new WeakSet<HTMLElement>()

  // ── Entry wizard ────────────────────────────────────────────────────────────

  function buildEntrySteps(slots: EntrySlot[]): OmgangEntryStep[] {
    return slots
      .filter(slot => !slot.participant.omgangar.some(o => o.omgang === slot.omgang))
      .map(slot => ({
        label: slot.label,
        omgang: slot.omgang,
        onSave: async (poeng, antallRinger) => {
          const { error } = await saveOmgang(slot.participant.id, slot.omgang, poeng, antallRinger)
          if (error) {
            showToast('Feil ved lagring av omgang.', 'error')
            return false
          }
          return true
        },
      }))
  }

  function openEntryPad(courts: CourtRow[]): void {
    const s = state
    if (!s) return
    const openCourts = courts.filter(c => !c.er_bekreftet)
    const steps = buildEntrySteps(variant.entryOrder(openCourts, s.antallOmganger))
    if (!steps.length) {
      showToast('Alle omganger er registrerte.', 'info')
      return
    }
    showOmgangNumberpad(steps)
  }

  // ── Rendering (same structure/classes as the kamp views) ───────────────────

  function courtActionTd(court: CourtRow): string {
    const s = state!
    if (court.er_bekreftet) {
      return `<td class="text-end pe-2" rowspan="${court.deltakarar.length}"><span class="match-confirmed-indicator">✓ Bekreftet</span></td>`
    }
    if (!s.isAdmin) {
      return `<td rowspan="${court.deltakarar.length}"></td>`
    }
    const canConfirm = isCourtComplete(court, s.antallOmganger)
    const registerBtn = variant.registerScope === 'court'
      ? `<button class="match-button match-button-primary" data-xk-register="${court.id}">Registrer</button>
      `
      : ''
    return `<td class="text-end pe-2 text-nowrap" rowspan="${court.deltakarar.length}">
        ${registerBtn}<button class="match-button${canConfirm ? ' match-button-success' : ''}" data-xk-confirm="${court.id}"${canConfirm ? '' : ' disabled'}>Bekreft</button>
      </td>`
  }

  function courtRowsHtml(court: CourtRow): string {
    const s = state!
    return sortedParticipants(court).map((participant, i) => {
      const scoreCells = variant.scoreCellValues(participant, s.antallOmganger)
        .map(value => `<td class="text-center">${value ?? '—'}</td>`)
        .join('')
      const firstCells = i === 0
        ? `<td class="text-center align-middle fw-semibold" rowspan="${court.deltakarar.length}">${court.bane_nummer ?? ''}</td>`
        : ''
      const rowAttrs = i === 0 ? ` class="match-row-desktop" data-status="${courtStatus(court)}"` : ''
      // text-start: the reused match-row-desktop styling right-aligns the P1
      // column (td:nth-child(2)) for kamp rows; court names stay left-aligned.
      return `<tr${rowAttrs}>
        ${firstCells}
        <td class="text-start">${escHtml(throwerName(participant.kaster))}</td>
        ${scoreCells}
        <td class="text-center fw-semibold">${totalSum(participant)}</td>
        ${i === 0 ? courtActionTd(court) : ''}
      </tr>`
    }).join('')
  }

  function puljeSectionHtml(pulje: number, courts: CourtRow[], puljeLabel: string): string {
    const s = state!
    const scoreHeaders = variant.scoreColumnHeaders(s.antallOmganger)
      .map(label => `<th class="text-center th-36">${escHtml(label)}</th>`)
      .join('')
    const actionTh = s.isAdmin && variant.registerScope === 'court' ? '<th class="th-148"></th>' : '<th class="th-80"></th>'
    const puljeRegisterBtn = s.isAdmin && variant.registerScope === 'pulje' && hasOpenEntries(courts, s.antallOmganger)
      ? ` <button class="match-button match-button-primary ms-2" data-xk-register-pulje="${pulje}">Registrer</button>`
      : ''

    return `
      <div class="mb-3">
        <h6 class="text-center fw-bold mb-1">${escHtml(puljeLabel)}${puljeRegisterBtn}</h6>
        <table class="table table-sm match-table mb-0">
          <thead class="org-thead">
            <tr>
              <th class="th-36 text-center">B</th>
              <th>NAMN</th>
              ${scoreHeaders}
              <th class="text-center th-44">TOT</th>
              ${actionTh}
            </tr>
          </thead>
          <tbody>${courts.map(court => courtRowsHtml(court)).join('')}</tbody>
        </table>
      </div>`
  }

  function computeStanding(): XkastStandingRow[] | KongelagStandingRow[] {
    const s = state!
    const base = buildXkastStanding(
      s.courts.flatMap(court => court.deltakarar.map(p => ({
        kasterid: p.kasterid,
        navn: throwerName(p.kaster),
        omganger: p.omgangar,
      }))),
    )
    return s.carryOver ? buildKongelagStanding(base, s.carryOver) : base
  }

  function standingRowHtml(row: XkastStandingRow | KongelagStandingRow): string {
    const carryCells = 'carryOver' in row
      ? `<td class="standing-number">${row.poeng}</td>
      <td class="standing-number standing-dim-cell">${row.carryOver}</td>
      <td class="standing-number standing-sp-cell">${row.displayTotal}</td>`
      : `<td class="standing-number standing-sp-cell">${row.poeng}</td>`
    return `<tr class="standing-player-row" data-kasterid="${row.kasterid}">
      <td class="standing-dim-cell">${row.plassering}</td>
      <td>${escHtml(row.navn)}</td>
      <td class="standing-number standing-dim-cell">${row.antallOmganger}</td>
      <td class="standing-number standing-kp-cell">${row.antallRinger}</td>
      ${carryCells}
    </tr>`
  }

  function standingHtml(): string {
    const s = state!
    const standing = computeStanding()
    if (!standing.length) return ''

    // With carry-over: P = kongelag poeng, I = innleiande carry-over, TOT = P + I
    const scoreHeaders = s.carryOver
      ? `<th class="th-44 standing-number">P</th>
            <th class="th-44 standing-number">I</th>
            <th class="th-50 standing-number standing-sp-th">TOT</th>`
      : '<th class="th-44 standing-number standing-sp-th">P</th>'

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
              ${scoreHeaders}
            </tr>
          </thead>
          <tbody>${standing.map(row => standingRowHtml(row)).join('')}</tbody>
        </table>
      </div>`
  }

  function buildContext(container: HTMLElement): CourtPhaseContext {
    const s = state!
    return {
      stevneid: s.stevneid,
      isAdmin: s.isAdmin,
      config: s.config,
      antallOmganger: s.antallOmganger,
      courts: s.courts,
      reload: () => reload(container),
    }
  }

  function renderView(container: HTMLElement): void {
    const s = state
    if (!s) return

    if (!s.courts.length) {
      const custom = variant.renderNoCourts?.(buildContext(container)) ?? null
      container.replaceChildren(custom ?? createEmptyState(variant.emptyHint(s.isAdmin)))
      renderBanner(container)
      return
    }

    const byPulje = new Map<number, CourtRow[]>()
    for (const court of s.courts) {
      const key = court.pulje ?? 0
      byPulje.set(key, [...(byPulje.get(key) ?? []), court])
    }

    const courtsHtml = [...byPulje.entries()]
      .sort(([a], [b]) => a - b)
      .map(([pulje, courts]) => puljeSectionHtml(pulje, courts, pulje === 0 ? 'Utan pulje' : `Pulje ${pulje}`))
      .join('')

    const activeTab = getActiveTab(container)
    container.innerHTML = renderMainContent(courtsHtml, standingHtml())
    bindTabToggle(container)
    if (activeTab === 'standing') setActiveTab(container, 'standing')
    renderBanner(container)
  }

  // ── Banner (Fullfør turnering) ──────────────────────────────────────────────

  function renderBanner(container: HTMLElement): void {
    const s = state
    if (!bannerSlot || !s) return
    if (!s.isAdmin) { bannerSlot.innerHTML = ''; return }

    const allConfirmed = s.courts.length > 0 && s.courts.every(c => c.er_bekreftet)
    const isFinalView = variant.fase === 'avsluttende' || !s.config.hasFinalPhase
    const showComplete = allConfirmed && isFinalView
    const showAutoComplete = import.meta.env.VITE_ENV === 'dev' && s.courts.length > 0 && !allConfirmed

    bannerSlot.innerHTML = `
      ${showComplete ? `<button id="complete-tournament-btn" class="btn btn-sm btn-success"${s.config.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>` : ''}
      ${showAutoComplete ? '<button id="test-auto-complete-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>' : ''}
    `

    bannerSlot.querySelector('#test-auto-complete-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget as HTMLButtonElement
      if (!await confirmDialog({ title: 'Autofullfør banar', message: 'Fylle alle manglande omganger med tilfeldige resultat og bekrefte banane?' })) return
      btn.disabled = true
      await autoCompleteCourts(s.stevneid, variant.fase, s.antallOmganger)
      await reload(container)
    })

    bannerSlot.querySelector('#complete-tournament-btn')?.addEventListener('click', async () => {
      if (!await confirmDialog({ title: 'Fullfør turnering', message: 'Vil du fullføre turneringa? Dette kan ikkje angrast.', danger: true })) return
      // Same ranking as the displayed standing — includes carry-over when present
      const { error: plErr } = await writePlacements(s.stevneid, computeStanding())
      if (plErr) { showToast('Feil ved lagring av plasseringar', 'error'); return }
      const { error } = await setTournamentCompleted(s.stevneid)
      if (error) { showToast('Feil ved fullføring av turnering', 'error'); return }
      await reload(container)
    })
  }

  // ── Events ──────────────────────────────────────────────────────────────────

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
        if (court) openEntryPad([court])
        return
      }

      const puljeRegisterBtn = target.closest<HTMLElement>('[data-xk-register-pulje]')
      if (puljeRegisterBtn) {
        const pulje = Number(puljeRegisterBtn.dataset.xkRegisterPulje)
        openEntryPad(s.courts.filter(c => (c.pulje ?? 0) === pulje))
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

  // ── Data / lifecycle ────────────────────────────────────────────────────────

  async function reload(container: HTMLElement): Promise<void> {
    const s = state
    if (!s) return
    try {
      const [configRes, courtsRes, carryRes] = await Promise.all([
        variant.loadConfig(s.stevneid),
        getCourts(s.stevneid, variant.fase),
        variant.loadCarryOver?.(s.stevneid) ?? Promise.resolve({ data: null, error: null }),
      ])
      if (configRes.error || courtsRes.error || carryRes.error) return // logError done in the service; keep the last good view
      if (configRes.data) s.config = configRes.data
      s.courts = courtsRes.data
      s.carryOver = carryRes.data
      renderView(container)
    } catch (err) {
      logError('xkastKongelagView.reload', err)
    }
  }

  return async function render(
    container: HTMLElement,
    { id, isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot
    if (channel) {
      void unsubscribeChannel(channel)
      channel = null
    }
    container.replaceChildren(createLoadingState())

    try {
      const [configRes, courtsRes, carryRes] = await Promise.all([
        variant.loadConfig(id),
        getCourts(id, variant.fase),
        variant.loadCarryOver?.(id) ?? Promise.resolve({ data: null, error: null }),
      ])
      if (configRes.error || courtsRes.error || carryRes.error || !configRes.data) {
        container.replaceChildren(createErrorBanner('Kunne ikkje laste data.'))
        return
      }
      const antallOmganger = configRes.data.antallOmganger
      if (!antallOmganger) {
        container.replaceChildren(createErrorBanner('Kastemetoden manglar antal omganger — sjekk kastemetode-oppsettet.'))
        return
      }

      state = { stevneid: id, isAdmin, config: configRes.data, antallOmganger, courts: courtsRes.data, carryOver: carryRes.data }
      renderView(container)
      bindActions(container)
      channel = subscribeToCourtChanges(id, variant.channelName(id), () => { void reload(container) })
    } catch (err) {
      logError('xkastKongelagView.render', err)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste data.'))
    }
  }
}
