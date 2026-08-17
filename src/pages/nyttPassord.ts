// Landing page for the link in the "Tilbakestill ditt passord" mail. The link
// arrives here already carrying proof of the mail, so this page's only job is to
// turn that proof into a session and take a new password.

import { getUser, updatePassword, verifyRecoveryToken } from "@/services/authService";
import { createLoadingState } from "@/components/states";
import { getHashQueryParam } from "@/utils/navigation";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

const EXPIRED_HTML = `
  <h2>Nytt passord</h2>
  <div class="alert alert-danger">Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
     opne den i same nettlesar som du ba om den frå.</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`;

const FORM_HTML = `
  <h2>Nytt passord</h2>
  <p class="account-intro">Vel eit nytt passord for kontoen din.</p>
  <form id="np-form">
    <div class="mb-3">
      <label class="form-label" for="np-password">Nytt passord</label>
      <input type="password" class="form-control" id="np-password" required
             autocomplete="new-password" minlength="8">
    </div>
    <div class="mb-3">
      <label class="form-label" for="np-password2">Gjenta nytt passord</label>
      <input type="password" class="form-control" id="np-password2" required
             autocomplete="new-password" minlength="8">
    </div>
    <div id="np-error" class="alert alert-danger d-none"></div>
    <button type="submit" class="btn btn-primary w-100" id="np-submit">Lagre nytt passord</button>
  </form>`;

const DONE_HTML = `
  <h2>Nytt passord</h2>
  <div class="alert alert-success">Passordet er endra. Du er innlogga.</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;

export async function render(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Opnar lenka…"));

  // A {{ .TokenHash }} link hands us the token to redeem here. A
  // {{ .ConfirmationURL }} link instead arrives with a ?code= that supabase-js has
  // already exchanged on its own, so there is nothing to redeem and a session
  // exists — or the exchange failed and the check below reports the dead link.
  const tokenHash = getHashQueryParam("token_hash");
  if (tokenHash) {
    const { error } = await verifyRecoveryToken(tokenHash);
    if (error) logError("nyttPassord.verifyRecoveryToken", error);
  }

  const wrap = document.createElement("div");
  wrap.className = "container py-4 account-container";

  if (!(await getUser())) {
    wrap.innerHTML = EXPIRED_HTML;
    container.replaceChildren(wrap);
    return;
  }

  wrap.innerHTML = FORM_HTML;
  container.replaceChildren(wrap);

  const password = wrap.querySelector<HTMLInputElement>("#np-password")!;
  const repeat = wrap.querySelector<HTMLInputElement>("#np-password2")!;
  const error = wrap.querySelector<HTMLElement>("#np-error")!;
  const submit = wrap.querySelector<HTMLButtonElement>("#np-submit")!;

  wrap.querySelector("#np-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.classList.add("d-none");

    if (password.value !== repeat.value) {
      error.textContent = "Passorda er ikkje like.";
      error.classList.remove("d-none");
      return;
    }

    submit.disabled = true;
    const { error: updateError } = await updatePassword(password.value);
    if (updateError) {
      logError("nyttPassord.updatePassword", updateError);
      error.textContent = `Kunne ikkje lagre passordet: ${errorMessage(updateError)}`;
      error.classList.remove("d-none");
      submit.disabled = false;
      return;
    }

    // Replaced in place rather than redirected: the confirmation is the only sign
    // the change took, and a redirect would carry the user past it.
    wrap.innerHTML = DONE_HTML;
  });
}
