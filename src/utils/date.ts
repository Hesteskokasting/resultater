// ── Dates ─────────────────────────────────────────────────────────────────────
//
// Reading and displaying the ISO date/time strings the dato and tid columns hold.
// Every formatter is nb-NO and returns "" for a missing value, so callers can
// drop the result straight into markup.
//

// Bare date strings (YYYY-MM-DD) are parsed as UTC midnight by JS, so a viewer
// west of UTC is shown the day before. Parsing at local noon keeps the day the
// string names, whatever the offset.
function parseLocalDate(datoStr: string): Date {
  return datoStr.length === 10 ? new Date(datoStr + "T12:00:00") : new Date(datoStr);
}

/**
 * Today as YYYY-MM-DD in the user's own timezone. toISOString() would answer in
 * UTC, which names yesterday between midnight and 01/02 Norwegian time — the
 * dato columns this is compared against are local dates.
 */
export function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** "2026-08-02" → 2026. Null/garbage dates yield null so callers can skip them. */
export function yearOf(dato: string | null | undefined): number | null {
  if (!dato) return null;
  const year = Number(dato.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

/** 1-based month (1–12) from an ISO date, or null when unparseable. */
export function monthOf(dato: string | null | undefined): number | null {
  if (!dato || dato.length < 7) return null;
  const month = Number(dato.slice(5, 7));
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

const dateFmtShort = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const dateFmtNumeric = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});
const dateFmtLong = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const dateFmtWeekday = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const dateFmtWeekdayShort = new Intl.DateTimeFormat("nb-NO", { weekday: "short" });

export function formatDate(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return dateFmtShort.format(parseLocalDate(datoStr));
}

export function formatDateNumeric(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return dateFmtNumeric.format(parseLocalDate(datoStr));
}

export function formatDateLong(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return dateFmtLong.format(parseLocalDate(datoStr));
}

/** Weekday + day + month, no year — e.g. "lørdag 1. august". Pair with `formatDateLong` for a full-date title/tooltip. */
export function formatDateWeekday(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return dateFmtWeekday.format(parseLocalDate(datoStr));
}

/** 3-letter uppercase weekday abbreviation, e.g. "TIR" — for a stacked date block. */
export function formatWeekdayShort(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return dateFmtWeekdayShort.format(parseLocalDate(datoStr)).replace(".", "").toUpperCase();
}

/** Bare day-of-month number, e.g. "28" — for a stacked date block. */
export function formatDayOfMonth(datoStr: string | null | undefined): string {
  if (!datoStr) return "";
  return String(parseLocalDate(datoStr).getDate());
}

export function formatTime(tidStr: string | null | undefined): string {
  if (!tidStr) return "";
  return tidStr.slice(0, 5);
}
