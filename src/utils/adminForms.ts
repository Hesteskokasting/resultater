import { escHtml } from "./escHtml";

export function formRowHtml(label: string, inputHtml: string): string {
  return `<div class="mb-3"><label class="form-label fw-semibold">${escHtml(label)}</label>${inputHtml}</div>`;
}

const AUTO_HIDE_MS = 4000;

/**
 * The form's inline alert. One element per variant, created on first use inside
 * the form and reused after that. The variant decides how it behaves as well as
 * how it looks: an error scrolls itself into view and stays until the next save,
 * a success message appears where the user already is and clears itself.
 */
export function showAlert(
  container: HTMLElement,
  message: string,
  variant: "danger" | "success",
): void {
  const marker = variant === "danger" ? "admin-feil" : "admin-suksess";
  let el = container.querySelector<HTMLDivElement>(`.${marker}`);
  if (!el) {
    el = document.createElement("div");
    el.className = `alert alert-${variant} ${marker} mt-3 d-none`;
    container.querySelector("form")?.append(el);
  }
  el.textContent = message;
  el.classList.remove("d-none");

  if (variant === "danger") {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const elRef = el;
  setTimeout(() => {
    elRef.classList.add("d-none");
  }, AUTO_HIDE_MS);
}
