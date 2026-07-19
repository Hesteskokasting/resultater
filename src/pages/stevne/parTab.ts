import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { throwerName } from '@/utils/kaster'
import type { ThrowerListRow } from '@/services/kasterService'
import { createRemoveButton } from '@/components/RemoveButton'
import { createPlayerTable } from '@/components/PlayerTable'
import { createSearchInput } from '@/components/SearchInput'
import { getPairsForTournament, createPair, deletePair } from '@/services/pameldingService'
import type { RegistrationPair } from '@/services/pameldingService'

// gender table ids — client-side UX guard only; the DB trigger is authoritative
const GENDER_MALE = 1
const GENDER_FEMALE = 2

export interface PairTabProps {
  tournamentId: number
  isAdmin: boolean
  /** Mix: side A (posisjon 1) must be a woman, side B (posisjon 2) a man */
  isMix: boolean
  getRegisteredIds: () => Set<number>
  allThrowers: ThrowerListRow[]
  /** Reports current pair membership after every (re)render, so the parent can keep its guards in sync */
  onPairsChanged?: (pairedIds: Set<number>) => void
}

export interface PairTabHandle {
  element: HTMLElement
  /** Re-fetches pairs and re-renders with fresh registeredIds */
  refresh: () => void
}


/**
 * Renders nothing until the first refresh() — the parent calls it on tab
 * activation, so pairs are only fetched when (and if) the tab is opened.
 */
export function createPairTab(props: PairTabProps): PairTabHandle {
  const root = document.createElement('div')
  root.appendChild(createLoadingState())
  return {
    element: root,
    refresh: () => { void renderPairs(root, props) },
  }
}

