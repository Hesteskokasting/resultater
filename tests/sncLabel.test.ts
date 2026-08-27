import { sncLocalLabel } from "@/utils/stevne/sncLabel";

describe("sncLocalLabel", () => {
  it("joins club and place when they differ", () => {
    expect(
      sncLocalLabel({ navn: "SNC runde 1 – Førde", sted: "Halbrend", klubb: { navn: "Førde" } }),
    ).toBe("Førde · Halbrend");
  });

  it("collapses the usual case where club and place are the same word", () => {
    expect(
      sncLocalLabel({ navn: "SNC runde 1 – Førde", sted: "Førde", klubb: { navn: "Førde" } }),
    ).toBe("Førde");
  });

  it("uses whichever of the two is present", () => {
    expect(sncLocalLabel({ navn: "Lokalt", sted: "Bergen", klubb: null })).toBe("Bergen");
    expect(sncLocalLabel({ navn: "Lokalt", sted: null, klubb: { navn: "Bergen" } })).toBe("Bergen");
  });

  it("falls back to the stevne's own name when neither is usable", () => {
    expect(sncLocalLabel({ navn: "SNC runde 1", sted: "   ", klubb: { navn: null } })).toBe(
      "SNC runde 1",
    );
    expect(sncLocalLabel({ navn: "SNC runde 1" })).toBe("SNC runde 1");
  });
});
