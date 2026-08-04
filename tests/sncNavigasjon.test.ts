/**
 * Which tabs a stevne shows (stevne.ts) and what the home page shows (home.ts)
 * when SNC is involved: an umbrella uses the same tab set as any other stevne but
 * only Info and Sluttresultat have content, and its local stevner are hidden from
 * the home page in favour of the umbrella itself.
 */

const mocks = vi.hoisted(() => ({
  getTournamentHeader: vi.fn(),
  getLatestResults: vi.fn(),
  getLiveTournaments: vi.fn(),
  getTournamentsByIds: vi.fn(),
  getUpcomingTournaments: vi.fn(),
  getRegistrationsForThrower: vi.fn(),
  isAdmin: vi.fn(),
  isClubAdmin: vi.fn(),
  getUser: vi.fn(),
  bindRegistrationSlots: vi.fn(),
  renderInfo: vi.fn(),
  renderParticipants: vi.fn(),
  renderPreliminary: vi.fn(),
  renderFinal: vi.fn(),
  renderSettings: vi.fn(),
  renderResults: vi.fn(),
  renderStats: vi.fn(),
  renderSncInfo: vi.fn(),
  renderSncResults: vi.fn(),
}));

function noRegistrations() {
  return { byTournament: new Map<number, number>(), sncParentIds: new Set<number>() };
}

/** Registered to a local stevne under `parentId`, never to the umbrella itself. */
function registeredUnder(parentId: number, localId: number, registrationId = 1) {
  return {
    byTournament: new Map<number, number>([[localId, registrationId]]),
    sncParentIds: new Set<number>([parentId]),
  };
}

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getTournamentHeader: mocks.getTournamentHeader,
  getLatestResults: mocks.getLatestResults,
  getLiveTournaments: mocks.getLiveTournaments,
  getTournamentsByIds: mocks.getTournamentsByIds,
  getUpcomingTournaments: mocks.getUpcomingTournaments,
  getRegistrationsForThrower: mocks.getRegistrationsForThrower,
  emptyThrowerRegistrations: () => noRegistrations(),
}));
vi.mock("@/services/authService", () => ({
  isAdmin: mocks.isAdmin,
  isClubAdmin: mocks.isClubAdmin,
  getUser: mocks.getUser,
}));
vi.mock("@/components/PameldingKnapp", () => ({
  bindRegistrationSlots: mocks.bindRegistrationSlots,
}));
vi.mock("@/pages/stevne/stevne-info", () => ({ render: mocks.renderInfo }));
vi.mock("@/pages/stevne/stevne-deltakere", () => ({ render: mocks.renderParticipants }));
vi.mock("@/pages/stevne/stevne-innledende", () => ({ render: mocks.renderPreliminary }));
vi.mock("@/pages/stevne/stevne-avsluttende", () => ({ render: mocks.renderFinal }));
vi.mock("@/pages/stevne/stevne-innstillinger", () => ({ render: mocks.renderSettings }));
vi.mock("@/pages/stevne/stevne-resultat", () => ({ render: mocks.renderResults }));
vi.mock("@/pages/stevne/stevne-stats", () => ({ render: mocks.renderStats }));
vi.mock("@/pages/stevne/snc-info", () => ({ render: mocks.renderSncInfo }));
vi.mock("@/pages/stevne/snc-resultat", () => ({ render: mocks.renderSncResults }));

const {
  getTournamentHeader,
  getLatestResults,
  getLiveTournaments,
  getTournamentsByIds,
  getUpcomingTournaments,
  getRegistrationsForThrower,
  isAdmin,
  isClubAdmin,
  getUser,
  renderInfo,
  renderResults,
  renderSncInfo,
  renderSncResults,
} = mocks;

import { render as renderTournamentPage } from "@/pages/stevne";
import { render as renderHome } from "@/pages/home";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

function tabLabels(el: HTMLElement): string[] {
  return [...el.querySelectorAll(".nav-link")].map((n) => n.textContent?.trim() ?? "");
}

function header(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    navn: "SNC runde 1",
    stevne_fase: null,
    erfullfort: false,
    avsluttendekastemetodeid: 6,
    er_snc_hovudstevne: false,
    snc_hovudstevne_id: null,
    kategori: { id: 1, navn: "Singel", erlagbasert: false },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  isAdmin.mockResolvedValue(false);
  isClubAdmin.mockResolvedValue(false);
  getUser.mockResolvedValue(null);
  getTournamentHeader.mockResolvedValue({ data: header(), error: null });
  getLatestResults.mockResolvedValue({ data: [], error: null });
  getLiveTournaments.mockResolvedValue({ data: [], error: null });
  getTournamentsByIds.mockResolvedValue({ data: [], error: null });
  getUpcomingTournaments.mockResolvedValue({ data: [], error: null });
  getRegistrationsForThrower.mockResolvedValue(noRegistrations());
});