async function renderPairs(root: HTMLElement, props: PairTabProps): Promise<void> {
  const { tournamentId, isAdmin, isMix, getRegisteredIds, allThrowers } = props
  const registeredIds = getRegisteredIds()

  const { data: pairs, error } = await getPairsForTournament(tournamentId)
  if (error) {
    logError('createPairTab', error)
    root.replaceChildren(createErrorBanner('Kunne ikkje laste par.'))
    return
  }

  const pairedIds = new Set(pairs.flatMap(p => [p.sideA.kasterid, p.sideB.kasterid]))
  props.onPairsChanged?.(pairedIds)
  const unpaired = allThrowers.filter(s => registeredIds.has(s.id) && !pairedIds.has(s.id))

  let pendingA: ThrowerListRow | null = null
  let pendingB: ThrowerListRow | null = null
  let draggedId: number | null = null

  const layout = document.createElement('div')
  layout.className = 'row g-3'

  // ── Left: unpaired players ─────────────────────────────────────────────────

  const leftCol = document.createElement('div')
  leftCol.className = 'col-md-6 d-flex flex-column participant-column'

  const searchInput = createSearchInput({
    placeholder: 'Søk spelar…',
    variant: 'form',
    onInput: () => renderUnpaired(),
  })
  searchInput.classList.add('mb-2')

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
      return throwerName(s).toLowerCase().includes(q) || (s.klubb?.navn ?? '').toLowerCase().includes(q)
    })
    unpairedTable.setPlayers(available)
  }

  leftCol.appendChild(searchInput)
  leftCol.appendChild(unpairedTable.element)

  // ── Right: pair creator + existing pairs ───────────────────────────────────

  const rightCol = document.createElement('div')
  rightCol.className = 'col-md-6 d-flex flex-column participant-column'

  const rightTitle = document.createElement('h6')
  rightTitle.className = 'fw-bold mb-1'

  const pairContainer = document.createElement('div')
  pairContainer.className = 'flex-grow-1'

  function makeDropZone(side: 'A' | 'B'): HTMLElement {
    const zone = document.createElement('div')
    zone.className = 'pair-slot border rounded px-2 py-2 text-center'
    const emptyLabel = isMix ? (side === 'A' ? 'Side A (kvinne)' : 'Side B (mann)') : `Side ${side}`
    zone.setAttribute('aria-label', emptyLabel)

    function refresh(): void {
      const player = side === 'A' ? pendingA : pendingB
      zone.textContent = player ? throwerName(player) : emptyLabel
      zone.classList.toggle('pair-slot--filled', player != null)
    }

    refresh()

    zone.addEventListener('dragover', e => {
      e.preventDefault()
      zone.classList.add('pair-slot--hover')
    })
    zone.addEventListener('dragleave', () => zone.classList.remove('pair-slot--hover'))
    zone.addEventListener('drop', e => {
      e.preventDefault()
      zone.classList.remove('pair-slot--hover')
      const id = draggedId ?? Number(e.dataTransfer?.getData('text/plain'))
      if (!id) return

      // Prevent the same player from filling both sides
      if (side === 'A' && pendingB?.id === id) return
      if (side === 'B' && pendingA?.id === id) return

      const sp = allThrowers.find(s => s.id === id)
      if (!sp) return

      if (isMix) {
        if (side === 'A' && sp.kjonnid !== GENDER_FEMALE) {
          showToast('Mix: Side A må vere ei kvinne', 'error')
          return
        }
        if (side === 'B' && sp.kjonnid !== GENDER_MALE) {
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
    const { error: err } = await createPair(tournamentId, pendingA.id, pendingB.id)
    confirmBtn.disabled = false
    if (err) {
      showToast('Feil ved oppretting av par: ' + errorMessage(err), 'error')
      return
    }
    root.replaceChildren(createLoadingState())
    void renderPairs(root, props)
  })

  function renderPairList(pairList: RegistrationPair[]): void {
    rightTitle.textContent = `Antal par: ${pairList.length}`
    pairContainer.innerHTML = ''

    if (!pairList.length) {
      const empty = document.createElement('p')
      empty.className = 'text-muted fst-italic py-2 mb-0'
      empty.textContent = 'Ingen par oppretta enno'
      pairContainer.appendChild(empty)
      return
    }

    for (const pair of pairList) {
      // Same grid as the slots row, so each cell lines up exactly under its
      // drop zone (cell A, cell B, then the 22px remove-button track)
      const row = document.createElement('div')
      row.className = 'pair-row pair-grid-row mb-1'

      const sideACell = document.createElement('span')
      sideACell.className = 'pair-cell border rounded px-2 py-1'
      sideACell.textContent = throwerName(pair.sideA.kaster)

      const sideBCell = document.createElement('span')
      sideBCell.className = 'pair-cell border rounded px-2 py-1'
      sideBCell.textContent = throwerName(pair.sideB.kaster)

      row.appendChild(sideACell)
      row.appendChild(sideBCell)

      if (isAdmin) {
        const removeBtn = createRemoveButton({
          title: 'Slett par',
          onClick: async () => {
            removeBtn.disabled = true
            const { error: err } = await deletePair(tournamentId, pair.lag_id)
            if (err) {
              showToast('Feil ved sletting: ' + errorMessage(err), 'error')
              removeBtn.disabled = false
              return
            }
            root.replaceChildren(createLoadingState())
            void renderPairs(root, props)
          },
        })
        row.appendChild(removeBtn)
      }

      pairContainer.appendChild(row)
    }
  }

  // Assemble right column — slots row sits at the top aligned with the left
  // column's search input; a spacer preserves that alignment for non-admin.
  if (isAdmin) {
    // Same grid as the pair rows; the empty third (22px) track reserves space
    // for the remove button that pair rows have, keeping columns aligned.
    const slotsRow = document.createElement('div')
    slotsRow.className = 'pair-grid-row mb-2'
    slotsRow.appendChild(makeDropZone('A'))
    slotsRow.appendChild(makeDropZone('B'))
    rightCol.appendChild(slotsRow)
    rightCol.appendChild(confirmBtn)
  } else {
    const spacer = document.createElement('div')
    spacer.className = 'form-control mb-2 participant-search-spacer'
    rightCol.appendChild(spacer)
  }

  rightCol.appendChild(rightTitle)
  rightCol.appendChild(pairContainer)

  layout.appendChild(leftCol)
  layout.appendChild(rightCol)
  root.replaceChildren(layout)

  renderUnpaired()
  renderPairList(pairs)
}
