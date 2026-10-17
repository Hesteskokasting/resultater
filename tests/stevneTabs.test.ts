import { describe, it, expect } from "vite-plus/test";
import { visibleTabs } from "@/pages/stevne";

const keys = (...args: Parameters<typeof visibleTabs>) => visibleTabs(...args).map((t) => t.key);

describe("visibleTabs", () => {
  it("hides the fase tabs when the stevne has no matches", () => {
    expect(keys(true, true, false, false, false, false)).toEqual([
      "info",
      "deltakere",
      "innstillinger",
    ]);
  });

  it("shows them once matches exist", () => {
    expect(keys(false, true, false, false, true, true)).toEqual([
      "info",
      "innledende",
      "avsluttende",
      "stats",
    ]);
  });

  it("hides stats until an omgang is registered", () => {
    expect(keys(false, true, false, false, true, false)).toEqual([
      "info",
      "innledende",
      "avsluttende",
    ]);
  });

  it("still hides avsluttende without a final method", () => {
    expect(keys(false, false, false, false, true, true)).toEqual(["info", "innledende", "stats"]);
  });

  it("puts innstillinger last", () => {
    expect(keys(true, true, true, false, true, true).pop()).toBe("innstillinger");
  });
});
