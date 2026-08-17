import { createChartCard, renderShareCard } from "@/admin/_adminUi";

describe("share bar palette", () => {
  it("gives a segment and its legend swatch the same colour past three entries", () => {
    const card = createChartCard("Roller");
    renderShareCard(card, [
      { label: "a", count: 4 },
      { label: "b", count: 3 },
      { label: "c", count: 2 },
      { label: "d", count: 1 },
      { label: "e", count: 1 },
    ]);

    const segs = [...card.wrap.querySelectorAll<HTMLElement>(".admin-sharebar__seg")];
    const swatches = [...card.legend.querySelectorAll<HTMLElement>(".admin-legend__swatch")];

    expect(segs.map((s) => s.style.background)).toEqual(swatches.map((s) => s.style.background));
    // Cycles rather than clamping, so no two neighbours share a colour.
    expect(segs.map((s) => s.style.background)).toEqual([
      "var(--chart-s1)",
      "var(--chart-s2)",
      "var(--chart-s3)",
      "var(--chart-s1)",
      "var(--chart-s2)",
    ]);
  });

  it("keeps them aligned when a zero entry drops out of the bar", () => {
    const card = createChartCard("Status");
    renderShareCard(card, [
      { label: "a", count: 5 },
      { label: "b", count: 0 },
      { label: "c", count: 3 },
    ]);

    const segs = [...card.wrap.querySelectorAll<HTMLElement>(".admin-sharebar__seg")];
    const swatches = [...card.legend.querySelectorAll<HTMLElement>(".admin-legend__swatch")];

    expect(segs).toHaveLength(2);
    expect(swatches).toHaveLength(3);
    // The surviving segments match slots 1 and 3 — the skipped entry keeps slot 2.
    expect(segs.map((s) => s.style.background)).toEqual([
      swatches[0]!.style.background,
      swatches[2]!.style.background,
    ]);
  });
});
