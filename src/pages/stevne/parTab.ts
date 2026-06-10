import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { kasterNavn } from '@/utils/kaster'
import type { KasterListeRow } from '@/services/kasterService'
import { hentParForStevne, opprettPar, slettPar } from '@/services/pameldingService'
import type { PameldingPar } from '@/services/pameldingService'

export interface ParTabProps {
  stevneId: number
  isAdmin: boolean
  pameldtIds: Set<number>
  alleSpelarar: KasterListeRow[]
}

function kortNamn(k: { fornavn: string | null; etternavn: string | null } | null): string {
  const fornavn = k?.fornavn ?? ''
  const initial = k?.etternavn ? k.etternavn[0].toUpperCase() + '.' : ''
  return [fornavn, initial].filter(Boolean).join(' ')
}

export function createParTab(props: ParTabProps): HTMLElement {
  const root = document.createElement('div')
  root.appendChild(createLoadingState())
  void renderPar(root, props)
  return root
}

async function renderPar(root: HTMLElement, props: ParTabProps): Promise<void> {
  const { stevneId, isAdmin, pameldtIds, alleSpelarar } = props

  const { data: parar, error } = await hentParForStevne(stevneId)
  if (error) {
    logError('createParTab', error)
    root.replaceChildren(createErrorBanner('Kunne ikkje laste par.'))
    return
  }

  const pairedIds = new Set(parar.flatMap(p => [p.sideA.kasterid, p.sideB.kasterid]))
  const unpaired = alleSpelarar.filter(s => pameldtIds.has(s.id) && !pairedIds.has(s.id))

  let pendingA: KasterListeRow | null = null
  let pendingB: KasterListeRow | null = null
  let draggedId: number | null = null

  const layout = document.createElement('div')
  layout.className = 'row g-3'

  // ── Left: unpaired players ─────────────────────────────────────────────────

  const leftCol = document.createElement('div')
  leftCol.className = 'col-md-6 d-flex flex-column'

  const leftTitle = document.createElement('h6')
  leftTitle.className = 'fw-bold mb-1'

  const playerListWrapper = document.createElement('div')
  playerListWrapper.className = 'border rounded par-spelarar-liste flex-grow-1 overflow-auto'

  function renderUnpaired(): void {
    const available = unpaired.filter(s => s.id !== pendingA?.id && s.id !== pendingB?.id)
    leftTitle.textContent = `Spelarar utan par: ${available.length}`
    playerListWrapper.innerHTML = ''

    if (!available.length) {
      const empty = document.createElement('p')
      empty.className = 'text-muted fst-italic text-center py-3 mb-0'
      empty.textContent = 'Ingen fleire spelarar å tilordne'
      playerListWrapper.appendChild(empty)
      return
    }

    for (const sp of available) {
      const card = document.createElement('div')
      card.className = 'par-spelar-kort px-2 py-1 border-bottom'
      card.textContent = kasterNavn(sp)

      if (isAdmin) {
        card.draggable = true
        card.setAttribute('tabindex', '0')
        card.dataset.kasterid = String(sp.id)

        card.addEventListener('dragstart', e => {
          draggedId = sp.id
          e.dataTransfer?.setData('text/plain', String(sp.id))
          card.classList.add('opacity-50')
        })
        card.addEventListener('dragend', () => {
          draggedId = null
          card.classList.remove('opacity-50')
        })
      }

      playerListWrapper.appendChild(card)
    }
  }

  leftCol.appendChild(leftTitle)
  leftCol.appendChild(playerListWrapper)

  // ── Right: pair creator + existing pairs ───────────────────────────────────

  const rightCol = document.createElement('div')
  rightCol.className = 'col-md-6 d-flex flex-column'

  const rightTitle = document.createElement('h6')
  rightTitle.className = 'fw-bold mb-1'

  const parContainer = document.createElement('div')
  parContainer.className = 'flex-grow-1'

  function makeDropZone(side: 'A' | 'B'): HTMLElement {
    const zone = document.createElement('div')
    zone.className = 'par-slot border rounded px-2 py-2 text-center flex-grow-1'
    zone.setAttribute('aria-label', `Side ${side}`)

    function refresh(): void {
      const player = side === 'A' ? pendingA : pendingB
      zone.textContent = player ? kortNamn(player) : `Side ${side}`
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
      const msg = err instanceof Error ? err.message : String(err)
      showToast('Feil ved oppretting av par: ' + msg, 'error')
      return
    }
    root.replaceChildren(createLoadingState())
    void renderPar(root, props)
  })

  function renderParListe(parList: PameldingPar[]): void {
    rightTitle.textContent = `Parar: ${parList.length}`
    parContainer.innerHTML = ''

    if (!parList.length) {
      const empty = document.createElement('p')
      empty.className = 'text-muted fst-italic py-2 mb-0'
      empty.textContent = 'Ingen par oppretta enno'
      parContainer.appendChild(empty)
      return
    }

    for (const par of parList) {
      const row = document.createElement('div')
      row.className = 'par-rad d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1'

      const nameSpan = document.createElement('span')
      nameSpan.textContent = `${kortNamn(par.sideA.kaster)} / ${kortNamn(par.sideB.kaster)}`
      row.appendChild(nameSpan)

      if (isAdmin) {
        const fjernBtn = document.createElement('button')
        fjernBtn.type = 'button'
        fjernBtn.innerHTML = '&times;'
        fjernBtn.className = 'btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn'
        fjernBtn.title = 'Slett par'
        fjernBtn.addEventListener('click', async () => {
          fjernBtn.disabled = true
          const { error: err } = await slettPar(stevneId, par.lag_id)
          if (err) {
            showToast('Feil ved sletting: ' + (err instanceof Error ? err.message : String(err)), 'error')
            fjernBtn.disabled = false
            return
          }
          root.replaceChildren(createLoadingState())
          void renderPar(root, props)
        })
        row.appendChild(fjernBtn)
      }

      parContainer.appendChild(row)
    }
  }

  // Assemble right column
  if (isAdmin) {
    const slotsRow = document.createElement('div')
    slotsRow.className = 'd-flex gap-2 mb-1'
    slotsRow.appendChild(makeDropZone('A'))
    slotsRow.appendChild(makeDropZone('B'))

    const newParSection = document.createElement('div')
    newParSection.className = 'mb-3'
    newParSection.appendChild(slotsRow)
    newParSection.appendChild(confirmBtn)
    rightCol.appendChild(newParSection)
  }

  rightCol.appendChild(rightTitle)
  rightCol.appendChild(parContainer)

  layout.appendChild(leftCol)
  layout.appendChild(rightCol)
  root.replaceChildren(layout)

  renderUnpaired()
  renderParListe(parar)
}
