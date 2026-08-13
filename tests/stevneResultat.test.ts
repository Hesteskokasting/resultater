/**
 * An ordinary stevne's result tab against mocked services: which columns the
 * thrown kastemetodar earn, how groups and Par/Mix rows are laid out, and the
 * cross-links a local SNC stevne gets. Supabase is mocked — it does not work
 * under happy-dom.
 */

const mocks = vi.hoisted(() => ({
  getTournamentWithDetails: vi.fn(),
  getResultsForTournament: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/resultatService", () => ({
  getTournamentWithDetails: mocks.getTournamentWithDetails,
  getResultsForTournament: mocks.getResultsForTournament,
}));

const { getTournamentWithDetails, getResultsForTournament } = mocks;

import { render } from "@/pages/stevne/stevne-resultat";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

function stevne(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    navn: "Førde open",
    sted: "Førde",
    dato: "2026-06-01",
    erfullfort: true,
    resultaturl: null,
    juryleder: null,
    klubbid: 1,
    snc_hovudstevne_id: null,
    stevnetype: { navn: "Vanleg" },
    kategori: { navn: "Singel", erlagbasert: false },
    kontakt: null,
    innledende: { navn: "Minimatch X-kast", antall_omganger: 15 },
    avsluttende: { navn: "Kongelag" },
    ...overrides,
  };
}

function resultat(overrides: Record<string, unknown> = {}) {
  return {
    plassering: 1,
    nc_poeng: 75,
    snc_plassering: null,
    startnummer: 1,
    kamp_poeng_innl: 4,
    score_poeng_innl: 88,
    poeng_xkast: 150,
    antall_ring_xkast: 15,
    poeng_kongelag: 55,
    antall_ring_kongelag: 5,
    erpremie: false,
    kaster: { id: 1, fornavn: "Ada", etternavn: "A" },
    klubb: { navn: "Førde" },
    klasse: { navn: "Klasse A" },
    gruppe: { navn: "Gruppe 1" },
    ...overrides,
  };
}

function headers(el: HTMLElement): string[] {
  return [...el.querySelectorAll(".res-thead-columns th")].map(
    (th) => th.textContent?.trim() ?? "",
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getTournamentWithDetails.mockResolvedValue({ data: stevne(), error: null });
  getResultsForTournament.mockResolvedValue({ data: [resultat()], error: null });
});

describe("stevne resultat tab", () => {
  it("shows the X-kast and Kongelag blocks with a total, and always a prize column", async () => {
    const el = host();
    await render(el, { id: 5 });

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
      "PREMIE",
    ]);
    // Kongelag 55 + a third of the 150 X-kast poeng.
    expect(el.querySelector(".res-desktop-blokk td.res-td-tot")?.textContent).toBe("105");
    // NC points belong to NC, DNC and SNC stevner only.
    expect(headers(el)).not.toContain("NC");
    expect(el.textContent).toContain("Antall deltakarar: 1");
  });

  it("gives a Gloppen stevne kamp- and scorepoeng instead", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ innledende: { navn: "Gloppen", antall_omganger: null }, avsluttende: null }),
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    expect(headers(el)).toEqual(["PL", "NAMN", "KLUBB", "KP", "SP", "PREMIE"]);
    expect(
      [...el.querySelectorAll(".res-thead-grupper .res-gruppe")].map((th) => th.textContent),
    ).toEqual(["Gloppen"]);
  });

  it("adds the NC column for an NC stevne, and marks drawn prizes", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ stevnetype: { navn: "NC" } }),
      error: null,
    });
    getResultsForTournament.mockResolvedValue({
      data: [resultat({ erpremie: true })],
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    expect(headers(el)).toContain("NC");
    expect(el.querySelector(".res-desktop-blokk td.res-td-premie .res-premie")?.textContent).toBe(
      "X",
    );
    expect(el.querySelector(".res-mobil-blokk .res-tot .res-premie")?.textContent).toBe("PREMIE");
  });

  it("splits the groups into one titled list each", async () => {
    getResultsForTournament.mockResolvedValue({
      data: [
        resultat(),
        resultat({
          plassering: 1,
          startnummer: 2,
          gruppe: { navn: "Gruppe 2" },
          kaster: { id: 2, fornavn: "Bo", etternavn: "B" },
        }),
      ],
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    expect(
      [...el.querySelectorAll(".res-mobil-blokk .res-group-title")].map((h) => h.textContent),
    ).toEqual(["Gruppe 1", "Gruppe 2"]);
    expect(
      [...el.querySelectorAll(".res-desktop-blokk .res-thead-group td")].map(
        (td) => td.textContent,
      ),
    ).toEqual(["Gruppe 1", "Gruppe 2"]);
    // One shared table, so the columns line up between the groups.
    expect(el.querySelectorAll(".res-desktop-blokk table")).toHaveLength(1);
    // One data row each, under its own heading.
    expect(el.querySelectorAll(".res-desktop-blokk tbody:not(.res-tbody-hovud) tr")).toHaveLength(
      2,
    );
  });

  it("prefixes the group name with the klasse for stevner before 2026", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ dato: "2025-06-01" }),
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    expect(el.querySelector(".res-group-title")?.textContent).toBe("Klasse A Gruppe 1");
  });

  it("reads a Par/Mix pair as one row, with both names and clubs", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ kategori: { navn: "Par", erlagbasert: true } }),
      error: null,
    });
    getResultsForTournament.mockResolvedValue({
      data: [
        resultat(),
        resultat({ kaster: { id: 2, fornavn: "Bo", etternavn: "B" }, klubb: { navn: "Bergen" } }),
      ],
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    const rows = [...el.querySelectorAll(".res-desktop-blokk tbody:not(.res-tbody-hovud) tr")];
    expect(rows).toHaveLength(1);
    expect(rows[0]!.querySelector(".res-td-navn")?.textContent?.trim()).toBe("Ada A og Bo B");
    expect(rows[0]!.querySelector(".res-td-klubb")?.textContent).toBe("Førde / Bergen");
  });

  it("carries the merged placement and a link to the umbrella on a local SNC stevne", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ snc_hovudstevne_id: 10, stevnetype: { navn: "SNC" } }),
      error: null,
    });
    getResultsForTournament.mockResolvedValue({
      data: [resultat({ snc_plassering: 3 })],
      error: null,
    });
    const el = host();
    await render(el, { id: 5 });

    expect(headers(el)).toContain("SNC PL");
    expect(el.querySelector('a[href="#/stevne/10/resultat"]')).not.toBeNull();
  });

  it("says so when the tournament has no result yet", async () => {
    getTournamentWithDetails.mockResolvedValue({
      data: stevne({ erfullfort: false }),
      error: null,
    });
    getResultsForTournament.mockResolvedValue({ data: [], error: null });
    const el = host();
    await render(el, { id: 5 });

    expect(el.querySelector("table")).toBeNull();
    expect(el.textContent).toContain("ikkje avslutta");
  });

  it("unfolds a mobile card's details on click", async () => {
    const el = host();
    await render(el, { id: 5 });

    const btn = el.querySelector<HTMLButtonElement>(".res-mobil-blokk .res-detalj-btn")!;
    const panel = el.querySelector<HTMLElement>(".res-mobil-blokk .res-detalj")!;
    expect(panel.hidden).toBe(true);
    btn.click();
    expect(panel.hidden).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});
