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
import { showTotalNumberpad } from '@/components/TotalNumberpad'
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
  swapCourtPlayers,
  editCourtOmgang,
  setCourtTotal,
  subscribeToCourtChanges,
  type CourtRow,
  type CourtParticipantRow,
  type CourtFase,
  type CourtPhaseConfig,
  type KongelagCarryOverInfo,
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
  /** Context line above the player name in the pad, e.g. "Bane 1 · Runde 2". */
  contextLabel: string
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
  /**
   * The omgang number(s) a score cell represents. Kongelag: one omgang per
   * cell → click edits it directly. X-kast: a round of ≤5 omganger → click
   * expands an inline drill-down of those omganger.
   */
  omgangerForScoreCell: (cellIndex: number, antallOmganger: number) => number[]
  emptyHint: (isAdmin: boolean) => string
  /**
   * Lets admins swap two players between courts (tap one, tap the other) as
   * long as neither court is confirmed and neither seat has recorded
   * omganger. X-kast only for now.
   */
  canSwapPlayers?: boolean
  /** Optional replacement for the empty state (e.g. Kongelag's admin start panel). */
  renderNoCourts?: (ctx: CourtPhaseContext) => HTMLElement | null
  /**
   * Optional innledende carry-over (Kongelag Phases 3/4). When it resolves
   * non-null, the standing gains I/TOT columns (plus the raw X-kast sum and
   * percentage for X-kast innledende) and ranks by poeng + carry-over;
   * placements on Fullfør use the same ranking.
   */
  loadCarryOver?: (stevneid: number) => Promise<{ data: KongelagCarryOverInfo | null; error: unknown }>
}

// ── Shared pure helpers ───────────────────────────────────────────────────────

export function sortedParticipants(court: CourtRow): CourtParticipantRow[] {
  return [...court.deltakarar].sort((a, b) => a.id - b.id)
}

function totalSum(participant: CourtParticipantRow): number {
  if (participant.totalsum_manuelt) return participant.poeng
  return participant.omgangar.reduce((sum, o) => sum + o.poeng, 0)
}

function isCourtComplete(court: CourtRow, antallOmganger: number): boolean {
  return court.deltakarar.every(p => p.totalsum_manuelt || p.omgangar.length >= antallOmganger)
}

