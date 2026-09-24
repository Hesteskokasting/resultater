/**
 * The first-visit dialog has exactly two jobs beyond its prose: never nag someone
 * who has dismissed it or already signed in, and let the checkbox make that
 * dismissal permanent. Both are gates around localStorage, so both are pinned here.
 */

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@/supabase", () => ({ supabase: {} }));
// Matches what ships: sign-up is closed, so the card must not offer an account.
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser, SIGNUP_ENABLED: false }));

import { maybeShowWelcomeDialog } from "@/components/dialog/WelcomeDialog";

const SEEN_KEY = "welcome-seen";

const dialog = () => document.querySelector<HTMLElement>('[aria-labelledby="wd-title"]');
const isOpen = () => dialog()?.classList.contains("show") === true;

function closeIfOpen(): void {
  dialog()?.querySelector<HTMLButtonElement>("#wd-close")?.click();
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.getUser.mockResolvedValue(null);
});

afterEach(closeIfOpen);

describe("maybeShowWelcomeDialog", () => {
  it("greets a first-time visitor who is not signed in", async () => {
    await maybeShowWelcomeDialog();
    expect(isOpen()).toBe(true);
  });

  it("warns up front that the app is unfinished", async () => {
    await maybeShowWelcomeDialog();

    const notice = dialog()!.querySelector("#wd-body .alert-warning")!;
    expect(notice.textContent).toContain("under utvikling");
  });

  it("splits the advice between utøvarar and publikum", async () => {
    await maybeShowWelcomeDialog();

    const body = dialog()!.querySelector("#wd-body")!;
    expect(body.textContent).toContain("Er du utøvar?");
    expect(body.textContent).toContain("Er du publikum?");
    expect(body.querySelector('a[href="#/logginn"]')).not.toBeNull();
    expect(body.querySelector('a[href="#/terminliste"]')).not.toBeNull();
  });

  it("says sign-up is closed rather than offering an account nobody can get", async () => {
    await maybeShowWelcomeDialog();

    const card = dialog()!.querySelector("#wd-body .card")!;
    expect(card.querySelector(".alert-warning")!.textContent).toContain("deaktivert");
    expect(card.textContent).not.toContain("opprett konto");
  });

  it("stays away once it has been dismissed for good", async () => {
    localStorage.setItem(SEEN_KEY, "1");
    await maybeShowWelcomeDialog();
    expect(isOpen()).toBe(false);
  });

  it("stays away from a signed-in account, whose next step lives on min side", async () => {
    mocks.getUser.mockResolvedValue({ user: { id: "u1" }, profil: null, club: null });
    await maybeShowWelcomeDialog();
    expect(isOpen()).toBe(false);
  });

  it("records the dismissal the moment the box is ticked, not on close", async () => {
    await maybeShowWelcomeDialog();

    const box = dialog()!.querySelector<HTMLInputElement>("#wd-hide")!;
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    expect(localStorage.getItem(SEEN_KEY)).toBe("1");

    box.checked = false;
    box.dispatchEvent(new Event("change"));
    expect(localStorage.getItem(SEEN_KEY)).toBeNull();
  });

  it("closes without remembering anything when the box is left alone", async () => {
    await maybeShowWelcomeDialog();
    dialog()!.querySelector<HTMLButtonElement>("#wd-close")!.click();

    expect(dialog()).toBeNull();
    expect(localStorage.getItem(SEEN_KEY)).toBeNull();
  });

  it("gets out of the way when a link navigates", async () => {
    await maybeShowWelcomeDialog();
    dialog()!.querySelector<HTMLAnchorElement>('a[href="#/logginn"]')!.click();
    expect(dialog()).toBeNull();
  });

  it("can be shown again in a later visit after a plain close", async () => {
    await maybeShowWelcomeDialog();
    dialog()!.querySelector<HTMLButtonElement>("#wd-close")!.click();

    await maybeShowWelcomeDialog();
    expect(isOpen()).toBe(true);
  });
});
