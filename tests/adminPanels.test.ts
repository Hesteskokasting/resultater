/**
 * Renders the admin panels against mocked services and asserts what lands in the
 * DOM: which rows appear, what the filters do, and which service call each
 * action fires. The Supabase client is mocked away at the bottom of the graph so
 * nothing here touches the network.
 */

// vi.mock factories are hoisted above the module body, so the spies they close
// over have to be created in a hoisted block too.
const mocks = vi.hoisted(() => ({
  getScheduleTournaments: vi.fn(),
  getLiveTournaments: vi.fn(),
  getAllClubsForAdmin: vi.fn(),
  getActiveThrowerList: vi.fn(),
  getAllThrowerList: vi.fn(),
  getThrowersById: vi.fn(),
  getAllUsers: vi.fn(),
  getUserEmails: vi.fn(),
  updateUserRole: vi.fn(),
  getPendingLinks: vi.fn(),
  updateLinkStatus: vi.fn(),
  getPendingLinkCount: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getScheduleTournaments: mocks.getScheduleTournaments,
  getLiveTournaments: mocks.getLiveTournaments,
}));
vi.mock("@/services/klubbService", () => ({
  getAllClubsForAdmin: mocks.getAllClubsForAdmin,
  getClubs: vi.fn(),
}));
vi.mock("@/services/kasterService", () => ({
  getActiveThrowerList: mocks.getActiveThrowerList,
  getAllThrowerList: mocks.getAllThrowerList,
  getThrowersById: mocks.getThrowersById,
}));
vi.mock("@/services/adminService", () => ({
  getAllUsers: mocks.getAllUsers,
  getUserEmails: mocks.getUserEmails,
  updateUserRole: mocks.updateUserRole,
  getPendingLinks: mocks.getPendingLinks,
  updateLinkStatus: mocks.updateLinkStatus,
  getPendingLinkCount: mocks.getPendingLinkCount,
  getClubAdminUsers: vi.fn(),
  getClubAdminAssignments: vi.fn(),
  addClubAdminAccess: vi.fn(),
  removeClubAdminAccess: vi.fn(),
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));

const {
  getScheduleTournaments,
  getLiveTournaments,
  getAllClubsForAdmin,
  getActiveThrowerList,
  getThrowersById,
  getAllUsers,
  getUserEmails,
  updateUserRole,
  getPendingLinks,
  updateLinkStatus,
  getPendingLinkCount,
  getUser,
} = mocks;

import { render as renderAdmin } from "@/admin/admin";
import { render as renderClubs } from "@/admin/panels/klubbar";
import { render as renderRequests } from "@/admin/panels/forespurnader";
import { render as renderThrowers } from "@/admin/panels/utovarar";
import { render as renderTournaments } from "@/admin/panels/stevne";
import { render as renderUsers } from "@/admin/panels/brukarar";
import { createAdminRow } from "@/admin/_adminUi";

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.replaceChildren(el);
  return el;
}

function rowTitles(el: HTMLElement): string[] {
  return [...el.querySelectorAll(".admin-row__title")].map((n) => n.textContent ?? "");
}

function typeInSearch(el: HTMLElement, text: string): void {
  const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;
  input.value = text;
  input.dispatchEvent(new Event("input"));
}

const YEAR = new Date().getFullYear();

beforeEach(() => {
  vi.clearAllMocks();
  getLiveTournaments.mockResolvedValue({ data: [], error: null });
  getPendingLinkCount.mockResolvedValue(0);
  getUser.mockResolvedValue({ user: { email: "sjef@example.com" }, profil: null, clubs: [] });
});