function courtStatus(court: CourtRow): string {
  if (court.er_bekreftet) return 'done'
  if (court.deltakarar.some(p => p.totalsum_manuelt || p.omgangar.length > 0)) return 'in-progress'
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
    /** Innledende carry-over; null = no carry-over columns. */
    carryOver: KongelagCarryOverInfo | null
    /** Deltaker id of the first player picked in a pending swap. */
    swapSelectedId: number | null
    /** Score cell currently drilled-down for omgang editing (X-kast rounds). */
    expandedCell: { deltakerId: number; cellIndex: number } | null
  }

  let state: CourtPhaseState | null = null
  let channel: RealtimeChannel | null = null
  let bannerSlot: HTMLElement | null = null
  const boundContainers = new WeakSet<HTMLElement>()

  // ── Entry wizard ────────────────────────────────────────────────────────────

  function buildEntrySteps(slots: EntrySlot[]): OmgangEntryStep[] {
    return slots
      // Manual-total players have no omganger to enter; already-recorded omganger are skipped.
      .filter(slot => !slot.participant.totalsum_manuelt && !slot.participant.omgangar.some(o => o.omgang === slot.omgang))
      .map(slot => ({
        contextLabel: slot.contextLabel,
        playerName: throwerName(slot.participant.kaster),
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

  /** The participant whose round is drilled-down in this court, if still editable. */
  function expandedParticipant(court: CourtRow): CourtParticipantRow | null {
    const s = state!
    if (!s.expandedCell) return null
    const p = court.deltakarar.find(pp => pp.id === s.expandedCell!.deltakerId)
    if (!p) return null
    return canEditScores(p) ? p : null
  }

  function courtRowspan(court: CourtRow): number {
    return court.deltakarar.length + (expandedParticipant(court) ? 1 : 0)
  }

  function courtActionTd(court: CourtRow): string {
    const s = state!
    const rowspan = courtRowspan(court)
    if (court.er_bekreftet) {
      return `<td class="text-end pe-2" rowspan="${rowspan}"><span class="match-confirmed-indicator">✓ Bekreftet</span></td>`
    }
    if (!s.isAdmin) {
      return `<td rowspan="${rowspan}"></td>`
    }
    const canConfirm = isCourtComplete(court, s.antallOmganger)
    const registerBtn = variant.registerScope === 'court'
      ? `<button class="match-button match-button-primary" data-xk-register="${court.id}">Registrer</button>
      `
      : ''
    return `<td class="text-end pe-2 text-nowrap" rowspan="${rowspan}">
        ${registerBtn}<button class="match-button${canConfirm ? ' match-button-success' : ''}" data-xk-confirm="${court.id}"${canConfirm ? '' : ' disabled'}>Bekreft</button>
      </td>`
  }

  function canSwapParticipant(court: CourtRow, participant: CourtParticipantRow): boolean {
    const s = state!
    return Boolean(variant.canSwapPlayers) && s.isAdmin && !court.er_bekreftet && participant.omgangar.length === 0
  }

  /** Admin may edit omgang scores (confirmed courts allowed; fullført and manual totals not). */
  function canEditScores(participant: CourtParticipantRow): boolean {
    const s = state!
    return s.isAdmin && !s.config.erfullfort && !participant.totalsum_manuelt
  }

  /** Inline drill-down row for one round: its omganger as tappable chips. */
  function detailRowHtml(participant: CourtParticipantRow, cellIndex: number): string {
    const s = state!
    const scoreColCount = variant.scoreColumnHeaders(s.antallOmganger).length
    const chips = variant.omgangerForScoreCell(cellIndex, s.antallOmganger).map(omgang => {
      const existing = participant.omgangar.find(o => o.omgang === omgang)
      const val = existing
        ? `${existing.poeng} p${existing.antall_ringer != null ? ` · ${existing.antall_ringer} r` : ''}`
        : 'Ikkje ført'
      return `<button class="xk-omgang-chip" data-xk-omgang-edit="${participant.id}:${omgang}">
        <span class="xk-omgang-chip-nr">Omgang ${omgang}</span>
        <span class="xk-omgang-chip-val">${val}</span>
      </button>`
    }).join('')
    // B and action are rowspanned to cover this row; span the middle columns.
    return `<tr class="xk-detail-row"><td colspan="${scoreColCount + 2}">
        <div class="xk-omgang-chips">${chips}</div>
      </td></tr>`
  }

  function courtRowsHtml(court: CourtRow): string {
    const s = state!
    const expanded = expandedParticipant(court)
    return sortedParticipants(court).map((participant, i) => {
      const editScores = canEditScores(participant)
      const scoreCells = variant.scoreCellValues(participant, s.antallOmganger)
        .map((value, cellIndex) => {
          const isExpanded = s.expandedCell?.deltakerId === participant.id && s.expandedCell?.cellIndex === cellIndex
          const cls = `text-center${editScores ? ' xk-editable-cell' : ''}${isExpanded ? ' xk-cell-expanded' : ''}`
          const attr = editScores ? ` data-xk-score="${participant.id}:${cellIndex}"` : ''
          return `<td class="${cls}"${attr}>${value ?? '—'}</td>`
        })
        .join('')
      const firstCells = i === 0
        ? `<td class="text-center align-middle fw-semibold" rowspan="${courtRowspan(court)}">${court.bane_nummer ?? ''}</td>`
        : ''
      const rowAttrs = i === 0 ? ` class="match-row-desktop" data-status="${courtStatus(court)}"` : ''
      const isSwappable = canSwapParticipant(court, participant)
      const swapClasses = isSwappable
        ? ` court-swap-cell${s.swapSelectedId === participant.id ? ' court-swap-selected' : ''}`
        : ''
      const swapAttr = isSwappable ? ` data-xk-swap="${participant.id}"` : ''
      const canEditTotal = s.isAdmin && !s.config.erfullfort
      const totCls = `text-center fw-semibold${canEditTotal ? ' xk-editable-cell' : ''}`
      const totAttr = canEditTotal ? ` data-xk-total="${participant.id}"` : ''
      // text-start: the reused match-row-desktop styling right-aligns the P1
      // column (td:nth-child(2)) for kamp rows; court names stay left-aligned.
      const row = `<tr${rowAttrs}>
        ${firstCells}
        <td class="text-start${swapClasses}"${swapAttr}>${escHtml(throwerName(participant.kaster))}</td>
        ${scoreCells}
        <td class="${totCls}"${totAttr}>${totalSum(participant)}</td>
        ${i === 0 ? courtActionTd(court) : ''}
      </tr>`
      const detail = expanded?.id === participant.id && s.expandedCell
        ? detailRowHtml(participant, s.expandedCell.cellIndex)
        : ''
      return row + detail
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
        manualTotal: p.totalsum_manuelt
          ? { poeng: p.poeng, antallRinger: p.antall_ringer, antallOmganger: s.antallOmganger }
          : null,
      }))),
    )
    return s.carryOver ? buildKongelagStanding(base, s.carryOver.byKasterid) : base
  }

  function standingRowHtml(row: XkastStandingRow | KongelagStandingRow): string {
    const s = state!
    const xkastCell = s.carryOver?.xkastPoengByKasterid
      ? `<td class="standing-number standing-dim-cell">${s.carryOver.xkastPoengByKasterid[row.kasterid] ?? '—'}</td>`
      : ''
    const carryCells = 'carryOver' in row
      ? `<td class="standing-number">${row.poeng}</td>
      ${xkastCell}
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

    // With carry-over: P = kongelag poeng, X = rå X-kast-sum, I = innleiande
    // carry-over (X × prosenten i overskrifta), TOT = P + I
    const scoreHeaders = s.carryOver
      ? `<th class="th-44 standing-number">P</th>
            ${s.carryOver.xkastPoengByKasterid ? '<th class="th-44 standing-number">X</th>' : ''}
            <th class="th-44 standing-number">I</th>
            <th class="th-50 standing-number standing-sp-th">TOT</th>`
      : '<th class="th-44 standing-number standing-sp-th">P</th>'
    const percentSuffix = s.carryOver?.xkastPercent != null
      ? ` · overføring ${s.carryOver.xkastPercent} %`
      : ''

    return `
      <div class="standing-table-wrap">
        <h6 class="text-center fw-bold mb-1">${standing.length} spelarar${percentSuffix}</h6>
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

  // ── Player swap (tap one player, tap the other) ─────────────────────────────

  function findParticipant(deltakerId: number): { court: CourtRow; participant: CourtParticipantRow } | null {
    const s = state
    if (!s) return null
    for (const court of s.courts) {
      const participant = court.deltakarar.find(p => p.id === deltakerId)
      if (participant) return { court, participant }
    }
    return null
  }

  async function handleSwapClick(container: HTMLElement, deltakerId: number): Promise<void> {
    const s = state
    if (!s) return

    if (s.swapSelectedId == null) {
      s.swapSelectedId = deltakerId
      renderView(container)
      showToast('Vel spelaren du vil byte med.', 'info')
      return
    }
    if (s.swapSelectedId === deltakerId) {
      s.swapSelectedId = null
      renderView(container)
      return
    }

    const first = findParticipant(s.swapSelectedId)
    const second = findParticipant(deltakerId)
    if (!first || !second) {
      s.swapSelectedId = null
      renderView(container)
      return
    }
    if (first.court.id === second.court.id) {
      showToast('Spelarane står allereie på same bane.', 'info')
      return
    }

    const ok = await confirmDialog({
      title: 'Byte spelarar',
      message: `Byte ${throwerName(first.participant.kaster)} (bane ${first.court.bane_nummer ?? '?'}) og ${throwerName(second.participant.kaster)} (bane ${second.court.bane_nummer ?? '?'})?`,
    })
    if (!ok) return

    const { error } = await swapCourtPlayers(first.participant.id, second.participant.id)
    if (error) {
      showToast('Feil ved byte av spelarar.', 'error')
      return
    }
    s.swapSelectedId = null
    showToast('Spelarane har bytt bane.', 'success')
    await reload(container)
  }

  // ── Score editing (admin) ───────────────────────────────────────────────────

  function ringerSum(participant: CourtParticipantRow): number {
    if (participant.totalsum_manuelt) return participant.antall_ringer
    return participant.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0)
  }

  function openOmgangEdit(deltakerId: number, omgang: number): void {
    const found = findParticipant(deltakerId)
    if (!found) return
    const { court, participant } = found
    const existing = participant.omgangar.find(o => o.omgang === omgang)
    showOmgangNumberpad([{
      contextLabel: `Bane ${court.bane_nummer ?? '?'} · Omgang ${omgang}`,
      playerName: throwerName(participant.kaster),
      initialPoeng: existing?.poeng,
      initialRinger: existing?.antall_ringer ?? undefined,
      onSave: async (poeng, antallRinger) => {
        const { error } = await editCourtOmgang(participant.id, omgang, poeng, antallRinger)
        if (error) { showToast('Feil ved lagring av omgang.', 'error'); return false }
        return true
      },
    }])
  }

  function openTotalEdit(deltakerId: number): void {
    const s = state
    if (!s) return
    const found = findParticipant(deltakerId)
    if (!found) return
    const { court, participant } = found
    const hasOmganger = participant.omgangar.length > 0
    const open = (): void => showTotalNumberpad({
      contextLabel: `Bane ${court.bane_nummer ?? '?'} · Totalsum`,
      playerName: throwerName(participant.kaster),
      antallOmganger: s.antallOmganger,
      initialPoeng: participant.totalsum_manuelt || hasOmganger ? totalSum(participant) : undefined,
      initialRinger: participant.totalsum_manuelt || hasOmganger ? ringerSum(participant) : undefined,
      onSave: async (poeng, antallRinger) => {
        const { error } = await setCourtTotal(participant.id, poeng, antallRinger)
        if (error) { showToast('Feil ved lagring av totalsum.', 'error'); return false }
        showToast('Totalsum lagra.', 'success')
        return true
      },
    })
    if (hasOmganger) {
      void confirmDialog({
        title: 'Overstyr med totalsum',
        message: `Dette slettar alle omgangsskår for ${throwerName(participant.kaster)} og lagrar berre totalsummen. Vil du halde fram?`,
        danger: true,
      }).then(ok => { if (ok) open() })
    } else {
      open()
    }
  }

  function handleScoreCellClick(container: HTMLElement, deltakerId: number, cellIndex: number): void {
    const s = state
    if (!s) return
    const omganger = variant.omgangerForScoreCell(cellIndex, s.antallOmganger)
    if (omganger.length === 1) {
      openOmgangEdit(deltakerId, omganger[0]!)
      return
    }
    const cur = s.expandedCell
    s.expandedCell = cur && cur.deltakerId === deltakerId && cur.cellIndex === cellIndex
      ? null
      : { deltakerId, cellIndex }
    renderView(container)
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

      const swapCell = target.closest<HTMLElement>('[data-xk-swap]')
      if (swapCell) {
        await handleSwapClick(container, Number(swapCell.dataset.xkSwap))
        return
      }

      const totalCell = target.closest<HTMLElement>('[data-xk-total]')
      if (totalCell) {
        openTotalEdit(Number(totalCell.dataset.xkTotal))
        return
      }

      const omgangChip = target.closest<HTMLElement>('[data-xk-omgang-edit]')
      if (omgangChip) {
        const [pid, omgang] = omgangChip.dataset.xkOmgangEdit!.split(':').map(Number)
        openOmgangEdit(pid!, omgang!)
        return
      }

      const scoreCell = target.closest<HTMLElement>('[data-xk-score]')
      if (scoreCell) {
        const [pid, cellIndex] = scoreCell.dataset.xkScore!.split(':').map(Number)
        handleScoreCellClick(container, pid!, cellIndex!)
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

      state = { stevneid: id, isAdmin, config: configRes.data, antallOmganger, courts: courtsRes.data, carryOver: carryRes.data, swapSelectedId: null, expandedCell: null }
      renderView(container)
      bindActions(container)
      channel = subscribeToCourtChanges(id, variant.channelName(id), () => { void reload(container) })
    } catch (err) {
      logError('xkastKongelagView.render', err)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste data.'))
    }
  }
}
