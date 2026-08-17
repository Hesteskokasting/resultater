import {
  cupRanking,
  rescoreCupMatch,
  settleCupMatch,
  CUP_TIE_MESSAGE,
  type CupSide,
} from "@/services/cupKampService";
import { errorMessage } from "@/utils/errorMessage";

// cupRanking only reads members[].kasterid, so a bare id row is enough
function side(...kasterids: number[]): CupSide {
  const members = kasterids.map((kasterid) => ({ kasterid }));
  return { rep: members[0]!, members } as unknown as CupSide;
}

describe("cupRanking", () => {
  it("gives the win to the higher total", () => {
    const r = cupRanking(side(1), side(2), 15, 21);
    expect(r.winnerIds).toEqual([2]);
    expect(r.loserIds).toEqual([1]);
  });

  it("ranks both members of a pair together", () => {
    const r = cupRanking(side(1, 2), side(3, 4), 21, 10);
    expect(r.placements).toEqual([
      { kasterid: 1, plassering: 1 },
      { kasterid: 2, plassering: 1 },
      { kasterid: 3, plassering: 2 },
      { kasterid: 4, plassering: 2 },
    ]);
  });

  it("handles a missing opposing side (walkover)", () => {
    const r = cupRanking(side(1), null, 21, 0);
    expect(r.winnerIds).toEqual([1]);
    expect(r.loserIds).toEqual([]);
    expect(r.placements).toEqual([{ kasterid: 1, plassering: 1 }]);
  });
});

// A draw leaves the bracket with no one to advance, so both write paths refuse
// one before they touch the database.

describe("cup draw guard", () => {
  const kamp = { id: 1, runde_nummer: 2, runde_navn: null } as never;
  const sides = [side(1), side(2)] as never;

  it("settleCupMatch refuses equal totals", async () => {
    const { error } = await settleCupMatch({ stevneId: 9, kamp, sides, s1: 21, s2: 21 });
    expect(errorMessage(error)).toBe(CUP_TIE_MESSAGE);
  });

  it("settleCupMatch refuses a scoreless match", async () => {
    const { error } = await settleCupMatch({ stevneId: 9, kamp, sides, s1: 0, s2: 0 });
    expect(errorMessage(error)).toBe(CUP_TIE_MESSAGE);
  });

  it("rescoreCupMatch refuses equal totals before deleting omgangar", async () => {
    const { error, step } = await rescoreCupMatch({ stevneId: 9, kamp, sides, s1: 15, s2: 15 });
    expect(step).toBe("uavgjort");
    expect(errorMessage(error)).toBe(CUP_TIE_MESSAGE);
  });
});
