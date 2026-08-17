/**
 * The recovery-mail landing page. Two link shapes reach it — a {{ .TokenHash }}
 * link it redeems itself, and a {{ .ConfirmationURL }} link whose ?code= supabase-js
 * has already exchanged — and both collapse to the same question: is there a session
 * to change the password on? A dead link must say so rather than show a form that
 * cannot work.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updatePassword: vi.fn(),
  verifyRecoveryToken: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/authService", () => ({
  getUser: mocks.getUser,
  updatePassword: mocks.updatePassword,
  verifyRecoveryToken: mocks.verifyRecoveryToken,
}));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { render as renderNewPassword } from "@/pages/nyttPassord";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

const el = () => document.body.firstElementChild as HTMLElement;
const form = () => el().querySelector<HTMLFormElement>("#np-form");
const error = () => el().querySelector<HTMLElement>("#np-error")!;

function fill(password: string, repeat: string): void {
  el().querySelector<HTMLInputElement>("#np-password")!.value = password;
  el().querySelector<HTMLInputElement>("#np-password2")!.value = repeat;
}

function submitForm(): void {
  form()!.dispatchEvent(new Event("submit", { cancelable: true }));
}

const signedIn = { user: { id: "u1" }, profil: null, clubs: [] };

beforeEach(() => {
  vi.clearAllMocks();
  location.hash = "#/nytt-passord";
  mocks.getUser.mockResolvedValue(signedIn);
  mocks.updatePassword.mockResolvedValue({ error: null });
  mocks.verifyRecoveryToken.mockResolvedValue({ error: null });
});

describe("nytt passord", () => {
  it("redeems a token_hash link before looking for a session", async () => {
    location.hash = "#/nytt-passord?token_hash=abc123";
    await renderNewPassword(host());

    expect(mocks.verifyRecoveryToken).toHaveBeenCalledWith("abc123");
    expect(form()).not.toBeNull();
  });

  it("takes the session supabase-js already established from a ?code= link", async () => {
    await renderNewPassword(host());

    expect(mocks.verifyRecoveryToken).not.toHaveBeenCalled();
    expect(form()).not.toBeNull();
  });

  it("reports a dead link instead of a form that cannot work", async () => {
    mocks.getUser.mockResolvedValue(null);
    await renderNewPassword(host());

    expect(form()).toBeNull();
    expect(el().textContent).toContain("ugyldig eller har gått ut");
    expect(el().querySelector('a[href="#/logginn"]')).not.toBeNull();
  });

  it("still reports a dead link when redeeming the token fails", async () => {
    mocks.verifyRecoveryToken.mockResolvedValue({ error: { message: "Token has expired" } });
    mocks.getUser.mockResolvedValue(null);
    location.hash = "#/nytt-passord?token_hash=stale";
    await renderNewPassword(host());

    expect(form()).toBeNull();
    expect(el().textContent).toContain("ugyldig eller har gått ut");
  });

  it("refuses mismatched passwords without writing anything", async () => {
    await renderNewPassword(host());
    fill("hemmeleg1", "hemmeleg2");
    submitForm();

    await vi.waitFor(() => expect(error().textContent).toBe("Passorda er ikkje like."));
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it("saves the password and confirms in place rather than redirecting past it", async () => {
    await renderNewPassword(host());
    fill("hemmeleg1", "hemmeleg1");
    submitForm();

    await vi.waitFor(() => expect(mocks.updatePassword).toHaveBeenCalledWith("hemmeleg1"));
    await vi.waitFor(() => expect(el().querySelector(".alert-success")).not.toBeNull());
    expect(el().textContent).toContain("Passordet er endra");
    expect(el().querySelector('a[href="#/minside"]')).not.toBeNull();
    expect(location.hash).toBe("#/nytt-passord");
  });

  it("keeps the form usable when the write fails", async () => {
    mocks.updatePassword.mockResolvedValue({ error: { message: "Password too weak" } });
    await renderNewPassword(host());
    fill("hemmeleg1", "hemmeleg1");
    submitForm();

    await vi.waitFor(() => expect(error().textContent).toContain("Kunne ikkje lagre passordet"));
    expect(el().querySelector<HTMLButtonElement>("#np-submit")!.disabled).toBe(false);
  });
});
