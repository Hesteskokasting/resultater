import { escHtml } from "@/utils/escHtml";

/**
 * The organizer banner's overflow menu — every phase action lives here instead
 * of as a row of buttons in the banner. Items keep their own ids, so callers
 * bind handlers with bannerSlot.querySelector("#the-id") as before.
 */
export interface BannerMenuItem {
  id: string;
  label: string;
  /** Colours the label; success = the green "Fullfør turnering" entry. */
  tone?: "success" | "warning";
  disabled?: boolean;
  /** Tooltip — used to explain why a disabled entry is unavailable. */
  hint?: string;
}

export function renderBannerMenu(items: BannerMenuItem[]): string {
  if (items.length === 0) return "";
  const itemsHtml = items
    .map(
      (item) => `
      <button type="button" id="${item.id}"
        class="stevne-banner-menu__item${item.tone ? ` stevne-banner-menu__item--${item.tone}` : ""}"
        ${item.hint ? `title="${escHtml(item.hint)}"` : ""}
        ${item.disabled ? "disabled" : ""}>${escHtml(item.label)}</button>`,
    )
    .join("");
  return `
    <div class="stevne-banner-menu">
      <button type="button" class="stevne-banner-menu__trigger"
        aria-expanded="false" aria-label="Handlingar">⋯</button>
      <div class="stevne-banner-menu__panel" hidden>${itemsHtml}</div>
    </div>`;
}

export function bindBannerMenu(bannerSlot: HTMLElement | null): void {
  const root = bannerSlot?.querySelector<HTMLElement>(".stevne-banner-menu");
  if (!root) return;
  const trigger = root.querySelector<HTMLButtonElement>(".stevne-banner-menu__trigger");
  const panel = root.querySelector<HTMLElement>(".stevne-banner-menu__panel");
  if (!trigger || !panel) return;

  const setOpen = (open: boolean): void => {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      document.addEventListener("pointerdown", onOutside, true);
      document.addEventListener("keydown", onKeydown, true);
    } else {
      document.removeEventListener("pointerdown", onOutside, true);
      document.removeEventListener("keydown", onKeydown, true);
    }
  };

  // Also fires when a re-render replaced the banner while the menu was open —
  // the detached root can never contain the target, so the listeners unbind.
  const onOutside = (e: Event): void => {
    if (!root.isConnected || !root.contains(e.target as Node)) setOpen(false);
  };

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    setOpen(false);
    trigger.focus();
  };

  // hidden is boolean | "until-found", so compare instead of coercing.
  trigger.addEventListener("click", () => setOpen(panel.hidden !== false));

  panel.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".stevne-banner-menu__item")) setOpen(false);
  });
}
