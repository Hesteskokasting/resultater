/**
 * The info tab's hero owns the stevne name and the one primary action. Which
 * button lands in that slot depends on who is looking, so that choice is what
 * these tests pin down — the shell drops its own header on this tab, and the
 * slot is only ever empty when there is genuinely nothing for the viewer to do.
 */

const mocks = vi.hoisted(() => ({
  getInfoTournament: vi.fn(),
  startTournament: vi.fn(),
  setInitialRoundCount: vi.fn(),
  getInfoMatchSummary: vi.fn(),
  getRegistrationCount: vi.fn(),
  getPairCount: vi.fn(),
  getUnconfirmedCount: vi.fn(),
  getMyRegistrationForTournament: vi.fn(),
  createRegistrationButton: vi.fn(),
  getUser: vi.fn(),
  confirmDialog: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getInfoTournament: mocks.getInfoTournament,
  startTournament: mocks.startTournament,
  setInitialRoundCount: mocks.setInitialRoundCount,
  getInfoMatchSummary: mocks.getInfoMatchSummary,
}));
vi.mock("@/services/pameldingService", () => ({
  getRegistrationCount: mocks.getRegistrationCount,
  getPairCount: mocks.getPairCount,
  getUnconfirmedCount: mocks.getUnconfirmedCount,
  getMyRegistrationForTournament: mocks.getMyRegistrationForTournament,
}));
vi.mock("@/components/stevne/RegistrationButton", () => ({
  createRegistrationButton: mocks.createRegistrationButton,
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/components/dialog/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
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
  mocks.getInfoMatchSummary.mockResolvedValue({
    initialRounds: 0,
    hasFinalMatches: false,
    groupSizes: {},
  });
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

  it("spares an unlinked admin the koble-profil nudge beside Start stevne", async () => {
    mocks.getUser.mockResolvedValue({
      user: { id: "a1" },
      profil: { role: "admin", kasterid: null, kobling_status: "ingen" },
    });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    expect(slot(el).querySelector("#start-stevne-btn")).not.toBeNull();
    expect(el.querySelector('#info-handling-knapper a[href^="#/minside"]')).toBeNull();
  });

  it("refuses to start Gloppen with more rundar than the field can pair, and says so before the click", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: 7, kastemetodeInnl: { id: 1, navn: "Gloppen" } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(10);
    mocks.getUnconfirmedCount.mockResolvedValue(0);
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    const startBtn = slot(el).querySelector<HTMLButtonElement>("#start-stevne-btn")!;
    expect(startBtn.disabled).toBe(true);
    expect(slot(el).querySelector(".stevne-start-hindring")!.textContent).toContain(
      "maks 5 rundar",
    );

    startBtn.click();
    expect(mocks.startTournament).not.toHaveBeenCalled();
  });

  it("starts Gloppen when the rundar sit on the cap", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: 5, kastemetodeInnl: { id: 1, navn: "Gloppen" } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(10);
    mocks.getUnconfirmedCount.mockResolvedValue(0);
    mocks.startTournament.mockResolvedValue({ error: null, step: null, phase: "innledende" });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });

    slot(el).querySelector<HTMLButtonElement>("#start-stevne-btn")!.click();
    await vi.waitFor(() => expect(mocks.startTournament).toHaveBeenCalled());

    expect(mocks.startTournament).toHaveBeenCalledWith({
      stevneid: 5,
      methodName: "Gloppen",
      roundCount: 5,
      isTeam: false,
      isStandaloneKongelag: false,
    });
  });

  it("invites a signed-out visitor to log in instead of leaving the slot empty", async () => {
    const el = host();
    await renderInfo(el, { id: 5 });

    const cta = slot(el).querySelector("a")!;
    expect(cta.textContent).toBe("Logg inn for å melde på");
    expect(cta.getAttribute("href")).toBe("#/logginn?redirect=%2Fstevne%2F5%2Finfo");
  });

  it("asks an unlinked account to link a profile rather than to log in again", async () => {
    mocks.getUser.mockResolvedValue({ user: { id: "u1" }, profil: { kobling_status: "ingen" } });
    const el = host();
    await renderInfo(el, { id: 5 });

    const cta = slot(el).querySelector("a")!;
    expect(cta.textContent).toBe("Koble profil for å melde på");
    expect(cta.getAttribute("href")).toBe("#/minside/kampar");
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

  function roundOptions(el: HTMLElement): string[] {
    return [...el.querySelectorAll<HTMLOptionElement>("#info-rundar option")].map((o) => o.value);
  }

  it("keeps both right-hand tiles even when the metodar have nothing to show", async () => {
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });
    const right = [
      ...el.querySelectorAll(".stevne-hero__par > .stevne-hero__rute + .stevne-hero__rute"),
    ];
    expect(right.map((r) => r.textContent!.replace(/\s+/g, ""))).toEqual(["Rundar—", "Info—"]);
    expect(el.querySelector("#info-rundar")).toBeNull();
  });

  it("lets an organiser pick and clear the rundar, unblocking the start button", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ antall_runder_innl: null, kastemetodeInnl: { id: 1, navn: "Gloppen" } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(4);
    mocks.setInitialRoundCount.mockResolvedValue({ error: null });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });
    const startBtn = () => slot(el).querySelector<HTMLButtonElement>("#start-stevne-btn")!;
    expect(startBtn().disabled).toBe(true);

    // 4 spelarar caps Gloppen at 2 rundar.
    expect(roundOptions(el)).toEqual(["", "1", "2"]);

    const select = el.querySelector<HTMLSelectElement>("#info-rundar")!;
    select.value = "2";
    select.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(mocks.setInitialRoundCount).toHaveBeenCalledWith(5, 2));
    await vi.waitFor(() => expect(startBtn().disabled).toBe(false));

    select.value = "";
    select.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(mocks.setInitialRoundCount).toHaveBeenCalledWith(5, null));
    await vi.waitFor(() => expect(startBtn().disabled).toBe(true));
  });

  it("keeps NHM rundar adjustable mid-innleiande, never below what is generated", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({
        stevne_fase: "innledende",
        antall_runder_innl: 5,
        kastemetodeInnl: { id: 2, navn: "Nordhordlandsmetoden" },
      }),
      error: null,
    });
    mocks.getInfoMatchSummary.mockResolvedValue({
      initialRounds: 3,
      hasFinalMatches: false,
      groupSizes: {},
    });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });
    expect(roundOptions(el)).toEqual(["3", "4", "5", "6", "7", "8", "9", "10"]);
  });

  it("locks the rundar once Gloppen has started", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({
        stevne_fase: "innledende",
        antall_runder_innl: 4,
        kastemetodeInnl: { id: 1, navn: "Gloppen" },
      }),
      error: null,
    });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });
    expect(el.querySelector("#info-rundar")).toBeNull();
    expect(el.querySelector(".stevne-hero__par")!.textContent).toContain("4");
  });

  it("shows the cup gruppefordeling next to the avsluttande metode", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({ kastemetodeAvsl: { id: 7, navn: "Cup" }, runde1_format: { nA: 9 } }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(15);
    const el = host();
    await renderInfo(el, { id: 5 });
    expect(el.querySelectorAll(".stevne-hero__par")[1]!.textContent).toContain("A: 9 - B: 6");
    expect(el.querySelector('a[href="#/stevne/5/avsluttende?fra=info"]')).toBeNull();

    await renderInfo(el, { id: 5, isAdmin: true });
    expect(el.querySelector('a[href="#/stevne/5/avsluttende?fra=info"]')!.textContent).toBe(
      "Endre gruppefordeling",
    );
  });

  it("prefers the assigned grupper and drops the link once the cup has kampar", async () => {
    mocks.getInfoTournament.mockResolvedValue({
      data: row({
        stevne_fase: "avsluttende",
        kastemetodeAvsl: { id: 7, navn: "Cup" },
        runde1_format: { nA: 9 },
      }),
      error: null,
    });
    mocks.getRegistrationCount.mockResolvedValue(16);
    mocks.getInfoMatchSummary.mockResolvedValue({
      initialRounds: 0,
      hasFinalMatches: true,
      groupSizes: { A: 8, B: 8 },
    });
    const el = host();
    await renderInfo(el, { id: 5, isAdmin: true });
    expect(el.querySelectorAll(".stevne-hero__par")[1]!.textContent).toContain("A: 8 - B: 8");
    expect(el.querySelector('a[href="#/stevne/5/avsluttende?fra=info"]')).toBeNull();
  });
});
