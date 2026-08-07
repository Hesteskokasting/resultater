/**
 * The entity forms are mounted by two hosts — their own route and the dashboard
 * overlay — so what matters is that they report outcomes through the host
 * callbacks rather than navigating themselves.
 */

const mocks = vi.hoisted(() => ({
  getClubForAdmin: vi.fn(),
  createClub: vi.fn(),
  updateClub: vi.fn(),
  getClubs: vi.fn(),
  getClasses: vi.fn(),
  getGenders: vi.fn(),
  getThrowerForAdmin: vi.fn(),
  updateThrower: vi.fn(),
  createThrower: vi.fn(),
  deleteThrower: vi.fn(),
  isAdmin: vi.fn(),
  isClubAdmin: vi.fn(),
  confirmDialog: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/klubbService", () => ({
  getClubForAdmin: mocks.getClubForAdmin,
  createClub: mocks.createClub,
  updateClub: mocks.updateClub,
  getClubs: mocks.getClubs,
}));
vi.mock("@/services/kasterService", () => ({
  getClasses: mocks.getClasses,
  getGenders: mocks.getGenders,
  getThrowerForAdmin: mocks.getThrowerForAdmin,
  updateThrower: mocks.updateThrower,
  createThrower: mocks.createThrower,
  deleteThrower: mocks.deleteThrower,
}));
vi.mock("@/services/authService", () => ({
  isAdmin: mocks.isAdmin,
  isClubAdmin: mocks.isClubAdmin,
}));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));

import { mountClubForm } from "@/admin/forms/klubbForm";
import { mountThrowerForm } from "@/admin/forms/kasterForm";

function host(extra: Record<string, unknown> = {}) {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  return { container, ...extra };
}

function submit(container: HTMLElement): void {
  container.querySelector("form")!.dispatchEvent(new Event("submit", { cancelable: true }));
}

function setField(container: HTMLElement, name: string, value: string): void {
  container.querySelector<HTMLInputElement>(`[name="${name}"]`)!.value = value;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isAdmin.mockResolvedValue(true);
  mocks.isClubAdmin.mockResolvedValue(false);
  mocks.getClubs.mockResolvedValue({
    data: [{ id: 1, navn: "Oslo HK", logourl: null }],
    error: null,
  });
  mocks.getClasses.mockResolvedValue({ data: [{ id: 1, navn: "Senior" }], error: null });
  mocks.getGenders.mockResolvedValue({ data: [{ id: 1, navn: "Mann" }], error: null });
});

describe("klubbForm", () => {
  it("creates a club and hands the new id to the host", async () => {
    mocks.createClub.mockResolvedValue({ data: { id: 42 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountClubForm(h);
    setField(h.container, "navn", "Ny HK");
    setField(h.container, "kortnavn", "NHK");
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(42, true));
    expect(mocks.createClub).toHaveBeenCalledWith({
      navn: "Ny HK",
      kortnavn: "NHK",
      logourl: null,
      eraktiv: true,
    });
  });

  it("prefills an existing club and reports an update, not a create", async () => {
    mocks.getClubForAdmin.mockResolvedValue({
      data: { id: 3, navn: "Oslo HK", kortnavn: "OHK", logourl: null, eraktiv: false },
      error: null,
    });
    mocks.updateClub.mockResolvedValue({ error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountClubForm(h, 3);
    expect(h.container.querySelector<HTMLInputElement>('[name="navn"]')!.value).toBe("Oslo HK");
    expect(h.container.querySelector<HTMLInputElement>('[name="eraktiv"]')!.checked).toBe(false);

    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(3, false));
    expect(mocks.createClub).not.toHaveBeenCalled();
  });

  it("keeps a failed save on screen with the server's message", async () => {
    mocks.createClub.mockResolvedValue({ data: null, error: { message: "duplikat namn" } });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountClubForm(h);
    setField(h.container, "navn", "Oslo HK");
    submit(h.container);

    await vi.waitFor(() => {
      expect(h.container.querySelector(".admin-feil")?.textContent).toBe("duplikat namn");
    });
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("refuses club creation to a non-admin", async () => {
    mocks.isAdmin.mockResolvedValue(false);
    const h = host();
    await mountClubForm(h);
    expect(h.container.querySelector(".error-banner")?.textContent).toBe("Ingen tilgang.");
  });

  it("only offers Avbryt when the host can handle it", async () => {
    const withCancel = host({ onCancel: vi.fn() });
    await mountClubForm(withCancel);
    expect(withCancel.container.querySelector("#cancel-button")).not.toBeNull();

    const withoutCancel = host();
    await mountClubForm(withoutCancel);
    expect(withoutCancel.container.querySelector("#cancel-button")).toBeNull();
  });

  it("renders the heading only when the host asks for one", async () => {
    const withHeading = host({ heading: "Ny klubb" });
    await mountClubForm(withHeading);
    expect(withHeading.container.querySelector("h2")?.textContent).toBe("Ny klubb");

    const bare = host();
    await mountClubForm(bare);
    expect(bare.container.querySelector("h2")).toBeNull();
  });
});

describe("kasterForm", () => {
  const thrower = {
    id: 5,
    fornavn: "Ola",
    etternavn: "Nordmann",
    kjonnid: 1,
    klasseid: 1,
    klubbid: 1,
    eraktiv: true,
  };

  it("saves an edit through the host callback", async () => {
    mocks.getThrowerForAdmin.mockResolvedValue({ data: thrower, error: null });
    mocks.updateThrower.mockResolvedValue({ data: { id: 5 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountThrowerForm(h, 5);
    setField(h.container, "etternavn", "Nordkvinne");
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(5, false));
    expect(mocks.updateThrower).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ fornavn: "Ola", etternavn: "Nordkvinne", klubbid: 1 }),
    );
  });

  it("deletes only after confirmation and then tells the host", async () => {
    mocks.getThrowerForAdmin.mockResolvedValue({ data: thrower, error: null });
    mocks.deleteThrower.mockResolvedValue({ error: null });
    const onDeleted = vi.fn();
    const h = host({ onDeleted });
    await mountThrowerForm(h, 5);

    mocks.confirmDialog.mockResolvedValue(false);
    h.container.querySelector<HTMLButtonElement>("#delete-button")!.click();
    await vi.waitFor(() => expect(mocks.confirmDialog).toHaveBeenCalled());
    expect(mocks.deleteThrower).not.toHaveBeenCalled();

    mocks.confirmDialog.mockResolvedValue(true);
    h.container.querySelector<HTMLButtonElement>("#delete-button")!.click();
    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(mocks.deleteThrower).toHaveBeenCalledWith(5);
  });

  it("blocks a klubbadmin from another club's thrower", async () => {
    mocks.getThrowerForAdmin.mockResolvedValue({ data: thrower, error: null });
    mocks.isAdmin.mockResolvedValue(false);
    mocks.isClubAdmin.mockResolvedValue(false);

    const h = host();
    await mountThrowerForm(h, 5);
    expect(h.container.querySelector(".error-banner")?.textContent).toBe(
      "Ingen tilgang til denne utøvaren.",
    );
  });

  it("has no delete button when creating", async () => {
    const h = host();
    await mountThrowerForm(h);
    expect(h.container.querySelector("#delete-button")).toBeNull();
  });
});
