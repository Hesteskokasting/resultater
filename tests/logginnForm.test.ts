/**
 * The account page is one form in three modes — log in, register, reset — because
 * the old register tab went unnoticed and newcomers concluded there was no way to
 * sign up. What these tests hold in place is that every way in stays visible, and
 * that switching mode actually rewires the form rather than just relabelling the
 * button: a hidden field that stays `required` silently blocks submit.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdmin: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  signInErrorMessage: vi.fn(),
  requestPasswordReset: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/authService", () => ({
  GOOGLE_SIGN_IN_PENDING_KEY: "google-pending",
  getUser: mocks.getUser,
  isAdmin: mocks.isAdmin,
  signIn: mocks.signIn,
  signUp: mocks.signUp,
  signInWithGoogle: mocks.signInWithGoogle,
  signInWithApple: mocks.signInWithApple,
  signInErrorMessage: mocks.signInErrorMessage,
  requestPasswordReset: mocks.requestPasswordReset,
}));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { render as renderLogin } from "@/pages/logginn";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

const el = () => document.body.firstElementChild as HTMLElement;
const submitButton = () => el().querySelector<HTMLButtonElement>("#ac-submit")!;
const switchButton = () => el().querySelector<HTMLButtonElement>("#ac-switch")!;
const repeatInput = () => el().querySelector<HTMLInputElement>("#ac-password2")!;
const repeatRow = () => el().querySelector<HTMLElement>("#ac-repeat-row")!;
const message = () => el().querySelector<HTMLElement>("#ac-message")!;
const googleButton = () => el().querySelector<HTMLButtonElement>('[data-provider="Google"]')!;
const hint = () => el().querySelector<HTMLElement>(".account-hint")!;
const forgotButton = () => el().querySelector<HTMLButtonElement>("#ac-forgot")!;
const passwordRow = () => el().querySelector<HTMLElement>("#ac-password-row")!;
const resetHint = () => el().querySelector<HTMLElement>("#ac-reset-hint")!;
const divider = () => el().querySelector<HTMLElement>(".account-divider")!;
const hidden = (node: HTMLElement) => node.classList.contains("d-none");

function fill(email: string, password: string, repeat?: string): void {
  el().querySelector<HTMLInputElement>("#ac-email")!.value = email;
  el().querySelector<HTMLInputElement>("#ac-password")!.value = password;
  if (repeat !== undefined) repeatInput().value = repeat;
}

/** Dispatch only — the handler is async, so each test waits for the outcome it cares about. */
function submitForm(): void {
  el()
    .querySelector<HTMLFormElement>("#account-form")!
    .dispatchEvent(new Event("submit", { cancelable: true }));
}

beforeEach(async () => {
  vi.clearAllMocks();
  location.hash = "#/logginn";
  mocks.getUser.mockResolvedValue(null);
  mocks.isAdmin.mockResolvedValue(false);
  mocks.signIn.mockResolvedValue({ error: null });
  mocks.signUp.mockResolvedValue({ error: null });
  mocks.signInErrorMessage.mockReturnValue("Feil e-post eller passord.");
  mocks.requestPasswordReset.mockResolvedValue({ error: null });
  await renderLogin(host());
});

