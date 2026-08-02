import { describe, expect, it } from "vite-plus/test";
import { calcXkastLayout } from "@/utils/calcXkastLayout";

describe("calcXkastLayout", () => {
  it("uses one pulje of pairs when lanes are unlimited (odd player alone)", () => {
    expect(calcXkastLayout(8, null)).toEqual([[2, 2, 2, 2]]);
    expect(calcXkastLayout(7, null)).toEqual([[2, 2, 2, 1]]);
    expect(calcXkastLayout(0, null)).toEqual([]);
  });

  it("packs everyone onto the available courts without puljer when they fit", () => {
    expect(calcXkastLayout(6, 2)).toEqual([[3, 3]]);
    expect(calcXkastLayout(8, 4)).toEqual([[2, 2, 2, 2]]);
    expect(calcXkastLayout(10, 4)).toEqual([[2, 2, 3, 3]]);
    expect(calcXkastLayout(12, 4)).toEqual([[3, 3, 3, 3]]);
  });

  it("keeps pairs with the odd remainder as a 3 while pairs fit the lanes", () => {
    expect(calcXkastLayout(7, 4)).toEqual([[2, 2, 3]]);
    expect(calcXkastLayout(5, 4)).toEqual([[2, 3]]);
  });

  it("splits into puljer only when players exceed lanes × 3", () => {
    expect(calcXkastLayout(24, 4)).toEqual([
      [3, 3, 3, 3],
      [3, 3, 3, 3],
    ]);
    expect(calcXkastLayout(13, 4)).toEqual([
      [2, 2, 2],
      [2, 2, 3],
    ]);
  });

  it("never exceeds the lanes per pulje or 3 players per court, and sums correctly", () => {
    for (let count = 1; count <= 60; count++) {
      for (let lanes = 1; lanes <= 8; lanes++) {
        const layout = calcXkastLayout(count, lanes);
        const total = layout.flat().reduce((a, b) => a + b, 0);
        expect(total).toBe(count);
        for (const courts of layout) {
          expect(courts.length).toBeLessThanOrEqual(lanes);
          expect(courts.every((size) => size >= 1 && size <= 3)).toBe(true);
        }
      }
    }
  });

  it("rejects an invalid lane count", () => {
    expect(() => calcXkastLayout(10, 0)).toThrow();
    expect(() => calcXkastLayout(10, 2.5)).toThrow();
  });
});
