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
      <button type="button" role="menuitem" id="${item.id}"
        class="org-banner-menu__item${item.tone ? ` org-banner-menu__item--${item.tone}` : ""}"
        ${item.hint ? `title="${escHtml(item.hint)}"` : ""}
        ${item.disabled ? "disabled" : ""}>${escHtml(item.label)}</button>`,
    )
    .join("");
  return `
    <div class="org-banner-menu">
      <button type="button" class="org-banner-menu__trigger" aria-haspopup="true"
        aria-expanded="false" aria-label="Handlingar">⋯</button>
      <div class="org-banner-menu__panel" role="menu" hidden>${itemsHtml}</div>
    </div>`;
}

export function bindBannerMenu(bannerSlot: HTMLElement | null): void {
  const root = bannerSlot?.querySelector<HTMLElement>(".org-banner-menu");
  if (!root) return;
  const trigger = root.querySelector<HTMLButtonElement>(".org-banner-menu__trigger");
  const panel = root.querySelector<HTMLElement>(".org-banner-menu__panel");
  if (!trigger || !panel) return;

  function close(): void {
    panel!.hidden = true;
    trigger!.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", onOutside, true);
    document.removeEventListener("keydown", onKeydown, true);
  }

  // Also fires when a re-render replaced the banner while the menu was open —
  // the detached root can never contain the target, so the listeners unbind.
  function onOutside(e: Event): void {
    if (!root!.isConnected || !root!.contains(e.target as Node)) close();
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.key !== "Escape") return;
    close();
    trigger!.focus();
  }

  trigger.addEventListener("click", () => {
    if (!panel.hidden) {
      close();
      return;
    }
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("keydown", onKeydown, true);
  });

  panel.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".org-banner-menu__item")) close();
  });
}
