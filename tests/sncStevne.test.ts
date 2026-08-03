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
  getRegistrationsAcrossTournaments: vi.fn(),
  registerForTournament: vi.fn(),
  removeRegistration: vi.fn(),
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
}));
vi.mock("@/services/resultatService", () => ({
  getSncConsolidatedResults: mocks.getSncConsolidatedResults,
}));
vi.mock("@/services/pameldingService", () => ({
  getRegistrationsAcrossTournaments: mocks.getRegistrationsAcrossTournaments,
  registerForTournament: mocks.registerForTournament,
  removeRegistration: mocks.removeRegistration,
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
  getRegistrationsAcrossTournaments,
  registerForTournament,
  removeRegistration,
  getUser,
  confirmDialog,
} = mocks;

import { render as renderSncInfo } from "@/pages/stevne/snc-info";
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
});

describe("SNC umbrella info tab", () => {
  it("lists every venue with its own registration count and total", async () => {
    const el = host();
    await renderSncInfo(el, { id: 10 });

    const text = el.textContent ?? "";
    expect(text).toContain("Førde");
    expect(text).toContain("Bergen");
    expect(text).toContain("0 av 2 lokale stevne fullført");

    const venueRows = [...el.querySelectorAll("#snc-locals tbody tr")];
    expect(venueRows).toHaveLength(2);
    expect(venueRows[0]!.textContent).toContain("3");
    expect(venueRows[1]!.textContent).toContain("2");
    // 3 + 2 registrations across the local stevner
    expect(el.querySelector(".card")?.textContent).toContain("5");
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

    expect(el.querySelectorAll(".snc-meldpa")).toHaveLength(1);
    expect(el.textContent).toContain("Stengt");
  });

  it("keeps the consolidate button disabled until every venue is finished", async () => {
    const el = host();
    const banner = document.createElement("div");
    await renderSncInfo(el, { id: 10, isAdmin: true }, banner);

    const button = banner.querySelector<HTMLButtonElement>("#snc-complete-btn")!;
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
    const banner = document.createElement("div");
    await renderSncInfo(el, { id: 10, isAdmin: true }, banner);

    const button = banner.querySelector<HTMLButtonElement>("#snc-complete-btn")!;
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
    const banner = document.createElement("div");
    await renderSncInfo(el, { id: 10, isAdmin: true }, banner);

    expect(banner.querySelector("#snc-complete-btn")).toBeNull();
    banner.querySelector<HTMLButtonElement>("#snc-reopen-btn")!.click();
    await vi.waitFor(() => expect(reopenSncParent).toHaveBeenCalledWith(10));
  });

  it("hides the admin banner from ordinary visitors", async () => {
    const el = host();
    const banner = document.createElement("div");
    await renderSncInfo(el, { id: 10 }, banner);

    expect(banner.innerHTML).toBe("");
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
