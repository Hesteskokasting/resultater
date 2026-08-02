/**
 * Renders the admin panels against mocked services and asserts what lands in the
 * DOM: the key figures, the detail on each row, what the filters do, and that the
 * create/edit actions open the overlay instead of navigating away. Chart.js and
 * the Supabase client are mocked out — neither works under happy-dom.
 */

// vi.mock factories are hoisted above the module body, so the spies they close
// over have to be created in a hoisted block too.
const mocks = vi.hoisted(() => ({
  getScheduleTournaments: vi.fn(),
  getLiveTournaments: vi.fn(),
  getAllClubsForAdmin: vi.fn(),
  getThrowerAdminList: vi.fn(),
  getThrowersById: vi.fn(),
  getRegistrationCountsForTournaments: vi.fn(),
  getAllUsers: vi.fn(),
  getUserEmails: vi.fn(),
  updateUserRole: vi.fn(),
  getPendingLinks: vi.fn(),
  updateLinkStatus: vi.fn(),
  getPendingLinkCount: vi.fn(),
  getUser: vi.fn(),
  deleteUserAccount: vi.fn(),
  confirmDialog: vi.fn(),
  showToast: vi.fn(),
  openTournamentEditor: vi.fn(),
  openThrowerEditor: vi.fn(),
  openClubEditor: vi.fn(),
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
  getThrowerAdminList: mocks.getThrowerAdminList,
  getThrowersById: mocks.getThrowersById,
}));
vi.mock("@/services/adminStatsService", () => ({
  getRegistrationCountsForTournaments: mocks.getRegistrationCountsForTournaments,
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
vi.mock("@/services/accountService", () => ({ deleteUserAccount: mocks.deleteUserAccount }));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));
vi.mock("@/admin/_adminCharts", () => ({
  drawBarChart: vi.fn(),
  drawLineChart: vi.fn(),
  drawShareBar: vi.fn(),
  seriesColor: () => "#2a78d6",
  destroyAdminCharts: vi.fn(),
}));
vi.mock("@/admin/_adminEdit", () => ({
  openTournamentEditor: mocks.openTournamentEditor,
  openThrowerEditor: mocks.openThrowerEditor,
  openClubEditor: mocks.openClubEditor,
}));

const {
  getScheduleTournaments,
  getLiveTournaments,
  getAllClubsForAdmin,
  getThrowerAdminList,
  getThrowersById,
  getRegistrationCountsForTournaments,
  getAllUsers,
  getUserEmails,
  updateUserRole,
  getPendingLinks,
  updateLinkStatus,
  getPendingLinkCount,
  getUser,
  deleteUserAccount,
  confirmDialog,
  openTournamentEditor,
  openThrowerEditor,
  openClubEditor,
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

function tileValue(el: HTMLElement, label: string): string | undefined {
  const tile = [...el.querySelectorAll<HTMLElement>(".admin-stat")].find(
    (t) => t.querySelector(".admin-stat__label")?.textContent === label,
  );
  return tile?.querySelector(".admin-stat__value")?.textContent ?? undefined;
}

function typeInSearch(el: HTMLElement, text: string): void {
  const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;
  input.value = text;
  input.dispatchEvent(new Event("input"));
}

function selectByLabel(el: HTMLElement, label: string): HTMLSelectElement {
  return el.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
}

function choose(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event("change"));
}

/** Clicks the action button with the given label in row `index`. */
function clickAction(el: HTMLElement, index: number, label: string): void {
  const row = [...el.querySelectorAll<HTMLElement>(".admin-row")][index]!;
  const button = [...row.querySelectorAll<HTMLButtonElement>(".admin-row__actions button")].find(
    (b) => b.textContent === label,
  )!;
  button.click();
}

const YEAR = new Date().getFullYear();

beforeEach(() => {
  vi.clearAllMocks();
  getLiveTournaments.mockResolvedValue({ data: [], error: null });
  getPendingLinkCount.mockResolvedValue(0);
  getUser.mockResolvedValue({
    user: { id: "u2", email: "sjef@example.com" },
    profil: null,
    clubs: [],
  });
  getRegistrationCountsForTournaments.mockResolvedValue(new Map());
  getThrowerAdminList.mockResolvedValue({ data: [], error: null });
  getScheduleTournaments.mockResolvedValue({ data: [], error: null });
  getAllClubsForAdmin.mockResolvedValue({ data: [], error: null });
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
      tid: "11:00:00",
      ernm: false,
      erfullfort: true,
      stevne_fase: "avsluttende",
      resultaturl: "https://example.com/res.pdf",
      klubb: { id: 1, navn: "Oslo HK" },
      stevnetype: { id: 1, navn: "DNC" },
      kategori: { id: 1, navn: "Singel" },
      innledende: { id: 1, navn: "X-kast" },
      avsluttende: { id: 2, navn: "Cup" },
    },
    {
      id: 2,
      navn: "Bergen Cup",
      sted: "Bergen",
      dato: `${YEAR}-06-01`,
      tid: null,
      ernm: true,
      erfullfort: false,
      stevne_fase: "innledende",
      resultaturl: null,
      klubb: { id: 2, navn: "Bergen HK" },
      stevnetype: null,
      kategori: null,
      innledende: null,
      avsluttende: null,
    },
    {
      id: 3,
      navn: "Trondheim Open",
      sted: null,
      dato: `${YEAR}-12-24`,
      tid: null,
      ernm: false,
      erfullfort: false,
      stevne_fase: null,
      resultaturl: null,
      klubb: { id: 2, navn: "Bergen HK" },
      stevnetype: null,
      kategori: null,
      innledende: null,
      avsluttende: null,
    },
  ];

  beforeEach(() => {
    getScheduleTournaments.mockResolvedValue({ data: rows, error: null });
    getRegistrationCountsForTournaments.mockResolvedValue(
      new Map([
        [1, 24],
        [2, 12],
      ]),
    );
  });

  it("leads with key figures for the selected year", async () => {
    const el = host();
    await renderTournaments(el);

    expect(tileValue(el, `Stevne i ${YEAR}`)).toBe("3");
    expect(tileValue(el, "Fullført")).toBe("1");
    expect(tileValue(el, "Pågåande")).toBe("1");
    expect(tileValue(el, "Påmeldingar")).toBe("36");
    expect(tileValue(el, "Snitt påmelde")).toBe("18");
  });

  it("asks for registration counts for exactly the listed tournaments", async () => {
    const el = host();
    await renderTournaments(el);
    expect(getRegistrationCountsForTournaments).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("shows per-row detail beyond what the terminliste carries", async () => {
    const el = host();
    await renderTournaments(el);

    const first = el.querySelector(".admin-row")!;
    const meta = first.querySelector(".admin-row__meta")?.textContent ?? "";
    expect(meta).toContain("Oslo HK");
    expect(meta).toContain("11:00");
    expect(meta).toContain("DNC · Singel");
    expect(meta).toContain("X-kast → Cup");
    expect(meta).toContain("24 påmelde");
    expect(first.textContent).toContain("PDF");
  });

  it("filters by status as well as by text", async () => {
    const el = host();
    await renderTournaments(el);

    choose(selectByLabel(el, "Filtrer på status"), "pagaar");
    expect(rowTitles(el)).toEqual(["Bergen Cup"]);

    choose(selectByLabel(el, "Filtrer på status"), "alle");
    typeInSearch(el, "bergen hk");
    expect(rowTitles(el)).toEqual(["Bergen Cup", "Trondheim Open"]);

    typeInSearch(el, "");
    expect(rowTitles(el)).toHaveLength(3);
  });

  it("edits and creates through the overlay, never by navigating", async () => {
    const el = host();
    await renderTournaments(el);

    clickAction(el, 0, "Rediger");
    expect(openTournamentEditor).toHaveBeenCalledWith(1, expect.any(Function));

    el.querySelector<HTMLButtonElement>(".admin-toolbar button")!.click();
    expect(openTournamentEditor).toHaveBeenLastCalledWith(undefined, expect.any(Function));

    // No create/edit link may point away from the dashboard.
    const hrefs = [...el.querySelectorAll<HTMLAnchorElement>("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).not.toContain("#/stevne/ny");
    expect(hrefs).not.toContain("#/stevne/1/rediger");
    expect(hrefs).toContain("#/stevne/1/resultat");
  });

  it("reloads when the year changes", async () => {
    const el = host();
    await renderTournaments(el);
    getScheduleTournaments.mockClear();

    choose(selectByLabel(el, "Vel år"), String(YEAR - 1));
    await vi.waitFor(() => expect(getScheduleTournaments).toHaveBeenCalledWith(YEAR - 1));
  });

  it("shows an error banner when the query fails", async () => {
    getScheduleTournaments.mockResolvedValue({ data: [], error: new Error("nope") });
    const el = host();
    await renderTournaments(el);
    expect(el.querySelector(".error-banner")).not.toBeNull();
  });
});

describe("utovarar panel", () => {
  const throwers = [
    {
      id: 1,
      fornavn: "Ola",
      etternavn: "Nordmann",
      eraktiv: true,
      medlemsnummer: 1234,
      epost: "ola@example.com",
      telefon: null,
      klubbid: 1,
      klubb: { id: 1, navn: "Oslo HK" },
      klasse: { id: 1, navn: "Senior" },
      kjonn: { id: 1, navn: "Mann" },
    },
    {
      id: 2,
      fornavn: "Kari",
      etternavn: "Vik",
      eraktiv: true,
      medlemsnummer: null,
      epost: null,
      telefon: null,
      klubbid: 2,
      klubb: { id: 2, navn: "Bergen HK" },
      klasse: { id: 2, navn: "Junior" },
      kjonn: { id: 2, navn: "Kvinne" },
    },
    {
      id: 3,
      fornavn: "Per",
      etternavn: "Utan",
      eraktiv: false,
      medlemsnummer: null,
      epost: null,
      telefon: null,
      klubbid: null,
      klubb: null,
      klasse: null,
      kjonn: { id: 1, navn: "Mann" },
    },
  ];

  beforeEach(() => {
    getThrowerAdminList.mockResolvedValue({ data: throwers, error: null });
  });

  it("summarises the roster before the list", async () => {
    const el = host();
    await renderThrowers(el);

    expect(tileValue(el, "Utøvarar totalt")).toBe("3");
    expect(tileValue(el, "Inaktive")).toBe("1");
    expect(tileValue(el, "Klubbar representert")).toBe("2");
    expect(tileValue(el, "Utan klubb")).toBe("1");
    expect(tileValue(el, "Med kontaktinfo")).toBe("1");
    expect(tileValue(el, "Med medlemsnr.")).toBe("1");
  });

  it("shows class, gender, member number and contact per row", async () => {
    const el = host();
    await renderThrowers(el);

    const first = el.querySelector(".admin-row")!;
    expect(first.textContent).toContain("Senior");
    const meta = first.querySelector(".admin-row__meta")?.textContent ?? "";
    expect(meta).toContain("Oslo HK");
    expect(meta).toContain("Mann");
    expect(meta).toContain("Medlemsnr. 1234");
    expect(meta).toContain("ola@example.com");
  });

  it("scopes to active by default and can show only inactive", async () => {
    const el = host();
    await renderThrowers(el);
    expect(rowTitles(el)).toEqual(["Ola Nordmann", "Kari Vik"]);

    choose(selectByLabel(el, "Vis utøvarar"), "inaktive");
    expect(rowTitles(el)).toEqual(["Per Utan"]);

    choose(selectByLabel(el, "Vis utøvarar"), "alle");
    expect(rowTitles(el)).toHaveLength(3);
  });

  it("offers a club filter built from the data", async () => {
    const el = host();
    await renderThrowers(el);

    const clubFilter = selectByLabel(el, "Filtrer på klubb");
    expect([...clubFilter.options].map((o) => o.textContent)).toEqual([
      "Alle klubbar",
      "Bergen HK",
      "Oslo HK",
    ]);

    choose(clubFilter, "2");
    expect(rowTitles(el)).toEqual(["Kari Vik"]);
    choose(clubFilter, "alle");
  });

  it("searches name, club, e-post and member number", async () => {
    const el = host();
    await renderThrowers(el);

    typeInSearch(el, "1234");
    expect(rowTitles(el)).toEqual(["Ola Nordmann"]);

    typeInSearch(el, "bergen");
    expect(rowTitles(el)).toEqual(["Kari Vik"]);
    typeInSearch(el, "");
  });

  it("edits and creates through the overlay", async () => {
    const el = host();
    await renderThrowers(el);

    clickAction(el, 0, "Rediger");
    expect(openThrowerEditor).toHaveBeenCalledWith(1, expect.any(Function));

    el.querySelector<HTMLButtonElement>(".admin-toolbar button")!.click();
    expect(openThrowerEditor).toHaveBeenLastCalledWith(undefined, expect.any(Function));
  });
});

describe("klubbar panel", () => {
  beforeEach(() => {
    getAllClubsForAdmin.mockResolvedValue({
      data: [
        { id: 1, navn: "Oslo HK", kortnavn: "OHK", logourl: "http://x/logo.png", eraktiv: true },
        { id: 2, navn: "Gamle HK", kortnavn: "", logourl: null, eraktiv: false },
      ],
      error: null,
    });
    getThrowerAdminList.mockResolvedValue({
      data: [
        { id: 10, fornavn: "A", etternavn: "B", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
        { id: 11, fornavn: "C", etternavn: "D", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
        { id: 12, fornavn: "E", etternavn: "F", eraktiv: false, klubb: { id: 1, navn: "Oslo HK" } },
      ],
      error: null,
    });
    getScheduleTournaments.mockResolvedValue({
      data: [{ id: 1, navn: "Oslo Open", klubb: { id: 1, navn: "Oslo HK" } }],
      error: null,
    });
  });

  it("summarises the club register", async () => {
    const el = host();
    await renderClubs(el);

    expect(tileValue(el, "Klubbar totalt")).toBe("2");
    expect(tileValue(el, "Inaktive")).toBe("1");
    expect(tileValue(el, "Utan utøvarar")).toBe("1");
    expect(tileValue(el, "Snitt utøvarar")).toBe("1");
    expect(tileValue(el, `Arrangørar i ${YEAR}`)).toBe("1");
    expect(tileValue(el, "Største klubb")).toBe("2");
  });

  it("shows members, inactive members, hosting and logo state per row", async () => {
    const el = host();
    await renderClubs(el);

    const first = el.querySelector(".admin-row")!;
    const meta = first.querySelector(".admin-row__meta")?.textContent ?? "";
    expect(meta).toContain("OHK");
    expect(meta).toContain("2 aktive utøvarar");
    expect(meta).toContain("1 inaktive");
    expect(meta).toContain("Har logo");
    expect(first.textContent).toContain("1 stevne i år");

    const second = [...el.querySelectorAll(".admin-row")][1]!;
    expect(second.textContent).toContain("Inaktiv");
    expect(second.querySelector(".admin-row__meta")?.textContent).toContain("Manglar logo");
  });

  it("filters to clubs without throwers", async () => {
    const el = host();
    await renderClubs(el);

    choose(selectByLabel(el, "Vis klubbar"), "tomme");
    expect(rowTitles(el)).toEqual(["Gamle HK"]);
    choose(selectByLabel(el, "Vis klubbar"), "alle");
  });

  it("edits and creates through the overlay", async () => {
    const el = host();
    await renderClubs(el);

    clickAction(el, 0, "Rediger");
    expect(openClubEditor).toHaveBeenCalledWith(1, expect.any(Function));

    el.querySelector<HTMLButtonElement>(".admin-toolbar button")!.click();
    expect(openClubEditor).toHaveBeenLastCalledWith(undefined, expect.any(Function));
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

    choose(selectByLabel(el, "Filtrer på rolle"), "admin");
    expect(rowTitles(el)).toEqual(["sjef@example.com"]);
  });

  it("deletes an account after confirmation, keeping the thrower", async () => {
    confirmDialog.mockResolvedValue(true);
    deleteUserAccount.mockResolvedValue({ error: null });
    const el = host();
    await renderUsers(el);
    choose(selectByLabel(el, "Filtrer på rolle"), "alle");

    clickAction(el, 0, "Slett");
    await vi.waitFor(() => expect(deleteUserAccount).toHaveBeenCalledWith("u1"));

    const prompt = confirmDialog.mock.calls[0]?.[0] as { message: string } | undefined;
    expect(prompt?.message).toContain("ola@example.com");
    expect(prompt?.message).toContain("Ola Nordmann");
    expect(prompt?.message).toContain("blir verande");
  });

  it("does not delete when the confirmation is declined", async () => {
    confirmDialog.mockResolvedValue(false);
    const el = host();
    await renderUsers(el);

    clickAction(el, 0, "Slett");
    await vi.waitFor(() => expect(confirmDialog).toHaveBeenCalled());
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });

  it("offers no delete on the signed-in admin's own row", async () => {
    const el = host();
    await renderUsers(el);

    const rows = [...el.querySelectorAll<HTMLElement>(".admin-row")];
    const labels = (row: HTMLElement) =>
      [...row.querySelectorAll(".admin-row__actions button")].map((b) => b.textContent);

    expect(labels(rows[0]!)).toEqual(["Lagre", "Slett"]);
    expect(labels(rows[1]!)).toEqual(["Lagre"]);
    expect(rows[1]!.textContent).toContain("Deg");
  });

  it("shows the server's refusal (e.g. the last admin) without dropping the list", async () => {
    confirmDialog.mockResolvedValue(true);
    deleteUserAccount.mockResolvedValue({
      error: { message: "Cannot delete the last admin account" },
    });
    const el = host();
    await renderUsers(el);

    clickAction(el, 0, "Slett");
    await vi.waitFor(() => {
      expect(el.querySelector(".alert-danger")?.textContent).toBe(
        "Cannot delete the last admin account",
      );
    });
    expect(rowTitles(el)).toHaveLength(2);
  });

  it("surfaces a write failure without losing the list", async () => {
    updateUserRole.mockResolvedValue({ error: { message: "ingen tilgang" } });
    const el = host();
    await renderUsers(el);

    // Toolbar filters live in module state and survive a re-render on purpose
    // (same as the public thrower list) — clear the previous test's role filter.
    choose(selectByLabel(el, "Filtrer på rolle"), "alle");

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

    clickAction(el, 0, "Godkjenn");
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", 7, "godkjent"));

    updateLinkStatus.mockClear();
    await renderRequests(el);
    clickAction(el, 0, "Avvis");
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "avvist"));
  });
});

describe("admin shell", () => {
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
    const el = host();
    await renderAdmin(el, { tab: "tullball" });

    expect(el.querySelector(".admin-nav .nav-link.active")?.textContent).toBe("Oversikt");
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
