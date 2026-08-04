import { sncUmbrellaActionLink } from "@/utils/sncRegistration";

describe("sncUmbrellaActionLink", () => {
  it("invites registration when the thrower is in no local stevne under the umbrella", () => {
    expect(sncUmbrellaActionLink(100, false)).toEqual({
      href: "#/stevne/100/info",
      label: "Meld på",
    });
  });

  it("reports status instead of inviting when the thrower already joined a local stevne", () => {
    expect(sncUmbrellaActionLink(100, true)).toEqual({
      href: "#/stevne/100/info",
      label: "Påmeldt",
      variant: "secondary",
    });
  });

  it("keeps the umbrella reachable either way, so the thrower can still switch or withdraw", () => {
    expect(sncUmbrellaActionLink(42, true).href).toBe(sncUmbrellaActionLink(42, false).href);
  });
});