describe("stevne tabs", () => {
  it("gives an ordinary tournament the usual tabs", async () => {
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "info" });

    expect(tabLabels(el)).toEqual(["Info", "Innl.", "Avsl.", "Stats"]);
    expect(renderInfo).toHaveBeenCalled();
  });

  it("leaves an SNC hovudstevne with Info only until it is consolidated", async () => {
    getTournamentHeader.mockResolvedValue({
      data: header({ er_snc_hovudstevne: true }),
      error: null,
    });
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "info" });

    expect(tabLabels(el)).toEqual(["Info"]); // not admin: Innstillingar is admin-only
    expect(renderSncInfo).toHaveBeenCalled();
    expect(renderInfo).not.toHaveBeenCalled();
  });

  it("keeps Innstillingar but drops the match tabs for an admin on a hovudstevne", async () => {
    isAdmin.mockResolvedValue(true);
    getTournamentHeader.mockResolvedValue({
      data: header({ er_snc_hovudstevne: true, erfullfort: true }),
      error: null,
    });
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "info" });

    expect(tabLabels(el)).toEqual(["Info", "Sluttresultat", "Innstillingar"]);
  });

  it("serves the ordinary settings tab on a hovudstevne", async () => {
    isAdmin.mockResolvedValue(true);
    getTournamentHeader.mockResolvedValue({
      data: header({ er_snc_hovudstevne: true }),
      error: null,
    });
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "innstillinger" });

    expect(mocks.renderSettings).toHaveBeenCalled();
    expect(renderSncInfo).not.toHaveBeenCalled();
  });

  it("still gives an admin every tab on an ordinary tournament", async () => {
    isAdmin.mockResolvedValue(true);
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "info" });

    expect(tabLabels(el)).toEqual([
      "Info",
      "Deltakere",
      "Innl.",
      "Avsl.",
      "Innstillingar",
      "Stats",
    ]);
  });

  it("serves the consolidated list on the hovudstevne's Sluttresultat tab", async () => {
    getTournamentHeader.mockResolvedValue({
      data: header({ er_snc_hovudstevne: true, erfullfort: true }),
      error: null,
    });
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "resultat" });

    expect(renderSncResults).toHaveBeenCalled();
    expect(renderResults).not.toHaveBeenCalled();
  });

  it("falls back to Info when a hidden tab is asked for directly", async () => {
    getTournamentHeader.mockResolvedValue({
      data: header({ er_snc_hovudstevne: true }),
      error: null,
    });
    const el = host();
    await renderTournamentPage(el, { id: 10, tab: "innledende" });

    expect(renderSncInfo).toHaveBeenCalled();
    expect(el.querySelector(".nav-link.active")?.textContent?.trim()).toBe("Info");
  });
});

describe("home page and SNC", () => {
  const linkedUser = {
    user: { id: "u1", email: "a@b.no" },
    profil: { role: "bruker", kasterid: 77, kobling_status: "godkjent" },
    clubs: [],
  };

  function upcoming(overrides: Record<string, unknown> = {}) {
    return {
      id: 100,
      navn: "SNC runde 1",
      dato: "2026-08-15",
      stevne_fase: null,
      erfullfort: false,
      er_snc_hovudstevne: false,
      ...overrides,
    };
  }

  it("shows the round once as live instead of one card per local tournament", async () => {
    getLiveTournaments.mockResolvedValue({
      data: [
        {
          id: 101,
          navn: "SNC runde 1 – Førde",
          dato: "2026-08-15",
          stevne_fase: "innledende",
          erfullfort: false,
          er_snc_hovudstevne: false,
          snc_hovudstevne_id: 100,
        },
        {
          id: 102,
          navn: "SNC runde 1 – Bergen",
          dato: "2026-08-15",
          stevne_fase: "innledende",
          erfullfort: false,
          er_snc_hovudstevne: false,
          snc_hovudstevne_id: 100,
        },
      ],
      error: null,
    });
    getTournamentsByIds.mockResolvedValue({
      data: [
        {
          id: 100,
          navn: "SNC runde 1",
          dato: "2026-08-15",
          stevne_fase: null,
          erfullfort: false,
          er_snc_hovudstevne: true,
          snc_hovudstevne_id: null,
        },
      ],
      error: null,
    });
    const el = host();
    await renderHome(el);

    expect(getTournamentsByIds).toHaveBeenCalledWith([100]);
    const liveCards = [...el.querySelectorAll("#live-section .stevne-kort")];
    expect(liveCards).toHaveLength(1);
    expect(liveCards[0]!.textContent).toContain("SNC runde 1");
    expect(liveCards[0]!.textContent).not.toContain("Førde");
    // The umbrella has no phase tabs, so the card must point at Info.
    expect(liveCards[0]!.querySelector("a")?.getAttribute("href")).toBe("#/stevne/100/info");
  });

  it("takes the Meld på button on an SNC round to the local-tournament picker", async () => {
    getUser.mockResolvedValue(linkedUser);
    getUpcomingTournaments.mockResolvedValue({
      data: [upcoming({ er_snc_hovudstevne: true })],
      error: null,
    });
    const el = host();
    await renderHome(el);

    const action = el.querySelector<HTMLAnchorElement>(".homepage-upcoming a.btn")!;
    expect(action.textContent).toBe("Meld på");
    expect(action.getAttribute("href")).toBe("#/stevne/100/info");
    expect(el.querySelector("[data-registration-slot]")).toBeNull();
  });

  it("reports Påmeldt on an SNC round the thrower already joined through a local stevne", async () => {
    getUser.mockResolvedValue(linkedUser);
    getUpcomingTournaments.mockResolvedValue({
      data: [upcoming({ er_snc_hovudstevne: true })],
      error: null,
    });
    getRegistrationsForThrower.mockResolvedValue(registeredUnder(100, 101));
    const el = host();
    await renderHome(el);

    const action = el.querySelector<HTMLAnchorElement>(".homepage-upcoming a.btn")!;
    expect(action.textContent).toBe("Påmeldt");
    expect(action.className).toContain("btn-outline-secondary");
    // Still reachable: the umbrella page is where they switch local stevne or withdraw.
    expect(action.getAttribute("href")).toBe("#/stevne/100/info");
  });

  it("keeps the ordinary registration button on a non-SNC tournament", async () => {
    getUser.mockResolvedValue(linkedUser);
    getUpcomingTournaments.mockResolvedValue({ data: [upcoming()], error: null });
    const el = host();
    await renderHome(el);

    expect(el.querySelector(".homepage-upcoming a.btn")).toBeNull();
    expect(mocks.bindRegistrationSlots).toHaveBeenCalled();
  });
});
