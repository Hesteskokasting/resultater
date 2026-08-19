/**
 * What confirmMatch actually sends to the database. The score maths has its own
 * unit tests (buildKampSpelarUpdates.test.ts); these cover the wiring around it:
 * whether the omgangar are read at all, and what ends up in the RPC payload and
 * the kamp_spelar PATCHes. A side built without a baseScore must always be
 * scored from its omgang rows — the bug this file guards against wrote the
 * array index as the side total and left the real scores in kamp_omgang.
 */

type Filter = [string, unknown];
type Call = {
  table: string;
  op: "select" | "update" | "delete";
  payload?: unknown;
  filters: Filter[];
};

const mocks = vi.hoisted(() => {
  const calls: Call[] = [];
  const rpc = vi.fn();
  let omgangRows: { kamp_spelar_id: number; score: number; antall_ringer: number }[] = [];
  let storedScores: { id: number; score_poeng: number }[] = [];

  function resultFor(call: Call): { data: unknown; error: unknown } {
    if (call.op === "update") {
      // verifyRowsAffected treats an empty array as "already confirmed"
      return { data: [{ id: 1 }], error: null };
    }
    if (call.table === "kamp_omgang") return { data: omgangRows, error: null };
    if (call.table === "kamp_spelar") return { data: storedScores, error: null };
    return { data: [], error: null };
  }

  function from(table: string): unknown {
    const call: Call = { table, op: "select", filters: [] };
    calls.push(call);
    const builder: Record<string, unknown> = {
      select: () => builder,
      update: (payload: unknown) => {
        call.op = "update";
        call.payload = payload;
        return builder;
      },
      delete: () => {
        call.op = "delete";
        return builder;
      },
      eq: (col: string, val: unknown) => {
        call.filters.push([col, val]);
        return builder;
      },
      in: (col: string, val: unknown) => {
        call.filters.push([col, val]);
        return builder;
      },
      // A Supabase query builder is awaited directly, so the fake has to be thenable
      // oxlint-disable-next-line unicorn/no-thenable
      then: (resolve: (r: unknown) => unknown) => resolve(resultFor(call)),
    };
    return builder;
  }

  return {
    calls,
    rpc,
    from,
    setOmgangar: (rows: typeof omgangRows) => {
      omgangRows = rows;
    },
    setStoredScores: (rows: typeof storedScores) => {
      storedScores = rows;
    },
  };
});

vi.mock("@/supabase", () => ({ supabase: { from: mocks.from, rpc: mocks.rpc } }));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { confirmMatch, toConfirmSide } from "@/services/kampService";

const P1 = 101;
const P2 = 202;
const K1 = 11;
const K2 = 22;

/** A Singel side as the callers build it: one kamp_spelar row, one kaster. */
const side = (id: number, kasterid: number) => ({
  rep: { id, kasterid },
  members: [{ id, kasterid }],
});

function omgang(id: number, score: number, rings: number) {
  return { kamp_spelar_id: id, score, antall_ringer: rings };
}

/** P1 wins 16–9 over three omganger. */
const THREE_ROUNDS = [
  omgang(P1, 6, 2),
  omgang(P2, 3, 1),
  omgang(P1, 4, 1),
  omgang(P2, 4, 1),
  omgang(P1, 6, 2),
  omgang(P2, 2, 0),
];

const scoreUpdates = () =>
  mocks.calls.filter(
    (c) => c.table === "kamp_spelar" && c.op === "update" && "score_poeng" in (c.payload as object),
  );

const reads = (table: string) => mocks.calls.filter((c) => c.table === table && c.op === "select");

beforeEach(() => {
  mocks.calls.length = 0;
  mocks.rpc.mockReset();
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.setOmgangar([]);
  mocks.setStoredScores([]);
});

