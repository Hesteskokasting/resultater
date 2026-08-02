import { createModalEl, createModalLifecycle } from "@/components/ModalBase";
import { createEl } from "@/utils/createEl";

/**
 * Overlay used by the admin dashboard for create/edit, so an admin never has to
 * leave the page (and lose their filters and scroll position) to change a row.
 *
 * One modal is alive at a time: it is created on open and removed on close, since
 * each caller mounts its own form into the body.
 */

export interface AdminModalHandle {
  /** Mount point for the caller's form. */
  body: HTMLElement;
  setTitle: (title: string) => void;
  close: () => void;
}

export interface AdminModalProps {
  title: string;
  /** "lg" for the tournament form, "md" (default) for the shorter ones. */
  size?: "md" | "lg";
  /** Runs on every close, whichever way it was closed. */
  onClose?: () => void;
}

let openHandle: AdminModalHandle | null = null;

export function openAdminModal({ title, size = "md", onClose }: AdminModalProps): AdminModalHandle {
  // Defensive: a stray second open would otherwise stack backdrops.
  openHandle?.close();

  const lifecycle = createModalLifecycle();
  const el = createModalEl({
    role: "dialog",
    labelledBy: "admin-modal-title",
    html: `
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable ${size === "lg" ? "modal-lg" : ""} admin-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="admin-modal-title"></h5>
          <button type="button" class="btn-close" aria-label="Lukk" data-modal-close></button>
        </div>
        <div class="modal-body" data-modal-body></div>
      </div>
    </div>`,
  });

  const body = el.querySelector<HTMLElement>("[data-modal-body]")!;
  el.querySelector<HTMLElement>("#admin-modal-title")!.textContent = title;

  let closed = false;
  function close(): void {
    if (closed) return;
    closed = true;
    lifecycle.close(el);
    el.remove();
    if (openHandle === handle) openHandle = null;
    onClose?.();
  }

  el.querySelector("[data-modal-close]")!.addEventListener("click", close);
  // Click outside the dialog closes, matching how the app's other overlays behave.
  el.addEventListener("click", (e) => {
    if (e.target === el) close();
  });

  /**
   * A confirm dialog (delete, fullfør) opens on top of this one and installs its
   * own Escape handler. Both would fire, so only the topmost overlay reacts.
   */
  function closeIfTopmost(): void {
    const open = [...document.querySelectorAll<HTMLElement>(".modal")].filter(
      (m) => m.style.display !== "none",
    );
    if (open[open.length - 1] === el) close();
  }

  const handle: AdminModalHandle = {
    body,
    setTitle: (next: string) => {
      el.querySelector<HTMLElement>("#admin-modal-title")!.textContent = next;
    },
    close,
  };

  body.appendChild(createEl("p", "Laster…", "loading"));
  lifecycle.open(el, { focus: "[data-modal-close]", onEscape: closeIfTopmost });
  openHandle = handle;
  return handle;
}
