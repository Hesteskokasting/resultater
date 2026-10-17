import { icon } from "@/components/icons";

const ICON = icon("monitor", 13);

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
