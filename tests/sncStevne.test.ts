/**
 * Renders the two SNC umbrella tabs against mocked services and asserts what
 * lands in the DOM: the local-stevne list with its registration counts, which
 * button each thrower gets, the admin consolidation banner, and the merged
 * result list. The Supabase client is mocked out - it does not work under happy-dom.
 */

const mocks = vi.hoisted(() => ({
  getSncParentTournament: vi.fn(),
  getSncLocalTournaments: vi.fn(),
  completeSncParent: vi.fn(),
  reopenSncParent: vi.fn(),
  getSncConsolidatedResults: vi.fn(),
  drawSncPremiar: vi.fn(),
  clearSncPremiar: vi.fn(),
  premieDialog: vi.fn(),
  getTournamentSettings: vi.fn(),
  getActiveThrowingMethods: vi.fn(),
  updateTournamentSettings: vi.fn(),
  resetTournament: vi.fn(),
  getRegistrationsAcrossTournaments: vi.fn(),
  registerForTournament: vi.fn(),
  removeRegistration: vi.fn(),
  getRegistrationCount: vi.fn(),
  getPairCount: vi.fn(),
  getUser: vi.fn(),
  confirmDialog: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getSncParentTournament: mocks.getSncParentTournament,
  getSncLocalTournaments: mocks.getSncLocalTournaments,
  completeSncParent: mocks.completeSncParent,
  reopenSncParent: mocks.reopenSncParent,
  getTournamentSettings: mocks.getTournamentSettings,
  getActiveThrowingMethods: mocks.getActiveThrowingMethods,
  updateTournamentSettings: mocks.updateTournamentSettings,
}));
vi.mock("@/services/testDataService", () => ({ resetTournament: mocks.resetTournament }));
vi.mock("@/services/resultatService", () => ({
  getSncConsolidatedResults: mocks.getSncConsolidatedResults,
  drawSncPremiar: mocks.drawSncPremiar,
  clearSncPremiar: mocks.clearSncPremiar,
}));
vi.mock("@/components/PremieDialog", () => ({ premieDialog: mocks.premieDialog }));
vi.mock("@/services/pameldingService", () => ({
  getRegistrationsAcrossTournaments: mocks.getRegistrationsAcrossTournaments,
  registerForTournament: mocks.registerForTournament,
  removeRegistration: mocks.removeRegistration,
  getRegistrationCount: mocks.getRegistrationCount,
  getPairCount: mocks.getPairCount,
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));

const {
  getSncParentTournament,
  getSncLocalTournaments,
  completeSncParent,
  reopenSncParent,
  getSncConsolidatedResults,
  drawSncPremiar,
  premieDialog,
  getTournamentSettings,
  getActiveThrowingMethods,
  getRegistrationsAcrossTournaments,
  registerForTournament,
  removeRegistration,
  getUser,
  confirmDialog,
} = mocks;

import { render as renderSncInfo } from "@/pages/stevne/snc-info";
import { render as renderSettings } from "@/pages/stevne/stevne-innstillinger";
import { render as renderSncResults } from "@/pages/stevne/snc-resultat";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

function parentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    navn: "SNC runde 1",
    sted: null,
    dato: "2026-08-15",
    tid: "11:00:00",
    erfullfort: false,
    klubbid: 1,
    innledendekastemetodeid: 5,
    avsluttendekastemetodeid: 6,
    kastemetodeInnl: { id: 5, navn: "Minimatch X-kast", antall_omganger: 15 },
    kastemetodeAvsl: { id: 6, navn: "Kongelag" },
    kategori: { navn: "Singel", erlagbasert: false },
    klubb: { id: 1, navn: "NHF" },
    ...overrides,
  };
}

function localRow(id: number, klubb: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    navn: `SNC runde 1 – ${klubb}`,
    sted: klubb,
    dato: "2026-08-15",
    tid: "11:00:00",
    erfullfort: false,
    stevne_fase: "ikke_startet",
    klubbid: id,
    klubb: { id, navn: klubb, logourl: null },
    kontakt: { fornavn: "Ola", etternavn: klubb },
    ...overrides,
  };
}

function linkedUser() {
  return {
    user: { id: "u1", email: "utovar@example.com" },
    profil: { role: "bruker", kasterid: 77, kobling_status: "godkjent" },
    clubs: [],
  };
}

