import { describe, it, expect } from "vite-plus/test";
import { visibleTabs } from "@/pages/stevne";

const keys = (...args: Parameters<typeof visibleTabs>) => visibleTabs(...args).map((t) => t.key);

describe("visibleTabs", () => {
  it("hides the fase tabs when the stevne has no matches", () => {
    expect(keys(true, true, false, false, false)).toEqual(["info", "deltakere", "innstillinger"]);
  });

  it("shows them once matches exist", () => {
    expect(keys(false, true, false, false, true)).toEqual([
      "info",
      "innledende",
      "avsluttende",
      "stats",
    ]);
  });

  it("still hides avsluttende without a final method", () => {
    expect(keys(false, false, false, false, true)).toEqual(["info", "innledende", "stats"]);
  });
});
