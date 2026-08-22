/**
 * The registration button's toggle flow — above all that it never leaves itself
 * disabled, which would strand the user with a dead button and no way back.
 */

const mocks = vi.hoisted(() => ({
  registerForTournament: vi.fn(),
  removeRegistration: vi.fn(),
  getMyRegistrationForTournament: vi.fn(),
  confirmDialog: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/pameldingService", () => ({
  registerForTournament: mocks.registerForTournament,
  removeRegistration: mocks.removeRegistration,
  getMyRegistrationForTournament: mocks.getMyRegistrationForTournament,
}));
vi.mock("@/components/dialog/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));

import { createRegistrationButton } from "@/components/PameldingKnapp";

function button(isRegistered: boolean, registrationId?: number) {
  return createRegistrationButton({
    tournamentId: 10,
    throwerId: 20,
    isRegistered,
    registrationId,
  });
}

/** Click and wait for the handler's promise chain to settle. */
async function click(btn: HTMLButtonElement): Promise<void> {
  btn.click();
  await vi.waitFor(() => expect(btn.disabled).toBe(false));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.confirmDialog.mockResolvedValue(true);
});

it("registers and flips to Meld av", async () => {
  mocks.registerForTournament.mockResolvedValue({ error: null, id: 99 });
  const btn = button(false);
  expect(btn.textContent).toBe("Meld på");

  await click(btn);

  expect(mocks.registerForTournament).toHaveBeenCalledWith(10, 20);
  expect(btn.textContent).toBe("Meld av");
});

it("re-enables itself and keeps its label when the write fails", async () => {
  mocks.registerForTournament.mockResolvedValue({ error: new Error("nei"), id: null });
  const btn = button(false);

  await click(btn);

  expect(btn.textContent).toBe("Meld på");
  expect(mocks.showToast).toHaveBeenCalledWith(expect.stringContaining("nei"), "error");
});

it("re-enables itself when the user backs out of the confirm dialog", async () => {
  mocks.confirmDialog.mockResolvedValue(false);
  const btn = button(true, 99);

  await click(btn);

  expect(mocks.removeRegistration).not.toHaveBeenCalled();
  expect(btn.textContent).toBe("Meld av");
});

it("recovers and says so when the network throws outright", async () => {
  mocks.registerForTournament.mockRejectedValue(new Error("boom"));
  const btn = button(false);

  await click(btn);

  expect(btn.textContent).toBe("Meld på");
  expect(mocks.showToast).toHaveBeenCalledWith(expect.stringContaining("gale"), "error");
});

it("looks the registration up when the card was built without an id", async () => {
  mocks.getMyRegistrationForTournament.mockResolvedValue({ data: { id: 77 } });
  mocks.removeRegistration.mockResolvedValue({ error: null });
  const btn = button(true);

  await click(btn);

  expect(mocks.removeRegistration).toHaveBeenCalledWith(77);
  expect(btn.textContent).toBe("Meld på");
});

it("gives up without a write when the registration cannot be found", async () => {
  mocks.getMyRegistrationForTournament.mockResolvedValue({ data: null });
  const btn = button(true);

  await click(btn);

  expect(mocks.removeRegistration).not.toHaveBeenCalled();
  expect(btn.textContent).toBe("Meld av");
});
