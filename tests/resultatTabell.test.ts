/**
 * The shared result table. Every page feeds it the same row shape, so what is
 * asserted here is the column logic: which blocks the thrown kastemetodar earn,
 * what the total is made of, and that the header and the body stay in step.
 */

import {
  radTotal,
  resultatKolonnar,
  resultatListeHtml,
  resultatTabellHtml,
} from "@/components/ResultatTabell";
import type { ResultatRad } from "@/components/ResultatTabell";

function rad(over: Partial<ResultatRad> = {}): ResultatRad {
  return {
    pl: 1,
    namn: "Ada A",
    klubb: "Førde",
    poengInnl: 150,
    ringInnl: 15,
    kampPoeng: 4,
    scorePoeng: 88,
    poengAvsl: 55,
    ringAvsl: 5,
    ncPoeng: 75,
    sncPl: 3,
    erpremie: false,
    ...over,
  };
}

function host(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.replaceChildren(el);
  return el;
}

function headers(el: HTMLElement): string[] {
  return [...el.querySelectorAll(".res-thead-columns th")].map(
    (th) => th.textContent?.trim() ?? "",
  );
}

function groups(el: HTMLElement): [string, string | null][] {
  return [...el.querySelectorAll(".res-thead-grupper .res-gruppe")].map((th) => [
    th.textContent?.trim() ?? "",
    th.getAttribute("colspan"),
  ]);
}

function cells(el: HTMLElement): string[] {
  return [...el.querySelectorAll("tbody tr td")].map((td) => td.textContent?.trim() ?? "");
}

const XKAST_KONGELAG = resultatKolonnar({
  visInnlPoeng: true,
  visAvslPoeng: true,
  visTotal: true,
  visNc: true,
  innlLabel: "Minimatch X-kast",
  avslLabel: "Kongelag",
  carryFactor: 1 / 3,
  carryPercent: 33.33,
});

const GLOPPEN = resultatKolonnar({
  visKpSp: true,
  innlLabel: "Gloppen",
});

