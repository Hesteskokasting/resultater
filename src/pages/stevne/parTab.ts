import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { kasterNavn } from '@/utils/kaster'
import type { KasterListeRow } from '@/services/kasterService'
import { createRemoveButton } from '@/components/RemoveButton'
import { createPlayerTable } from '@/components/PlayerTable'
import { hentParForStevne, opprettPar, slettPar } from '@/services/pameldingService'
import type { PameldingPar } from '@/services/pameldingService'

// kjonn table ids — client-side UX guard only; the DB trigger is authoritative
const KJONN_MANN = 1
const KJONN_KVINNE = 2

export interface ParTabProps {
  stevneId: number
  isAdmin: boolean
  /** Mix: side A (posisjon 1) must be a woman, side B (posisjon 2) a man */
  erMix: boolean
  getPameldtIds: () => Set<number>
  alleSpelarar: KasterListeRow[]
  /** Reports current pair membership after every (re)render, so the parent can keep its guards in sync */
  onPairsChanged?: (pairedIds: Set<number>) => void
}

export interface ParTabHandle {
  element: HTMLElement
  /** Re-fetches pairs and re-renders with fresh pameldtIds */
  refresh: () => void
}

function kortNamn(k: { fornavn: string | null; etternavn: string | null } | null): string {
  const fornavn = k?.fornavn ?? ''
  const initial = k?.etternavn ? k.etternavn.charAt(0).toUpperCase() + '.' : ''
  return [fornavn, initial].filter(Boolean).join(' ')
}

/**
 * Renders nothing until the first refresh() — the parent calls it on tab
 * activation, so pairs are only fetched when (and if) the tab is opened.
 */
export function createParTab(props: ParTabProps): ParTabHandle {
  const root = document.createElement('div')
  root.appendChild(createLoadingState())
  return {
    element: root,
    refresh: () => { void renderPar(root, props) },
  }
}

