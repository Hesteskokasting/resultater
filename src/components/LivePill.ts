/** The pulsing dot marking something ongoing. Decorative — a caller that conveys
    "live" through the dot alone has to label it itself. */
export function liveDotHtml(extraClass = ""): string {
  const cls = extraClass ? `live-prikk ${extraClass}` : "live-prikk";
  return `<span class="${cls}" aria-hidden="true"></span>`;
}

export function livePillHtml(): string {
  return `<span class="live-pill">${liveDotHtml()}</span>`;
}
