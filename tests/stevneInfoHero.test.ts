/**
 * The info tab's hero owns the stevne name and the one primary action. Which
 * button lands in that slot depends on who is looking, so that choice is what
 * these tests pin down — the shell drops its own header on this tab, and an
 * empty slot means a visitor gets no call to action at all.
 */

const mocks = vi.hoisted(() => ({
  getInfoTournament: vi.fn(),
  updateTournamentPhase: vi.fn(),
  getRegistrationCount: vi.fn(),
  getPairCount: vi.fn(),
  getUnconfirmedCount: vi.fn(),
  getMyRegistrationForTournament: vi.fn(),
  generateInitialRoundMatches: vi.fn(),
  createRegistrationButton: vi.fn(),
  getUser: vi.fn(),
  confirmDialog: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getInfoTournament: mocks.getInfoTournament,
  updateTournamentPhase: mocks.updateTournamentPhase,
}));
vi.mock("@/services/pameldingService", () => ({
  getRegistrationCount: mocks.getRegistrationCount,
  getPairCount: mocks.getPairCount,
  getUnconfirmedCount: mocks.getUnconfirmedCount,
  getMyRegistrationForTournament: mocks.getMyRegistrationForTournament,
}));
vi.mock("@/components/PameldingKnapp", () => ({
  createRegistrationButton: mocks.createRegistrationButton,
}));
vi.mock("@/services/kampGenereringInnledendeService", () => ({
  generateInitialRoundMatches: mocks.generateInitialRoundMatches,
}));
vi.mock("@/services/xkastKongelagService", () => ({ generateKongelagCourts: vi.fn() }));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));

import { render as renderInfo } from "@/pages/stevne/stevne-info";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    navn: "SNC - TEST",
    sted: "Årdalen",
    dato: "2026-08-06",
    tid: "12:00:00",
    stevne_fase: null,
    antall_runder_innl: null,
    erfullfort: false,
    klubbid: 1,
    tilgjengelige_baner: 4,
    snc_hovudstevne_id: null,
    kastemetodeInnl: { id: 5, navn: "Minimatch" },
    kastemetodeAvsl: { id: 6, navn: "Kongelag" },
    kategori: { erlagbasert: false, navn: "Singel" },
    stevnetype: { id: 3, navn: "SNC" },
    klubb: { id: 1, navn: "Skjold HK" },
    kontakt: { fornavn: "Trygve", etternavn: "Bolset" },
    ...overrides,
  };
}

/** A logged-in user whose profile is linked to a kaster. */
function linkedUser() {
  return { user: { id: "u1" }, profil: { kobling_status: "godkjent", kasterid: 77 } };
}

function slot(el: HTMLElement): HTMLElement {
  return el.querySelector<HTMLElement>("#stevne-hero-handling")!;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getInfoTournament.mockResolvedValue({ data: row(), error: null });
  mocks.getRegistrationCount.mockResolvedValue(0);
  mocks.getPairCount.mockResolvedValue(0);
  mocks.getMyRegistrationForTournament.mockResolvedValue({ data: null });
  mocks.getUser.mockResolvedValue(null);
  mocks.createRegistrationButton.mockImplementation(() => {
    const button = document.createElement("button");
    button.className = "pamelding-knapp";
    return button;
  });
});

