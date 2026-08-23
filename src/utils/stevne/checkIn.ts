// The two-hour window is enforced by a trigger on pamelding; these helpers only
// decide what the UI shows, so a skewed device clock costs a rejected write and
// a toast, never a wrongly accepted confirmation.

const WINDOW_HOURS = 2;

/**
 * When self-service attendance opens: two hours before start. A stevne with no
 * `tid` has no known start, so the window opens at midnight on the day itself —
 * the same fallback the trigger uses.
 */
export function attendanceOpensAt(dato: string, tid: string | null | undefined): Date | null {
  if (!dato) return null;
  if (!tid) return new Date(`${dato}T00:00:00`);
  const hhmmss = tid.length === 5 ? `${tid}:00` : tid.slice(0, 8);
  const start = new Date(`${dato}T${hhmmss}`);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() - WINDOW_HOURS * 60 * 60 * 1000);
}

export function isAttendanceOpen(opensAt: Date | null, now: Date = new Date()): boolean {
  return opensAt !== null && now.getTime() >= opensAt.getTime();
}

/** setTimeout overflows past ~24 days and fires at once; nothing that far out needs a live button. */
const MAX_WAIT_MS = 24 * 60 * 60 * 1000;

/**
 * Milliseconds to wait before the locked button should unlock itself, or null
 * when arming a timer is pointless: the window is already open, the opening
 * moment is unknown, or the stevne is more than a day away.
 */
export function attendanceOpenDelay(opensAt: Date | null, now: Date = new Date()): number | null {
  if (!opensAt) return null;
  const wait = opensAt.getTime() - now.getTime();
  if (wait <= 0 || wait > MAX_WAIT_MS) return null;
  return wait;
}

/** "09:41" in the viewer's locale-independent 24h form, matching the rest of the app. */
export function formatClock(value: Date | string | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
