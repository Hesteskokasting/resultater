/**
 * The innledende match list's confirm wiring. Entering a score here IS the
 * confirmation, and the entered side totals are meant to reach confirmMatch as
 * baseScore — the opposite of the scoreboard page, which must leave baseScore
 * out so the omgangar decide (see kampBekreft). Both callsites feed the same
 * service, so both need to be pinned.
 */

const mocks = vi.hoisted(() => ({
  getInitialPhaseTournament: vi.fn(),
  getInitialRoundMatches: vi.fn(),
  getResultsForInitialRound: vi.fn(),
  confirmMatch: vi.fn(),
  unconfirmMatch: vi.fn(),
  subscribeToMatchChanges: vi.fn(),
  showScoreEditor: vi.fn(),
  deleteMatchRounds: vi.fn(),
}));

vi.mock("@/supabase", () => ({
  supabase: { from: () => new Proxy({}, { get: () => () => undefined }) },
}));
vi.mock("@/services/kampService", async (importOriginal) => {
  // toConfirmSide stays real — it is half of what this file is testing
  const actual = await importOriginal<typeof import("@/services/kampService")>();
  return { ...actual, ...mocks };
});
vi.mock("@/services/stevneService", () => ({
  getInitialPhaseTournament: mocks.getInitialPhaseTournament,
  completeTournament: vi.fn(),
}));
vi.mock("@/services/resultatService", () => ({
  getResultsForInitialRound: mocks.getResultsForInitialRound,
}));
vi.mock("@/components/ScoreEditor", () => ({ showScoreEditor: mocks.showScoreEditor }));
vi.mock("@/services/testDataService", () => ({ autoCompleteInitialRoundMatches: vi.fn() }));
vi.mock("@/utils/realtime", () => ({ unsubscribeChannel: vi.fn() }));
vi.mock("@/components/Toast", () => ({ showToast: vi.fn() }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { render } from "@/pages/stevne/innledende/gloppen";

const STEVNE_ID = 3;
const KAMP_ID = 7;
const P1 = { id: 101, kasterid: 11 };
const P2 = { id: 202, kasterid: 22 };

function player(p: { id: number; kasterid: number }, fornavn: string, omgangar: number[] = []) {
  return {
    id: p.id,
    kasterid: p.kasterid,
    score_poeng: 0,
    kamp_poeng: 0,
    antall_ringer: 0,
    kaster: { id: p.kasterid, fornavn, etternavn: "Kastar", klubb: null },
    omgangar: omgangar.map((score) => ({ score, antall_ringer: 0 })),
  };
}

function match(spelarar = [player(P1, "Ada"), player(P2, "Bo")]) {
  return {
    id: KAMP_ID,
    stevneid: STEVNE_ID,
    runde_nummer: 1,
    bane_nummer: 4,
    er_bekreftet: false,
    er_walkover: false,
    fase: "innledende",
    spelarar,
  };
}

const stevne = {
  id: STEVNE_ID,
  navn: "Testcupen",
  erfullfort: false,
  stevne_fase: "innledende",
  antall_runder_innl: 3,
  runde1_format: null,
  avsluttendekastemetodeid: null,
  kastemetodeInnl: { id: 1, navn: "Gloppen" },
  kategori: { erlagbasert: false },
};

function results(hcp: Record<number, number> = {}) {
  return [
    { kasterid: P1.kasterid, startnummer: 1, posisjon: 1, hcp: hcp[P1.kasterid] ?? 0 },
    { kasterid: P2.kasterid, startnummer: 2, posisjon: 1, hcp: hcp[P2.kasterid] ?? 0 },
  ];
}

const container = () => document.querySelector<HTMLElement>("#app")!;

/** The options the score editor was last opened with. */
function lastEditorOptions() {
  const { calls } = mocks.showScoreEditor.mock;
  return calls[calls.length - 1]?.[0];
}

async function renderPage(): Promise<void> {
  document.body.innerHTML = '<div id="app"></div>';
  await render(container(), { id: STEVNE_ID, isAdmin: true });
}

/** Opens the score editor the way the admin does, then enters the two totals. */
async function enterScores(s1: number, s2: number): Promise<void> {
  const trigger = container().querySelector<HTMLElement>(`[data-endre-score="${KAMP_ID}"]`);
  expect(trigger, "score edit trigger").not.toBeNull();
  trigger!.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const opts = lastEditorOptions();
  expect(opts, "showScoreEditor options").toBeDefined();
  await opts.onSaved(s1, s2);
}

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
  mocks.getInitialPhaseTournament.mockResolvedValue({ data: stevne, error: null });
  mocks.getInitialRoundMatches.mockResolvedValue({ data: [match()], error: null });
  mocks.getResultsForInitialRound.mockResolvedValue({ data: results(), error: null });
  mocks.confirmMatch.mockResolvedValue({ error: null });
  mocks.subscribeToMatchChanges.mockReturnValue({});
});

