/**
 * The 3-side cup confirm dialog is one of the callsites that builds the sides
 * for confirmMatch, and that construction had no coverage at all: a bare
 * `sides.map(toConfirmSide)` handed the array index over as the side total, so
 * the scores in kamp_omgang were never read. This drives the real dialog and
 * checks the payload it hands the service.
 */

const mocks = vi.hoisted(() => ({
  confirmMatch: vi.fn(),
  chain: new Proxy({}, { get: () => () => undefined }),
}));

vi.mock("@/supabase", () => ({ supabase: { from: () => mocks.chain, rpc: vi.fn() } }));
vi.mock("@/services/kampService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/kampService")>();
  return { ...actual, confirmMatch: mocks.confirmMatch };
});
vi.mock("@/pages/stevne/faseView", () => ({ sideNameHtml: () => "Spelar" }));
vi.mock("@/components/Toast", () => ({ showToast: vi.fn() }));

import { openThreeSideConfirmDialog } from "@/pages/stevne/avsluttende/_avslCupTreSpelarDialog";

const player = (id: number, kasterid: number) => ({ id, kasterid });
const side = (id: number, kasterid: number) => ({
  rep: player(id, kasterid),
  members: [player(id, kasterid)],
});

const kamp = { id: 7, runde_nummer: 2, runde_navn: "Kvartfinale" };
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
});

describe("openThreeSideConfirmDialog", () => {
  function open(afterConfirm = vi.fn()): ReturnType<typeof vi.fn> {
    // The dialog's types come from the cup page's row shapes; the fields it
    // actually reads are the ones built above.
    openThreeSideConfirmDialog(
      kamp as never,
      sides as never,
      3,
      afterConfirm as unknown as () => Promise<void>,
    );
    return afterConfirm;
  }

  it("sends sides with no baseScore, so the omgangar decide the scores", async () => {
    open();
    clickSide(11);
    clickSide(22);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    const { sides: sent } = mocks.confirmMatch.mock.calls[0]![0];
    expect(sent).toEqual([
      { playerIds: [101], kasterid: 11 },
      { playerIds: [202], kasterid: 22 },
      { playerIds: [303], kasterid: 33 },
    ]);
    expect(sent.every((s: { baseScore?: number }) => s.baseScore === undefined)).toBe(true);
  });

  it("ranks the advancing sides in pick order and eliminates the rest", async () => {
    const afterConfirm = open();
    clickSide(33);
    clickSide(11);
    document.querySelector<HTMLElement>("#bekreft-tre-btn")!.click();
    await flush();

    expect(mocks.confirmMatch.mock.calls[0]![0].outcome).toEqual({
      type: "cup-ranked",
      stevneId: 3,
      roundNumber: 2,
      roundName: "Kvartfinale",
      allThrowerIds: [11, 22, 33],
      eliminatedIds: [22],
      advancingSides: [[33], [11]],
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
});