describe("resultatTabellHtml", () => {
  it("groups an X-kast innledende and Kongelag under their method names", () => {
    const el = host(resultatTabellHtml([rad()], XKAST_KONGELAG));

    expect(groups(el)).toEqual([
      ["Minimatch X-kast", "3"],
      ["Kongelag", "2"],
    ]);
    expect(headers(el)).toEqual([
      "PL",
      "NAMN",
      "KLUBB",
      "POENG",
      "RINGAR",
      "33,33 %",
      "POENG",
      "RINGAR",
      "TOTAL",
      "NC",
      "PREMIE",
    ]);
    // Kongelag 55 + a third of 150 carried over.
    expect(cells(el)).toEqual([
      "1.",
      "Ada A",
      "Førde",
      "150",
      "15",
      "50",
      "55",
      "5",
      "105",
      "75",
      "",
    ]);
  });

  it("gives Gloppen kamp- and scorepoeng, and no total without an avsluttande fase", () => {
    const el = host(resultatTabellHtml([rad()], GLOPPEN));

    expect(groups(el)).toEqual([["Gloppen", "2"]]);
    expect(headers(el)).toEqual(["PL", "NAMN", "KLUBB", "KP", "SP", "PREMIE"]);
    expect(cells(el)).toEqual(["1.", "Ada A", "Førde", "4", "88", ""]);
  });

  it("adds the kamppoeng as thrown to a Kongelag total behind Gloppen", () => {
    const cols = resultatKolonnar({ ...GLOPPEN, visAvslPoeng: true, visTotal: true });
    const el = host(resultatTabellHtml([rad()], cols));

    expect(headers(el)).toEqual([
      "PL",
      "NAMN",
      "KLUBB",
      "KP",
      "SP",
      "POENG",
      "RINGAR",
      "TOTAL",
      "PREMIE",
    ]);
    // Kongelag 55 + 4 kamppoeng, with nothing normalized away.
    expect(radTotal(rad(), cols)).toBe(59);
    expect(cells(el)).toContain("59");
  });

  it("keeps the carried column out when nothing is carried over", () => {
    const cols = resultatKolonnar({
      ...XKAST_KONGELAG,
      carryFactor: null,
      carryPercent: null,
    });
    const el = host(resultatTabellHtml([rad()], cols));

    expect(groups(el)).toEqual([
      ["Minimatch X-kast", "2"],
      ["Kongelag", "2"],
    ]);
    expect(headers(el)).not.toContain("33,33 %");
    expect(radTotal(rad(), cols)).toBe(55);
  });

  it("drops the whole group row for a stevne with no scored method", () => {
    const el = host(resultatTabellHtml([rad()], resultatKolonnar()));

    expect(el.querySelector(".res-thead-grupper")).toBeNull();
    expect(headers(el)).toEqual(["PL", "NAMN", "KLUBB", "PREMIE"]);
  });

  it("swaps the prize column for the merged placement when asked", () => {
    const el = host(
      resultatTabellHtml(
        [rad()],
        resultatKolonnar({ ...XKAST_KONGELAG, visPremie: false, visSncPl: true }),
      ),
    );

    const head = headers(el);
    expect(head[head.length - 1]).toBe("SNC PL");
    expect(head).not.toContain("PREMIE");
    expect(cells(el)[cells(el).length - 1]).toBe("3");
  });

  it("marks a drawn prize with an X in its own column", () => {
    const el = host(resultatTabellHtml([rad({ erpremie: true })], XKAST_KONGELAG));

    expect(el.querySelector("td.res-td-premie .res-premie")?.textContent).toBe("X");
  });

  it("heads the table with the group name when one is given", () => {
    const el = host(resultatTabellHtml([rad()], GLOPPEN, "Klasse A Gruppe 1"));

    const header = el.querySelector(".res-thead-group td")!;
    expect(header.textContent).toBe("Klasse A Gruppe 1");
    expect(header.getAttribute("colspan")).toBe("6");
  });

  it("escapes what comes from the database", () => {
    const el = host(resultatTabellHtml([rad({ namn: "<script>", klubb: "A & B" })], GLOPPEN));

    expect(el.querySelector("script")).toBeNull();
    expect(cells(el)).toContain("<script>");
    expect(cells(el)).toContain("A & B");
  });
});

describe("resultatListeHtml", () => {
  it("leads the mobile card with the total and hides the rest behind a toggle", () => {
    const el = host(resultatListeHtml([rad({ erpremie: true })], XKAST_KONGELAG));

    const card = el.querySelector(".res-mobil-blokk .res-row--detalj")!;
    expect(card.querySelector(".res-tot-label")?.textContent).toBe("TOT");
    expect(card.querySelector(".res-tot-verdi")?.textContent).toBe("105");
    expect(card.querySelector(".res-tot .res-premie")?.textContent).toBe("PREMIE");

    const panel = card.querySelector<HTMLElement>(".res-detalj")!;
    expect(panel.hidden).toBe(true);
    expect([...panel.querySelectorAll(".res-stat-label")].map((s) => s.textContent)).toEqual([
      "Minimatch X-kast (33,33 %)",
      "Kongelag",
      "NC",
    ]);
  });

  it("falls back to the kamppoeng when there is no total to lead with", () => {
    const el = host(resultatListeHtml([rad()], GLOPPEN));

    expect(el.querySelector(".res-tot-label")?.textContent).toBe("KP");
    expect(el.querySelector(".res-tot-verdi")?.textContent).toBe("4");
  });

  it("leaves out the detail toggle when there is nothing to unfold", () => {
    const el = host(resultatListeHtml([rad()], resultatKolonnar()));

    expect(el.querySelector(".res-detalj-btn")).toBeNull();
    expect(el.querySelector(".res-detalj")).toBeNull();
  });

  it("keeps the panel ids apart between lists on one page", () => {
    const el = host(
      resultatListeHtml([rad()], GLOPPEN, { prefiks: "0-" }) +
        resultatListeHtml([rad()], GLOPPEN, { prefiks: "1-" }),
    );

    const ids = [...el.querySelectorAll(".res-detalj")].map((p) => p.id);
    expect(ids).toEqual(["res-detalj-0-0", "res-detalj-1-0"]);
  });
});