describe("account page", () => {
  it("offers both ways in without hiding either behind a tab", () => {
    expect(el().querySelector(".nav-tabs")).toBeNull();
    expect(submitButton().textContent).toBe("Logg inn");
    expect(switchButton().textContent).toBe("Opprett konto");
  });

  it("says the provider button also creates the account while it reads Logg inn", () => {
    expect(googleButton().textContent).toBe("Logg inn med Google");
    expect(hint().classList.contains("d-none")).toBe(false);
    expect(hint().textContent).toContain("oppretta automatisk");
  });

  it("relabels the provider button in register mode, and drops the now-redundant hint", () => {
    switchButton().click();

    expect(googleButton().textContent).toBe("Registrer deg med Google");
    expect(hint().classList.contains("d-none")).toBe(true);

    switchButton().click();
    expect(googleButton().textContent).toBe("Logg inn med Google");
    expect(hint().classList.contains("d-none")).toBe(false);
  });

  it("starts in login mode with the repeat field out of the way and not required", () => {
    expect(repeatRow().classList.contains("d-none")).toBe(true);
    expect(repeatInput().required).toBe(false);
    expect(el().querySelector<HTMLInputElement>("#ac-password")!.autocomplete).toBe(
      "current-password",
    );
  });

  it("rewires the form when switching to register, not just the button label", () => {
    switchButton().click();

    expect(submitButton().textContent).toBe("Opprett konto");
    expect(switchButton().textContent).toBe("Logg inn");
    expect(repeatRow().classList.contains("d-none")).toBe(false);
    expect(repeatInput().required).toBe(true);
    const password = el().querySelector<HTMLInputElement>("#ac-password")!;
    expect(password.autocomplete).toBe("new-password");
    expect(password.getAttribute("minlength")).toBe("8");
  });

  it("drops the repeat requirement again on the way back, so login can submit", () => {
    switchButton().click();
    repeatInput().value = "leftover";
    switchButton().click();

    expect(repeatInput().required).toBe(false);
    expect(repeatInput().value).toBe("");
    expect(el().querySelector<HTMLInputElement>("#ac-password")!.hasAttribute("minlength")).toBe(
      false,
    );
  });

  it("signs in on submit in login mode", async () => {
    fill("utovar@example.com", "hemmeleg1");
    submitForm();

    await vi.waitFor(() =>
      expect(mocks.signIn).toHaveBeenCalledWith("utovar@example.com", "hemmeleg1"),
    );
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("reports a failed sign-in through signInErrorMessage and frees the button", async () => {
    mocks.signIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    fill("utovar@example.com", "feil");
    submitForm();

    await vi.waitFor(() => expect(message().textContent).toBe("Feil e-post eller passord."));
    expect(message().className).toContain("alert-danger");
    expect(submitButton().disabled).toBe(false);
  });

  it("refuses mismatched passwords before spending a signUp call", async () => {
    switchButton().click();
    fill("ny@example.com", "hemmeleg1", "hemmeleg2");
    submitForm();

    await vi.waitFor(() => expect(message().textContent).toBe("Passorda er ikkje like."));
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("registers, signs straight in, and lands on min side without a toast", async () => {
    switchButton().click();
    fill("ny@example.com", "hemmeleg1", "hemmeleg1");
    submitForm();

    await vi.waitFor(() => expect(location.hash).toBe("#/minside"));
    expect(mocks.signUp).toHaveBeenCalledWith("ny@example.com", "hemmeleg1");
    expect(mocks.signIn).toHaveBeenCalledWith("ny@example.com", "hemmeleg1");
    // The link card on min side already spells out the next step, at reading pace.
    expect(mocks.showToast).not.toHaveBeenCalled();
  });

  it("falls back to login mode when the new account still needs e-mail confirmation", async () => {
    mocks.signIn.mockResolvedValue({ error: { message: "Email not confirmed" } });
    switchButton().click();
    fill("ny@example.com", "hemmeleg1", "hemmeleg1");
    submitForm();

    await vi.waitFor(() => expect(message().textContent).toContain("Bekreft e-postadressa"));
    expect(message().className).toContain("alert-success");
    expect(submitButton().textContent).toBe("Logg inn");
    expect(repeatRow().classList.contains("d-none")).toBe(true);
  });

  it("strips the form down to the e-mail field in reset mode", () => {
    forgotButton().click();

    expect(hidden(passwordRow())).toBe(true);
    expect(el().querySelector<HTMLInputElement>("#ac-password")!.required).toBe(false);
    expect(hidden(resetHint())).toBe(false);
    expect(submitButton().textContent).toBe("Send lenke");
    // Provider sign-in is no part of resetting a password.
    expect(hidden(googleButton())).toBe(true);
    expect(hidden(divider())).toBe(true);
    expect(hidden(hint())).toBe(true);
  });

  it("restores the password field on the way back out of reset mode", () => {
    forgotButton().click();
    switchButton().click();

    expect(hidden(passwordRow())).toBe(false);
    expect(el().querySelector<HTMLInputElement>("#ac-password")!.required).toBe(true);
    expect(hidden(googleButton())).toBe(false);
    expect(submitButton().textContent).toBe("Logg inn");
  });

  it("sends the reset link and answers without revealing whether the account exists", async () => {
    forgotButton().click();
    fill("kanskje@example.com", "");
    submitForm();

    await vi.waitFor(() =>
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith("kanskje@example.com"),
    );
    await vi.waitFor(() => expect(message().className).toContain("alert-success"));
    expect(message().textContent).toContain("Har du ein konto");
    expect(mocks.signIn).not.toHaveBeenCalled();
    // Staying enabled is what lets the user resend.
    expect(submitButton().disabled).toBe(false);
  });

  it("keeps Gløymt passordet? out of the way outside login mode", () => {
    expect(hidden(el().querySelector<HTMLElement>("#ac-forgot-row")!)).toBe(false);
    switchButton().click();
    expect(hidden(el().querySelector<HTMLElement>("#ac-forgot-row")!)).toBe(true);
  });

  it("prefills the e-mail when min side sent the user here to switch account", async () => {
    location.hash = "#/logginn?email=annan%40example.com";
    await renderLogin(host());

    expect(el().querySelector<HTMLInputElement>("#ac-email")!.value).toBe("annan@example.com");
  });
});
