import { parseLocalDate } from "./parseLocalDate";

// ── Date formatting ───────────────────────────────────────────────────────────

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

// ── Number formatting ─────────────────────────────────────────────────────────

const percentFmt = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPercent(p: number | null | undefined): string {
  if (p == null) return "–";
  return percentFmt.format(p) + " %";
}

// ── Excel export ──────────────────────────────────────────────────────────────

export async function downloadExcel(
  rows: Record<string, unknown>[],
  fileName: string,
  sheetName = "Data",
): Promise<void> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  XLSX.writeFile(book, fileName);
}

// ── Year dropdown ─────────────────────────────────────────────────────────────

export function yearOptions(selected: number, from: number, to = new Date().getFullYear()): string {
  let html = "";
  for (let year = to; year >= from; year--) {
    html += `<option value="${year}"${year === selected ? " selected" : ""}>${year}</option>`;
  }
  return html;
}
