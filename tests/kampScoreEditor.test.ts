/**
 * The editor clears a match's omgangar before saving a typed total, unless the
 * save does it itself in the same transaction (cup) — then a separate delete
 * would only add a round trip and could leave the omgangar gone with no score.
 */

const mocks = vi.hoisted(() => ({
  deleteMatchRounds: vi.fn(),
  confirmDialog: vi.fn(),
  showKampScoreNumberpad: vi.fn(),
}));

vi.mock("@/services/kampService", () => ({ deleteMatchRounds: mocks.deleteMatchRounds }));
vi.mock("@/components/dialog/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/numberpad/KampScoreNumberpad", () => ({
  showKampScoreNumberpad: mocks.showKampScoreNumberpad,
}));
vi.mock("@/components/Toast", () => ({ showToast: vi.fn() }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { showKampScoreEditor } from "@/components/numberpad/kampScoreEditor";

async function saveWith(roundsClearedBySave: boolean): Promise<ReturnType<typeof vi.fn>> {
  const onSaved = vi.fn().mockResolvedValue(true);
  await showKampScoreEditor({
    side1Name: "A",
    side2Name: "B",
    currentS1: 0,
    currentS2: 0,
    playerIds: [1, 2],
    hasRounds: true,
    roundsClearedBySave,
    onSaved,
    logPrefix: "test",
  });
  const onSave = mocks.showKampScoreNumberpad.mock.calls[0]![1] as (
    s: number[],
  ) => Promise<boolean>;
  expect(await onSave([21, 9])).toBe(true);
  return onSaved;
}

beforeEach(() => {
  mocks.deleteMatchRounds.mockReset().mockResolvedValue({ error: null });
  mocks.confirmDialog.mockReset().mockResolvedValue(true);
  mocks.showKampScoreNumberpad.mockReset();
});

describe("showKampScoreEditor", () => {
  it("deletes the omgangar before the save by default", async () => {
    const onSaved = await saveWith(false);
    expect(mocks.deleteMatchRounds).toHaveBeenCalledWith([1, 2]);
    expect(onSaved).toHaveBeenCalledWith(21, 9);
  });

  it("leaves the delete to a save that clears them itself", async () => {
    const onSaved = await saveWith(true);
    expect(mocks.deleteMatchRounds).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith(21, 9);
  });
});
