import { cupRanking, type CupSide } from "@/services/cupKampService";

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

  it("gives a tie to side 1", () => {
    const r = cupRanking(side(1), side(2), 21, 21);
    expect(r.winnerIds).toEqual([1]);
    expect(r.loserIds).toEqual([2]);
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
