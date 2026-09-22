// Landing page for the link in the "Tilbakestill ditt passord" and "Du har blitt
// invitert" mails. The link arrives here already carrying proof of the mail, so
// this page's only job is to turn that proof into a session and take a password.

import { Capacitor } from "@capacitor/core";
import {
  getUser,
  linkGoogleIdentity,
  updatePassword,
  verifyEmailToken,
} from "@/services/authService";
import { createLoadingState } from "@/components/states";
import { getHashQueryParam } from "@/utils/navigation";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

const heading = (invite: boolean) => (invite ? "Set passord" : "Nytt passord");

const expiredHtml = (invite: boolean) => `
  <h2>${heading(invite)}</h2>
  <div class="alert alert-danger">${
    invite
      ? "Invitasjonen er ugyldig eller har gått ut. Be om ein ny invitasjon."
      : `Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
         opne den i same nettlesar som du ba om den frå.`
  }</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`;

const formHtml = (invite: boolean) => `
  <h2>${heading(invite)}</h2>
  <p class="account-intro">${
    invite ? "Vel eit passord for den nye kontoen din." : "Vel eit nytt passord for kontoen din."
  }</p>
  <form id="np-form">
    <div class="mb-3">
      <label class="form-label" for="np-password">${invite ? "Passord" : "Nytt passord"}</label>
      <input type="password" class="form-control" id="np-password" required
             autocomplete="new-password" minlength="8">
    </div>
    <div class="mb-3">
      <label class="form-label" for="np-password2">Gjenta passord</label>
      <input type="password" class="form-control" id="np-password2" required
             autocomplete="new-password" minlength="8">
    </div>
    <div id="np-error" class="alert alert-danger d-none"></div>
    <button type="submit" class="btn btn-primary w-100" id="np-submit">Lagre passord</button>
  </form>${
    // Only on invite, and only on the web: linkIdentity is a browser redirect, which
    // the native Google flow cannot use. An invite mail opens in the browser anyway.
    invite && !Capacitor.isNativePlatform()
      ? `<p class="account-hint">eller</p>
         <button type="button" class="btn btn-google w-100" id="np-google">Bruk Google-kontoen din</button>`
      : ""
  }`;

const doneHtml = (invite: boolean) => `
  <h2>${heading(invite)}</h2>
  <div class="alert alert-success">${
    invite ? "Kontoen er klar. Du er innlogga." : "Passordet er endra. Du er innlogga."
  }</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;

export async function render(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Opnar lenka…"));

  const invite = getHashQueryParam("type") === "invite";

  // A {{ .TokenHash }} link hands us the token to redeem here. A
  // {{ .ConfirmationURL }} link instead arrives with a ?code= that supabase-js has
  // already exchanged on its own, so there is nothing to redeem and a session
  // exists — or the exchange failed and the check below reports the dead link.
  const tokenHash = getHashQueryParam("token_hash");
  if (tokenHash) {
    const { error } = await verifyEmailToken(tokenHash, invite ? "invite" : "recovery");
    if (error) logError("nyttPassord.verifyEmailToken", error);
  }

  const wrap = document.createElement("div");
  wrap.className = "container py-4 account-container";

  if (!(await getUser())) {
    wrap.innerHTML = expiredHtml(invite);
    container.replaceChildren(wrap);
    return;
  }

  wrap.innerHTML = formHtml(invite);
  container.replaceChildren(wrap);

  const password = wrap.querySelector<HTMLInputElement>("#np-password")!;
  const repeat = wrap.querySelector<HTMLInputElement>("#np-password2")!;
  const error = wrap.querySelector<HTMLElement>("#np-error")!;
  const submit = wrap.querySelector<HTMLButtonElement>("#np-submit")!;

  const googleButton = wrap.querySelector<HTMLButtonElement>("#np-google");
  googleButton?.addEventListener("click", async () => {
    error.classList.add("d-none");
    googleButton.disabled = true;
    // On success the browser has already navigated to Google, so only the failure
    // path ever gets here.
    const { error: linkError } = await linkGoogleIdentity();
    if (linkError) {
      logError("nyttPassord.linkGoogleIdentity", linkError);
      error.textContent = `Kunne ikkje koble til Google: ${errorMessage(linkError)}`;
      error.classList.remove("d-none");
      googleButton.disabled = false;
    }
  });

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
    wrap.innerHTML = doneHtml(invite);
  });
}
