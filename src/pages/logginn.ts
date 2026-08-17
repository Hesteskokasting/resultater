import { Capacitor } from "@capacitor/core";
import googlePlayBadge from "@/assets/google-play-badge-nb-NO.svg";
import {
  GOOGLE_SIGN_IN_PENDING_KEY,
  getUser,
  isAdmin,
  requestPasswordReset,
  signIn,
  signInErrorMessage,
  signInWithApple,
  signInWithGoogle,
  signUp,
} from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { errorMessage } from "@/utils/errorMessage";
import { getHashQueryParam } from "@/utils/navigation";
import { showToast } from "@/components/Toast";
import { logError } from "@/utils/logError";

/**
 * Log in, sign up and password reset are the same form in three modes rather than
 * separate tabs or pages: the register tab went unnoticed, so newcomers concluded
 * the app had no way in.
 */
type AccountMode = "login" | "register" | "reset";

const FORM_HTML = `
  <form id="account-form">
    <div class="mb-3">
      <label class="form-label" for="ac-email">E-post</label>
      <input type="email" class="form-control" id="ac-email" required autocomplete="email">
    </div>
    <div class="mb-3" id="ac-password-row">
      <label class="form-label" for="ac-password">Passord</label>
      <input type="password" class="form-control" id="ac-password" required autocomplete="current-password">
    </div>
    <div class="mb-3 d-none" id="ac-repeat-row">
      <label class="form-label" for="ac-password2">Gjenta passord</label>
      <input type="password" class="form-control" id="ac-password2" autocomplete="new-password" minlength="8">
    </div>
    <p class="account-hint d-none" id="ac-reset-hint">Vi sender ei lenke til e-posten din som du
       kan velje nytt passord med.</p>
    <div id="ac-message" class="alert d-none"></div>
    <button type="submit" class="btn btn-primary w-100" id="ac-submit">Logg inn</button>
    <p class="account-forgot" id="ac-forgot-row">
      <button type="button" class="btn btn-link p-0 align-baseline" id="ac-forgot">Gløymt passordet?</button>
    </p>
    <p class="account-switch">
      <span id="ac-switch-text"></span>
      <button type="button" class="btn btn-link p-0 align-baseline" id="ac-switch"></button>
    </p>
  </form>`;

function getRedirectParam(): string | null {
  return getHashQueryParam("redirect");
}

async function resolvePostLoginDestination(redirect: string | null): Promise<string> {
  return redirect ? `#${redirect}` : (await isAdmin()) ? "#/admin" : "#/minside";
}