async function renderPar(root: HTMLElement, props: ParTabProps): Promise<void> {
  const { stevneId, isAdmin, erMix, getPameldtIds, alleSpelarar } = props
  const pameldtIds = getPameldtIds()

  const { data: pairs, error } = await hentParForStevne(stevneId)
  if (error) {
    logError('createParTab', error)
    root.replaceChildren(createErrorBanner('Kunne ikkje laste par.'))
    return
  }

  const pairedIds = new Set(pairs.flatMap(p => [p.sideA.kasterid, p.sideB.kasterid]))
  props.onPairsChanged?.(pairedIds)
  const unpaired = alleSpelarar.filter(s => pameldtIds.has(s.id) && !pairedIds.has(s.id))

  let pendingA: KasterListeRow | null = null
  let pendingB: KasterListeRow | null = null
  let draggedId: number | null = null

  const layout = document.createElement('div')
  layout.className = 'row g-3'

  // ── Left: unpaired players ─────────────────────────────────────────────────

  const leftCol = document.createElement('div')
  leftCol.className = 'col-md-6 d-flex flex-column deltaker-kolonne'

  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.placeholder = 'Søk spelar…'
  searchInput.className = 'form-control mb-2'

  const unpairedTable = createPlayerTable({
    formatTitle: n => `Spelarar utan par: ${n}`,
    emptyText: 'Ingen fleire spelarar å tilordne',
    isDraggable: isAdmin,
    onDragStart: (sp, row) => {
      draggedId = sp.id
      row.classList.add('opacity-50')
    },
    onDragEnd: (_sp, row) => {
      draggedId = null
      row.classList.remove('opacity-50')
    },
  })

  function renderUnpaired(): void {
    const q = searchInput.value.toLowerCase()
    const available = unpaired.filter(s => {
      if (s.id === pendingA?.id || s.id === pendingB?.id) return false
      if (!q) return true
      return kasterNavn(s).toLowerCase().includes(q) || (s.klubb?.navn ?? '').toLowerCase().includes(q)
    })
    unpairedTable.setPlayers(available)
  }

  searchInput.addEventListener('input', renderUnpaired)

  leftCol.appendChild(searchInput)
  leftCol.appendChild(unpairedTable.element)

  // ── Right: pair creator + existing pairs ───────────────────────────────────

  const rightCol = document.createElement('div')
  rightCol.className = 'col-md-6 d-flex flex-column deltaker-kolonne'

  const rightTitle = document.createElement('h6')
  rightTitle.className = 'fw-bold mb-1'

  const parContainer = document.createElement('div')
  parContainer.className = 'flex-grow-1'

  function makeDropZone(side: 'A' | 'B'): HTMLElement {
    const zone = document.createElement('div')
    zone.className = 'par-slot border rounded px-2 py-2 text-center'
    const tomLabel = erMix ? (side === 'A' ? 'Side A (kvinne)' : 'Side B (mann)') : `Side ${side}`
    zone.setAttribute('aria-label', tomLabel)

    function refresh(): void {
      const player = side === 'A' ? pendingA : pendingB
      zone.textContent = player ? kortNamn(player) : tomLabel
      zone.classList.toggle('par-slot--filled', player != null)
    }

    refresh()

    zone.addEventListener('dragover', e => {
      e.preventDefault()
      zone.classList.add('par-slot--hover')
    })
    zone.addEventListener('dragleave', () => zone.classList.remove('par-slot--hover'))
    zone.addEventListener('drop', e => {
      e.preventDefault()
      zone.classList.remove('par-slot--hover')
      const id = draggedId ?? Number(e.dataTransfer?.getData('text/plain'))
      if (!id) return

      // Prevent the same player from filling both sides
      if (side === 'A' && pendingB?.id === id) return
      if (side === 'B' && pendingA?.id === id) return

      const sp = alleSpelarar.find(s => s.id === id)
      if (!sp) return

      if (erMix) {
        if (side === 'A' && sp.kjonnid !== KJONN_KVINNE) {
          showToast('Mix: Side A må vere ei kvinne', 'error')
          return
        }
        if (side === 'B' && sp.kjonnid !== KJONN_MANN) {
          showToast('Mix: Side B må vere ein mann', 'error')
          return
        }
      }

      if (side === 'A') pendingA = sp
      else pendingB = sp

      refresh()
      renderUnpaired()
      renderConfirmBtn()
    })

    return zone
  }

  const confirmBtn = document.createElement('button')
  confirmBtn.type = 'button'
  confirmBtn.className = 'btn btn-primary btn-sm w-100 d-none mt-2'
  confirmBtn.textContent = 'Opprett par'

  function renderConfirmBtn(): void {
    confirmBtn.classList.toggle('d-none', pendingA == null || pendingB == null)
  }

  confirmBtn.addEventListener('click', async () => {
    if (!pendingA || !pendingB) return
    confirmBtn.disabled = true
    const { error: err } = await opprettPar(stevneId, pendingA.id, pendingB.id)
    confirmBtn.disabled = false
    if (err) {
      showToast('Feil ved oppretting av par: ' + errorMessage(err), 'error')
      return
    }
    root.replaceChildren(createLoadingState())
    void renderPar(root, props)
  })

  function renderParListe(parList: PameldingPar[]): void {
    rightTitle.textContent = `Antal par: ${parList.length}`
    parContainer.innerHTML = ''

    if (!parList.length) {
      const empty = document.createElement('p')
      empty.className = 'text-muted fst-italic py-2 mb-0'
      empty.textContent = 'Ingen par oppretta enno'
      parContainer.appendChild(empty)
      return
    }

    for (const par of parList) {
      // Same grid as the slots row, so each cell lines up exactly under its
      // drop zone (cell A, cell B, then the 22px remove-button track)
      const row = document.createElement('div')
      row.className = 'par-rad par-grid-row mb-1'

      const sideACell = document.createElement('span')
      sideACell.className = 'par-par-celle border rounded px-2 py-1'
      sideACell.textContent = kortNamn(par.sideA.kaster)

      const sideBCell = document.createElement('span')
      sideBCell.className = 'par-par-celle border rounded px-2 py-1'
      sideBCell.textContent = kortNamn(par.sideB.kaster)

      row.appendChild(sideACell)
      row.appendChild(sideBCell)

      if (isAdmin) {
        const fjernBtn = createRemoveButton({
          title: 'Slett par',
          onClick: async () => {
            fjernBtn.disabled = true
            const { error: err } = await slettPar(stevneId, par.lag_id)
            if (err) {
              showToast('Feil ved sletting: ' + errorMessage(err), 'error')
              fjernBtn.disabled = false
              return
            }
            root.replaceChildren(createLoadingState())
            void renderPar(root, props)
          },
        })
        row.appendChild(fjernBtn)
      }

      parContainer.appendChild(row)
    }
  }

  // Assemble right column — slots row sits at the top aligned with the left
  // column's search input; a spacer preserves that alignment for non-admin.
  if (isAdmin) {
    // Same grid as the pair rows; the empty third (22px) track reserves space
    // for the remove button that pair rows have, keeping columns aligned.
    const slotsRow = document.createElement('div')
    slotsRow.className = 'par-grid-row mb-2'
    slotsRow.appendChild(makeDropZone('A'))
    slotsRow.appendChild(makeDropZone('B'))
    rightCol.appendChild(slotsRow)
    rightCol.appendChild(confirmBtn)
  } else {
    const spacer = document.createElement('div')
    spacer.className = 'form-control mb-2 deltaker-search-spacer'
    rightCol.appendChild(spacer)
  }

  rightCol.appendChild(rightTitle)
  rightCol.appendChild(parContainer)

  layout.appendChild(leftCol)
  layout.appendChild(rightCol)
  root.replaceChildren(layout)

  renderUnpaired()
  renderParListe(pairs)
}