describe("stevne-info hero", () => {
  it("leads with the name, the status and the key facts", async () => {
    const el = host();
    await renderInfo(el, { id: 5 });

    expect(el.querySelector(".stevne-hero__tittel")!.textContent).toBe("SNC - TEST");
    expect(el.querySelector(".stevne-hero__status")!.textContent).toBe("Ikkje starta");
    expect(el.querySelector(".stevne-hero__undertittel")!.textContent).toBe("SNC Singel · Årdalen");

    const facts = [...el.querySelectorAll(".stevne-hero__rute")].map((r) => r.textContent);
    expect(facts.join("|")).toContain("Type / kategori");
    expect(facts.join("|")).toContain("SNC Singel");
    expect(facts.join("|")).toContain("Minimatch");
    expect(facts.join("|")).toContain("Kongelag");
  });

  it("lists juryleiaren right after kontaktpersonen, and only when there is one", async () => {
    const el = host();
    await renderInfo(el, { id: 5 });

    const labels = [...el.querySelectorAll(".stevne-hero__detalj dt")].map((dt) => dt.textContent);
    expect(labels).not.toContain("Juryleiar");

    mocks.getInfoTournament.mockResolvedValue({
      data: row({ juryleder: "Kari Kasting" }),
      error: null,
    });
    await renderInfo(el, { id: 5 });

    const details = [...el.querySelectorAll(".stevne-hero__detalj")].map((d) =>
      d.textContent?.replace(/\s+/g, " ").trim(),
    );
    const kontakt = details.findIndex((d) => d?.startsWith("Kontaktperson"));
    expect(details[kontakt + 1]).toBe("Juryleiar Kari Kasting");
  });

  it("gives the admin Start stevne in the hero slot", async () => {
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    expect(slot(el).querySelector("#start-stevne-btn")).not.toBeNull();
  });

  it("gives a linked thrower the registration button in that same slot", async () => {
    mocks.getUser.mockResolvedValue(linkedUser());
    const el = host();
    await renderInfo(el, { id: 5 });

    expect(slot(el).querySelector(".pamelding-knapp")).not.toBeNull();
    expect(slot(el).querySelector("#start-stevne-btn")).toBeNull();
  });

  it("keeps Start stevne in the slot for an admin who is also entered", async () => {
    mocks.getUser.mockResolvedValue(linkedUser());
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    expect(slot(el).querySelector("#start-stevne-btn")).not.toBeNull();
    expect(el.querySelector("#info-handling-knapper .pamelding-knapp")).not.toBeNull();
  });

  it("refuses to start Gloppen with more rundar than the field can pair", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: 7, kastemetodeInnl: { id: 1, navn: "Gloppen" } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(10);
    mocks.getUnconfirmedCount.mockResolvedValue(0);
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    slot(el).querySelector<HTMLButtonElement>("#start-stevne-btn")!.click();
    await vi.waitFor(() => expect(mocks.showToast).toHaveBeenCalled());

    expect(mocks.showToast.mock.calls[0]![0]).toContain("maks 5 rundar");
    expect(mocks.generateInitialRoundMatches).not.toHaveBeenCalled();
  });

  it("starts Gloppen when the rundar sit on the cap", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: 5, kastemetodeInnl: { id: 1, navn: "Gloppen" } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(10);
    mocks.getUnconfirmedCount.mockResolvedValue(0);
    mocks.updateTournamentPhase.mockResolvedValue({ error: null });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    slot(el).querySelector<HTMLButtonElement>("#start-stevne-btn")!.click();
    await vi.waitFor(() => expect(mocks.generateInitialRoundMatches).toHaveBeenCalled());

    expect(mocks.generateInitialRoundMatches).toHaveBeenCalledWith(5, "Gloppen", 5, false);
  });

  it("leaves the slot empty for a visitor with nothing to do", async () => {
    const el = host();
    await renderInfo(el, { id: 5 });

    expect(slot(el).innerHTML).toBe("");
  });

  it("drops the start button once the stevne is running", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ stevne_fase: "innledende" }),
      error: null,
    });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    expect(slot(el).innerHTML).toBe("");
    expect(el.querySelector(".stevne-hero__status")!.textContent).toBe("Innleiande fase");
  });

  it("only lists antal rundar once it is set", async () => {
    const el = host();
    await renderInfo(el, { id: 5 });
    expect(el.querySelector(".stevne-hero__detaljar")!.textContent).not.toContain("Antal rundar");

    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: 3 }),
      error: null,
    });
    const withRounds = host();
    await renderInfo(withRounds, { id: 5 });
    expect(withRounds.querySelector(".stevne-hero__detaljar")!.textContent).toContain(
      "Antal rundar",
    );
  });
});
