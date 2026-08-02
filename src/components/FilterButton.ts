export interface FilterButtonProps {
  /** Placeholder element (from an innerHTML skeleton) that the button replaces. */
  slot: Element;
  onClick: () => void;
}

// Bootstrap Icons isn't loaded in this app — inline SVG, matching StevneCard's chevron convention.
const FILTER_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/>' +
  '<line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/>' +
  '<line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2" fill="currentColor" stroke="none"/>' +
  "</svg>";

/** Opens the mobile filter bottom sheet. Only used by terminliste today, but follows the
 * same interactive-widget shape as the other components here rather than the page's own markup. */
export function createFilterButton({ slot, onClick }: FilterButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tl-filter-button";
  btn.innerHTML = `${FILTER_SVG} Filter`;
  btn.addEventListener("click", onClick);
  slot.replaceWith(btn);
  return btn;
}
