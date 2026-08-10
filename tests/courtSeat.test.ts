import { describe, expect, it } from "vite-plus/test";
import { isSeatUnscored, canSwapSeat } from "@/utils/courtSeat";

const seat = (
  totalsum_manuelt: boolean,
  omganger: number,
): { totalsum_manuelt: boolean; omgangar: unknown[] } => ({
  totalsum_manuelt,
  omgangar: Array.from({ length: omganger }, (_, i) => ({ omgang: i + 1 })),
});

describe("isSeatUnscored", () => {
  it("is true only for a seat with no omganger and no manual total", () => {
    expect(isSeatUnscored(seat(false, 0))).toBe(true);
  });

  it("is false once omganger are recorded", () => {
    expect(isSeatUnscored(seat(false, 1))).toBe(false);
    expect(isSeatUnscored(seat(false, 10))).toBe(false);
  });

  // The regression: a manual total deletes every omgang row, so an
  // omganger-only check reads the seat as unscored.
  it("is false for a manual total even though it has no omganger", () => {
    expect(isSeatUnscored(seat(true, 0))).toBe(false);
  });

  it("is false when a manual total somehow coexists with omganger", () => {
    expect(isSeatUnscored(seat(true, 3))).toBe(false);
  });
});

describe("canSwapSeat", () => {
  it("allows an unscored seat on an open court", () => {
    expect(canSwapSeat({ er_bekreftet: false }, seat(false, 0))).toBe(true);
  });

  it("refuses a confirmed court regardless of the seat", () => {
    expect(canSwapSeat({ er_bekreftet: true }, seat(false, 0))).toBe(false);
    expect(canSwapSeat({ er_bekreftet: true }, seat(true, 0))).toBe(false);
  });

  it("refuses a scored seat on an open court, in either scoring form", () => {
    expect(canSwapSeat({ er_bekreftet: false }, seat(false, 1))).toBe(false);
    expect(canSwapSeat({ er_bekreftet: false }, seat(true, 0))).toBe(false);
  });
});
