/**
 * The scoreboard page's write wiring: what the Bekreft kamp button hands to
 * confirmMatch, and what the Angre button deletes. The service's own payload is
 * covered in confirmMatchPayload, and the score maths in buildKampSpelarUpdates
 * — this is the layer in between, where the sides are grouped by startnummer and
 * handed over. It had no coverage when a bare `.map(toConfirmSide)` started
 * passing the array index as the side total.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getMatch: vi.fn(),
  getMatchResultInfo: vi.fn(),
  getMatchRounds: vi.fn(),
  confirmMatch: vi.fn(),
  getNextMatchForOrganizer: vi.fn(),
  getNextMatchForParticipant: vi.fn(),
  isParticipantInMatch: vi.fn(),
  subscribeToScoreboardChanges: vi.fn(),
  subscribeToNextMatch: vi.fn(),
  saveMatchRound: vi.fn(),
  deleteMatchRounds: vi.fn(),
  confirmDialog: vi.fn(),
}));

vi.mock("@/supabase", () => ({
  supabase: { from: () => new Proxy({}, { get: () => () => undefined }) },
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/services/kampService", async (importOriginal) => {
  // toConfirmSide stays real — it is half of what this file is testing
  const actual = await importOriginal<typeof import("@/services/kampService")>();
  return { ...actual, ...mocks };
});
vi.mock("@/utils/realtime", () => ({ unsubscribeChannel: vi.fn() }));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: vi.fn() }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { render } from "@/pages/kamp";

const KAMP_ID = 7;
const STEVNE_ID = 3;
/** kamp_spelar ids and their kasterids: P1 wins 22–9. */
const P1 = { id: 101, kasterid: 11 };
const P2 = { id: 202, kasterid: 22 };

function player(p: { id: number; kasterid: number }, fornavn: string) {
  return {
    id: p.id,
    kasterid: p.kasterid,
    score_poeng: 0,
    kamp_poeng: 0,
    antall_ringer: 0,
    kaster: { id: p.kasterid, fornavn, etternavn: "Kastar" },
  };
}

function match(overrides: Record<string, unknown> = {}) {
  return {
    id: KAMP_ID,
    stevneid: STEVNE_ID,
    fase: "innledende",
    runde_nummer: 1,
    runde_navn: null,
    bane_nummer: 4,
    er_bekreftet: false,
    er_walkover: false,
    er_tre_spelarar: false,
    stevne: { navn: "Testcupen" },
    spelarar: [player(P1, "Ada"), player(P2, "Bo")],
    ...overrides,
  };
}

/** Omgang rows summing to 22–9, i.e. a decided match with a Bekreft button. */
function rounds() {
  const per = [
    [6, 3],
    [6, 0],
    [4, 6],
    [6, 0],
  ];
  return per.flatMap(([s1, s2], i) => [
    { id: i * 2 + 1, kamp_spelar_id: P1.id, omgang: i + 1, score: s1, antall_ringer: 0 },
    { id: i * 2 + 2, kamp_spelar_id: P2.id, omgang: i + 1, score: s2, antall_ringer: 0 },
  ]);
}

function resultInfo(hcp: [number, number] = [0, 0]) {
  return {
    startNumberMap: { [P1.kasterid]: 1, [P2.kasterid]: 2 },
    positionMap: { [P1.kasterid]: 1, [P2.kasterid]: 1 },
    hcpMap: new Map([
      [P1.kasterid, hcp[0]],
      [P2.kasterid, hcp[1]],
    ]),
  };
}

const container = () => document.querySelector<HTMLElement>("#app")!;

async function renderPage(): Promise<void> {
  document.body.innerHTML = '<div class="top-header"></div><div id="app"></div>';
  await render(container(), { id: String(KAMP_ID) });
}

function clickConfirm(): void {
  const btn = document.querySelector<HTMLElement>(".sb-neste-btn--bekreft");
  expect(btn, "Bekreft kamp button").not.toBeNull();
  btn!.click();
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  sessionStorage.clear();
  for (const fn of Object.values(mocks)) fn.mockReset();
  mocks.getUser.mockResolvedValue({ profil: { kasterid: null, role: "admin" } });
  mocks.getMatch.mockResolvedValue({ data: match(), error: null });
  mocks.getMatchResultInfo.mockResolvedValue(resultInfo());
  mocks.getMatchRounds.mockResolvedValue({ data: rounds(), error: null });
  mocks.confirmMatch.mockResolvedValue({ error: null });
  mocks.getNextMatchForOrganizer.mockResolvedValue({ data: null });
  mocks.getNextMatchForParticipant.mockResolvedValue({ data: null });
  mocks.subscribeToScoreboardChanges.mockReturnValue({});
  mocks.subscribeToNextMatch.mockReturnValue({});
  mocks.deleteMatchRounds.mockResolvedValue({ error: null });
  mocks.confirmDialog.mockResolvedValue(true);
});

