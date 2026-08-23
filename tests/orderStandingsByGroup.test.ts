import { orderStandingsByGroup } from "@/utils/kamp/stilling";
import type { StandingRow } from "@/utils/kamp/stilling";

function row(kasterid: number, gruppe: string | null): StandingRow {
  return { kasterid, gruppe: gruppe ? { navn: gruppe } : null };
}

describe("orderStandingsByGroup", () => {
  it("gives gruppe A the first placements, then B, then the ungrouped", () => {
    // Interleaved, the way sortStandings leaves them
    const standings = [row(1, "B"), row(2, "A"), row(3, null), row(4, "B"), row(5, "A")];

    expect(orderStandingsByGroup(standings).map((r) => r.kasterid)).toEqual([2, 5, 1, 4, 3]);
  });

  it("keeps each group's own order", () => {
    const standings = [row(9, "A"), row(3, "A"), row(7, "A")];
    expect(orderStandingsByGroup(standings).map((r) => r.kasterid)).toEqual([9, 3, 7]);
  });

  it("leaves an ungrouped standing untouched", () => {
    const standings = [row(1, null), row(2, null)];
    expect(orderStandingsByGroup(standings).map((r) => r.kasterid)).toEqual([1, 2]);
  });
});