function summary(
  overrides: Partial<{
    counts: Map<number, number>;
    ownStevneId: number | null;
    ownRegistrationId: number | null;
  }> = {},
) {
  return {
    counts: new Map([
      [11, 3],
      [12, 2],
    ]),
    ownStevneId: null,
    ownRegistrationId: null,
    ...overrides,
  };
}

function buttonWithText(el: HTMLElement, text: string): HTMLButtonElement | undefined {
  return [...el.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent === text);
}

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue(null);
  getSncParentTournament.mockResolvedValue({ data: parentRow(), error: null });
  getSncLocalTournaments.mockResolvedValue({
    data: [localRow(11, "Førde"), localRow(12, "Bergen")],
    error: null,
  });
  getRegistrationsAcrossTournaments.mockResolvedValue(summary());
  getSncConsolidatedResults.mockResolvedValue({ data: [], error: null });
  confirmDialog.mockResolvedValue(true);
  registerForTournament.mockResolvedValue({ error: null, id: 99 });
  removeRegistration.mockResolvedValue({ error: null });
  completeSncParent.mockResolvedValue({ error: null });
  reopenSncParent.mockResolvedValue({ error: null });
  mocks.getRegistrationCount.mockResolvedValue(0);
  mocks.getPairCount.mockResolvedValue(0);
});

describe("SNC umbrella info tab", () => {
  it("lists every venue with its own registration count and total", async () => {
    const el = host();
    await renderSncInfo(el, { id: 10 });

    const text = el.textContent ?? "";
    expect(text).toContain("Førde");
    expect(text).toContain("Bergen");
    expect(text).toContain("0 av 2 fullført");

    const cards = [...el.querySelectorAll("#snc-locals .stevne-kort")];
    expect(cards).toHaveLength(2);
    expect(cards[0]!.textContent).toContain("3 påmelde");
    expect(cards[1]!.textContent).toContain("2 påmelde");
    // 3 + 2 registrations across the local stevner
    expect(el.querySelector(".stevne-hero__detaljar")?.textContent).toContain("5");
  });

  it("asks an anonymous visitor to log in rather than offering a venue", async () => {
    const el = host();
    await renderSncInfo(el, { id: 10 });

    expect(el.querySelector('a[href*="logginn"]')).not.toBeNull();
    expect(buttonWithText(el, "Meld på")).toBeUndefined();
  });

  it("offers a linked thrower one Meld på button per venue", async () => {
    getUser.mockResolvedValue(linkedUser());
    const el = host();
    await renderSncInfo(el, { id: 10 });

    expect(el.querySelectorAll(".snc-meldpa")).toHaveLength(2);
    expect(buttonWithText(el, "Byt hit")).toBeUndefined();
  });

  it("registers the thrower on the venue whose button was clicked", async () => {
    getUser.mockResolvedValue(linkedUser());
    const el = host();
    await renderSncInfo(el, { id: 10 });

    el.querySelectorAll<HTMLButtonElement>(".snc-meldpa")[1]!.click();
    await vi.waitFor(() => expect(registerForTournament).toHaveBeenCalled());
    expect(registerForTournament).toHaveBeenCalledWith(12, 77);
  });

  it("shows the chosen venue and turns the others into a venue switch", async () => {
    getUser.mockResolvedValue(linkedUser());
    getRegistrationsAcrossTournaments.mockResolvedValue(
      summary({ ownStevneId: 11, ownRegistrationId: 500 }),
    );
    const el = host();
    await renderSncInfo(el, { id: 10 });

    expect(el.textContent).toContain("Du er påmeld");
    expect(el.querySelectorAll(".snc-avmeld")).toHaveLength(1);
    expect(el.querySelectorAll(".snc-byt")).toHaveLength(1);
    const own = el.querySelector("#snc-locals .stevne-kort")!;
    expect(own.querySelector(".stevne-kort__nearest-merke")?.textContent).toBe("PÅMELD");
  });

  it("switches venue by unregistering the old one first", async () => {
    getUser.mockResolvedValue(linkedUser());
    getRegistrationsAcrossTournaments.mockResolvedValue(
      summary({ ownStevneId: 11, ownRegistrationId: 500 }),
    );
    const el = host();
    await renderSncInfo(el, { id: 10 });

    el.querySelector<HTMLButtonElement>(".snc-byt")!.click();
    await vi.waitFor(() => expect(registerForTournament).toHaveBeenCalled());
    expect(removeRegistration).toHaveBeenCalledWith(500);
    expect(registerForTournament).toHaveBeenCalledWith(12, 77);
  });

  it("closes registration on a venue that has already started", async () => {
    getUser.mockResolvedValue(linkedUser());
    getSncLocalTournaments.mockResolvedValue({
      data: [localRow(11, "Førde", { stevne_fase: "innledende" }), localRow(12, "Bergen")],
      error: null,
    });
    const el = host();
    await renderSncInfo(el, { id: 10 });

    const cards = [...el.querySelectorAll("#snc-locals .stevne-kort")];
    expect(cards[0]!.classList.contains("stevne-kort--live")).toBe(true);
    expect(cards[0]!.querySelector("button")).toBeNull();
    expect(cards[1]!.querySelector(".snc-meldpa")).not.toBeNull();
    expect(el.querySelectorAll(".snc-meldpa")).toHaveLength(1);
  });

  it("keeps the consolidate button disabled until every venue is finished", async () => {
    const el = host();
    await renderSncInfo(el, { id: 10, isAdmin: true });

    const button = el.querySelector<HTMLButtonElement>("#snc-complete-btn")!;
    expect(button.disabled).toBe(true);
  });

  it("consolidates the round once every venue is finished", async () => {
    getSncLocalTournaments.mockResolvedValue({
      data: [
        localRow(11, "Førde", { erfullfort: true }),
        localRow(12, "Bergen", { erfullfort: true }),
      ],
      error: null,
    });
    const el = host();
    await renderSncInfo(el, { id: 10, isAdmin: true });

    const button = el.querySelector<HTMLButtonElement>("#snc-complete-btn")!;
    expect(button.disabled).toBe(false);
    button.click();
    await vi.waitFor(() => expect(completeSncParent).toHaveBeenCalledWith(10));
  });

  it("offers reopening instead once the round is consolidated", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    const el = host();
    await renderSncInfo(el, { id: 10, isAdmin: true });

    expect(el.querySelector("#snc-complete-btn")).toBeNull();
    el.querySelector<HTMLButtonElement>("#snc-reopen-btn")!.click();
    await vi.waitFor(() => expect(reopenSncParent).toHaveBeenCalledWith(10));
  });

  it("hides the consolidation action from ordinary visitors", async () => {
    const el = host();
    await renderSncInfo(el, { id: 10 });

    expect(el.querySelector("#stevne-hero-handling")!.innerHTML).toBe("");
  });
});

