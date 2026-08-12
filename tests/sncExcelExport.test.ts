import { describe, expect, it } from "vite-plus/test";
import { buildSncExportRows, sncExportFileName, sncTotal } from "@/utils/sncExcelExport";
import type {
  SncExportLocal,
  SncExportOptions,
  SncExportParent,
  SncExportResult,
} from "@/utils/sncExcelExport";

const parent: SncExportParent = {
  navn: "SNC Runde 3",
  dato: "2026-08-01",
  tid: "10:00:00",
  sted: "Årdalen",
  erfullfort: true,
  stevnetype: { navn: "SNC" },
  kategori: { navn: "Singel" },
  klubb: { navn: "Nordhordland HK" },
  kontakt: { fornavn: "Kari", etternavn: "Nordmann" },
  kastemetodeInnl: { navn: "Halvmatch", antall_omganger: 25 },
  kastemetodeAvsl: { navn: "Kongelag" },
};

const locals: SncExportLocal[] = [
  {
    id: 10,
    navn: "Dale",
    dato: "2026-07-25",
    tid: "11:00:00",
    sted: "Dale",
    erfullfort: true,
    klubb: { navn: "Skjold HK" },
  },
  {
    id: 11,
    navn: "Voss",
    dato: "2026-07-26",
    tid: "12:00:00",
    sted: "Voss",
    erfullfort: true,
    klubb: { navn: "Voss HK" },
  },
];

function result(
  sncPl: number,
  navn: string,
  stevneId: number,
  localPl: number,
  poengXkast: number,
): SncExportResult {
  return {
    snc_plassering: sncPl,
    plassering: localPl,
    nc_poeng: 100,
    poeng_xkast: poengXkast,
    poeng_kongelag: 118,
    antall_ring_xkast: 24,
    antall_ring_kongelag: 8,
    kaster: { fornavn: navn, etternavn: "Testar" },
    klubb: { navn: "Skjold HK" },
    stevne: { id: stevneId, navn: stevneId === 10 ? "Dale" : "Voss", sted: null },
  };
}

const opts: SncExportOptions = {
  showXkast: true,
  showKongelag: true,
  carryFactor: 0.2,
  carryPercent: 20,
  innlLabel: "Halvmatch",
  avslLabel: "Kongelag",
};

/** First cell of every row — enough to assert on section order. */
function firstCells(rows: (string | number | null)[][]): string[] {
  return rows.map((r) => String(r[0] ?? ""));
}

describe("sncTotal", () => {
  it("adds the carried-over innledende points to the kongelag points", () => {
    expect(sncTotal(result(1, "A", 10, 1, 302), opts)).toBe(178);
  });

  it("falls back to the single block's own points when nothing carries over", () => {
    const single = { ...opts, showKongelag: false, carryFactor: null, carryPercent: null };
    expect(sncTotal(result(1, "A", 10, 1, 302), single)).toBe(302);
  });
});

describe("buildSncExportRows", () => {
  const rows = buildSncExportRows(
    parent,
    locals,
    [result(1, "A", 10, 1, 302), result(2, "B", 11, 1, 290), result(3, "C", 10, 2, 280)],
    opts,
  );
  const cells = firstCells(rows);

  it("leads with the round's name and its facts", () => {
    expect(cells[0]).toBe("SNC Runde 3");
    expect(cells).toContain("STEVNEINFO");
    expect(rows.find((r) => r[0] === "Arrangør")?.[1]).toBe("Nordhordland HK");
    expect(rows.find((r) => r[0] === "Omgangar")?.[1]).toBe(25);
    expect(rows.find((r) => r[0] === "Overføring frå innleiande")?.[1]).toBe("20 %");
    expect(rows.find((r) => r[0] === "Type / kategori")?.[1]).toBe("SNC Singel");
  });

  it("puts the merged list before the local blocks", () => {
    expect(cells.indexOf("SAMLA RESULTAT")).toBeLessThan(cells.indexOf("LOKALE STEVNE"));
    expect(cells.indexOf("LOKALE STEVNE")).toBeLessThan(cells.lastIndexOf("Dale"));
  });

  it("names the score columns after the methods in use", () => {
    const header = rows[cells.indexOf("SAMLA RESULTAT") + 1]!;
    expect(header).toEqual([
      "Pl",
      "Namn",
      "Klubb",
      "Lokalt stevne",
      "Halvmatch poeng",
      "Halvmatch ringer",
      "Overført",
      "Kongelag poeng",
      "Kongelag ringer",
      "Total",
      "NC",
      "Lokal pl",
    ]);
  });

  it("writes each result as numbers, with the carried-over value spelled out", () => {
    const first = rows[cells.indexOf("SAMLA RESULTAT") + 2]!;
    expect(first).toEqual([1, "A Testar", "Skjold HK", "Dale", 302, 24, 60, 118, 8, 178, 100, 1]);
  });

  it("gives every local stevne its own block, ordered by local placement", () => {
    const start = cells.indexOf("Dale", cells.indexOf("LOKALE STEVNE"));
    const block = rows.slice(start);
    expect(block[1]).toEqual(["Arrangør", "Skjold HK"]);
    expect(block.find((r) => r[0] === "Deltakarar")?.[1]).toBe(2);
    const header = block.findIndex((r) => r[0] === "Pl");
    expect(block[header + 1]?.[1]).toBe("A Testar");
    expect(block[header + 2]?.[1]).toBe("C Testar");
  });

  it("skips columns for a block the round does not use", () => {
    const single = { ...opts, showKongelag: false, carryFactor: null, carryPercent: null };
    const onlyXkast = buildSncExportRows(parent, locals, [result(1, "A", 10, 1, 302)], single);
    const heads = firstCells(onlyXkast);
    expect(onlyXkast[heads.indexOf("SAMLA RESULTAT") + 1]).toEqual([
      "Pl",
      "Namn",
      "Klubb",
      "Lokalt stevne",
      "Halvmatch poeng",
      "Halvmatch ringer",
      "Total",
      "NC",
      "Lokal pl",
    ]);
    expect(heads).not.toContain("Overføring frå innleiande");
  });

  it("keeps a stevne the local list missed rather than dropping its rows", () => {
    const built = buildSncExportRows(parent, [locals[0]!], [result(1, "B", 11, 1, 290)], opts);
    expect(firstCells(built)).toContain("Voss");
  });

  it("leaves out a local stevne with no results", () => {
    const built = buildSncExportRows(parent, locals, [result(1, "A", 10, 1, 302)], opts);
    const afterList = firstCells(built).slice(firstCells(built).indexOf("LOKALE STEVNE"));
    expect(afterList).not.toContain("Voss");
  });
});

describe("sncExportFileName", () => {
  it("slugs the name and keeps the extension", () => {
    expect(sncExportFileName("SNC Runde 3 – Årdalen")).toBe("snc-runde-3-ardalen.xlsx");
  });

  it("falls back when nothing survives slugging", () => {
    expect(sncExportFileName("—")).toBe("snc-resultat.xlsx");
  });
});
