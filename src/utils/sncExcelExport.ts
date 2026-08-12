// Builds the sheet for the consolidated SNC result as rows of cells: the round's
// own facts, the merged list, then every local stevne as its own block below.
// Pure — the page hands it the rows it already loaded, and xlsx stays out of the
// bundle until someone actually clicks the export.

import { formatDateNumeric, formatTime } from "@/utils/shared";

export type Cell = string | number | null;

/** A merged cell range, in xlsx's own row/column form. */
export interface SheetMerge {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

export interface SncExportSheet {
  rows: Cell[][];
  merges: SheetMerge[];
}

interface NamedRow {
  navn?: string | null;
}

/** The round itself — what the info hero shows, plus the method details. */
export interface SncExportParent {
  navn: string;
  dato?: string | null;
  tid?: string | null;
  sted?: string | null;
  stevnetype?: NamedRow | null;
  kategori?: NamedRow | null;
  klubb?: NamedRow | null;
  kontakt?: { fornavn?: string | null; etternavn?: string | null } | null;
  kastemetodeInnl?: (NamedRow & { antall_omganger?: number | null }) | null;
  kastemetodeAvsl?: NamedRow | null;
}

export interface SncExportLocal {
  id: number;
  navn: string;
  dato?: string | null;
  tid?: string | null;
  sted?: string | null;
  klubb?: NamedRow | null;
  kontakt?: { fornavn?: string | null; etternavn?: string | null } | null;
}

export interface SncExportResult {
  snc_plassering: number | null;
  plassering: number | null;
  nc_poeng: number | null;
  poeng_xkast: number | null;
  poeng_kongelag: number | null;
  antall_ring_xkast: number | null;
  antall_ring_kongelag: number | null;
  kaster: { fornavn?: string | null; etternavn?: string | null } | null;
  klubb?: NamedRow | null;
  stevne: { id: number; navn: string; sted?: string | null };
}

export interface SncExportOptions {
  showXkast: boolean;
  showKongelag: boolean;
  /** Innledende → total factor, null when nothing is carried over. */
  carryFactor: number | null;
  carryPercent: number | null;
  innlLabel: string;
  avslLabel: string;
}

const EMPTY: Cell[] = [];

function fullName(person: { fornavn?: string | null; etternavn?: string | null } | null): string {
  if (!person) return "";
  return `${person.fornavn ?? ""} ${person.etternavn ?? ""}`.trim();
}

/**
 * Facts as a labels row over a values row, so a dozen of them cost two rows
 * instead of a dozen — the same shape the info tiles have on the page.
 */
function factBlock(facts: [label: string, value: Cell][]): Cell[][] {
  return [facts.map(([label]) => label), facts.map(([, value]) => value ?? "")];
}

export function sncTotal(row: SncExportResult, opts: SncExportOptions): number {
  if (opts.carryFactor != null) {
    return (row.poeng_kongelag ?? 0) + Math.round((row.poeng_xkast ?? 0) * opts.carryFactor);
  }
  return (opts.showKongelag ? row.poeng_kongelag : row.poeng_xkast) ?? 0;
}

/**
 * The round's facts, in the order both the sheet and the printed page show them —
 * one list so the two cannot drift apart.
 */
export function sncInfoFacts(
  parent: SncExportParent,
  opts: SncExportOptions,
  localCount: number,
  deltakarar: number,
): [label: string, value: Cell][] {
  const facts: [string, Cell][] = [
    ["Arrangør", parent.klubb?.navn ?? ""],
    ["Dato", formatDateNumeric(parent.dato)],
  ];
  // Tid and stad belong to the local stevner, not to the umbrella they sit under.
  if (localCount === 0) {
    facts.push(["Tid", formatTime(parent.tid)], ["Stad", parent.sted ?? ""]);
  }
  facts.push(
    ["Type / kategori", [parent.stevnetype?.navn, parent.kategori?.navn].filter(Boolean).join(" ")],
    ["Kontaktperson", fullName(parent.kontakt ?? null)],
  );
  if (opts.showXkast) facts.push(["Innleiande", opts.innlLabel]);
  if (opts.showKongelag) facts.push(["Avsluttande", opts.avslLabel]);
  if (opts.carryPercent != null) facts.push(["Overføring", `${opts.carryPercent} %`]);
  facts.push(["Lokale stevne", localCount], ["Deltakarar", deltakarar]);
  return facts;
}

/** A local stevne's own facts — where and when it was thrown, and by how many. */
export function sncLocalFacts(
  local: SncExportLocal,
  deltakarar: number,
): [label: string, value: Cell][] {
  return [
    ["Arrangør", local.klubb?.navn ?? ""],
    ["Dato", formatDateNumeric(local.dato)],
    ["Tid", formatTime(local.tid)],
    ["Stad", local.sted ?? ""],
    ["Kontaktperson", fullName(local.kontakt ?? null)],
    ["Deltakarar", deltakarar],
  ];
}

function infoRows(
  parent: SncExportParent,
  locals: SncExportLocal[],
  results: SncExportResult[],
  opts: SncExportOptions,
): Cell[][] {
  return [["STEVNEINFO"], ...factBlock(sncInfoFacts(parent, opts, locals.length, results.length))];
}

/** One method's block of columns: the name goes above, the plain labels below. */
function scoreGroups(opts: SncExportOptions): { label: string; labels: string[] }[] {
  const groups: { label: string; labels: string[] }[] = [];
  if (opts.showXkast) {
    const labels = ["Poeng", "Ringar"];
    if (opts.carryFactor != null) labels.push("Overført");
    groups.push({ label: opts.innlLabel, labels });
  }
  if (opts.showKongelag) {
    groups.push({ label: opts.avslLabel, labels: ["Poeng", "Ringar"] });
  }
  return groups;
}

/**
 * Two header rows, mirroring the table on the page: the method names merged over
 * their own columns, then Poeng / Ringar under each. `firstRow` is where the
 * group row lands in the sheet, so the merge ranges point at the right cells.
 */
function headerRows(
  leading: string[],
  trailing: string[],
  opts: SncExportOptions,
  firstRow: number,
): { rows: Cell[][]; merges: SheetMerge[] } {
  const groups = scoreGroups(opts);
  const groupRow: Cell[] = leading.map(() => "");
  const merges: SheetMerge[] = [];
  let col = leading.length;

  for (const group of groups) {
    groupRow.push(group.label, ...group.labels.slice(1).map(() => ""));
    if (group.labels.length > 1) {
      merges.push({
        s: { r: firstRow, c: col },
        e: { r: firstRow, c: col + group.labels.length - 1 },
      });
    }
    col += group.labels.length;
  }

  const labelRow: Cell[] = [
    ...leading,
    ...groups.flatMap((g) => g.labels),
    "Total",
    "NC",
    ...trailing,
  ];
  return {
    rows: [[...groupRow, ...labelRow.slice(groupRow.length).map(() => "")], labelRow],
    merges,
  };
}

function scoreCells(row: SncExportResult, opts: SncExportOptions): Cell[] {
  const cells: Cell[] = [];
  if (opts.showXkast) cells.push(row.poeng_xkast, row.antall_ring_xkast);
  if (opts.carryFactor != null) cells.push(Math.round((row.poeng_xkast ?? 0) * opts.carryFactor));
  if (opts.showKongelag) cells.push(row.poeng_kongelag, row.antall_ring_kongelag);
  return [...cells, sncTotal(row, opts), row.nc_poeng];
}

function mainTable(
  results: SncExportResult[],
  opts: SncExportOptions,
  firstRow: number,
): { rows: Cell[][]; merges: SheetMerge[] } {
  // +1: the section title sits above the header rows.
  const header = headerRows(["Pl", "Namn", "Klubb"], [], opts, firstRow + 1);
  const rows: Cell[][] = [["SAMLA RESULTAT"], ...header.rows];
  for (const row of results) {
    rows.push([
      row.snc_plassering,
      fullName(row.kaster),
      row.klubb?.navn ?? "",
      ...scoreCells(row, opts),
    ]);
  }
  return { rows, merges: header.merges };
}

function localBlock(
  local: SncExportLocal,
  results: SncExportResult[],
  opts: SncExportOptions,
  firstRow: number,
): { rows: Cell[][]; merges: SheetMerge[] } {
  const ordered = results;
  const facts = factBlock(sncLocalFacts(local, ordered.length));
  // Name row + the fact block come before the header rows.
  const header = headerRows(["Pl", "Namn", "Klubb"], ["SNC pl"], opts, firstRow + 1 + facts.length);
  const rows: Cell[][] = [[local.navn], ...facts, ...header.rows];
  for (const row of ordered) {
    rows.push([
      row.plassering,
      fullName(row.kaster),
      row.klubb?.navn ?? "",
      ...scoreCells(row, opts),
      row.snc_plassering,
    ]);
  }
  return { rows, merges: header.merges };
}

/**
 * Locals the export and the printed page show: the ones passed in, plus any
 * stevne a result points at that the list missed, so no row is silently dropped.
 * Locals without results are left out. Rows come back in local placement order.
 */
export function localsWithResults<T extends SncExportLocal, R extends SncExportResult>(
  locals: T[],
  results: R[],
): { local: T | SncExportLocal; rows: R[] }[] {
  const byStevne = new Map<number, R[]>();
  for (const row of results) {
    const list = byStevne.get(row.stevne.id) ?? [];
    list.push(row);
    byStevne.set(row.stevne.id, list);
  }
  for (const list of byStevne.values()) {
    list.sort(
      (a, b) =>
        (a.plassering ?? Number.MAX_SAFE_INTEGER) - (b.plassering ?? Number.MAX_SAFE_INTEGER),
    );
  }

  const known = new Set(locals.map((l) => l.id));
  const extras: SncExportLocal[] = [];
  for (const row of results) {
    if (known.has(row.stevne.id)) continue;
    known.add(row.stevne.id);
    extras.push({ id: row.stevne.id, navn: row.stevne.navn, sted: row.stevne.sted ?? null });
  }

  return [...locals, ...extras]
    .map((local) => ({ local, rows: byStevne.get(local.id) ?? [] }))
    .filter((entry) => entry.rows.length > 0);
}

export function buildSncExportSheet(
  parent: SncExportParent,
  locals: SncExportLocal[],
  results: SncExportResult[],
  opts: SncExportOptions,
): SncExportSheet {
  const rows: Cell[][] = [[parent.navn], EMPTY, ...infoRows(parent, locals, results, opts), EMPTY];

  const main = mainTable(results, opts, rows.length);
  rows.push(...main.rows, EMPTY, ["LOKALE STEVNE"]);
  const merges = [...main.merges];

  for (const entry of localsWithResults(locals, results)) {
    rows.push(EMPTY);
    const block = localBlock(entry.local, entry.rows, opts, rows.length);
    rows.push(...block.rows);
    merges.push(...block.merges);
  }
  return { rows, merges };
}

/** "SNC Runde 3 – Dale" → "snc-runde-3-dale.xlsx" */
export function sncExportFileName(navn: string): string {
  const slug = navn
    .toLowerCase()
    .replace(/[æå]/g, "a")
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "snc-resultat"}.xlsx`;
}
