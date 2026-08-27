import { describe, it, expect } from "vite-plus/test";
import {
  formatDate,
  formatDateCompact,
  formatDateLong,
  formatDateNumeric,
  formatDateWeekday,
  formatDayOfMonth,
  formatTime,
  formatWeekdayShort,
  monthOf,
  todayIso,
  yearOf,
} from "@/utils/date";

describe("todayIso", () => {
  it("answers in the local timezone, not UTC", () => {
    const now = new Date();
    const local = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    expect(todayIso()).toBe(local);
  });
});

describe("yearOf", () => {
  it("reads the year off an ISO date", () => {
    expect(yearOf("2026-08-02")).toBe(2026);
  });

  it("returns null for missing or unparseable values", () => {
    expect(yearOf(null)).toBeNull();
    expect(yearOf(undefined)).toBeNull();
    expect(yearOf("")).toBeNull();
    expect(yearOf("abcd-01-01")).toBeNull();
  });

  it("rejects years before 1900 as garbage", () => {
    expect(yearOf("1899-01-01")).toBeNull();
    expect(yearOf("0000-01-01")).toBeNull();
  });
});

describe("monthOf", () => {
  it("reads a 1-based month", () => {
    expect(monthOf("2026-08-02")).toBe(8);
    expect(monthOf("2026-01-02")).toBe(1);
    expect(monthOf("2026-12-02")).toBe(12);
  });

  it("returns null for a string too short to hold a month", () => {
    expect(monthOf("2026-8")).toBeNull();
    expect(monthOf(null)).toBeNull();
  });

  it("returns null for a month outside 1–12", () => {
    expect(monthOf("2026-13-01")).toBeNull();
    expect(monthOf("2026-00-01")).toBeNull();
  });
});

describe("date formatters", () => {
  // The formatters parse a bare date at local noon, so no timezone can push the
  // rendered day onto the one before or after.
  it("keeps the calendar day the string names", () => {
    expect(formatDate("2026-01-01")).toBe("01.01.2026");
    expect(formatDayOfMonth("2026-01-01")).toBe("1");
  });

  it("renders each nb-NO variant", () => {
    expect(formatDateNumeric("2026-01-01")).toBe("1.1.2026");
    expect(formatDateLong("2026-01-01")).toBe("torsdag 1. januar 2026");
    expect(formatDateWeekday("2026-01-01")).toBe("torsdag 1. januar");
    expect(formatWeekdayShort("2026-01-01")).toBe("TOR");
    expect(formatDateCompact("2026-01-01")).toBe("1.jan.");
    expect(formatDateCompact("2026-08-12")).toBe("12.aug.");
  });

  it("accepts a full timestamp as well as a bare date", () => {
    expect(formatDate("2026-01-01T09:30:00")).toBe("01.01.2026");
  });

  it("returns an empty string for a missing date", () => {
    for (const format of [
      formatDate,
      formatDateCompact,
      formatDateNumeric,
      formatDateLong,
      formatDateWeekday,
      formatWeekdayShort,
      formatDayOfMonth,
    ]) {
      expect(format(null)).toBe("");
      expect(format(undefined)).toBe("");
      expect(format("")).toBe("");
    }
  });
});

describe("formatTime", () => {
  it("cuts seconds off a HH:MM:SS time", () => {
    expect(formatTime("11:00:00")).toBe("11:00");
  });

  it("leaves a HH:MM time alone", () => {
    expect(formatTime("11:00")).toBe("11:00");
  });

  it("returns an empty string for a missing time", () => {
    expect(formatTime(null)).toBe("");
    expect(formatTime(undefined)).toBe("");
    expect(formatTime("")).toBe("");
  });
});
