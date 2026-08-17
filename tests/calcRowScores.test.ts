import { calcRowScores } from "@/pages/stevne/innledende/innledendeView";

// calcRowScores only reads score_poeng and omgangar off the members, and
// er_bekreftet / er_walkover off the match.
type TestSide = Parameters<typeof calcRowScores>[1];
type TestMatch = Parameters<typeof calcRowScores>[0];

function side(score: number, omgangar: number[] = []): TestSide {
  const member = { score_poeng: score, omgangar: omgangar.map((s) => ({ score: s })) };
  return { rep: member, members: [member] } as unknown as TestSide;
}

function match(flags: { confirmed?: boolean; walkover?: boolean } = {}): TestMatch {
  return {
    er_bekreftet: flags.confirmed ?? false,
    er_walkover: flags.walkover ?? false,
  } as unknown as TestMatch;
}

describe("calcRowScores", () => {
  it("adds the handicap to a side that has started throwing", () => {
    const r = calcRowScores(match(), side(0, [3, 4]), side(0, [2, 2]), true, true, 5, 0);
    expect(r.s1).toBe(12); // 7 thrown + 5 hcp
    expect(r.s2).toBe(4);
    expect(r.hasPoints).toBe(true);
  });

  it("withholds the handicap until the side has thrown", () => {
    const r = calcRowScores(match(), side(0), side(0), false, false, 5, 0);
    expect(r.s1).toBe(0);
    expect(r.hasPoints).toBe(false);
  });

  it("uses the stored total once confirmed, without re-adding the handicap", () => {
    // score_poeng already includes the hcp the confirm step folded in
    const r = calcRowScores(match({ confirmed: true }), side(26), side(18), true, true, 5, 0);
    expect(r.s1).toBe(26);
    expect(r.s2).toBe(18);
  });

  it("shows 21–0 for an unconfirmed walkover, whatever is stored", () => {
    const r = calcRowScores(match({ walkover: true }), side(7), side(3), false, false, 0, 0);
    expect(r.s1).toBe(21);
    expect(r.s2).toBe(0);
    expect(r.hasPoints).toBe(true);
  });

  it("shows the stored totals for a confirmed walkover", () => {
    const r = calcRowScores(
      match({ confirmed: true, walkover: true }),
      side(21),
      side(0),
      false,
      false,
      0,
      0,
    );
    expect(r.s1).toBe(21);
    expect(r.s2).toBe(0);
  });

  it("counts a match as scoreless only when nothing at all has happened", () => {
    expect(calcRowScores(match(), side(0), side(0), false, false, 0, 0).hasPoints).toBe(false);
    expect(calcRowScores(match(), side(2), side(0), false, false, 0, 0).hasPoints).toBe(true);
    expect(
      calcRowScores(match({ confirmed: true }), side(0), side(0), false, false, 0, 0).hasPoints,
    ).toBe(true);
  });
});
