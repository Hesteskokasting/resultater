import { describe, it, expect } from "vite-plus/test";
import { attendanceOpensAt, formatClock, isAttendanceOpen } from "@/utils/oppmote";

describe("attendanceOpensAt", () => {
  it("opens two hours before a stevne with a start time", () => {
    const opens = attendanceOpensAt("2026-08-07", "11:00:00");
    expect(formatClock(opens)).toBe("09:00");
    expect(opens?.getFullYear()).toBe(2026);
  });

  it("accepts a HH:MM time as well as HH:MM:SS", () => {
    expect(formatClock(attendanceOpensAt("2026-08-07", "11:00"))).toBe("09:00");
  });

  it("crosses midnight backwards when the stevne starts early", () => {
    const opens = attendanceOpensAt("2026-08-07", "01:00:00");
    expect(formatClock(opens)).toBe("23:00");
    expect(opens?.getDate()).toBe(6);
  });

  it("falls back to midnight on the day itself when no time is set", () => {
    const opens = attendanceOpensAt("2026-08-07", null);
    expect(formatClock(opens)).toBe("00:00");
    expect(opens?.getDate()).toBe(7);
  });

  it("returns null for a missing date", () => {
    expect(attendanceOpensAt("", "11:00:00")).toBeNull();
  });
});

describe("isAttendanceOpen", () => {
  const opens = attendanceOpensAt("2026-08-07", "11:00:00");

  it("is shut before the window opens", () => {
    expect(isAttendanceOpen(opens, new Date("2026-08-07T08:59:00"))).toBe(false);
  });

  it("is open from the opening moment onwards", () => {
    expect(isAttendanceOpen(opens, new Date("2026-08-07T09:00:00"))).toBe(true);
    expect(isAttendanceOpen(opens, new Date("2026-08-07T14:00:00"))).toBe(true);
  });

  it("is shut when the opening moment is unknown", () => {
    expect(isAttendanceOpen(null, new Date("2026-08-07T09:00:00"))).toBe(false);
  });
});

describe("formatClock", () => {
  it("pads to a 24-hour HH:MM", () => {
    expect(formatClock(new Date("2026-08-07T09:41:00"))).toBe("09:41");
  });

  it("accepts a timestamp string", () => {
    expect(formatClock("2026-08-07T09:41:00")).toBe("09:41");
  });

  it("renders nothing for a missing or unparseable value", () => {
    expect(formatClock(null)).toBe("");
    expect(formatClock("not a date")).toBe("");
  });
});
