// Bootstrap Icons isn't loaded in this app — inline SVG, matching ExcelButton's convention.
const ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>' +
  '<line x1="12" y1="17" x2="12" y2="21"/>' +
  "</svg>";

/**
 * Icon-only scoreboard button. Carries data-scoreboard-kamp-id, so the
 * delegated handler bindScoreboardClicks installs picks it up unchanged.
 * Pass "scoreboard-btn--touch" as extraClass where the control is a primary
 * tap target rather than table chrome.
 */
export function scoreboardButtonHtml(kampId: number, extraClass = ""): string {
  const css = `scoreboard-btn${extraClass ? ` ${extraClass}` : ""}`;
  return `<button type="button" class="${css}" data-scoreboard-kamp-id="${kampId}" title="Scoreboard" aria-label="Scoreboard">${ICON}</button>`;
}

/** The same control as a link, for views that navigate instead of delegating. */
export function scoreboardLinkHtml(
  kampId: number | string,
  extraAttrs = "",
  extraClass = "",
): string {
  const css = `scoreboard-btn${extraClass ? ` ${extraClass}` : ""}`;
  return `<a href="#/kamp/${kampId}" class="${css}"${extraAttrs} title="Scoreboard" aria-label="Scoreboard">${ICON}</a>`;
}