describe("SNC consolidated result", () => {
  const consolidated = [
    {
      snc_plassering: 1,
      plassering: 1,
      nc_poeng: 75,
      poeng_xkast: 150,
      antall_ring_xkast: 15,
      poeng_kongelag: 55,
      antall_ring_kongelag: 5,
      kaster: { id: 3, fornavn: "Cato", etternavn: "C" },
      klubb: { navn: "Bergen" },
      stevne: { id: 12, navn: "SNC runde 1 – Bergen", sted: "Bergen", klubb: { navn: "Bergen" } },
    },
    {
      snc_plassering: 2,
      plassering: 1,
      nc_poeng: 64,
      poeng_xkast: 120,
      antall_ring_xkast: 12,
      poeng_kongelag: 60,
      antall_ring_kongelag: 6,
      kaster: { id: 1, fornavn: "Ada", etternavn: "A" },
      klubb: { navn: "Førde" },
      stevne: { id: 11, navn: "SNC runde 1 – Førde", sted: "Førde", klubb: { navn: "Førde" } },
    },
  ];

  it("waits for consolidation before showing a list", async () => {
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    expect(el.querySelector("table")).toBeNull();
    expect(el.textContent).toContain("konsolidert");
  });

  it("shows one merged list with the venue and both totals per thrower", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    const rows = [...el.querySelectorAll(".res-desktop-blokk tbody tr")];
    expect(rows).toHaveLength(2);
    expect(el.querySelector(".res-seksjon-tittel")?.textContent?.trim()).toBe(
      "Minimatch X-kast / Kongelag – 2 deltakarar",
    );
    // Kongelag 55 + carried-over X-kast (150 / 3) = 105 for the winner, 100 for 2nd
    expect(rows[0]!.textContent).toContain("105");
    expect(rows[1]!.textContent).toContain("100");
    expect(rows[0]!.textContent).toContain("Bergen");
  });

  it("groups the score columns under the method names, with Total on its own", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    const groups = [
      ...el.querySelectorAll(".res-desktop-blokk .res-thead-grupper .res-gruppe"),
    ].map((th) => [th.textContent?.trim(), th.getAttribute("colspan")]);
    // Poeng + ringar + overført under the innledende method, poeng + ringar under kongelag.
    expect(groups).toEqual([
      ["Minimatch X-kast", "3"],
      ["Kongelag", "2"],
    ]);

    const columns = [...el.querySelectorAll(".res-desktop-blokk .res-thead-columns th")].map((th) =>
      th.textContent?.trim(),
    );
    expect(columns).toEqual([
      "PL",
      "NAMN",
      "KLUBB",
      "POENG",
      "RINGAR",
      "OVERFØRT",
      "POENG",
      "RINGAR",
      "TOTAL",
      "NC",
      "PREMIE",
    ]);
    expect(el.querySelectorAll(".res-desktop-blokk tbody tr td.res-td-tot")).toHaveLength(2);
  });

  it("swaps the merged list for one local stevne's own when the filter picks it", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    const select = el.querySelector<HTMLSelectElement>("#snc-lokal-filter")!;
    expect([...select.options].map((o) => o.textContent)).toEqual([
      "Alle lokale stevne",
      "SNC runde 1 – Førde",
      "SNC runde 1 – Bergen",
    ]);
    expect(el.querySelectorAll("#snc-liste .res-desktop-blokk tbody tr")).toHaveLength(2);

    select.value = "12";
    select.dispatchEvent(new Event("change"));

    const list = el.querySelector("#snc-liste")!;
    const rows = [...list.querySelectorAll(".res-desktop-blokk tbody tr")];
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain("Cato");
    expect(el.querySelector("#snc-liste-tittel")?.textContent).toBe(
      "SNC runde 1 – Bergen – 1 deltakarar",
    );
    // The local view leads with the local placement, so PREMIE gives way to SNC PL.
    const columns = [...list.querySelectorAll(".res-thead-columns th")].map((th) =>
      th.textContent?.trim(),
    );
    expect(columns[columns.length - 1]).toBe("SNC PL");

    select.value = "";
    select.dispatchEvent(new Event("change"));
    expect(list.querySelectorAll(".res-desktop-blokk tbody tr")).toHaveLength(2);
    expect(el.querySelector("#snc-liste-tittel")?.textContent).toContain("2 deltakarar");
  });

  it("draws prizes for the percentage the admin gives, and marks the winners", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    premieDialog.mockResolvedValue({ prosent: 25 });
    drawSncPremiar.mockResolvedValue({ antal: 1, error: null });

    const el = host();
    const banner = document.createElement("div");
    document.body.appendChild(banner);
    await renderSncResults(el, { id: 10, isAdmin: true }, banner);

    banner.querySelector<HTMLButtonElement>("#snc-premie-btn")!.click();
    await vi.waitFor(() => expect(drawSncPremiar).toHaveBeenCalled());
    expect(drawSncPremiar).toHaveBeenCalledWith(10, { prosent: 25 });

    // The redraw picks up erpremie: the winner is marked, and a drawn round
    // offers the reset instead of letting the admin draw again on top.
    getSncConsolidatedResults.mockResolvedValue({
      data: [{ ...consolidated[0], erpremie: true }, consolidated[1]],
      error: null,
    });
    await renderSncResults(el, { id: 10, isAdmin: true }, banner);
    expect(banner.querySelector("#snc-premie-nullstill-btn")).not.toBeNull();

    // The marker lives in the merged table's own PREMIE column and, on mobile,
    // under the total — not beside the name.
    const winner = el.querySelector(".res-desktop-blokk tbody tr")!;
    expect(winner.querySelector("td.res-td-premie .res-premie")?.textContent).toBe("X");
    expect(winner.querySelector(".res-td-navn .res-premie")).toBeNull();
    expect(el.querySelector(".res-mobil-blokk .res-tot .res-premie")?.textContent).toBe("PREMIE");
    // A local stevne's own table has no prize column, so nothing is marked there.
    expect(el.querySelectorAll(".res-print-lokal .res-premie")).toHaveLength(0);
  });

  it("passes an exact prize count straight through when that is what was chosen", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    premieDialog.mockResolvedValue({ antal: 6 });
    drawSncPremiar.mockResolvedValue({ antal: 6, error: null });

    const el = host();
    const banner = document.createElement("div");
    document.body.appendChild(banner);
    await renderSncResults(el, { id: 10, isAdmin: true }, banner);

    banner.querySelector<HTMLButtonElement>("#snc-premie-btn")!.click();
    await vi.waitFor(() => expect(drawSncPremiar).toHaveBeenCalled());
    expect(drawSncPremiar).toHaveBeenCalledWith(10, { antal: 6 });
  });

  it("offers no reset until the round has drawn prizes", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });

    const el = host();
    const banner = document.createElement("div");
    document.body.appendChild(banner);
    await renderSncResults(el, { id: 10, isAdmin: true }, banner);

    expect(banner.querySelector("#snc-premie-btn")).not.toBeNull();
    expect(banner.querySelector("#snc-premie-nullstill-btn")).toBeNull();
  });

  it("keeps the prize draw out of the menu for a non-admin", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });

    const el = host();
    const banner = document.createElement("div");
    document.body.appendChild(banner);
    await renderSncResults(el, { id: 10 }, banner);

    expect(banner.querySelector("#snc-premie-btn")).toBeNull();
    expect(banner.querySelector("#snc-excel-btn")).not.toBeNull();
  });

  it("carries a print-only title and stevneinfo the screen keeps hidden", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    const block = el.querySelector(".res-print-blokk");
    expect(block?.querySelector(".res-print-tittel")?.textContent).toBe("SNC runde 1");
    const facts = [...block!.querySelectorAll(".res-print-fakta__par")].map((p) =>
      p.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(facts).toContain("Arrangør NHF");
    expect(facts).toContain("Deltakarar 2");
    expect(facts).toContain("Lokale stevne 2");
    // Tid and stad belong to the local stevner, not to the umbrella.
    expect(facts.some((f) => f?.startsWith("Tid"))).toBe(false);
    expect(facts.some((f) => f?.startsWith("Stad"))).toBe(false);
  });

  it("prints every local stevne separately, with its own tid, stad and placement", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({ data: consolidated, error: null });
    const el = host();
    await renderSncResults(el, { id: 10 });

    const blocks = [...el.querySelectorAll(".res-print-lokal")];
    expect(blocks.map((b) => b.querySelector(".res-print-undertittel")?.textContent)).toEqual([
      "SNC runde 1 – Førde",
      "SNC runde 1 – Bergen",
    ]);

    const forde = blocks[0]!;
    const facts = [...forde.querySelectorAll(".res-print-fakta__par")].map((p) =>
      p.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(facts).toContain("Tid 11:00");
    expect(facts).toContain("Stad Førde");
    expect(facts).toContain("Kontaktperson Ola Førde");
    expect(facts).toContain("Deltakarar 1");

    // A local table leads with the local placement and trails with the SNC one.
    const columns = [...forde.querySelectorAll(".res-thead-columns th")].map((th) =>
      th.textContent?.trim(),
    );
    expect(columns[0]).toBe("PL");
    expect(columns[columns.length - 1]).toBe("SNC PL");
    const cells = [...forde.querySelectorAll("tbody tr td")].map((td) => td.textContent?.trim());
    expect(cells[0]).toBe("1.");
    expect(cells[cells.length - 1]).toBe("2");
  });

  it("drops rows the consolidation has not placed", async () => {
    getSncParentTournament.mockResolvedValue({
      data: parentRow({ erfullfort: true }),
      error: null,
    });
    getSncConsolidatedResults.mockResolvedValue({
      data: [...consolidated, { ...consolidated[0], snc_plassering: null }],
      error: null,
    });
    const el = host();
    await renderSncResults(el, { id: 10 });

    expect(el.querySelectorAll(".res-desktop-blokk tbody tr")).toHaveLength(2);
  });
});

