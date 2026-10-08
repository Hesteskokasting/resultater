/**
 * On a slow connection the omgang insert can fail on the client yet land on the
 * server. saveMatchRound then reads the rows back and only reports an error
 * when what is stored is not what was sent.
 */

const db = vi.hoisted(() => ({
  insertResult: { error: null as unknown },
  stored: [] as { kamp_spelar_id: number; omgang: number; score: number }[],
}));

vi.mock("@/supabase", () => {
  const select = () => {
    const chain = {
      in: () => chain,
      abortSignal: () => Promise.resolve({ data: db.stored, error: null }),
    };
    return chain;
  };
  return {
    supabase: {
      from: () => ({
        insert: () => ({ abortSignal: () => Promise.resolve(db.insertResult) }),
        select,
      }),
    },
  };
});
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { saveMatchRound } from "@/services/kampService";

const rows = [
  { kamp_spelar_id: 1, omgang: 3, score: 6, antall_ringer: 2 },
  { kamp_spelar_id: 2, omgang: 3, score: 0, antall_ringer: 0 },
];

describe("saveMatchRound", () => {
  beforeEach(() => {
    db.insertResult = { error: null };
    db.stored = [];
  });

  it("succeeds without a read-back when the insert succeeds", async () => {
    expect((await saveMatchRound(rows)).error).toBeNull();
  });

  it("treats a failed insert as saved when the same rows are stored", async () => {
    db.insertResult = { error: new Error("Failed to fetch") };
    db.stored = rows.map(({ kamp_spelar_id, omgang, score }) => ({
      kamp_spelar_id,
      omgang,
      score,
    }));
    expect((await saveMatchRound(rows)).error).toBeNull();
  });

  it("keeps the error when the rows are missing", async () => {
    db.insertResult = { error: new Error("Failed to fetch") };
    expect((await saveMatchRound(rows)).error).toBeInstanceOf(Error);
  });

  it("keeps the error when another device stored a different score", async () => {
    db.insertResult = { error: { code: "23505" } };
    db.stored = [
      { kamp_spelar_id: 1, omgang: 3, score: 3 },
      { kamp_spelar_id: 2, omgang: 3, score: 0 },
    ];
    expect((await saveMatchRound(rows)).error).toEqual({ code: "23505" });
  });
});
