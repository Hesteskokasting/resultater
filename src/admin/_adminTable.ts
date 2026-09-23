import { createEl } from "@/utils/createEl";
import { createActionEl } from "./_adminUi";
import type { AdminAction } from "./_adminUi";

/**
 * Compact admin table with a checkbox per row. The caller owns the selection
 * set, so bulk actions and filters read the same state the table draws.
 */

export interface AdminTableColumn<T> {
  header: string;
  /** Class on both the th and every td, for widths and alignment. */
  className?: string;
  /** Called again whenever the row's selection flips, so a cell can turn into an editor. */
  cell: (row: T, selected: boolean) => Node | string;
}

export interface AdminTableProps<T> {
  rows: T[];
  key: (row: T) => string;
  /** Accessible name of the row's checkbox, e.g. the email. */
  rowLabel: (row: T) => string;
  columns: AdminTableColumn<T>[];
  selected: Set<string>;
  onSelectionChange: () => void;
}

function createCheckbox(label: string, checked: boolean): HTMLInputElement {
  const box = createEl("input", null, "form-check-input");
  box.type = "checkbox";
  box.checked = checked;
  box.setAttribute("aria-label", label);
  return box;
}

function createCell(tag: "td" | "th", className?: string): HTMLTableCellElement {
  return createEl(tag, null, className);
}

export function createAdminTable<T>({
  rows,
  key,
  rowLabel,
  columns,
  selected,
  onSelectionChange,
}: AdminTableProps<T>): HTMLElement {
  const all = createCheckbox("Vel alle", false);

  function syncAll(): void {
    all.checked = rows.length > 0 && rows.every((r) => selected.has(key(r)));
    all.indeterminate = !all.checked && rows.some((r) => selected.has(key(r)));
  }

  function buildRow(row: T): HTMLTableRowElement {
    const id = key(row);
    const isSelected = selected.has(id);
    const tr = createEl("tr", null, isSelected ? "admin-table__row--selected" : undefined);

    const box = createCheckbox(`Vel ${rowLabel(row)}`, isSelected);
    // Only this row is rebuilt, so unsaved edits in other selected rows survive.
    box.addEventListener("change", () => {
      if (box.checked) selected.add(id);
      else selected.delete(id);
      tr.replaceWith(buildRow(row));
      syncAll();
      onSelectionChange();
    });

    const checkTd = createCell("td", "admin-table__check");
    checkTd.append(box);
    tr.append(checkTd);
    for (const col of columns) {
      const td = createCell("td", col.className);
      td.append(col.cell(row, isSelected));
      tr.append(td);
    }
    return tr;
  }

  const tbody = createEl("tbody", null);
  tbody.append(...rows.map((r) => buildRow(r)));

  all.addEventListener("change", () => {
    for (const r of rows) {
      if (all.checked) selected.add(key(r));
      else selected.delete(key(r));
    }
    tbody.replaceChildren(...rows.map((r) => buildRow(r)));
    syncAll();
    onSelectionChange();
  });

  const headRow = createEl("tr", null);
  const checkTh = createCell("th", "admin-table__check");
  checkTh.append(all);
  headRow.append(checkTh);
  for (const col of columns) headRow.append(createEl("th", col.header, col.className));

  const thead = createEl("thead", null);
  thead.append(headRow);
  const table = createEl("table", null, "admin-table");
  table.append(thead, tbody);
  syncAll();

  const wrap = createEl("div", null, "table-scroll");
  wrap.append(table);
  return wrap;
}

export interface BulkBar {
  el: HTMLElement;
  /** Shows the bar with "N valde", or hides it at zero. */
  update: (count: number) => void;
}

/** Toolbar slot for actions on the selected rows; hidden while nothing is selected. */
export function createBulkBar(controls: (HTMLElement | AdminAction)[]): BulkBar {
  const count = createEl("span", null, "admin-count");
  const el = createEl("div", null, "admin-bulk admin-toolbar__end d-none");
  el.append(count, ...controls.map((c) => (c instanceof HTMLElement ? c : createActionEl(c))));
  return {
    el,
    update: (n) => {
      el.classList.toggle("d-none", n === 0);
      count.textContent = `${n} valde`;
    },
  };
}