describe("kamp page — confirming from the scoreboard", () => {
  it("hands over both sides with no baseScore, so the omgangar decide the scores", async () => {
    await renderPage();
    clickConfirm();
    await flush();

    expect(mocks.confirmMatch).toHaveBeenCalledWith({
      kampId: KAMP_ID,
      sides: [
        { playerIds: [P1.id], kasterid: P1.kasterid },
        { playerIds: [P2.id], kasterid: P2.kasterid },
      ],
      hcp: [0, 0],
      erWalkover: false,
      outcome: { type: "innledende" },
    });
  });

  it("passes each side's HCP in side order", async () => {
    mocks.getMatchResultInfo.mockResolvedValue(resultInfo([0, 6]));
    await renderPage();
    clickConfirm();
    await flush();

    expect(mocks.confirmMatch.mock.calls[0]![0].hcp).toEqual([0, 6]);
  });

  it("groups a Par side by startnummer, rep first", async () => {
    const P1B = { id: 111, kasterid: 12 };
    const P2B = { id: 212, kasterid: 23 };
    mocks.getMatch.mockResolvedValue({
      data: match({
        spelarar: [player(P1, "Ada"), player(P1B, "Ola"), player(P2, "Bo"), player(P2B, "Kari")],
      }),
      error: null,
    });
    mocks.getMatchResultInfo.mockResolvedValue({
      startNumberMap: { [P1.kasterid]: 1, [P1B.kasterid]: 1, [P2.kasterid]: 2, [P2B.kasterid]: 2 },
      positionMap: { [P1.kasterid]: 1, [P1B.kasterid]: 2, [P2.kasterid]: 1, [P2B.kasterid]: 2 },
      hcpMap: new Map(),
    });

    await renderPage();
    clickConfirm();
    await flush();

    expect(mocks.confirmMatch.mock.calls[0]![0].sides).toEqual([
      { playerIds: [P1.id, P1B.id], kasterid: P1.kasterid },
      { playerIds: [P2.id, P2B.id], kasterid: P2.kasterid },
    ]);
  });

  it("settles a cup match through the cup outcome, not the innledende one", async () => {
    mocks.getMatch.mockResolvedValue({
      data: match({ fase: "avsluttende", runde_navn: "Kvartfinale" }),
      error: null,
    });

    await renderPage();
    clickConfirm();
    await flush();

    expect(mocks.confirmMatch.mock.calls[0]![0].outcome).toEqual({
      type: "cup-derived",
      orderedKasterids: null,
    });
  });

  it("keeps the page on screen and shows the error when the confirm fails", async () => {
    mocks.confirmMatch.mockResolvedValue({ error: { message: "nei" } });

    await renderPage();
    clickConfirm();
    await flush();

    expect(container().querySelector(".sb-error-banner")?.textContent).toContain("nei");
    expect(mocks.getNextMatchForOrganizer).not.toHaveBeenCalled();
  });

  it("moves the organizer to the next match on the same bane once confirmed", async () => {
    mocks.getNextMatchForOrganizer.mockResolvedValue({ data: { id: 99 } });

    await renderPage();
    clickConfirm();
    await flush();

    expect(mocks.getNextMatchForOrganizer).toHaveBeenCalledWith(STEVNE_ID, 4);
    expect(location.hash).toBe("#/kamp/99");
  });

  it("offers no confirm button to a viewer who is neither organizer nor participant", async () => {
    mocks.getUser.mockResolvedValue({ profil: { kasterid: 999, role: "bruker" } });

    await renderPage();

    expect(document.querySelector(".sb-neste-btn--bekreft")).toBeNull();
  });
});

describe("kamp page — undoing the last omgang", () => {
  const clickUndo = (): void => {
    const btn = document.querySelector<HTMLElement>(".sb-angre-btn");
    expect(btn, "Angre button").not.toBeNull();
    btn!.click();
  };

  it("deletes only the last omgang, for every side", async () => {
    await renderPage();
    clickUndo();
    await flush();

    expect(mocks.deleteMatchRounds).toHaveBeenCalledWith([P1.id, P2.id], 4);
  });

  it("names the round and its scores in the confirm, so the wrong one is not thrown away", async () => {
    await renderPage();
    clickUndo();
    await flush();

    const props = mocks.confirmDialog.mock.calls[0]![0];
    expect(props.title).toContain("4");
    expect(props.message).toContain("6 – 0");
  });

  it("deletes nothing when the confirm is declined", async () => {
    mocks.confirmDialog.mockResolvedValue(false);

    await renderPage();
    clickUndo();
    await flush();

    expect(mocks.deleteMatchRounds).not.toHaveBeenCalled();
  });

  it("re-reads the rounds after the delete, so the board falls back a round", async () => {
    await renderPage();
    mocks.getMatchRounds.mockResolvedValue({ data: rounds().slice(0, 6), error: null });
    clickUndo();
    await flush();

    // 22-9 minus the undone 6-0 leaves 16-9 — undecided, so the confirm is gone
    expect(document.querySelector(".sb-neste-btn--bekreft")).toBeNull();
    expect(container().querySelector(".sb-neste-btn")?.textContent).toBe("Neste omgang");
  });

  it("offers no undo to a viewer who is neither organizer nor participant", async () => {
    mocks.getUser.mockResolvedValue({ profil: { kasterid: 999, role: "bruker" } });

    await renderPage();

    expect(document.querySelector(".sb-angre-btn")).toBeNull();
  });
});
