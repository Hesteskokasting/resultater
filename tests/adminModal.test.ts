/**
 * The overlay that keeps create/edit on the dashboard: the modal shell itself,
 * and the wiring that closes it and refreshes the panel behind it once the form
 * reports a save or a delete.
 */

const mocks = vi.hoisted(() => ({
  mountClubForm: vi.fn(),
  mountThrowerForm: vi.fn(),
  mountTournamentForm: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/admin/forms/klubbForm", () => ({ mountClubForm: mocks.mountClubForm }));
vi.mock("@/admin/forms/kasterForm", () => ({ mountThrowerForm: mocks.mountThrowerForm }));
vi.mock("@/admin/forms/stevneForm", () => ({ mountTournamentForm: mocks.mountTournamentForm }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));

import { openAdminModal } from "@/admin/_adminModal";
import { openClubEditor, openThrowerEditor, openTournamentEditor } from "@/admin/_adminEdit";
import type { AdminFormHost } from "@/admin/forms/_formHost";

function modalEl(): HTMLElement | null {
  return document.querySelector(".modal");
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.replaceChildren();
  document.body.className = "";
  mocks.mountClubForm.mockResolvedValue(undefined);
  mocks.mountThrowerForm.mockResolvedValue(undefined);
  mocks.mountTournamentForm.mockResolvedValue(undefined);
});

describe("openAdminModal", () => {
  it("mounts a titled dialog with a body and a backdrop", () => {
    const modal = openAdminModal({ title: "Nytt stevne" });

    expect(modalEl()).not.toBeNull();
    expect(document.querySelector(".modal-title")?.textContent).toBe("Nytt stevne");
    expect(document.querySelector(".modal-backdrop")).not.toBeNull();
    expect(document.body.classList.contains("modal-open")).toBe(true);
    expect(modal.body.closest(".modal")).toBe(modalEl());

    modal.close();
  });

  it("removes itself, the backdrop and the body class on close", () => {
    const onClose = vi.fn();
    const modal = openAdminModal({ title: "X", onClose });
    modal.close();

    expect(modalEl()).toBeNull();
    expect(document.querySelector(".modal-backdrop")).toBeNull();
    expect(document.body.classList.contains("modal-open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape, on the close button and on a backdrop click", () => {
    const onClose = vi.fn();

    openAdminModal({ title: "X", onClose });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(modalEl()).toBeNull();

    openAdminModal({ title: "X", onClose });
    document.querySelector<HTMLButtonElement>("[data-modal-close]")!.click();
    expect(modalEl()).toBeNull();

    openAdminModal({ title: "X", onClose });
    modalEl()!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modalEl()).toBeNull();

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("ignores Escape while a dialog is stacked on top of it", () => {
    const modal = openAdminModal({ title: "Rediger stevne" });

    // A confirm dialog (delete, fullfør) opens above and owns the Escape key.
    const confirm = document.createElement("div");
    confirm.className = "modal";
    confirm.style.display = "block";
    document.body.appendChild(confirm);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.querySelector(".modal-title")).not.toBeNull();

    confirm.remove();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.querySelector(".modal-title")).toBeNull();

    modal.close();
  });

  it("does not close when the click lands inside the dialog", () => {
    const modal = openAdminModal({ title: "X" });
    modal.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modalEl()).not.toBeNull();
    modal.close();
  });

  it("only fires onClose once however many times close is called", () => {
    const onClose = vi.fn();
    const modal = openAdminModal({ title: "X", onClose });
    modal.close();
    modal.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renames the dialog through setTitle", () => {
    const modal = openAdminModal({ title: "Gammal" });
    modal.setTitle("Ny");
    expect(document.querySelector(".modal-title")?.textContent).toBe("Ny");
    modal.close();
  });

  it("uses the wide dialog only when asked", () => {
    const wide = openAdminModal({ title: "X", size: "lg" });
    expect(document.querySelector(".modal-dialog")?.classList.contains("modal-lg")).toBe(true);
    wide.close();

    const normal = openAdminModal({ title: "X" });
    expect(document.querySelector(".modal-dialog")?.classList.contains("modal-lg")).toBe(false);
    normal.close();
  });
});

describe("entity editors", () => {
  function hostOf(mock: typeof mocks.mountClubForm): AdminFormHost {
    return mock.mock.calls[0]?.[0] as AdminFormHost;
  }

  it("opens the club form in the overlay with the club's id", () => {
    openClubEditor(7, vi.fn());

    expect(document.querySelector(".modal-title")?.textContent).toBe("Rediger klubb");
    expect(mocks.mountClubForm).toHaveBeenCalledWith(expect.any(Object), 7);
    expect(hostOf(mocks.mountClubForm).container.closest(".modal")).not.toBeNull();
  });

  it("titles the create case and passes no id", () => {
    openThrowerEditor(undefined, vi.fn());
    expect(document.querySelector(".modal-title")?.textContent).toBe("Ny utøvar");
    expect(mocks.mountThrowerForm).toHaveBeenCalledWith(expect.any(Object), undefined);
  });

  it("closes, confirms and refreshes the panel after a save", () => {
    const onChanged = vi.fn();
    openTournamentEditor(3, onChanged);

    hostOf(mocks.mountTournamentForm).onSaved?.(3, false);

    expect(modalEl()).toBeNull();
    expect(mocks.showToast).toHaveBeenCalledWith("Stevnet er lagra.", "success");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("reports a create differently from an update", () => {
    openTournamentEditor(undefined, vi.fn());
    hostOf(mocks.mountTournamentForm).onSaved?.(9, true);
    expect(mocks.showToast).toHaveBeenCalledWith("Stevnet er oppretta.", "success");
  });

  it("closes and refreshes after a delete", () => {
    const onChanged = vi.fn();
    openThrowerEditor(4, onChanged);

    hostOf(mocks.mountThrowerForm).onDeleted?.();

    expect(modalEl()).toBeNull();
    expect(mocks.showToast).toHaveBeenCalledWith("Utøvaren er sletta.", "success");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("cancelling closes without touching the panel", () => {
    const onChanged = vi.fn();
    openClubEditor(1, onChanged);

    hostOf(mocks.mountClubForm).onCancel?.();

    expect(modalEl()).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
    expect(mocks.showToast).not.toHaveBeenCalled();
  });
});
