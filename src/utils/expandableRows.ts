export interface ExpandableRowsOpts {
  triggerSel: string; // CSS selector for the clickable cell, e.g. '.nc-poeng-celle'
  idAttr: string; // data attribute name without 'data-', e.g. 'idx' or 'lag-idx'
  detailSel: string; // CSS selector prefix for the detail row, e.g. '.nc-detalj-rad'
  chevronSel?: string; // selector for the chevron span, defaults to '.nc-chevron'
  lookupRoot?: HTMLElement; // where to search for detail rows — defaults to container
}

export function bindExpandableRows(container: HTMLElement, opts: ExpandableRowsOpts): void {
  const { triggerSel, idAttr, detailSel, chevronSel = ".nc-chevron", lookupRoot } = opts;
  const root = lookupRoot ?? container;

  container.querySelectorAll<HTMLElement>(triggerSel).forEach((celle) => {
    celle.setAttribute("tabindex", "0");
    celle.setAttribute("aria-expanded", "false");
  });

  function toggle(celle: HTMLElement): void {
    const idx = celle.getAttribute(`data-${idAttr}`);
    if (!idx) return;
    const detalj = root.querySelector<HTMLElement>(`${detailSel}[data-${idAttr}="${idx}"]`);
    if (!detalj) return;
    const wasHidden = detalj.classList.contains("d-none");
    detalj.classList.toggle("d-none");
    celle.setAttribute("aria-expanded", String(wasHidden));
    const chevron = celle.querySelector(chevronSel);
    if (chevron) chevron.textContent = wasHidden ? " ▲" : " ▼";
  }

  container.addEventListener("click", (e) => {
    const celle = (e.target as Element).closest<HTMLElement>(triggerSel);
    if (celle) toggle(celle);
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const celle = (e.target as Element).closest<HTMLElement>(triggerSel);
    if (!celle) return;
    e.preventDefault();
    toggle(celle);
  });
}
