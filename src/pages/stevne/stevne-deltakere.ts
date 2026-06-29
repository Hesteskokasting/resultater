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
import { createParTab } from '@/pages/stevne/parTab'

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function sorterKastere(kastere: ThrowerListRow[]): ThrowerListRow[] {
  return [...kastere].sort((a, b) => {
    const klubbCmp = (a.klubb?.navn ?? '').localeCompare(b.klubb?.navn ?? '', 'nb')
    if (klubbCmp !== 0) return klubbCmp
    const etternavnCmp = (a.etternavn ?? '').localeCompare(b.etternavn ?? '', 'nb')
    if (etternavnCmp !== 0) return etternavnCmp
    return (a.fornavn ?? '').localeCompare(b.fornavn ?? '', 'nb')
  })
}

function filtrerTilgjengelege(
  kastere: ThrowerListRow[],
  search: string,
  registrerte: Map<number, boolean>,
): ThrowerListRow[] {
  const q = search.toLowerCase()
  return kastere.filter(p => {
    if (registrerte.has(p.id)) return false
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
    const [stevneRes, kastereRes, pameldingRes, metodeRes] = await Promise.all([
      getTournamentHeader(id),
      getActiveThrowerList(),
      getRegistrationStatusForTournament(id),
      getInitialMethodName(id),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }
    if (kastereRes.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste kasterliste.'))
      return
    }

    const fase       = stevneRes.data.stevne_fase ?? null
    const kanEndrast = isAdmin && (fase === null || fase === 'ikke_startet')
    const isStarted  = fase !== null && fase !== 'ikke_startet'
    const erLag      = stevneRes.data.kategori?.erlagbasert ?? false
    const isGloppen  = !metodeRes.error && metodeRes.navn.includes('gloppen')
    const alleSpelarar = kastereRes.data

    const pameldtMap = new Map<number, boolean>()
    const pairedIds = new Set<number>()
    for (const p of pameldingRes.data) {
      if (p.kasterid != null) {
        pameldtMap.set(p.kasterid, p.er_bekreftet ?? false)
        if (p.lag_id != null) pairedIds.add(p.kasterid)
      }
    }

    // Par tab renders lazily on first activation; true again whenever
    // enrollment changes so the next activation re-fetches
    let parTabDirty = true

    const wrapper = document.createElement('div')

    // ── Printer connect banner (admin + Gloppen only) ─────────────────────────

    let printerBanner: PrinterBanner | undefined
    if (isAdmin && isGloppen && isStarted) {
      printerBanner = createPrinterBanner({
        stevneId: id,
        stevneNavn: stevneRes.data.navn,
        erLag,
        onStateChange: () => renderPameldtListe(),
      })
      wrapper.appendChild(printerBanner.element)
    }

    const layout = document.createElement('div')
    layout.className = 'row g-3'

    // ── Venstre kolonne: tilgjengelege spelarar (berre når stevnet ikkje er starta) ──

    let searchInput: HTMLInputElement | null = null
    let tilgjengeliTable: PlayerTableHandle | null = null

    if (!isStarted) {
      const leftWrapper = document.createElement('div')
      leftWrapper.className = 'col-md-6 d-flex flex-column deltaker-kolonne'

      searchInput = document.createElement('input')
      searchInput.type = 'text'
      searchInput.placeholder = 'Søk etter navn eller klubb…'
      searchInput.className = 'form-control mb-2'

      tilgjengeliTable = createPlayerTable({
        formatTitle: () => 'Tilgjengelege spelarar',
        emptyText: 'Ingen spelarar funne',
        clubFallback: 'Ingen klubb',
        onRowClick: kanEndrast
          ? async s => {
              const { error } = await addRegistrationAdmin(id, s.id)
              if (error) { showToast('Feil ved innmelding: ' + errorMessage(error), 'error'); return }
              pameldtMap.set(s.id, false)
              parTabDirty = true
              printerBanner?.invalidateMatchData()
              renderPameldtListe()
              renderTilgjengeliListe()
            }
          : undefined,
      })
      leftWrapper.appendChild(searchInput)
      leftWrapper.appendChild(tilgjengeliTable.element)
      layout.appendChild(leftWrapper)
    }

    // ── Høgre kolonne: påmelde spelarar ──────────────────────────────────────

    const rightWrapper = document.createElement('div')
    rightWrapper.className = `${isStarted ? 'col-12' : 'col-md-6'} d-flex flex-column deltaker-kolonne`

    if (!isStarted) {
      const searchSpacer = document.createElement('input')
      searchSpacer.type = 'text'
      searchSpacer.className = 'form-control mb-2 deltaker-search-spacer'
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
          printBtn.className = 'btn btn-outline-secondary btn-sm p-0 lh-1 deltaker-print-btn'
          printBtn.title = 'Skriv ut startkort'
          printBtn.addEventListener('click', e => { e.stopPropagation(); handler(sp) })
          return printBtn
        }
      : null

    const pameldtTable = createPlayerTable({
      formatTitle: n => `Påmelde spelarar: ${n}`,
      emptyText: 'Ingen spelarar påmelde',
      renderLeading: sp => {
        if (pameldtMap.get(sp.id) ?? false) {
          const hake = document.createElement('span')
          hake.className = 'text-success fw-bold'
          hake.textContent = '✓'
          return hake
        }
        if (!kanEndrast) return null
        const bekreftBtn = document.createElement('button')
        bekreftBtn.textContent = '✓'
        bekreftBtn.className = 'btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn'
        bekreftBtn.title = 'Bekreft spelar'
        bekreftBtn.addEventListener('click', async e => {
          e.stopPropagation()
          const { error } = await confirmRegistrationForThrower(id, sp.id)
          if (error) { showToast('Feil ved bekreftelse: ' + errorMessage(error), 'error'); return }
          pameldtMap.set(sp.id, true)
          renderPameldtListe()
        })
        return bekreftBtn
      },
      renderTrailing: [
        sp => kanEndrast
          ? createRemoveButton({
              title: 'Fjern spelar',
              onClick: async () => {
                if (pairedIds.has(sp.id)) { showToast('Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.', 'error'); return }
                const { error } = await removeRegistrationForThrower(id, sp.id)
                if (error) { showToast('Feil ved fjerning: ' + errorMessage(error), 'error'); return }
                pameldtMap.delete(sp.id)
                parTabDirty = true
                printerBanner?.invalidateMatchData()
                renderPameldtListe()
                renderTilgjengeliListe()
              },
            })
          : null,
        ...(renderPrintCell ? [renderPrintCell] : []),
      ],
    })
    rightWrapper.appendChild(pameldtTable.element)

    // ── Renderfunksjonar ──────────────────────────────────────────────────────

    function renderPameldtListe(): void {
      pameldtTable.setPlayers(sorterKastere(alleSpelarar.filter(p => pameldtMap.has(p.id))))
    }

    function renderTilgjengeliListe(): void {
      if (!searchInput || !tilgjengeliTable) return
      tilgjengeliTable.setPlayers(sorterKastere(filtrerTilgjengelege(alleSpelarar, searchInput.value, pameldtMap)))
    }

    layout.appendChild(rightWrapper)

    if (erLag) {
      const parTab = createParTab({
        stevneId: id,
        isAdmin: kanEndrast,
        erMix: (stevneRes.data.kategori?.navn ?? '').toLowerCase().includes('mix'),
        getPameldtIds: () => new Set(pameldtMap.keys()),
        alleSpelarar,
        onPairsChanged: ids => {
          pairedIds.clear()
          for (const kid of ids) pairedIds.add(kid)
        },
      })
      wrapper.appendChild(createTabs({
        tabs: [
          { id: 'spelarar', label: 'Spelarar', panel: layout },
          { id: 'pairs', label: 'Administrer par', panel: parTab.element },
        ],
        onChange: tabId => {
          if (tabId === 'pairs' && parTabDirty) {
            parTabDirty = false
            parTab.refresh()
          }
        },
      }))
    } else {
      wrapper.appendChild(layout)
    }

    container.replaceChildren(wrapper)

    if (searchInput) searchInput.addEventListener('input', renderTilgjengeliListe)
    renderPameldtListe()
    renderTilgjengeliListe()
  } catch (err) {
    logError('stevne-deltakere.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste deltakarliste.'))
  }
}