export async function render(container: HTMLElement): Promise<void> {
  const oauthParams = new URLSearchParams(window.location.search);
  const oauthError = oauthParams.get("error_description") ?? oauthParams.get("error");
  if (oauthError) {
    showToast(oauthError, "error");
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
  }

  const auth = await getUser();
  if (auth) {
    const redirect = getRedirectParam();
    const returningFromGoogle = sessionStorage.getItem(GOOGLE_SIGN_IN_PENDING_KEY) === "1";
    if (returningFromGoogle) sessionStorage.removeItem(GOOGLE_SIGN_IN_PENDING_KEY);
    if (redirect || returningFromGoogle) {
      location.hash = await resolvePostLoginDestination(redirect);
      return;
    }
    container.innerHTML = `
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${escHtml(auth.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;
    return;
  }

  const outer = document.createElement("div");
  outer.className = "container py-4 account-container";
  const headingRow = document.createElement("div");
  headingRow.className = "d-flex justify-content-between align-items-start gap-3 mb-2";
  const heading = document.createElement("h2");
  heading.className = "mb-0";
  heading.textContent = "Konto";
  headingRow.appendChild(heading);
  // Store badge is web-only — the app stores reject links to other stores.
  if (!Capacitor.isNativePlatform()) {
    const badgeLink = document.createElement("a");
    badgeLink.href = "https://play.google.com/store/apps/details?id=no.hesteskokasting.app";
    badgeLink.target = "_blank";
    badgeLink.rel = "noopener";
    badgeLink.className = "google-play-badge";
    badgeLink.innerHTML = `<img src="${googlePlayBadge}" alt="Last ned på Google Play">`;
    headingRow.appendChild(badgeLink);
  }
  outer.appendChild(headingRow);

  const intro = document.createElement("p");
  intro.className = "account-intro";
  intro.textContent =
    "Med konto kan du melde deg på stevne, følgje dine eigne kampar og få varsel når eit stevne startar." +
    (getRedirectParam() ? " Du blir sendt tilbake til sida du kom frå etter innlogging." : "");
  outer.appendChild(intro);

  // The provider buttons carry the provider name only; applyMode writes the verb,
  // so a user who asked to register is never told to "log in" with Google.
  const socialButtons: HTMLButtonElement[] = [];

  function createSocialLoginButton(
    provider: string,
    className: string,
    signInFn: () => Promise<{ error: { message: string } | null }>,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${className} w-100`;
    button.dataset.provider = provider;
    socialButtons.push(button);
    button.addEventListener("click", async () => {
      button.disabled = true;
      const { error } = await signInFn();
      if (error) {
        logError("logginn.socialLogin", error);
        showToast(error.message, "error");
        button.disabled = false;
        return;
      }
      // Web: signInWithOAuth already navigated the browser away, so this line never
      // runs there. Native: the sign-in resolved a session directly with no
      // redirect to hang navigation off, so this handler must navigate itself.
      if (Capacitor.isNativePlatform()) {
        location.hash = await resolvePostLoginDestination(getRedirectParam());
      }
    });
    return button;
  }

  outer.appendChild(
    createSocialLoginButton("Google", "btn-google", () =>
      signInWithGoogle(getRedirectParam() ?? undefined),
    ),
  );
  // App Store guideline 4.8: offering Google sign-in on iOS requires offering
  // Apple sign-in too. Native-only flow, so the button is iOS-only.
  if (Capacitor.getPlatform() === "ios") {
    outer.appendChild(createSocialLoginButton("Apple", "btn-apple mt-2", signInWithApple));
  }

  // Only needed while the buttons say "Logg inn": that is where people concluded
  // they had to register somewhere else first. Redundant in register mode.
  const socialHint = document.createElement("p");
  socialHint.className = "account-hint";
  socialHint.textContent = "Har du ikkje konto frå før, blir den oppretta automatisk.";
  outer.appendChild(socialHint);

  const divider = document.createElement("div");
  divider.className = "account-divider";
  divider.textContent = "eller bruk e-post";
  outer.appendChild(divider);

  const formWrap = document.createElement("div");
  formWrap.innerHTML = FORM_HTML;
  outer.appendChild(formWrap);
  container.replaceChildren(outer);

  const form = container.querySelector<HTMLFormElement>("#account-form")!;
  const emailInput = container.querySelector<HTMLInputElement>("#ac-email")!;
  const passwordRow = container.querySelector<HTMLElement>("#ac-password-row")!;
  const passwordInput = container.querySelector<HTMLInputElement>("#ac-password")!;
  const repeatRow = container.querySelector<HTMLElement>("#ac-repeat-row")!;
  const repeatInput = container.querySelector<HTMLInputElement>("#ac-password2")!;
  const resetHint = container.querySelector<HTMLElement>("#ac-reset-hint")!;
  const message = container.querySelector<HTMLElement>("#ac-message")!;
  const submit = container.querySelector<HTMLButtonElement>("#ac-submit")!;
  const forgotRow = container.querySelector<HTMLElement>("#ac-forgot-row")!;
  const forgotButton = container.querySelector<HTMLButtonElement>("#ac-forgot")!;
  const switchText = container.querySelector<HTMLElement>("#ac-switch-text")!;
  const switchButton = container.querySelector<HTMLButtonElement>("#ac-switch")!;

  let mode: AccountMode = "login";

  function hideMessage(): void {
    message.className = "alert d-none";
    message.textContent = "";
  }

  function showMessage(text: string, tone: "danger" | "success"): void {
    message.className = `alert alert-${tone}`;
    message.textContent = text;
  }

  function applyMode(next: AccountMode): void {
    mode = next;
    const isRegister = next === "register";
    const isReset = next === "reset";

    // A hidden required field blocks submit on a control the user cannot see, so
    // every row toggles its own `required` alongside its visibility.
    passwordRow.classList.toggle("d-none", isReset);
    passwordInput.required = !isReset;
    repeatRow.classList.toggle("d-none", !isRegister);
    repeatInput.required = isRegister;
    if (!isRegister) repeatInput.value = "";

    passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
    // Only on sign-up: an existing password shorter than this must still get through.
    if (isRegister) passwordInput.setAttribute("minlength", "8");
    else passwordInput.removeAttribute("minlength");

    submit.textContent = isReset ? "Send lenke" : isRegister ? "Opprett konto" : "Logg inn";
    switchText.textContent =
      isReset || isRegister ? "Har du konto frå før?" : "Har du ikkje konto?";
    switchButton.textContent = next === "login" ? "Opprett konto" : "Logg inn";
    resetHint.classList.toggle("d-none", !isReset);
    forgotRow.classList.toggle("d-none", next !== "login");

    // Provider sign-in is no part of resetting a password, and a stray "Logg inn
    // med Google" above the form invites exactly the wrong click.
    const verb = isRegister ? "Registrer deg med" : "Logg inn med";
    for (const button of socialButtons) {
      button.textContent = `${verb} ${button.dataset.provider}`;
      button.classList.toggle("d-none", isReset);
    }
    socialHint.classList.toggle("d-none", isRegister || isReset);
    divider.classList.toggle("d-none", isReset);

    hideMessage();
  }

  applyMode("login");

  switchButton.addEventListener("click", () => {
    applyMode(mode === "login" ? "register" : "login");
    (mode === "register" ? passwordInput : emailInput).focus();
  });

  forgotButton.addEventListener("click", () => {
    applyMode("reset");
    emailInput.focus();
  });

  const prefillEmail = getHashQueryParam("email");
  if (prefillEmail) {
    emailInput.value = prefillEmail;
    passwordInput.focus();
  }

  /** Resolves true once navigation is under way, so the caller leaves submit disabled. */
  async function runLogin(email: string, password: string): Promise<boolean> {
    const { error } = await signIn(email, password);
    if (error) {
      showMessage(signInErrorMessage(error), "danger");
      return false;
    }
    location.hash = await resolvePostLoginDestination(getRedirectParam());
    return true;
  }

  /** Always false: staying put lets the user resend, and there is nowhere to navigate to. */
  async function runReset(email: string): Promise<boolean> {
    const { error } = await requestPasswordReset(email);
    if (error) {
      logError("logginn.requestPasswordReset", error);
      showMessage(`Kunne ikkje sende lenke: ${errorMessage(error)}`, "danger");
      return false;
    }
    // Phrased so it reveals nothing about whether the address has an account —
    // Supabase answers the same either way on purpose.
    showMessage(
      `Har du ein konto på ${email}, ligg det no ei lenke til nytt passord i innboksen.`,
      "success",
    );
    return false;
  }

  async function runRegister(email: string, password: string): Promise<boolean> {
    if (password !== repeatInput.value) {
      showMessage("Passorda er ikkje like.", "danger");
      return false;
    }

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      showMessage(signUpError.message, "danger");
      return false;
    }

    // A project that requires e-mail confirmation refuses this sign-in, and
    // #/minside would bounce straight back here without saying why.
    const { error: autoSignInError } = await signIn(email, password);
    if (autoSignInError) {
      applyMode("login");
      showMessage(
        "Kontoen er oppretta. Bekreft e-postadressa di, og logg deretter inn her.",
        "success",
      );
      return false;
    }

    // No toast about the next step: the link card the user lands on says it in
    // full, and a toast that says the same thing is gone before it is read.
    location.hash = "#/minside";
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage();
    submit.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const navigating =
      mode === "register"
        ? await runRegister(email, password)
        : mode === "reset"
          ? await runReset(email)
          : await runLogin(email, password);

    if (!navigating) submit.disabled = false;
  });
}
