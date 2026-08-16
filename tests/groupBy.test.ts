import { groupBy } from "@/utils/groupBy";

describe("groupBy", () => {
  it("keeps insertion order both between and within the groups", () => {
    const matches = [
      { id: 1, runde: 2 },
      { id: 2, runde: 1 },
      { id: 3, runde: 2 },
      { id: 4, runde: 1 },
    ];
    const grouped = groupBy(matches, (m) => m.runde);

    expect([...grouped.keys()]).toEqual([2, 1]);
    expect(grouped.get(2)!.map((m) => m.id)).toEqual([1, 3]);
    expect(grouped.get(1)!.map((m) => m.id)).toEqual([2, 4]);
  });

  it("returns an empty map for no items", () => {
    expect(groupBy([], () => 1).size).toBe(0);
  });
});
