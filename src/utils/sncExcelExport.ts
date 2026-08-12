// Builds the sheet for the consolidated SNC result as rows of cells: the round's
// own facts, the merged list, then every local stevne as its own block below.
// Pure — the page hands it the rows it already loaded, and xlsx stays out of the
// bundle until someone actually clicks the export.

import { formatDateNumeric, formatTime } from "@/utils/shared";

export type Cell = string | number | null;

interface NamedRow {
  navn?: string | null;
}

/** The round itself — what the info hero shows, plus the method details. */
export interface SncExportParent {
  navn: string;
  dato?: string | null;
  tid?: string | null;
  sted?: string | null;
  erfullfort?: boolean | null;
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
  erfullfort?: boolean | null;
  klubb?: NamedRow | null;
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

function labelValue(label: string, value: Cell): Cell[] {
  return [label, value ?? ""];
}

export function sncTotal(row: SncExportResult, opts: SncExportOptions): number {
  if (opts.carryFactor != null) {
    return (row.poeng_kongelag ?? 0) + Math.round((row.poeng_xkast ?? 0) * opts.carryFactor);
  }
  return (opts.showKongelag ? row.poeng_kongelag : row.poeng_xkast) ?? 0;
}

function infoRows(
  parent: SncExportParent,
  locals: SncExportLocal[],
  results: SncExportResult[],
  opts: SncExportOptions,
): Cell[][] {
  const omganger = parent.kastemetodeInnl?.antall_omganger ?? null;
  const rows: Cell[][] = [
    ["STEVNEINFO"],
    labelValue("Arrangør", parent.klubb?.navn ?? ""),
    labelValue("Dato", formatDateNumeric(parent.dato)),
    labelValue("Tid", formatTime(parent.tid)),
    labelValue("Stad", parent.sted ?? ""),
    labelValue(
      "Type / kategori",
      [parent.stevnetype?.navn, parent.kategori?.navn].filter(Boolean).join(" "),
    ),
    labelValue("Kontaktperson", fullName(parent.kontakt ?? null)),
    labelValue("Innleiande metode", parent.kastemetodeInnl?.navn ?? ""),
  ];
  if (omganger != null) rows.push(labelValue("Omgangar", omganger));
  rows.push(labelValue("Avsluttande metode", parent.kastemetodeAvsl?.navn ?? ""));
  if (opts.carryPercent != null) {
    rows.push(labelValue("Overføring frå innleiande", `${opts.carryPercent} %`));
  }
  rows.push(
    labelValue("Status", parent.erfullfort ? "Konsolidert" : "Ikkje konsolidert"),
    labelValue("Lokale stevne", locals.length),
    labelValue("Deltakarar", results.length),
  );
  return rows;
}

/** Score columns repeat in both tables, so the header and the cells share a shape. */
function scoreHeader(opts: SncExportOptions): Cell[] {
  const header: Cell[] = [];
  if (opts.showXkast) header.push(`${opts.innlLabel} poeng`, `${opts.innlLabel} ringer`);
  if (opts.carryFactor != null) header.push("Overført");
  if (opts.showKongelag) header.push(`${opts.avslLabel} poeng`, `${opts.avslLabel} ringer`);
  return [...header, "Total", "NC"];
}

function scoreCells(row: SncExportResult, opts: SncExportOptions): Cell[] {
  const cells: Cell[] = [];
  if (opts.showXkast) cells.push(row.poeng_xkast, row.antall_ring_xkast);
  if (opts.carryFactor != null) cells.push(Math.round((row.poeng_xkast ?? 0) * opts.carryFactor));
  if (opts.showKongelag) cells.push(row.poeng_kongelag, row.antall_ring_kongelag);
  return [...cells, sncTotal(row, opts), row.nc_poeng];
}

function mainTable(results: SncExportResult[], opts: SncExportOptions): Cell[][] {
  const rows: Cell[][] = [
    ["SAMLA RESULTAT"],
    ["Pl", "Namn", "Klubb", "Lokalt stevne", ...scoreHeader(opts), "Lokal pl"],
  ];
  for (const row of results) {
    rows.push([
      row.snc_plassering,
      fullName(row.kaster),
      row.klubb?.navn ?? "",
      row.stevne.navn,
      ...scoreCells(row, opts),
      row.plassering,
    ]);
  }
  return rows;
}

function localBlock(
  local: SncExportLocal,
  results: SncExportResult[],
  opts: SncExportOptions,
): Cell[][] {
  const ordered = [...results].sort(
    (a, b) => (a.plassering ?? Number.MAX_SAFE_INTEGER) - (b.plassering ?? Number.MAX_SAFE_INTEGER),
  );
  const rows: Cell[][] = [
    [local.navn],
    labelValue("Arrangør", local.klubb?.navn ?? ""),
    labelValue("Dato", formatDateNumeric(local.dato)),
    labelValue("Tid", formatTime(local.tid)),
    labelValue("Stad", local.sted ?? ""),
    labelValue("Status", local.erfullfort ? "Fullført" : "Ikkje fullført"),
    labelValue("Deltakarar", ordered.length),
    ["Pl", "Namn", "Klubb", ...scoreHeader(opts), "SNC pl"],
  ];
  for (const row of ordered) {
    rows.push([
      row.plassering,
      fullName(row.kaster),
      row.klubb?.navn ?? "",
      ...scoreCells(row, opts),
      row.snc_plassering,
    ]);
  }
  return rows;
}

/**
 * Locals the export shows: the ones passed in, plus any stevne a result points
 * at that the list missed, so no row is silently dropped.
 */
function localsWithResults(
  locals: SncExportLocal[],
  results: SncExportResult[],
): { local: SncExportLocal; rows: SncExportResult[] }[] {
  const byStevne = new Map<number, SncExportResult[]>();
  for (const row of results) {
    const list = byStevne.get(row.stevne.id) ?? [];
    list.push(row);
    byStevne.set(row.stevne.id, list);
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

export function buildSncExportRows(
  parent: SncExportParent,
  locals: SncExportLocal[],
  results: SncExportResult[],
  opts: SncExportOptions,
): Cell[][] {
  const rows: Cell[][] = [
    [parent.navn],
    EMPTY,
    ...infoRows(parent, locals, results, opts),
    EMPTY,
    ...mainTable(results, opts),
    EMPTY,
    ["LOKALE STEVNE"],
  ];
  for (const entry of localsWithResults(locals, results)) {
    rows.push(EMPTY, ...localBlock(entry.local, entry.rows, opts));
  }
  return rows;
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
