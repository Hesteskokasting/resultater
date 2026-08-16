import { escHtml } from "./escHtml";

export function formRowHtml(label: string, inputHtml: string): string {
  return `<div class="mb-3"><label class="form-label fw-semibold">${escHtml(label)}</label>${inputHtml}</div>`;
}

/**
 * A save error, anchored in the form and scrolled into view: it names a field
 * the user has to go back and fix, so it stays put until the next save rather
 * than floating past as a toast. Success goes through showToast instead — the
 * form is usually closed or navigated away from by then.
 */
export function showFormError(container: HTMLElement, message: string): void {
  let el = container.querySelector<HTMLDivElement>(".admin-feil");
  if (!el) {
    el = document.createElement("div");
    el.className = "alert alert-danger admin-feil mt-3 d-none";
    container.querySelector("form")?.append(el);
  }
  el.textContent = message;
  el.classList.remove("d-none");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
