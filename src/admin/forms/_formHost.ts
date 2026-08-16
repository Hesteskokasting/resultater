import { escHtml } from "@/utils/escHtml";

/**
 * Contract shared by the three admin entity forms. Each form renders into
 * `container` and reports back through the callbacks, so the very same form
 * serves both its own route (`#/stevne/ny`) and the dashboard's overlay — the
 * page wrapper navigates on save, the overlay closes and refreshes its list.
 */
export interface AdminFormHost {
  container: HTMLElement;
  /** Rendered as a heading above the form. Omit in a modal, which has its own. */
  heading?: string;
  /** Wrapper element class, e.g. the page's "container py-4 admin-form-lg". */
  wrapperClass?: string;
  /** `created` is false for an update. */
  onSaved?: (id: number, created: boolean) => void;
  onDeleted?: () => void;
  /** When set, the form renders an "Avbryt" button that calls this. */
  onCancel?: () => void;
}

/** The form's outer element plus the slot its fields go into. */
export function formShell(host: AdminFormHost): { wrapper: HTMLElement; headingHtml: string } {
  const wrapper = document.createElement("div");
  wrapper.className = host.wrapperClass ?? "admin-form-modal";
  return {
    wrapper,
    headingHtml: host.heading ? `<h2 class="mb-4">${escHtml(host.heading)}</h2>` : "",
  };
}

export function formRowHtml(label: string, inputHtml: string): string {
  return `<div class="mb-3"><label class="form-label fw-semibold">${escHtml(label)}</label>${inputHtml}</div>`;
}

/**
 * A save error, anchored in the form and scrolled into view: it names a field
 * the user has to go back and fix, so it stays put until the next save rather
 * than floating past as a toast. Success goes through showToast instead — the
 * form is usually closed or navigated away from by then.
 *
 * Fire-and-forget rather than an `InlineAlert` handle: the fields are built as
 * an HTML string, so there is no element for the caller to hold on to.
 */
export function showFormError(container: HTMLElement, message: string): void {
  let el = container.querySelector<HTMLDivElement>(".admin-feil");
  if (!el) {
    el = document.createElement("div");
    el.className = "alert alert-danger admin-feil mt-3 d-none";
    el.setAttribute("role", "alert");
    container.querySelector("form")?.append(el);
  }
  el.textContent = message;
  el.classList.remove("d-none");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
