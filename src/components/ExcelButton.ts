import { icon } from "@/components/icons";
export interface ExcelButtonProps {
  /** Placeholder element (from an innerHTML skeleton) that the button replaces. */
  slot: Element;
  onClick: () => void | Promise<void>;
}

/** Icon-only Excel export button — shared between terminliste and norgesranking. */
export function createExcelButton({ slot, onClick }: ExcelButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "excel-button";
  btn.setAttribute("aria-label", "Last ned Excel");
  btn.title = "Last ned Excel";
  btn.innerHTML = icon("excel");
  btn.addEventListener("click", () => {
    void onClick();
  });
  slot.replaceWith(btn);
  return btn;
}