describe("createAdminRow", () => {
  it("renders title, badges, joined meta and actions", () => {
    const row = createAdminRow({
      title: "Oslo Open",
      meta: ["Oslo HK", null, "Bislett"],
      badges: [{ text: "Fullført", tone: "ok" }],
      lead: { top: "LØR", bottom: "12" },
      actions: [{ label: "Rediger", href: "#/x" }],
    });

    expect(row.querySelector(".admin-row__title")?.textContent).toBe("Oslo Open");
    expect(row.querySelector(".admin-row__meta")?.textContent).toBe("Oslo HK · Bislett");
    expect(row.querySelector(".admin-badge--ok")?.textContent).toBe("Fullført");
    expect(row.querySelector(".admin-row__lead-bottom")?.textContent).toBe("12");
    expect(
      row.querySelector<HTMLAnchorElement>(".admin-row__actions a")?.getAttribute("href"),
    ).toBe("#/x");
  });

  it("treats a title as text, never as markup", () => {
    const row = createAdminRow({ title: "<img src=x onerror=alert(1)>" });
    expect(row.querySelector("img")).toBeNull();
    expect(row.querySelector(".admin-row__title")?.textContent).toBe(
      "<img src=x onerror=alert(1)>",
    );
  });

  it("fires onClick with its own button", () => {
    const onClick = vi.fn();
    const row = createAdminRow({ title: "X", actions: [{ label: "Lagre", onClick }] });
    const button = row.querySelector<HTMLButtonElement>(".admin-row__actions button")!;
    button.click();
    expect(onClick).toHaveBeenCalledWith(button);
  });
});

