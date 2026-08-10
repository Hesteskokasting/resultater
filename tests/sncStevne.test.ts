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
}));
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
    expect(el.textContent).toContain("2 deltakarar frå 2 lokale stevne");
    // Kongelag 55 + carried-over X-kast (150 / 3) = 105 for the winner, 100 for 2nd
    expect(rows[0]!.textContent).toContain("105");
    expect(rows[1]!.textContent).toContain("100");
    expect(rows[0]!.textContent).toContain("Bergen");
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

  it("keeps the edit link, so date and time stay reachable", async () => {
    const el = host();
    await renderSettings(el, { id: 10 });

    expect(el.querySelector('a[href="#/stevne/10/rediger"]')).not.toBeNull();
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
