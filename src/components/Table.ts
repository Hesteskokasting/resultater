export interface ColumnDef {
  label: string
  class?: string
}

export function createTable(columns: ColumnDef[], rowsHtml: string): HTMLTableElement {
  const table = document.createElement('table')
  table.className = 'app-tabell'

  const thead = table.createTHead()
  thead.className = 'app-thead'
  const headerRow = thead.insertRow()
  for (const col of columns) {
    const th = document.createElement('th')
    th.textContent = col.label
    if (col.class) th.className = col.class
    headerRow.appendChild(th)
  }

  table.createTBody().innerHTML = rowsHtml

  return table
}
