import { getUser } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import type { AuthUser } from "@/types";

export interface AdminLinkBarProps {
  href: string;
  label: string;
  /** 'warning' for edit links, 'success' for create links */
  variant: "warning" | "success";
  /** Permission rule; called only when a profile is present */
  canShow: (auth: AuthUser) => boolean;
}

/**
 * Prepends an admin action link (e.g. "Rediger klubb", "+ Ny utøvar") to the
 * page's .content-page column when the logged-in user has access.
 */
export function prependAdminLinkBar(
  container: HTMLElement,
  { href, label, variant, canShow }: AdminLinkBarProps,
): void {
  void getUser().then((auth) => {
    if (!auth?.profil || !canShow(auth)) return;
    const bar = document.createElement("div");
    bar.className = "mb-2 px-2";
    bar.innerHTML = `<a href="${href}" class="btn btn-sm btn-${variant}">${escHtml(label)}</a>`;
    container.querySelector(".content-page")?.prepend(bar);
  });
}
