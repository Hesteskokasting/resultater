/**
 * The shared season-standing list. What matters here is that the card block and
 * the table block are built from the same spec — same rows, same figures, same
 * detail — and that a detail panel opens from either side.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  bindRankingDetails,
  detailTableHtml,
  rankingListHtml,
} from "@/components/resultat/RankingList";

interface Row {
  placement: number;
  name: string;
  club: string;
  events: number;
  points: string;
  valid: boolean;
}

const ROWS: Row[] = [
  { placement: 1, name: "Ada A", club: "Førde", events: 6, points: "87,50", valid: true },
  { placement: 2, name: "Bo B", club: "Blaker", events: 5, points: "80,00", valid: true },
  { placement: 3, name: "Cato <C>", club: "Gloppen", events: 2, points: "70,00", valid: false },
];

function list(over: Partial<Parameters<typeof rankingListHtml<Row>>[1]> = {}): HTMLElement {
  const html = rankingListHtml<Row>(ROWS, {
    idPrefix: "test",
    placement: (r) => String(r.placement),
    name: (r) => r.name,
    club: (r) => r.club,
    meta: (r) => `${r.events} stevner`,
    columns: [
      { label: "STEVNER", cellClass: "res-tal res-tal--dempa", value: (r) => String(r.events) },
    ],
    mainLabel: "%SNITT",
    main: (r) => r.points,
    detail: (r) =>
      detailTableHtml(
        [
          { label: "Stevne", value: (d) => d.name },
          { label: "%Ring", cellClass: "res-tal", value: (d) => d.value },
        ],
        [{ name: `${r.name} runde 1`, value: r.points }],
      ),
    rowClass: (r) => (r.valid ? undefined : "rank-rad--ugyldig"),
    ...over,
  });
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.replaceChildren(el);
  bindRankingDetails(el);
  return el;
}

beforeEach(() => document.body.replaceChildren());

describe("rankingListHtml", () => {
  it("renders both blocks with one entry per row", () => {
    const el = list();
    expect(el.querySelectorAll(".res-mobil-blokk .res-row")).toHaveLength(3);
    expect(el.querySelectorAll(".res-desktop-blokk .rank-rad")).toHaveLength(3);
  });

  it("heads the table with the spec's columns, main figure last", () => {
    const el = list();
    const head = [...el.querySelectorAll(".res-thead-columns th")].map((th) => th.textContent);
    expect(head).toEqual(["PL", "NAMN", "KLUBB", "STEVNER", "%SNITT"]);
    expect(el.querySelector(".res-thead-columns th:last-child")?.className).toContain("res-td-tot");
    expect(el.querySelector(".rank-rad td:last-child")?.className).toContain("res-td-tot");
  });

  it("uses the name label the spec asks for", () => {
    const el = list({ nameLabel: "KLUBB", club: undefined });
    const head = [...el.querySelectorAll(".res-thead-columns th")].map((th) => th.textContent);
    expect(head).toEqual(["PL", "KLUBB", "STEVNER", "%SNITT"]);
    expect(el.querySelector(".res-mobil-blokk .res-klubb")).toBeNull();
  });

  it("shows the same figures in the card and in the table row", () => {
    const el = list();
    const card = el.querySelector(".res-mobil-blokk .res-row")!;
    expect(card.querySelector(".res-pl")?.textContent).toBe("1.");
    expect(card.querySelector(".res-navn")?.textContent).toBe("Ada A");
    expect(card.querySelector(".res-tot-verdi")?.textContent).toBe("87,50");

    const row = el.querySelector(".res-desktop-blokk .rank-rad")!;
    const cells = [...row.querySelectorAll("td")].map((td) => td.textContent?.trim());
    expect(cells).toEqual(["1.", "Ada A", "Førde", "6", "87,50▾"]);
  });

  it("escapes names into both blocks", () => {
    const el = list();
    expect(el.innerHTML).not.toContain("<C>");
    expect(el.querySelectorAll(".res-navn")[2]?.textContent).toBe("Cato <C>");
  });

  it("marks invalid rows in both blocks", () => {
    const el = list();
    expect(el.querySelectorAll(".res-mobil-blokk .rank-rad--ugyldig")).toHaveLength(1);
    expect(el.querySelectorAll(".res-desktop-blokk .rank-rad--ugyldig")).toHaveLength(1);
  });

  it("omits the detail panel when the spec has none", () => {
    const el = list({ detail: undefined });
    expect(el.querySelector(".res-detalj-btn")).toBeNull();
    expect(el.querySelector(".rank-detalj-rad")).toBeNull();
    expect(el.querySelector(".rank-rad--klikk")).toBeNull();
  });
});

describe("bindRankingDetails", () => {
  it("toggles the card panel from its button", () => {
    const el = list();
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
    const el = list();
    const row = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-rad--klikk")!;
    const panel = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-detalj-rad")!;

    expect(row.getAttribute("aria-controls")).toBe(panel.id);
    row.click();
    expect(panel.hidden).toBe(false);
    expect(row.getAttribute("aria-expanded")).toBe("true");
    row.click();
    expect(panel.hidden).toBe(true);
  });

  it("opens a table row from the keyboard", () => {
    const el = list();
    const row = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-rad--klikk")!;
    const panel = el.querySelector<HTMLElement>(".res-desktop-blokk .rank-detalj-rad")!;

    row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(panel.hidden).toBe(false);
  });
});

describe("detailTableHtml", () => {
  it("returns nothing for an empty detail", () => {
    expect(detailTableHtml([{ label: "A", value: () => "" }], [])).toBe("");
  });
});
