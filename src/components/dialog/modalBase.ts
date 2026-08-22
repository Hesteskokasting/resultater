export interface ModalElProps {
  role: string;
  labelledBy: string;
  describedBy?: string;
  html: string;
}

/** Creates the lazily-instantiated modal root used by the dialog components. */
export function createModalEl({ role, labelledBy, describedBy, html }: ModalElProps): HTMLElement {
  const el = document.createElement("div");
  el.className = "modal";
  el.style.display = "none";
  el.setAttribute("role", role);
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", labelledBy);
  if (describedBy) el.setAttribute("aria-describedby", describedBy);
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

export interface ModalLifecycle {
  open(el: HTMLElement, opts: { focus?: string; onEscape: () => void }): void;
  close(el: HTMLElement): void;
}

const BACKDROP_Z = 1050;
const MODAL_Z = 1055;
const STACK_STEP = 20;

/**
 * A dialog can open on top of another one (delete confirm over the admin form).
 * Bootstrap gives every `.modal` the same z-index, so the newest overlay would
 * only win when it also comes last in the DOM — and a cached dialog element
 * (ConfirmDialog reuses one) sits wherever it was first appended. Stack
 * explicitly instead, one step per already-open dialog.
 */
function stackLevel(el: HTMLElement): number {
  return [...document.querySelectorAll<HTMLElement>(".modal.show")].filter((m) => m !== el).length;
}

/** Backdrop + show/hide + Escape-key handling shared by the dialog components. */
export function createModalLifecycle(): ModalLifecycle {
  let backdrop: HTMLElement | null = null;
  let onKeydown: ((e: KeyboardEvent) => void) | null = null;

  return {
    open(el, { focus, onEscape }) {
      const level = stackLevel(el);

      backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop show";
      backdrop.style.zIndex = String(BACKDROP_Z + level * STACK_STEP);
      document.body.appendChild(backdrop);
      document.body.classList.add("modal-open");

      el.style.zIndex = String(MODAL_Z + level * STACK_STEP);
      el.style.display = "block";
      el.classList.add("show");
      if (focus) el.querySelector<HTMLElement>(focus)?.focus();

      onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onEscape();
        }
      };
      document.addEventListener("keydown", onKeydown);
    },
    close(el) {
      el.classList.remove("show");
      el.style.display = "none";
      backdrop?.remove();
      backdrop = null;
      document.body.classList.remove("modal-open");
      if (onKeydown) {
        document.removeEventListener("keydown", onKeydown);
        onKeydown = null;
      }
    },
  };
}
