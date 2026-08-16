// An "i" beside a heading, opening the explanation the page would otherwise
// spell out in standing text. Click rather than hover: a hover tooltip is
// unreachable on a touch screen, and these pages are read on phones.

export interface InfoTooltipProps {
  /** Placeholder element (from an innerHTML skeleton) that the button replaces. */
  slot: Element;
  /** Accessible name for the button. */
  label?: string;
  /** Panel contents as HTML — the caller escapes whatever comes from data. */
  html: string;
}

export interface InfoTooltip {
  /** Replaces the contents, for pages whose explanation follows the filters. */
  setHtml: (html: string) => void;
}

const INFO_SVG =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="17"/>' +
  '<line x1="12" y1="7.5" x2="12" y2="7.5"/>' +
  "</svg>";

let nextId = 0;

export function createInfoTooltip({
  slot,
  label = "Vis info",
  html,
}: InfoTooltipProps): InfoTooltip {
  const panelId = `info-tip-${nextId++}`;

  const wrapper = document.createElement("span");
  wrapper.className = "info-tip";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "info-tip__knapp";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", panelId);
  button.title = label;
  button.innerHTML = INFO_SVG;

  const panel = document.createElement("div");
  panel.className = "info-tip__panel";
  panel.id = panelId;
  panel.setAttribute("role", "note");
  panel.hidden = true;
  panel.innerHTML = html;

  wrapper.append(button, panel);

  function setOpen(open: boolean): void {
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  }

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(Boolean(panel.hidden));
  });

  // Clicking anywhere else, or Escape, closes it. Both listeners live on the
  // document because the click that closes lands outside the wrapper; they drop
  // themselves once the page that owns this tooltip has been replaced.
  function onDocumentClick(event: MouseEvent): void {
    if (!wrapper.isConnected) {
      document.removeEventListener("click", onDocumentClick);
      return;
    }
    if (!panel.hidden && !wrapper.contains(event.target as Node)) setOpen(false);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!wrapper.isConnected) {
      document.removeEventListener("keydown", onKeydown);
      return;
    }
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  }

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);

  slot.replaceWith(wrapper);

  return {
    setHtml: (next) => {
      panel.innerHTML = next;
    },
  };
}
