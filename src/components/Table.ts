export type CellContent = string | Node

export interface ColumnDef<T> {
  label: string
  render: (item: T, idx: number) => CellContent
  thClass?: string
  cellClass?: string | ((item: T, idx: number) => string | undefined)
  cellAttrs?: (item: T, idx: number) => Record<string, string> | undefined
}

export interface TableOptions<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  rowClass?: string | ((item: T, idx: number) => string | undefined)
  rowAttrs?: (item: T, idx: number) => Record<string, string> | undefined
  detailRow?: (item: T, idx: number) => HTMLElement | null
  detailRowClass?: string
  tableClass?: string
  theadClass?: string
}

function applyAttrs(el: HTMLElement, attrs: Record<string, string> | undefined): void {
  if (!attrs) return
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

export function createTable<T>(opts: TableOptions<T>): HTMLTableElement {
  const {
    columns,
    rows,
    rowClass,
    rowAttrs,
    detailRow,
    detailRowClass = 'detalj-rad d-none',
    tableClass = 'app-tabell',
    theadClass = 'app-thead',
  } = opts

  const table = document.createElement('table')
  table.className = tableClass

  const thead = table.createTHead()
  thead.className = theadClass
  const headerRow = thead.insertRow()
  for (const col of columns) {
    const th = document.createElement('th')
    th.textContent = col.label
    if (col.thClass) th.className = col.thClass
    headerRow.appendChild(th)
  }

  const tbody = table.createTBody()

  rows.forEach((item, idx) => {
    const tr = tbody.insertRow()
    const cls = typeof rowClass === 'function' ? rowClass(item, idx) : rowClass
    if (cls) tr.className = cls
    applyAttrs(tr, rowAttrs?.(item, idx))

    for (const col of columns) {
      const td = tr.insertCell()
      const cellCls = typeof col.cellClass === 'function' ? col.cellClass(item, idx) : col.cellClass
      if (cellCls) td.className = cellCls
      applyAttrs(td, col.cellAttrs?.(item, idx))

      const content = col.render(item, idx)
      if (typeof content === 'string') {
        td.textContent = content
      } else {
        td.appendChild(content)
      }
    }

    if (detailRow) {
      const detail = detailRow(item, idx)
      if (detail !== null) {
        const detailTr = tbody.insertRow()
        detailTr.className = detailRowClass
        applyAttrs(detailTr, rowAttrs?.(item, idx))
        const detailTd = detailTr.insertCell()
        detailTd.colSpan = columns.length
        detailTd.appendChild(detail)
      }
    }
  })

  return table
}
