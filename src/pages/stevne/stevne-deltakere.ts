import { throwerName } from '@/utils/kaster'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { getActiveThrowerList } from '@/services/kasterService'
import type { ThrowerListRow } from '@/services/kasterService'
import {
  getRegistrationStatusForTournament,
  addRegistrationAdmin,
  confirmRegistrationForThrower,
  removeRegistrationForThrower,
} from '@/services/pameldingService'
import { getTournamentHeader, getInitialMethodName } from '@/services/stevneService'
import { setOnDisconnect } from '@/services/receiptPrinterService'
import { createPrinterBanner } from '@/pages/stevne/PrinterBanner'
import type { PrinterBanner } from '@/pages/stevne/PrinterBanner'
import { createRemoveButton } from '@/components/RemoveButton'
import { createPlayerTable } from '@/components/PlayerTable'
import type { PlayerTableHandle } from '@/components/PlayerTable'
import { createLoadingState } from '@/components/LoadingState'
import { createTabs } from '@/components/Tabs'
import { createPairTab } from '@/pages/stevne/parTab'

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortThrowers(throwers: ThrowerListRow[]): ThrowerListRow[] {
  return [...throwers].sort((a, b) => {
    const clubCmp = (a.klubb?.navn ?? '').localeCompare(b.klubb?.navn ?? '', 'nb')
    if (clubCmp !== 0) return clubCmp
    const lastNameCmp = (a.etternavn ?? '').localeCompare(b.etternavn ?? '', 'nb')
    if (lastNameCmp !== 0) return lastNameCmp
    return (a.fornavn ?? '').localeCompare(b.fornavn ?? '', 'nb')
  })
}

