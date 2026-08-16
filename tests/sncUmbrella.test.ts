import { mergeSncUmbrellas, collectSncParentIds } from "@/utils/sncUmbrella";

function stevne(id: number, dato: string, extra: Record<string, unknown> = {}) {
  return { id, dato, erfullfort: false, snc_hovudstevne_id: null, ...extra };
}

describe("collectSncParentIds", () => {
  it("collects each umbrella once", () => {
    const ongoing = [
      stevne(1, "2026-05-01", { snc_hovudstevne_id: 90 }),
      stevne(2, "2026-05-01", { snc_hovudstevne_id: 90 }),
      stevne(3, "2026-05-01"),
    ];
    expect(collectSncParentIds(ongoing)).toEqual([90]);
  });
});

describe("mergeSncUmbrellas", () => {
  it("replaces the local stevner with their umbrella, sorted by date", () => {
    const ongoing = [stevne(1, "2026-05-02", { snc_hovudstevne_id: 90 }), stevne(2, "2026-05-03")];
    const parents = [stevne(90, "2026-05-01")];

    expect(mergeSncUmbrellas(ongoing, parents).map((s) => s.id)).toEqual([90, 2]);
  });

  it("leaves out an umbrella that is already finished", () => {
    const ongoing = [stevne(1, "2026-05-02", { snc_hovudstevne_id: 90 })];
    const parents = [stevne(90, "2026-05-01", { erfullfort: true })];

    expect(mergeSncUmbrellas(ongoing, parents)).toEqual([]);
  });

  it("shows an umbrella with its own live phase only once", () => {
    const ongoing = [stevne(90, "2026-05-01"), stevne(1, "2026-05-02", { snc_hovudstevne_id: 90 })];
    const parents = [stevne(90, "2026-05-01")];

    expect(mergeSncUmbrellas(ongoing, parents).map((s) => s.id)).toEqual([90]);
  });
});
