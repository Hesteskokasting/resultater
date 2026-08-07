import { throwerName } from "@/utils/kaster";
import type { ThrowerListRow } from "@/services/kasterService";

export interface PlayerTableProps {
  /** Builds the heading text from the current row count (callers decide whether to show the count) */
  formatTitle: (count: number) => string;
  /** Muted status text on the right of the heading, e.g. "1 av 4 bekreftet" */
  formatMeta?: (players: ThrowerListRow[]) => string;
  /** Shown when there are no rows */
  emptyText: string;
  /** Optional click handler on the whole row (e.g. add to enrollment) */
  onRowClick?: (player: ThrowerListRow) => void;
  /** Make rows draggable (sets dataset.kasterid + text/plain = player id) */
  isDraggable?: boolean;
  onDragStart?: (player: ThrowerListRow, row: HTMLTableRowElement) => void;
  onDragEnd?: (player: ThrowerListRow, row: HTMLTableRowElement) => void;
  /** Cell rendered before the name (e.g. confirm button / checkmark). Return null for an empty cell. */
  renderLeading?: (player: ThrowerListRow) => HTMLElement | null;
  /** Cells rendered after the club column (e.g. remove, print). Each returns null for an empty cell. */
  renderTrailing?: ((player: ThrowerListRow) => HTMLElement | null)[];
  /** Text shown when a player has no club */
  clubFallback?: string;
  /** Render the club as a small line under the name instead of its own column */
  stackClub?: boolean;
  /** Extra class(es) for the row, e.g. to mark an already-registered player */
  rowClass?: (player: ThrowerListRow) => string | undefined;
  /** Extra text appended to the club line, e.g. "påmeld" */
  clubSuffix?: (player: ThrowerListRow) => string | undefined;
}

export interface PlayerTableHandle {
  /** The titled, scrollable, width-capped column — drop into a col-md-6 wrapper */
  element: HTMLElement;
  /** Re-render the body with the given players and update the heading count */
  setPlayers: (players: ThrowerListRow[]) => void;
}

export function createPlayerTable(props: PlayerTableProps): PlayerTableHandle {
  const {
    formatTitle,
    formatMeta,
    emptyText,
    onRowClick,
    isDraggable,
    onDragStart,
    onDragEnd,
    renderLeading,
    renderTrailing,
    clubFallback,
    stackClub,
    rowClass,
    clubSuffix,
  } = props;

  const hasLeading = renderLeading != null;
  const trailing = renderTrailing ?? [];
  const colCount = (hasLeading ? 1 : 0) + (stackClub ? 1 : 2) + trailing.length;

  const column = document.createElement("div");
  column.className = "d-flex flex-column flex-grow-1";

  const titleRow = document.createElement("div");
  titleRow.className = "d-flex justify-content-between align-items-baseline gap-2 mb-1";

  const titleEl = document.createElement("h6");
  titleEl.className = "fw-bold mb-0";
  titleRow.appendChild(titleEl);

  let metaEl: HTMLElement | null = null;
  if (formatMeta) {
    metaEl = document.createElement("span");
    metaEl.className = "small text-muted";
    titleRow.appendChild(metaEl);
  }

  const wrapper = document.createElement("div");
  wrapper.className = "participant-table-wrapper border rounded overflow-auto";

  const table = document.createElement("table");
  table.className = "table table-sm table-hover mb-0";
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  wrapper.appendChild(table);
  column.appendChild(titleRow);
  column.appendChild(wrapper);

  function actionCell(child: HTMLElement | null): HTMLTableCellElement {
    const cell = document.createElement("td");
    cell.className = "text-center th-40";
    if (child) cell.appendChild(child);
    return cell;
  }

  function buildRow(player: ThrowerListRow): HTMLTableRowElement {
    const row = document.createElement("tr");

    if (hasLeading) row.appendChild(actionCell(renderLeading(player)));

    const suffix = clubSuffix?.(player);
    const clubName = player.klubb?.navn ?? clubFallback ?? "";
    const club = suffix ? `${clubName} · ${suffix}` : clubName;

    const nameCell = document.createElement("td");
    if (stackClub) {
      const nameLine = document.createElement("div");
      nameLine.textContent = throwerName(player);
      const clubLine = document.createElement("div");
      clubLine.className = "small text-muted";
      clubLine.textContent = club;
      nameCell.append(nameLine, clubLine);
      row.appendChild(nameCell);
    } else {
      nameCell.textContent = throwerName(player);
      row.appendChild(nameCell);

      const clubCell = document.createElement("td");
      clubCell.textContent = club;
      row.appendChild(clubCell);
    }

    for (const render of trailing) row.appendChild(actionCell(render(player)));

    const extraClass = rowClass?.(player);
    if (extraClass) row.className = extraClass;

    if (onRowClick) {
      row.classList.add("participant-row");
      row.addEventListener("click", () => onRowClick(player));
    }

    if (isDraggable) {
      row.draggable = true;
      row.dataset.kasterid = String(player.id);
      row.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/plain", String(player.id));
        onDragStart?.(player, row);
      });
      row.addEventListener("dragend", () => onDragEnd?.(player, row));
    }

    return row;
  }

  function setPlayers(players: ThrowerListRow[]): void {
    titleEl.textContent = formatTitle(players.length);
    if (metaEl && formatMeta) metaEl.textContent = formatMeta(players);
    tbody.replaceChildren();

    if (!players.length) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.className = "text-center text-muted fst-italic py-3";
      cell.textContent = emptyText;
      cell.colSpan = colCount;
      emptyRow.appendChild(cell);
      tbody.appendChild(emptyRow);
      return;
    }

    for (const player of players) tbody.appendChild(buildRow(player));
  }

  return { element: column, setPlayers };
}