describe("settings tab on an SNC umbrella", () => {
  const METHODS = [
    { id: 1, navn: "Gloppen", er_innledende: true, er_avsluttende: false },
    { id: 3, navn: "Minimatch X-kast", er_innledende: true, er_avsluttende: false },
    { id: 6, navn: "Kongelag", er_innledende: false, er_avsluttende: true },
    { id: 7, navn: "Cup", er_innledende: false, er_avsluttende: true },
  ];

  function settings(overrides: Record<string, unknown> = {}) {
    return {
      id: 10,
      stevne_fase: null,
      antall_runder_innl: null,
      innledendekastemetodeid: 3,
      avsluttendekastemetodeid: 6,
      tilgjengelige_baner: null,
      er_snc_hovudstevne: true,
      snc_hovudstevne_id: null,
      ...overrides,
    };
  }

  function optionLabels(el: HTMLElement, selectId: string): string[] {
    return [...el.querySelectorAll<HTMLOptionElement>(`#${selectId} option`)]
      .map((o) => o.textContent ?? "")
      .filter((label) => !label.startsWith("—"));
  }

  beforeEach(() => {
    getActiveThrowingMethods.mockResolvedValue({ data: METHODS, error: null });
    getTournamentSettings.mockResolvedValue({ data: settings(), error: null });
  });

  it("keeps the edit button, so date and time stay reachable", async () => {
    const el = host();
    await renderSettings(el, { id: 10 });

    expect(el.querySelector("#rediger-stevne")).not.toBeNull();
  });

  it("offers only X-kast and Kongelag as methods", async () => {
    const el = host();
    await renderSettings(el, { id: 10 });

    expect(optionLabels(el, "innl-metode")).toEqual(["Minimatch X-kast"]);
    expect(optionLabels(el, "avsl-metode")).toEqual(["Kongelag"]);
  });

  it("drops the lane field and the reset button, which belong to a local stevne", async () => {
    const el = host();
    await renderSettings(el, { id: 10 });

    expect(el.querySelector("#tilgjengelege-banar")).toBeNull();
    expect(el.querySelector("#nullstill-btn")).toBeNull();
  });

  it("saves without a lane value", async () => {
    mocks.updateTournamentSettings.mockResolvedValue({ error: null });
    const el = host();
    await renderSettings(el, { id: 10 });

    el.querySelector<HTMLFormElement>("#innstillingar-form")!.dispatchEvent(
      new Event("submit", { cancelable: true }),
    );
    await vi.waitFor(() => expect(mocks.updateTournamentSettings).toHaveBeenCalled());
    expect(mocks.updateTournamentSettings).toHaveBeenCalledWith(10, {
      innledendekastemetodeid: 3,
      avsluttendekastemetodeid: 6,
      antall_runder_innl: null,
      tilgjengelige_baner: null,
    });
  });

  it("locks the method fields on a local stevne, pointing at the umbrella", async () => {
    getTournamentSettings.mockResolvedValue({
      data: settings({ er_snc_hovudstevne: false, snc_hovudstevne_id: 10 }),
      error: null,
    });
    const el = host();
    await renderSettings(el, { id: 11 });

    expect(el.querySelector<HTMLSelectElement>("#innl-metode")!.disabled).toBe(true);
    expect(el.querySelector<HTMLSelectElement>("#avsl-metode")!.disabled).toBe(true);
    expect(el.querySelector('a[href="#/stevne/10/innstillinger"]')).not.toBeNull();
    // Lanes stay editable: courts are generated per local stevne.
    expect(el.querySelector("#tilgjengelege-banar")).not.toBeNull();
  });

  it("keeps the inherited methods when a local stevne saves", async () => {
    mocks.updateTournamentSettings.mockResolvedValue({ error: null });
    getTournamentSettings.mockResolvedValue({
      data: settings({ er_snc_hovudstevne: false, snc_hovudstevne_id: 10 }),
      error: null,
    });
    const el = host();
    await renderSettings(el, { id: 11 });

    el.querySelector<HTMLInputElement>("#tilgjengelege-banar")!.value = "4";
    el.querySelector<HTMLFormElement>("#innstillingar-form")!.dispatchEvent(
      new Event("submit", { cancelable: true }),
    );
    await vi.waitFor(() => expect(mocks.updateTournamentSettings).toHaveBeenCalled());
    expect(mocks.updateTournamentSettings).toHaveBeenCalledWith(11, {
      innledendekastemetodeid: 3,
      avsluttendekastemetodeid: 6,
      antall_runder_innl: null,
      tilgjengelige_baner: 4,
    });
  });

  it("leaves an ordinary tournament's lane field and reset button in place", async () => {
    getTournamentSettings.mockResolvedValue({
      data: settings({ er_snc_hovudstevne: false, innledendekastemetodeid: 1 }),
      error: null,
    });
    const el = host();
    await renderSettings(el, { id: 10 });

    expect(el.querySelector("#tilgjengelege-banar")).not.toBeNull();
    expect(el.querySelector("#nullstill-btn")).not.toBeNull();
    expect(optionLabels(el, "innl-metode")).toEqual(["Gloppen", "Minimatch X-kast"]);
  });

  describe("Gloppen round cap hint", () => {
    function gloppenSettings(rounds: number | null) {
      return settings({
        er_snc_hovudstevne: false,
        innledendekastemetodeid: 1,
        antall_runder_innl: rounds,
      });
    }

    it("names the cap for the current field", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(4), error: null });
      mocks.getRegistrationCount.mockResolvedValue(10);
      const el = host();
      await renderSettings(el, { id: 10 });

      const help = el.querySelector<HTMLElement>("#rundar-hjelp")!;
      expect(help.classList.contains("d-none")).toBe(false);
      expect(help.textContent).toContain("Maks 5 rundar med 10 spelarar");
      expect(help.classList.contains("text-danger")).toBe(false);
    });

    it("flags a stored round count that is already over the cap", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(7), error: null });
      mocks.getRegistrationCount.mockResolvedValue(10);
      const el = host();
      await renderSettings(el, { id: 10 });

      const help = el.querySelector<HTMLElement>("#rundar-hjelp")!;
      expect(help.textContent).toContain("For mange rundar");
      expect(help.classList.contains("text-danger")).toBe(true);
    });

    it("counts par, not spelarar, on a lagbasert stevne", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(3), error: null });
      mocks.getRegistrationCount.mockResolvedValue(16);
      mocks.getPairCount.mockResolvedValue(8);
      const el = host();
      await renderSettings(el, { id: 10 });

      expect(el.querySelector("#rundar-hjelp")!.textContent).toContain("Maks 4 rundar med 8 par");
    });

    it("updates as the organiser types", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(4), error: null });
      mocks.getRegistrationCount.mockResolvedValue(10);
      const el = host();
      await renderSettings(el, { id: 10 });

      const input = el.querySelector<HTMLInputElement>("#antall-rundar")!;
      input.value = "9";
      input.dispatchEvent(new Event("input"));

      expect(el.querySelector("#rundar-hjelp")!.classList.contains("text-danger")).toBe(true);
    });

    it("shows the round count only for a round-based metode", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(4), error: null });
      const el = host();
      await renderSettings(el, { id: 10 });

      const field = el.querySelector<HTMLElement>("#rundar-felt")!;
      expect(field.classList.contains("d-none")).toBe(false);

      // Minimatch X-kast gets its omgangar from the kastemetode instead.
      const select = el.querySelector<HTMLSelectElement>("#innl-metode")!;
      select.value = "3";
      select.dispatchEvent(new Event("change"));

      expect(field.classList.contains("d-none")).toBe(true);
      expect(el.querySelector<HTMLInputElement>("#antall-rundar")!.value).toBe("");
    });

    it("stays hidden for a non-cascade metode", async () => {
      getTournamentSettings.mockResolvedValue({
        data: settings({ er_snc_hovudstevne: false }),
        error: null,
      });
      mocks.getRegistrationCount.mockResolvedValue(10);
      const el = host();
      await renderSettings(el, { id: 10 });

      expect(el.querySelector("#rundar-hjelp")!.classList.contains("d-none")).toBe(true);
    });

    it("falls back to the required-hint before anyone is påmeld", async () => {
      getTournamentSettings.mockResolvedValue({ data: gloppenSettings(4), error: null });
      const el = host();
      await renderSettings(el, { id: 10 });

      const help = el.querySelector<HTMLElement>("#rundar-hjelp")!;
      expect(help.classList.contains("d-none")).toBe(false);
      expect(help.textContent).not.toContain("Maks");
      expect(help.textContent).toContain("Påkravd");
    });
  });
});