describe("stevne panel", () => {
  const rows = [
    {
      id: 1,
      navn: "Oslo Open",
      sted: "Bislett",
      dato: `${YEAR}-05-01`,
      ernm: false,
      erfullfort: true,
      stevne_fase: "avsluttende",
      klubb: { id: 1, navn: "Oslo HK" },
      stevnetype: { id: 1, navn: "DNC" },
      kategori: { id: 1, navn: "Singel" },
    },
    {
      id: 2,
      navn: "Bergen Cup",
      sted: "Bergen",
      dato: `${YEAR}-06-01`,
      ernm: true,
      erfullfort: false,
      stevne_fase: "innledende",
      klubb: { id: 2, navn: "Bergen HK" },
      stevnetype: null,
      kategori: null,
    },
  ];

  beforeEach(() => {
    getScheduleTournaments.mockResolvedValue({ data: rows, error: null });
  });

  it("lists tournaments with status badges and edit links", async () => {
    const el = host();
    await renderTournaments(el);

    expect(rowTitles(el)).toEqual(["Oslo Open", "Bergen Cup"]);
    expect(el.textContent).toContain("Fullført");
    expect(el.textContent).toContain("Innleiande");
    expect(el.textContent).toContain("NM");

    const hrefs = [...el.querySelectorAll<HTMLAnchorElement>("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("#/stevne/1/resultat");
    expect(hrefs).toContain("#/stevne/2/innledende");
    expect(hrefs).toContain("#/stevne/2/rediger");
    expect(hrefs).toContain("#/stevne/ny");
  });

  it("filters on name, place and club", async () => {
    const el = host();
    await renderTournaments(el);

    typeInSearch(el, "bergen hk");
    expect(rowTitles(el)).toEqual(["Bergen Cup"]);
    expect(el.querySelector(".admin-count")?.textContent).toBe(`1 av 2 stevne i ${YEAR}`);

    typeInSearch(el, "");
    expect(rowTitles(el)).toHaveLength(2);
  });

  it("reloads when the year changes", async () => {
    const el = host();
    await renderTournaments(el);
    getScheduleTournaments.mockClear();

    const select = el.querySelector<HTMLSelectElement>(".admin-select")!;
    select.value = String(YEAR - 1);
    select.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(getScheduleTournaments).toHaveBeenCalledWith(YEAR - 1));
  });

  it("shows an error banner when the query fails", async () => {
    getScheduleTournaments.mockResolvedValue({ data: [], error: new Error("nope") });
    const el = host();
    await renderTournaments(el);
    expect(el.querySelector(".error-banner")).not.toBeNull();
  });
});

describe("klubbar panel", () => {
  it("counts active members per club and marks inactive clubs", async () => {
    getAllClubsForAdmin.mockResolvedValue({
      data: [
        { id: 1, navn: "Oslo HK", kortnavn: "OHK", logourl: null, eraktiv: true },
        { id: 2, navn: "Gamle HK", kortnavn: "", logourl: null, eraktiv: false },
      ],
      error: null,
    });
    getActiveThrowerList.mockResolvedValue({
      data: [
        { id: 10, fornavn: "A", etternavn: "B", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
        { id: 11, fornavn: "C", etternavn: "D", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
      ],
      error: null,
    });

    const el = host();
    await renderClubs(el);

    expect(rowTitles(el)).toEqual(["Oslo HK", "Gamle HK"]);
    expect(el.textContent).toContain("2 aktive utøvarar");
    expect(el.textContent).toContain("0 aktive utøvarar");
    expect(el.querySelector(".admin-badge--muted")?.textContent).toBe("Inaktiv");
  });
});

describe("utovarar panel", () => {
  it("searches across name and club", async () => {
    getActiveThrowerList.mockResolvedValue({
      data: [
        {
          id: 1,
          fornavn: "Ola",
          etternavn: "Nordmann",
          eraktiv: true,
          klubb: { id: 1, navn: "Oslo HK" },
        },
        {
          id: 2,
          fornavn: "Kari",
          etternavn: "Vik",
          eraktiv: true,
          klubb: { id: 2, navn: "Bergen HK" },
        },
      ],
      error: null,
    });

    const el = host();
    await renderThrowers(el);
    expect(rowTitles(el)).toEqual(["Ola Nordmann", "Kari Vik"]);

    typeInSearch(el, "bergen");
    expect(rowTitles(el)).toEqual(["Kari Vik"]);
  });
});

describe("brukarar panel", () => {
  const users = [
    {
      id: "u1",
      rolle: "bruker",
      kobling_status: "godkjent",
      kobling_kasterid: null,
      kasterid: 5,
      opprettet_at: "2026-01-02T10:00:00Z",
    },
    {
      id: "u2",
      rolle: "admin",
      kobling_status: "ingen",
      kobling_kasterid: null,
      kasterid: null,
      opprettet_at: "2026-02-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    getAllUsers.mockResolvedValue({ data: users, error: null });
    getUserEmails.mockResolvedValue({
      data: [
        { id: "u1", epost: "ola@example.com" },
        { id: "u2", epost: "sjef@example.com" },
      ],
      error: null,
    });
    getThrowersById.mockResolvedValue({
      data: [{ id: 5, fornavn: "Ola", etternavn: "Nordmann", klubb: { navn: "Oslo HK" } }],
      error: null,
    });
    updateUserRole.mockResolvedValue({ error: null });
  });

  it("preselects each user's current role and saves a change", async () => {
    const el = host();
    await renderUsers(el);

    expect(rowTitles(el)).toEqual(["ola@example.com", "sjef@example.com"]);
    expect(el.textContent).toContain("Ola Nordmann");

    const firstRow = el.querySelector<HTMLElement>(".admin-row")!;
    const select = firstRow.querySelector<HTMLSelectElement>("select")!;
    expect(select.value).toBe("bruker");

    select.value = "klubbadmin";
    firstRow.querySelector<HTMLButtonElement>(".admin-row__actions button")!.click();
    await vi.waitFor(() => expect(updateUserRole).toHaveBeenCalledWith("u1", "klubbadmin"));
  });

  it("filters by role", async () => {
    const el = host();
    await renderUsers(el);

    const roleFilter = el.querySelector<HTMLSelectElement>(".admin-toolbar .admin-select")!;
    roleFilter.value = "admin";
    roleFilter.dispatchEvent(new Event("change"));

    expect(rowTitles(el)).toEqual(["sjef@example.com"]);
  });

  it("surfaces a write failure without losing the list", async () => {
    updateUserRole.mockResolvedValue({ error: { message: "ingen tilgang" } });
    const el = host();
    await renderUsers(el);

    // Toolbar filters live in module state and survive a re-render on purpose
    // (same as the public thrower list) — clear the previous test's role filter.
    const roleFilter = el.querySelector<HTMLSelectElement>(".admin-toolbar .admin-select")!;
    roleFilter.value = "alle";
    roleFilter.dispatchEvent(new Event("change"));

    el.querySelector<HTMLButtonElement>(".admin-row__actions button")!.click();
    await vi.waitFor(() => {
      expect(el.querySelector(".alert-danger")?.classList.contains("d-none")).toBe(false);
    });
    expect(el.querySelector(".alert-danger")?.textContent).toBe("ingen tilgang");
    expect(rowTitles(el)).toHaveLength(2);
  });
});

describe("forespurnader panel", () => {
  it("shows an empty state when nothing is pending", async () => {
    getPendingLinks.mockResolvedValue({ data: [], error: null });
    const el = host();
    await renderRequests(el);
    expect(el.querySelector(".empty-state")?.textContent).toBe("Ingen ventande forespørslar.");
  });

  it("approves with the requested thrower id and rejects with null", async () => {
    getPendingLinks.mockResolvedValue({
      data: [{ id: "u1", kobling_kasterid: 7 }],
      error: null,
    });
    getUserEmails.mockResolvedValue({ data: [{ id: "u1", epost: "ny@example.com" }], error: null });
    getThrowersById.mockResolvedValue({
      data: [{ id: 7, fornavn: "Ny", etternavn: "Spelar", klubb: { navn: "Oslo HK" } }],
      error: null,
    });
    updateLinkStatus.mockResolvedValue({ error: null });

    const el = host();
    await renderRequests(el);
    expect(el.textContent).toContain("Vil koblast til Ny Spelar");

    const [approve, reject] = [
      ...el.querySelectorAll<HTMLButtonElement>(".admin-row__actions button"),
    ];
    approve!.click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", 7, "godkjent"));

    updateLinkStatus.mockClear();
    getPendingLinks.mockResolvedValue({ data: [{ id: "u1", kobling_kasterid: 7 }], error: null });
    await renderRequests(el);
    const buttons = [...el.querySelectorAll<HTMLButtonElement>(".admin-row__actions button")];
    buttons[1]!.click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "avvist"));
    void reject;
  });
});

describe("admin shell", () => {
  beforeEach(() => {
    getScheduleTournaments.mockResolvedValue({ data: [], error: null });
  });

  it("renders every tab, marks the active one and deep-links each", async () => {
    const el = host();
    await renderAdmin(el, { tab: "stevne" });

    const links = [...el.querySelectorAll<HTMLAnchorElement>(".admin-nav .nav-link")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#/admin/oversikt",
      "#/admin/stevne",
      "#/admin/utovarar",
      "#/admin/klubbar",
      "#/admin/brukarar",
      "#/admin/forespurnader",
      "#/admin/tilgang",
    ]);
    expect(links.find((a) => a.classList.contains("active"))?.textContent).toBe("Stevne");
  });

  it("falls back to Oversikt for an unknown tab", async () => {
    getAllUsers.mockResolvedValue({ data: [], error: null });
    getActiveThrowerList.mockResolvedValue({ data: [], error: null });
    const el = host();
    await renderAdmin(el, { tab: "tullball" });

    const active = el.querySelector(".admin-nav .nav-link.active");
    expect(active?.textContent).toBe("Oversikt");
  });

  it("badges the requests tab with the pending count", async () => {
    getPendingLinkCount.mockResolvedValue(3);
    const el = host();
    await renderAdmin(el, { tab: "stevne" });
    expect(el.querySelector(".admin-nav__badge")?.textContent).toBe("3");
  });

  it("shows live tournaments above the tabs", async () => {
    getLiveTournaments.mockResolvedValue({
      data: [
        {
          id: 9,
          navn: "Live Cup",
          dato: `${YEAR}-08-01`,
          stevne_fase: "innledende",
          erfullfort: false,
        },
      ],
      error: null,
    });
    const el = host();
    await renderAdmin(el, { tab: "stevne" });

    const live = el.querySelector("#live-section");
    expect(live?.textContent).toContain("Live Cup");
    expect(live?.querySelector(".stevne-kort--live")).not.toBeNull();
  });
});
