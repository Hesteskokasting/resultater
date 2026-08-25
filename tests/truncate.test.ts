import { describe, it, expect } from "vite-plus/test";
import { truncate } from "@/utils/truncate";

describe("truncate", () => {
  it("leaves a string that fits untouched", () => {
    expect(truncate("SNC 1", 15)).toBe("SNC 1");
    expect(truncate("123456789012345", 15)).toBe("123456789012345");
  });

  it("cuts and marks anything longer", () => {
    expect(truncate("SNC 4 - Nordhordland", 15)).toBe("SNC 4 - Nordhor…");
  });

  it("drops the space a cut lands on", () => {
    expect(truncate("NH cupen runde 10", 15)).toBe("NH cupen runde…");
  });
});
