/**
 * The first-visit dialog has exactly two jobs beyond its prose: never nag someone
 * who has dismissed it or already signed in, and let the checkbox make that
 * dismissal permanent. Both are gates around localStorage, so both are pinned here.
 */

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));

import { maybeShowWelcomeDialog } from "@/components/WelcomeDialog";

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

  it("splits the advice between utøvarar and publikum", async () => {
    await maybeShowWelcomeDialog();

    const body = dialog()!.querySelector("#wd-body")!;
    expect(body.textContent).toContain("Er du utøvar?");
    expect(body.textContent).toContain("Er du publikum?");
    expect(body.querySelector('a[href="#/logginn"]')).not.toBeNull();
    expect(body.querySelector('a[href="#/terminliste"]')).not.toBeNull();
  });

  it("tells a newcomer with no profile to link that the club registers them", async () => {
    await maybeShowWelcomeDialog();

    const body = dialog()!.querySelector("#wd-body")!;
    expect(body.textContent).toContain("ikkje i utøvarregisteret enno");
    expect(body.querySelector('a[href^="mailto:"]')).not.toBeNull();
  });

  it("stays away once it has been dismissed for good", async () => {
    localStorage.setItem(SEEN_KEY, "1");
    await maybeShowWelcomeDialog();
    expect(isOpen()).toBe(false);
  });

  it("stays away from a signed-in account, whose next step lives on min side", async () => {
    mocks.getUser.mockResolvedValue({ user: { id: "u1" }, profil: null, clubs: [] });
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

  it("gets out of the way when a link navigates, but not for a mailto", async () => {
    await maybeShowWelcomeDialog();
    dialog()!.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')!.click();
    expect(isOpen()).toBe(true);

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
