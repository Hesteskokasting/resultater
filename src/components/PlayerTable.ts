import { kasterNavn } from '@/utils/kaster'
import type { KasterListeRow } from '@/services/kasterService'

export interface PlayerTableProps {
  /** Builds the heading text from the current row count (callers decide whether to show the count) */
  formatTitle: (count: number) => string
  /** Shown when there are no rows */
  emptyText: string
  /** Optional click handler on the whole row (e.g. add to enrollment) */
  onRowClick?: (player: KasterListeRow) => void
  /** Make rows draggable (sets dataset.kasterid + text/plain = player id) */
  isDraggable?: boolean
  onDragStart?: (player: KasterListeRow, row: HTMLTableRowElement) => void
  onDragEnd?: (player: KasterListeRow, row: HTMLTableRowElement) => void
  /** Cell rendered before the name (e.g. confirm button / checkmark). Return null for an empty cell. */
  renderLeading?: (player: KasterListeRow) => HTMLElement | null
  /** Cells rendered after the club column (e.g. remove, print). Each returns null for an empty cell. */
  renderTrailing?: ((player: KasterListeRow) => HTMLElement | null)[]
  /** Text shown when a player has no club */
  clubFallback?: string
}

export interface PlayerTableHandle {
  /** The titled, scrollable, width-capped column — drop into a col-md-6 wrapper */
  element: HTMLElement
  /** Re-render the body with the given players and update the heading count */
  setPlayers: (players: KasterListeRow[]) => void
}

export function createPlayerTable(props: PlayerTableProps): PlayerTableHandle {
  const { formatTitle, emptyText, onRowClick, isDraggable, onDragStart, onDragEnd, renderLeading, renderTrailing, clubFallback } = props

  const hasLeading = renderLeading != null
  const trailing = renderTrailing ?? []
  const colCount = (hasLeading ? 1 : 0) + 2 + trailing.length

  const column = document.createElement('div')
  column.className = 'd-flex flex-column flex-grow-1'

  const titleEl = document.createElement('h6')
  titleEl.className = 'fw-bold mb-1'

  const wrapper = document.createElement('div')
  wrapper.className = 'deltaker-tabell-wrapper flex-grow-1 overflow-auto'

  const table = document.createElement('table')
  table.className = 'table table-sm table-hover mb-0'
  const tbody = document.createElement('tbody')
  table.appendChild(tbody)

  wrapper.appendChild(table)
  column.appendChild(titleEl)
  column.appendChild(wrapper)

  function actionCell(child: HTMLElement | null): HTMLTableCellElement {
    const cell = document.createElement('td')
    cell.className = 'text-center th-40'
    if (child) cell.appendChild(child)
    return cell
  }

  function buildRow(player: KasterListeRow): HTMLTableRowElement {
    const row = document.createElement('tr')

    if (hasLeading) row.appendChild(actionCell(renderLeading(player)))

    const nameCell = document.createElement('td')
    nameCell.textContent = kasterNavn(player)
    row.appendChild(nameCell)

    const clubCell = document.createElement('td')
    clubCell.textContent = player.klubb?.navn ?? clubFallback ?? ''
    row.appendChild(clubCell)

    for (const render of trailing) row.appendChild(actionCell(render(player)))

    if (onRowClick) {
      row.classList.add('deltaker-rad')
      row.addEventListener('click', () => onRowClick(player))
    }

    if (isDraggable) {
      row.draggable = true
      row.dataset.kasterid = String(player.id)
      row.addEventListener('dragstart', e => {
        e.dataTransfer?.setData('text/plain', String(player.id))
        onDragStart?.(player, row)
      })
      row.addEventListener('dragend', () => onDragEnd?.(player, row))
    }

    return row
  }

  function setPlayers(players: KasterListeRow[]): void {
    titleEl.textContent = formatTitle(players.length)
    tbody.replaceChildren()

    if (!players.length) {
      const emptyRow = document.createElement('tr')
      const cell = document.createElement('td')
      cell.className = 'text-center text-muted fst-italic py-3'
      cell.textContent = emptyText
      cell.colSpan = colCount
      emptyRow.appendChild(cell)
      tbody.appendChild(emptyRow)
      return
    }

    for (const player of players) tbody.appendChild(buildRow(player))
  }

  return { element: column, setPlayers }
}
