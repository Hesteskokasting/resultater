/**
 * The digit transitions the three score pads share (utils/padInput.ts). The
 * caps used to live in each pad and were only reachable through the DOM.
 */

import { describe, expect, it } from "vite-plus/test";
import { appendDigit, digitValue } from "@/components/numberpad/padInput";

describe("appendDigit", () => {
  it("appends and replaces a lone leading zero", () => {
    expect(appendDigit("", "4", 999)).toBe("4");
    expect(appendDigit("1", "2", 999)).toBe("12");
    expect(appendDigit("0", "7", 999)).toBe("7");
  });

  it("keeps a zero that follows another digit", () => {
    expect(appendDigit("1", "0", 999)).toBe("10");
  });

  it("refuses a digit that would pass the cap", () => {
    expect(appendDigit("99", "9", 999)).toBe("999");
    expect(appendDigit("999", "9", 999)).toBe("999");
    expect(appendDigit("2", "1", 20)).toBe("2");
  });
});

describe("digitValue", () => {
  it("reads an untouched pad as 0", () => {
    expect(digitValue("")).toBe(0);
    expect(digitValue("0")).toBe(0);
    expect(digitValue("042")).toBe(42);
  });
});