describe("confirmMatch — innledende", () => {
  it("scores the sides from their omgang rows when no baseScore is given", async () => {
    mocks.setOmgangar(THREE_ROUNDS);
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    const { error } = await confirmMatch({
      kampId: 5,
      sides,
      hcp: [0, 0],
      outcome: { type: "innledende" },
    });

    expect(error).toBeNull();
    expect(mocks.rpc).toHaveBeenCalledWith("bekreft_innledende_kamp", {
      p_kamp_id: 5,
      p_scores: [
        { kamp_spelar_id: P1, score_poeng: 16, kamp_poeng: 2, antall_ringer: 5 },
        { kamp_spelar_id: P2, score_poeng: 9, kamp_poeng: 0, antall_ringer: 2 },
      ],
    });
  });

  it("adds the side HCP to the representative's score", async () => {
    mocks.setOmgangar(THREE_ROUNDS);
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    await confirmMatch({ kampId: 5, sides, hcp: [0, 6], outcome: { type: "innledende" } });

    const { p_scores } = mocks.rpc.mock.calls[0]![1] as {
      p_scores: { kamp_spelar_id: number; score_poeng: number; kamp_poeng: number }[];
    };
    // 9 + 6 = 15 still loses to 16, but passing 11 is worth one kamp_poeng
    expect(p_scores[1]).toMatchObject({ score_poeng: 15, kamp_poeng: 1 });
    expect(p_scores[0]).toMatchObject({ score_poeng: 16, kamp_poeng: 2 });
  });

  it("skips the omgang read entirely when every side hands over its total", async () => {
    const sides = [
      toConfirmSide(side(P1, K1), { baseScore: 21 }),
      toConfirmSide(side(P2, K2), { baseScore: 13 }),
    ];

    await confirmMatch({ kampId: 5, sides, hcp: [0, 0], outcome: { type: "innledende" } });

    expect(reads("kamp_omgang")).toHaveLength(0);
    expect(mocks.rpc).toHaveBeenCalledWith("bekreft_innledende_kamp", {
      p_kamp_id: 5,
      p_scores: [
        { kamp_spelar_id: P1, score_poeng: 21, kamp_poeng: 2, antall_ringer: 0 },
        { kamp_spelar_id: P2, score_poeng: 13, kamp_poeng: 1, antall_ringer: 0 },
      ],
    });
  });

  it("keeps the stored scores when there are neither omgangar nor entered totals", async () => {
    mocks.setStoredScores([
      { id: P1, score_poeng: 21 },
      { id: P2, score_poeng: 8 },
    ]);
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    await confirmMatch({ kampId: 5, sides, hcp: [0, 0], outcome: { type: "innledende" } });

    const { p_scores } = mocks.rpc.mock.calls[0]![1] as {
      p_scores: { score_poeng: number }[];
    };
    expect(p_scores.map((s) => s.score_poeng)).toEqual([21, 8]);
  });

  it("reports the already-confirmed case the RPC signals with false", async () => {
    mocks.setOmgangar(THREE_ROUNDS);
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    const { error } = await confirmMatch({
      kampId: 5,
      sides,
      hcp: [0, 0],
      outcome: { type: "innledende" },
    });

    expect((error as Error).message).toMatch(/stadfesta/);
  });
});

describe("confirmMatch — cup", () => {
  it("PATCHes the omgang sums and eliminates the lowest side", async () => {
    mocks.setOmgangar(THREE_ROUNDS);
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    await confirmMatch({
      kampId: 7,
      sides,
      outcome: { type: "cup-derived", orderedKasterids: null },
    });

    expect(scoreUpdates().map((c) => [c.filters[0]?.[1], c.payload])).toEqual([
      [P1, { score_poeng: 16, kamp_poeng: 2, antall_ringer: 5 }],
      [P2, { score_poeng: 9, kamp_poeng: 0, antall_ringer: 2 }],
    ]);
    expect(mocks.rpc).toHaveBeenCalledWith("bekreft_avsluttende_kamp_deltakar", {
      p_kamp_id: 7,
      p_eliminert_kasterid: K2,
    });
  });

  it("ranks a hand-confirmed match without touching its scores", async () => {
    mocks.setOmgangar(THREE_ROUNDS);
    const sides = [side(P1, K1), side(P2, K2)].map((s) => toConfirmSide(s));

    await confirmMatch({
      kampId: 7,
      sides,
      outcome: {
        type: "cup-ranked",
        stevneId: 3,
        roundNumber: 2,
        roundName: "Kvartfinale",
        allThrowerIds: [K1, K2],
        eliminatedIds: [K2],
        advancingSides: [[K1]],
      },
    });

    // The scores still come from the omgangar, not from the ranking
    expect(scoreUpdates().map((c) => c.payload)).toEqual([
      { score_poeng: 16, kamp_poeng: 2, antall_ringer: 5 },
      { score_poeng: 9, kamp_poeng: 0, antall_ringer: 2 },
    ]);

    const placements = mocks.calls.filter(
      (c) => c.op === "update" && "kamp_plassering" in (c.payload as object),
    );
    expect(placements.map((c) => [c.payload, c.filters])).toEqual([
      [
        { kamp_plassering: 1 },
        [
          ["kampid", 7],
          ["kasterid", K1],
        ],
      ],
      [
        { kamp_plassering: 2 },
        [
          ["kampid", 7],
          ["kasterid", K2],
        ],
      ],
    ]);
  });
});
