// ── Excel export ──────────────────────────────────────────────────────────────
//
// xlsx is imported inside each function, not at module scope, so the library
// only loads when an export actually runs.
//

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

/** Rows of cells rather than objects, for sheets that mix info blocks and tables. */
export async function downloadExcelRows(
  rows: (string | number | null)[][],
  fileName: string,
  sheetName = "Data",
  merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [],
): Promise<void> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  if (merges.length) sheet["!merges"] = merges;
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  XLSX.writeFile(book, fileName);
}
