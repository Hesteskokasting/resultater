import { createModalEl, createModalLifecycle } from "@/components/ModalBase";
import { signIn, signInErrorMessage, getLastKnownEmail } from "@/services/authService";
import { showToast } from "@/components/Toast";
import { logError } from "@/utils/logError";

let _el: HTMLElement | null = null;
let _isOpen = false;
const _modal = createModalLifecycle();

function getEl(): HTMLElement {
  if (_el) return _el;

  _el = createModalEl({
    role: "dialog",
    labelledBy: "reauth-title",
    describedBy: "reauth-message",
    html: `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="reauth-title">Sesjonen din er utløpt</h5>
        </div>
        <form id="reauth-form">
          <div class="modal-body pt-2">
            <p class="mb-3" id="reauth-message">Logg inn igjen for å halde fram. Arbeidet ditt på sida er teke vare på.</p>
            <div class="mb-3">
              <label class="form-label" for="reauth-email">E-post</label>
              <input type="email" class="form-control" id="reauth-email" required autocomplete="email">
            </div>
            <div class="mb-3">
              <label class="form-label" for="reauth-password">Passord</label>
              <input type="password" class="form-control" id="reauth-password" required autocomplete="current-password">
            </div>
            <div id="reauth-error" class="alert alert-danger d-none" role="alert"></div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" id="reauth-cancel">Hald fram utan innlogging</button>
            <button type="submit" class="btn btn-primary" id="reauth-submit">Logg inn</button>
          </div>
        </form>
      </div>
    </div>
  `,
  });

  _el.querySelector("#reauth-cancel")!.addEventListener("click", () => {
    close();
  });
  _el.querySelector("#reauth-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    void handleSubmit();
  });
  return _el;
}

async function handleSubmit(): Promise<void> {
  if (!_el) return;
  const errorEl = _el.querySelector<HTMLElement>("#reauth-error")!;
  const submitBtn = _el.querySelector<HTMLButtonElement>("#reauth-submit")!;
  const email = _el.querySelector<HTMLInputElement>("#reauth-email")!.value.trim();
  const password = _el.querySelector<HTMLInputElement>("#reauth-password")!.value;

  errorEl.classList.add("d-none");
  submitBtn.disabled = true;

  try {
    const { error } = await signIn(email, password);
    if (error) {
      errorEl.textContent = signInErrorMessage(error);
      errorEl.classList.remove("d-none");
      return;
    }
    close();
    showToast("Du er logga inn igjen.", "success");
  } catch (err) {
    // signIn reports a rejected login as an error value, so this is the network
    // failing. Leaving the button disabled would trap the user in the modal.
    logError("ReauthModal", err);
    errorEl.textContent = "Fekk ikkje kontakt. Prøv igjen.";
    errorEl.classList.remove("d-none");
  } finally {
    submitBtn.disabled = false;
  }
}

function close(): void {
  if (!_el || !_isOpen) return;
  _isOpen = false;
  _el.querySelector<HTMLInputElement>("#reauth-password")!.value = "";
  _el.querySelector<HTMLElement>("#reauth-error")!.classList.add("d-none");
  _modal.close(_el);
}

/**
 * Opens the in-place re-auth modal. Idempotent: a no-op while already open.
 * Cancelling just closes it — a logged-out viewer may only be browsing.
 */
export function showReauthModal(): void {
  if (_isOpen) return;
  const el = getEl();
  el.querySelector<HTMLInputElement>("#reauth-email")!.value = getLastKnownEmail() ?? "";
  _isOpen = true;
  _modal.open(el, {
    focus: "#reauth-password",
    onEscape: () => {
      close();
    },
  });
}
