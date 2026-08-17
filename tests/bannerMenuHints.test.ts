/**
 * The banner menu used to drop an action it couldn't run yet, leaving the
 * organizer with no entry and no reason. Now the entry stays, disabled, and the
 * hint is the only place the remaining precondition is stated — so every
 * disabled entry must have one.
 */
const mocks = vi.hoisted(() => {
  // stevneService builds query objects at module load purely for their types
  const chain: unknown = new Proxy({}, { get: () => () => chain });
  return { from: () => chain };
});

vi.mock("@/supabase", () => ({ supabase: { from: mocks.from } }));

import { finalMenuItems, initialMenuItems } from "@/pages/stevne/faseView";
import type { BannerMenuItem } from "@/components/BannerMenu";

const openStevne = { erfullfort: false, avsluttendekastemetodeid: null };

const initialState = {
  erSwiss: true,
  canGenerateRound: true,
  canComplete: true,
};

const byId = (items: BannerMenuItem[], id: string) => items.find((i) => i.id === id);

describe("initialMenuItems", () => {
  it("keeps Generer neste runde listed with a reason once every round exists", () => {
    const item = byId(
      initialMenuItems(openStevne, { ...initialState, canGenerateRound: false }),
      "neste-runde-btn",
    )!;
    expect(item.disabled).toBe(true);
    expect(item.hint).toMatch(/genererte/);
  });

  it("leaves Generer neste runde enabled and unexplained while rounds remain", () => {
    const item = byId(initialMenuItems(openStevne, initialState), "neste-runde-btn")!;
    expect(item.disabled).toBe(false);
    expect(item.hint).toBeUndefined();
  });

  it("omits Generer neste runde for a metode that has no next round to generate", () => {
    expect(
      byId(initialMenuItems(openStevne, { ...initialState, erSwiss: false }), "neste-runde-btn"),
    ).toBeUndefined();
  });

  it("says the turnering is already done rather than just greying Fullfør out", () => {
    const item = byId(
      initialMenuItems({ ...openStevne, erfullfort: true }, initialState),
      "complete-tournament-btn",
    )!;
    expect(item.disabled).toBe(true);
    expect(item.hint).toMatch(/fullført/);
  });

  it("drops Fullfør turnering entirely when an avsluttande fase follows", () => {
    const items = initialMenuItems({ ...openStevne, avsluttendekastemetodeid: 3 }, initialState);
    expect(byId(items, "complete-tournament-btn")).toBeUndefined();
  });
});

describe("finalMenuItems", () => {
  const beforeFinal = { erfullfort: false, stevne_fase: "innledende" };
  const finalState = {
    allMatchesConfirmed: true,
    hasFinalMatches: false,
    hasGroupAssignment: false,
  };

  it("lists Start avsluttande fase with the missing precondition instead of hiding it", () => {
    const item = byId(
      finalMenuItems(beforeFinal, { ...finalState, allMatchesConfirmed: false }),
      "start-final-btn",
    )!;
    expect(item.disabled).toBe(true);
    expect(item.hint).toMatch(/bekrefta/);
  });

  it("enables Start avsluttande fase once every innleiande kamp is confirmed", () => {
    const item = byId(finalMenuItems(beforeFinal, finalState), "start-final-btn")!;
    expect(item.disabled).toBe(false);
  });

  it("still gates Endre gruppefordeling on confirmed kampar", () => {
    const items = finalMenuItems(beforeFinal, {
      ...finalState,
      allMatchesConfirmed: false,
      hasPreconfiguredFormat: true,
    });
    expect(byId(items, "edit-group-assignment-btn")).toBeUndefined();
  });

  it("explains Fullfør turnering while kampar are unconfirmed", () => {
    const item = byId(
      finalMenuItems(beforeFinal, { ...finalState, allMatchesConfirmed: false }),
      "complete-tournament-btn",
    )!;
    expect(item.disabled).toBe(true);
    expect(item.hint).toMatch(/bekrefta/);
  });

  it("gives every disabled entry a hint, in every state it can render", () => {
    for (const erfullfort of [false, true]) {
      for (const allMatchesConfirmed of [false, true]) {
        for (const stevne_fase of ["innledende", "avsluttende"]) {
          const items = finalMenuItems(
            { erfullfort, stevne_fase },
            { ...finalState, allMatchesConfirmed, hasGroupAssignment: true },
          );
          for (const item of items.filter((i) => i.disabled)) {
            expect(item.hint, `${item.id} in ${stevne_fase}/${String(erfullfort)}`).toBeTruthy();
          }
        }
      }
    }
  });
});