describe("innledende list — entering a score confirms the match", () => {
  it("sends the entered totals as each side's baseScore", async () => {
    await renderPage();
    await enterScores(21, 13);

    expect(mocks.confirmMatch).toHaveBeenCalledWith({
      kampId: KAMP_ID,
      sides: [
        { playerIds: [P1.id], kasterid: P1.kasterid, baseScore: 21 },
        { playerIds: [P2.id], kasterid: P2.kasterid, baseScore: 13 },
      ],
      hcp: [0, 0],
      erWalkover: false,
      outcome: { type: "innledende" },
    });
  });

  it("keeps a zero total as a real score rather than dropping it", async () => {
    await renderPage();
    await enterScores(21, 0);

    const { sides } = mocks.confirmMatch.mock.calls[0]![0];
    expect(sides[1].baseScore).toBe(0);
  });

  it("passes each side's HCP in side order", async () => {
    mocks.getResultsForInitialRound.mockResolvedValue({
      data: results({ [P2.kasterid]: 6 }),
      error: null,
    });
    await renderPage();
    await enterScores(21, 13);

    expect(mocks.confirmMatch.mock.calls[0]![0].hcp).toEqual([0, 6]);
  });

  it("groups a Par side by startnummer and gives it one baseScore", async () => {
    const P1B = { id: 111, kasterid: 12 };
    const P2B = { id: 212, kasterid: 23 };
    mocks.getInitialRoundMatches.mockResolvedValue({
      data: [match([player(P1, "Ada"), player(P1B, "Ola"), player(P2, "Bo"), player(P2B, "Kari")])],
      error: null,
    });
    mocks.getResultsForInitialRound.mockResolvedValue({
      data: [
        { kasterid: P1.kasterid, startnummer: 1, posisjon: 1, hcp: 0 },
        { kasterid: P1B.kasterid, startnummer: 1, posisjon: 2, hcp: 0 },
        { kasterid: P2.kasterid, startnummer: 2, posisjon: 1, hcp: 0 },
        { kasterid: P2B.kasterid, startnummer: 2, posisjon: 2, hcp: 0 },
      ],
      error: null,
    });

    await renderPage();
    await enterScores(21, 13);

    expect(mocks.confirmMatch.mock.calls[0]![0].sides).toEqual([
      { playerIds: [P1.id, P1B.id], kasterid: P1.kasterid, baseScore: 21 },
      { playerIds: [P2.id, P2B.id], kasterid: P2.kasterid, baseScore: 13 },
    ]);
  });

  it("warns about discarding detail only when the match has omgangar", async () => {
    await renderPage();
    container().querySelector<HTMLElement>(`[data-endre-score="${KAMP_ID}"]`)!.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(lastEditorOptions().hasRounds).toBe(false);

    mocks.getInitialRoundMatches.mockResolvedValue({
      data: [match([player(P1, "Ada", [6, 6]), player(P2, "Bo", [3, 0])])],
      error: null,
    });
    await renderPage();
    container().querySelector<HTMLElement>(`[data-endre-score="${KAMP_ID}"]`)!.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(lastEditorOptions().hasRounds).toBe(true);
  });

  it("offers no score editing to a non-admin", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    await render(container(), { id: STEVNE_ID, isAdmin: false });

    expect(container().querySelector(`[data-endre-score="${KAMP_ID}"]`)).toBeNull();
  });
});
