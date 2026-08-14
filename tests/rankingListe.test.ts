/**
 * The shared season-standing list. What matters here is that the card block and
 * the table block are built from the same spec — same rows, same figures, same
 * detail — and that a detail panel opens from either side.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { bindRankingDetaljar, detaljTabellHtml, rankingListeHtml } from "@/components/RankingListe";

interface Rad {
  pl: number;
  navn: string;
  klubb: string;
  stevner: number;
  poeng: string;
  gyldig: boolean;
}

const RADER: Rad[] = [
  { pl: 1, navn: "Ada A", klubb: "Førde", stevner: 6, poeng: "87,50", gyldig: true },
  { pl: 2, navn: "Bo B", klubb: "Blaker", stevner: 5, poeng: "80,00", gyldig: true },
  { pl: 3, navn: "Cato <C>", klubb: "Gloppen", stevner: 2, poeng: "70,00", gyldig: false },
];

function liste(over: Partial<Parameters<typeof rankingListeHtml<Rad>>[1]> = {}): HTMLElement {
  const html = rankingListeHtml<Rad>(RADER, {
    idPrefix: "test",
    pl: (r) => String(r.pl),
    namn: (r) => r.navn,
    klubb: (r) => r.klubb,
    meta: (r) => `${r.stevner} stevner`,
    kolonnar: [
      { label: "STEVNER", klasse: "res-tal res-tal--dempa", verdi: (r) => String(r.stevner) },
    ],
    hovudLabel: "%SNITT",
    hovud: (r) => r.poeng,
    detalj: (r) =>
      detaljTabellHtml(
        [
          { label: "Stevne", verdi: (d) => d.namn },
          { label: "%Ring", klasse: "res-tal", verdi: (d) => d.verdi },
        ],
        [{ namn: `${r.navn} runde 1`, verdi: r.poeng }],
      ),
    radKlasse: (r) => (r.gyldig ? undefined : "rank-rad--ugyldig"),
    ...over,
  });
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.replaceChildren(el);
  bindRankingDetaljar(el);
  return el;
}

beforeEach(() => document.body.replaceChildren());

describe("rankingListeHtml", () => {
  it("renders both blocks with one entry per row", () => {
    const el = liste();
    expect(el.querySelectorAll(".res-mobil-blokk .res-row")).toHaveLength(3);
    expect(el.querySelectorAll(".res-desktop-blokk .rank-rad")).toHaveLength(3);
  });

  it("heads the table with the spec's columns, main figure last", () => {
    const el = liste();
    const head = [...el.querySelectorAll(".res-thead-columns th")].map((th) => th.textContent);
    expect(head).toEqual(["PL", "NAMN", "KLUBB", "STEVNER", "%SNITT"]);
    expect(el.querySelector(".res-thead-columns th:last-child")?.className).toContain("res-td-tot");
    expect(el.querySelector(".rank-rad td:last-child")?.className).toContain("res-td-tot");
  });

  it("uses the name label the spec asks for", () => {
    const el = liste({ namnLabel: "KLUBB", klubb: undefined });
    const head = [...el.querySelectorAll(".res-thead-columns th")].map((th) => th.textContent);
    expect(head).toEqual(["PL", "KLUBB", "STEVNER", "%SNITT"]);
    expect(el.querySelector(".res-mobil-blokk .res-klubb")).toBeNull();
  });

  it("shows the same figures in the card and in the table row", () => {
    const el = liste();
    const kort = el.querySelector(".res-mobil-blokk .res-row")!;
    expect(kort.querySelector(".res-pl")?.textContent).toBe("1.");
    expect(kort.querySelector(".res-navn")?.textContent).toBe("Ada A");
    expect(kort.querySelector(".res-tot-verdi")?.textContent).toBe("87,50");

    const rad = el.querySelector(".res-desktop-blokk .rank-rad")!;
    const celler = [...rad.querySelectorAll("td")].map((td) => td.textContent?.trim());
    expect(celler).toEqual(["1.", "Ada A", "Førde", "6", "87,50▾"]);
  });

  it("escapes names into both blocks", () => {
    const el = liste();
    expect(el.innerHTML).not.toContain("<C>");
    expect(el.querySelectorAll(".res-navn")[2]?.textContent).toBe("Cato <C>");
  });

  it("marks invalid rows in both blocks", () => {
    const el = liste();
    expect(el.querySelectorAll(".res-mobil-blokk .rank-rad--ugyldig")).toHaveLength(1);
    expect(el.querySelectorAll(".res-desktop-blokk .rank-rad--ugyldig")).toHaveLength(1);
  });

  it("omits the detail panel when the spec has none", () => {
    const el = liste({ detalj: undefined });
    expect(el.querySelector(".res-detalj-btn")).toBeNull();
    expect(el.querySelector(".rank-detalj-rad")).toBeNull();
    expect(el.querySelector(".rank-rad--klikk")).toBeNull();
  });
});

describe("bindRankingDetaljar", () => {
  it("toggles the card panel from its button", () => {
    const el = liste();
    const btn = el.querySelector<HTMLButtonElement>(".res-mobil-blokk .res-detalj-btn")!;
    const panel = el.querySelector<HTMLElement>(".res-mobil-blokk .res-detalj")!;

    expect(panel.hidden).toBe(true);
    btn.click();
    expect(panel.hidden).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(btn.querySelector(".res-detalj-tekst")?.textContent).toBe("Skjul detaljar");
    btn.click();
    expect(panel.hidden).toBe(true);
    expect(btn.querySelector(".res-detalj-tekst")?.textContent).toBe("Vis detaljar");
  });

  it("toggles the table panel from the row itself", () => {
    const el = liste();
    const rad = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-rad--klikk")!;
    const panel = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-detalj-rad")!;

    expect(rad.getAttribute("aria-controls")).toBe(panel.id);
    rad.click();
    expect(panel.hidden).toBe(false);
    expect(rad.getAttribute("aria-expanded")).toBe("true");
    rad.click();
    expect(panel.hidden).toBe(true);
  });

  it("opens a table row from the keyboard", () => {
    const el = liste();
    const rad = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-rad--klikk")!;
    const panel = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-detalj-rad")!;

    rad.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(panel.hidden).toBe(false);
  });
});

describe("detaljTabellHtml", () => {
  it("returns nothing for an empty detail", () => {
    expect(detaljTabellHtml([{ label: "A", verdi: () => "" }], [])).toBe("");
  });
});