function filterAvailable(
  throwers: ThrowerListRow[],
  search: string,
  registeredMap: Map<number, boolean>,
): ThrowerListRow[] {
  const q = search.toLowerCase()
  return throwers.filter(p => {
    if (registeredMap.has(p.id)) return false
    return !q || throwerName(p).toLowerCase().includes(q) || (p.klubb?.navn ?? '').toLowerCase().includes(q)
  })
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState())

  // Drop any disconnect callback from a previous render; the banner block re-registers a fresh one.
  setOnDisconnect(null)

  try {
    const [stevneRes, throwersRes, registrationRes, methodRes] = await Promise.all([
      getTournamentHeader(id),
      getActiveThrowerList(),
      getRegistrationStatusForTournament(id),
      getInitialMethodName(id),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }
    if (throwersRes.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste kasterliste.'))
      return
    }

    const phase       = stevneRes.data.stevne_fase ?? null
    const canEdit     = isAdmin && (phase === null || phase === 'ikke_startet')
    const isStarted   = phase !== null && phase !== 'ikke_startet'
    const isTeam      = stevneRes.data.kategori?.erlagbasert ?? false
    const isGloppen   = !methodRes.error && methodRes.navn.includes('gloppen')
    const allThrowers = throwersRes.data

    const registeredMap = new Map<number, boolean>()
    const pairedIds = new Set<number>()
    for (const p of registrationRes.data) {
      if (p.kasterid != null) {
        registeredMap.set(p.kasterid, p.er_bekreftet ?? false)
        if (p.lag_id != null) pairedIds.add(p.kasterid)
      }
    }

    // Pair tab renders lazily on first activation; true again whenever
    // enrollment changes so the next activation re-fetches
    let pairTabDirty = true

    const wrapper = document.createElement('div')

    // ── Printer connect banner (admin + Gloppen only) ─────────────────────────

    let printerBanner: PrinterBanner | undefined
    if (isAdmin && isGloppen && isStarted) {
      printerBanner = createPrinterBanner({
        tournamentId: id,
        tournamentName: stevneRes.data.navn,
        isTeam,
        onStateChange: () => renderRegisteredList(),
      })
      wrapper.appendChild(printerBanner.element)
    }

    const layout = document.createElement('div')
    layout.className = 'row g-3'

    // ── Left column: available throwers (only when tournament not started) ──

    let searchInput: HTMLInputElement | null = null
    let availableTable: PlayerTableHandle | null = null

    if (!isStarted) {
      const leftWrapper = document.createElement('div')
      leftWrapper.className = 'col-md-6 d-flex flex-column participant-column'

      searchInput = document.createElement('input')
      searchInput.type = 'text'
      searchInput.placeholder = 'Søk etter navn eller klubb…'
      searchInput.className = 'form-control mb-2'

      availableTable = createPlayerTable({
        formatTitle: () => 'Tilgjengelege spelarar',
        emptyText: 'Ingen spelarar funne',
        clubFallback: 'Ingen klubb',
        onRowClick: canEdit
          ? async s => {
              const { error } = await addRegistrationAdmin(id, s.id)
              if (error) { showToast('Feil ved innmelding: ' + errorMessage(error), 'error'); return }
              registeredMap.set(s.id, false)
              pairTabDirty = true
              printerBanner?.invalidateMatchData()
              renderRegisteredList()
              renderAvailableList()
            }
          : undefined,
      })
      leftWrapper.appendChild(searchInput)
      leftWrapper.appendChild(availableTable.element)
      layout.appendChild(leftWrapper)
    }

    // ── Right column: registered throwers ────────────────────────────────────

    const rightWrapper = document.createElement('div')
    rightWrapper.className = `${isStarted ? 'col-12' : 'col-md-6'} d-flex flex-column participant-column`

    if (!isStarted) {
      const searchSpacer = document.createElement('input')
      searchSpacer.type = 'text'
      searchSpacer.className = 'form-control mb-2 participant-search-spacer'
      searchSpacer.tabIndex = -1
      searchSpacer.disabled = true
      rightWrapper.appendChild(searchSpacer)
    }

    // Print column exists whenever the banner does; the per-row button is
    // re-evaluated on every render so it tracks the live printer connection.
    const renderPrintCell = printerBanner
      ? (sp: ThrowerListRow): HTMLElement | null => {
          const handler = printerBanner.getPrintHandler()
          if (!handler) return null
          const printBtn = document.createElement('button')
          printBtn.textContent = '🖨'
          printBtn.className = 'btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn'
          printBtn.title = 'Skriv ut startkort'
          printBtn.addEventListener('click', e => { e.stopPropagation(); handler(sp) })
          return printBtn
        }
      : null

    const registeredTable = createPlayerTable({
      formatTitle: n => `Påmelde spelarar: ${n}`,
      emptyText: 'Ingen spelarar påmelde',
      renderLeading: sp => {
        if (registeredMap.get(sp.id) ?? false) {
          const checkmark = document.createElement('span')
          checkmark.className = 'text-success fw-bold'
          checkmark.textContent = '✓'
          return checkmark
        }
        if (!canEdit) return null
        const confirmBtn = document.createElement('button')
        confirmBtn.textContent = '✓'
        confirmBtn.className = 'btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn'
        confirmBtn.title = 'Bekreft spelar'
        confirmBtn.addEventListener('click', async e => {
          e.stopPropagation()
          const { error } = await confirmRegistrationForThrower(id, sp.id)
          if (error) { showToast('Feil ved bekreftelse: ' + errorMessage(error), 'error'); return }
          registeredMap.set(sp.id, true)
          renderRegisteredList()
        })
        return confirmBtn
      },
      renderTrailing: [
        sp => canEdit
          ? createRemoveButton({
              title: 'Fjern spelar',
              onClick: async () => {
                if (pairedIds.has(sp.id)) { showToast('Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.', 'error'); return }
                const { error } = await removeRegistrationForThrower(id, sp.id)
                if (error) { showToast('Feil ved fjerning: ' + errorMessage(error), 'error'); return }
                registeredMap.delete(sp.id)
                pairTabDirty = true
                printerBanner?.invalidateMatchData()
                renderRegisteredList()
                renderAvailableList()
              },
            })
          : null,
        ...(renderPrintCell ? [renderPrintCell] : []),
      ],
    })
    rightWrapper.appendChild(registeredTable.element)

    // ── Render helpers ────────────────────────────────────────────────────────

    function renderRegisteredList(): void {
      registeredTable.setPlayers(sortThrowers(allThrowers.filter(p => registeredMap.has(p.id))))
    }

    function renderAvailableList(): void {
      if (!searchInput || !availableTable) return
      availableTable.setPlayers(sortThrowers(filterAvailable(allThrowers, searchInput.value, registeredMap)))
    }

    layout.appendChild(rightWrapper)

    if (isTeam) {
      const pairTab = createPairTab({
        tournamentId: id,
        isAdmin: canEdit,
        isMix: (stevneRes.data.kategori?.navn ?? '').toLowerCase().includes('mix'),
        getRegisteredIds: () => new Set(registeredMap.keys()),
        allThrowers,
        onPairsChanged: ids => {
          pairedIds.clear()
          for (const kid of ids) pairedIds.add(kid)
        },
      })
      wrapper.appendChild(createTabs({
        tabs: [
          { id: 'players', label: 'Spelarar', panel: layout },
          { id: 'pairs', label: 'Administrer par', panel: pairTab.element },
        ],
        onChange: tabId => {
          if (tabId === 'pairs' && pairTabDirty) {
            pairTabDirty = false
            pairTab.refresh()
          }
        },
      }))
    } else {
      wrapper.appendChild(layout)
    }

    container.replaceChildren(wrapper)

    if (searchInput) searchInput.addEventListener('input', renderAvailableList)
    renderRegisteredList()
    renderAvailableList()
  } catch (err) {
    logError('stevne-deltakere.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste deltakarliste.'))
  }
}
