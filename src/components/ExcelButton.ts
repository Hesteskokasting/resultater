export interface ExcelButtonProps {
  /** Placeholder element (from an innerHTML skeleton) that the button replaces. */
  slot: Element;
  onClick: () => void | Promise<void>;
}

// Bootstrap Icons isn't loaded in this app — inline SVG, matching StevneCard's chevron convention.
const EXCEL_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>' +
  '<line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>' +
  "</svg>";

/** Icon-only Excel export button — shared between terminliste and norgesranking. */
export function createExcelButton({ slot, onClick }: ExcelButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tl-excel-button";
  btn.setAttribute("aria-label", "Last ned Excel");
  btn.title = "Last ned Excel";
  btn.innerHTML = EXCEL_SVG;
  btn.addEventListener("click", () => {
    void onClick();
  });
  slot.replaceWith(btn);
  return btn;
}
