/**
 * The 3-side cup confirm dialog builds the sides for confirmMatch itself. A bare
 * `sides.map(toConfirmSide)` once handed the array index over as the side total.
 * Now every side totals 0: the hand-set ranking deletes the omgangar, so their
 * sums must not linger in kamp_spelar. This drives the real dialog and checks
 * the payload it hands the service.
 */

const mocks = vi.hoisted(() => ({
  confirmMatch: vi.fn(),
  confirmDialog: vi.fn(),
  chain: new Proxy({}, { get: () => () => undefined }),
}));

vi.mock("@/supabase", () => ({ supabase: { from: () => mocks.chain, rpc: vi.fn() } }));
vi.mock("@/services/kampService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/kampService")>();
  return { ...actual, confirmMatch: mocks.confirmMatch };
});
vi.mock("@/pages/stevne/faseView", () => ({ sideNameHtml: () => "Spelar" }));
vi.mock("@/components/Toast", () => ({ showToast: vi.fn() }));
vi.mock("@/components/dialog/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));

import { openThreeSideConfirmDialog } from "@/pages/stevne/avsluttende/_avslCupTreSpelarDialog";

const player = (id: number, kasterid: number) => ({ id, kasterid });
const side = (id: number, kasterid: number) => ({
  rep: player(id, kasterid),
  members: [player(id, kasterid)],
});

const kamp = { id: 7, runde_nummer: 2, runde_navn: "Kvartfinale", spelarar: [] };
const kampWithRounds = { ...kamp, spelarar: [{ omgangar: [{ score: 6, antall_ringer: 2 }] }] };
const sides = [side(101, 11), side(202, 22), side(303, 33)];

function clickSide(kasterid: number): void {
  document.querySelector<HTMLElement>(`[data-kasterid="${kasterid}"]`)!.click();
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  document.body.innerHTML = "";
  mocks.confirmMatch.mockReset();
  mocks.confirmMatch.mockResolvedValue({ error: null });
  mocks.confirmDialog.mockReset();
});

describe("openThreeSideConfirmDialog", () => {
  function open(afterConfirm = vi.fn(), k: object = kamp): ReturnType<typeof vi.fn> {
    // The dialog's types come from the cup page's row shapes; the fields it
    // actually reads are the ones built above.
    openThreeSideConfirmDialog(
      k as never,
      sides as never,
      afterConfirm as unknown as () => Promise<void>,
    );
    return afterConfirm;
  }

  it("sends every side with a zero total, so deleted omgangar leave no score behind", async () => {
    open();
    clickSide(11);
    clickSide(22);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    const { sides: sent } = mocks.confirmMatch.mock.calls[0]![0];
    expect(sent).toEqual([
      { playerIds: [101], kasterid: 11, baseScore: 0 },
      { playerIds: [202], kasterid: 22, baseScore: 0 },
      { playerIds: [303], kasterid: 33, baseScore: 0 },
    ]);
  });

  it("ranks the advancing sides in pick order and eliminates the rest", async () => {
    const afterConfirm = open();
    clickSide(33);
    clickSide(11);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmMatch.mock.calls[0]![0].outcome).toEqual({
      type: "cup-ranked",
      eliminatedIds: [22],
      advancingSides: [[33], [11]],
      deleteRounds: true,
    });
    expect(afterConfirm).toHaveBeenCalled();
    expect(document.querySelector(".final-dialog-overlay")).toBeNull();
  });

  it("confirms nothing until two sides are picked", async () => {
    open();
    clickSide(11);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmMatch).not.toHaveBeenCalled();
  });

  it("warns before discarding omgangar, and confirms nothing when declined", async () => {
    mocks.confirmDialog.mockResolvedValue(false);
    open(vi.fn(), kampWithRounds);
    clickSide(11);
    clickSide(22);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmDialog).toHaveBeenCalled();
    expect(mocks.confirmMatch).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>(".final-dialog-overlay")?.hidden).toBe(false);
  });

  it("confirms once the warning is accepted", async () => {
    mocks.confirmDialog.mockResolvedValue(true);
    open(vi.fn(), kampWithRounds);
    clickSide(11);
    clickSide(22);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmMatch).toHaveBeenCalled();
  });

  it("does not warn when there are no omgangar", async () => {
    open();
    clickSide(11);
    clickSide(22);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmDialog).not.toHaveBeenCalled();
    expect(mocks.confirmMatch).toHaveBeenCalled();
  });
});
