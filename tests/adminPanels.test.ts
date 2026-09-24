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
  getActiveThrowerList: vi.fn(),
  getRegistrationCountsForTournaments: vi.fn(),
  getAllUsers: vi.fn(),
  getUserEmails: vi.fn(),
  updateUserRole: vi.fn(),
  getPendingLinks: vi.fn(),
  updateLinkStatus: vi.fn(),
  answerLinkRequest: vi.fn(),
  getPendingLinkCount: vi.fn(),
  getClubs: vi.fn(),
  getClubAdminUsers: vi.fn(),
  getClubAdminAssignments: vi.fn(),
  setClubAdminClub: vi.fn(),
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
  getClubs: mocks.getClubs,
}));
vi.mock("@/services/kasterService", () => ({
  getThrowerAdminList: mocks.getThrowerAdminList,
  getThrowersById: mocks.getThrowersById,
  getActiveThrowerList: mocks.getActiveThrowerList,
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
  answerLinkRequest: mocks.answerLinkRequest,
  getPendingLinkCount: mocks.getPendingLinkCount,
  getClubAdminUsers: mocks.getClubAdminUsers,
  getClubAdminAssignments: mocks.getClubAdminAssignments,
  setClubAdminClub: mocks.setClubAdminClub,
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/services/accountService", () => ({ deleteUserAccount: mocks.deleteUserAccount }));
vi.mock("@/components/dialog/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));
vi.mock("@/components/Toast", () => ({ showToast: mocks.showToast }));
vi.mock("@/admin/_adminCharts", () => ({
  drawBarChart: vi.fn(),
  drawLineChart: vi.fn(),
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
  getActiveThrowerList,
  getRegistrationCountsForTournaments,
  getAllUsers,
  getUserEmails,
  updateUserRole,
  getPendingLinks,
  updateLinkStatus,
  answerLinkRequest,
  getPendingLinkCount,
  getClubs,
  getClubAdminUsers,
  getClubAdminAssignments,
  setClubAdminClub,
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
import { render as renderClubAccess } from "@/admin/panels/klubbtilgang";
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

function signInAs(role: string, club: number | null = null): void {
  getUser.mockResolvedValue({
    user: { id: "u2", email: "sjef@example.com" },
    profil: { role, kasterid: null, kobling_status: "ingen", kobling_kasterid: null },
    club,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getLiveTournaments.mockResolvedValue({ data: [], error: null });
  getPendingLinkCount.mockResolvedValue(0);
  signInAs("admin");
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

describe("stevne panel as a klubbadmin", () => {
  it("lists only their own club's stevner", async () => {
    signInAs("klubbadmin", 2);
    getScheduleTournaments.mockResolvedValue({
      data: [
        { id: 1, navn: "Oslo Open", dato: `${YEAR}-05-01`, klubb: { id: 1, navn: "Oslo HK" } },
        { id: 2, navn: "Bergen Cup", dato: `${YEAR}-06-01`, klubb: { id: 2, navn: "Bergen HK" } },
        { id: 3, navn: "Utan arrangør", dato: `${YEAR}-07-01`, klubb: null },
      ],
      error: null,
    });
    const el = host();
    await renderTournaments(el);
    expect(rowTitles(el)).toEqual(["Bergen Cup"]);
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
    expect(tileValue(el, "Med medlemsnr.")).toBe("1");
  });

  it("shows class, gender and member number per row", async () => {
    const el = host();
    await renderThrowers(el);

    const first = el.querySelector(".admin-row")!;
    expect(first.textContent).toContain("Senior");
    const meta = first.querySelector(".admin-row__meta")?.textContent ?? "";
    expect(meta).toContain("Oslo HK");
    expect(meta).toContain("Mann");
    expect(meta).toContain("Medlemsnr. 1234");
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

describe("utovarar panel as a klubbadmin", () => {
  it("lists only their own club's throwers", async () => {
    signInAs("klubbadmin", 2);
    getThrowerAdminList.mockResolvedValue({
      data: [
        { id: 1, fornavn: "Ola", etternavn: "Nordmann", eraktiv: true, klubbid: 1 },
        { id: 2, fornavn: "Kari", etternavn: "Vik", eraktiv: true, klubbid: 2 },
        { id: 3, fornavn: "Per", etternavn: "Utan", eraktiv: true, klubbid: null },
      ],
      error: null,
    });
    const el = host();
    await renderThrowers(el);
    expect(rowTitles(el)).toEqual(["Kari Vik"]);
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
    // The panel writes the saved role back onto the row object, so hand out a
    // fresh copy per render instead of leaking it into the next test.
    getAllUsers.mockImplementation(() =>
      Promise.resolve({ data: users.map((u) => ({ ...u })), error: null }),
    );
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
    updateLinkStatus.mockResolvedValue({ error: null });
    getActiveThrowerList.mockResolvedValue({
      data: [
        { id: 5, fornavn: "Ola", etternavn: "Nordmann", eraktiv: true, klubb: { navn: "Oslo HK" } },
        { id: 9, fornavn: "Kari", etternavn: "Ås", eraktiv: true, klubb: { navn: "Oslo HK" } },
      ],
      error: null,
    });
  });

  const tableRows = (el: HTMLElement): HTMLElement[] => [
    ...el.querySelectorAll<HTMLElement>(".admin-table tbody tr"),
  ];
  const emails = (el: HTMLElement): string[] =>
    tableRows(el).map((r) => r.querySelector(".user-table__email span")?.textContent ?? "");

  /** Ticks row `index`, which swaps it for its editable version. */
  function selectRow(el: HTMLElement, index: number): HTMLElement {
    const box = tableRows(el)[index]!.querySelector<HTMLInputElement>("input[type=checkbox]")!;
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    return tableRows(el)[index]!;
  }

  function rowButton(row: HTMLElement, label: string): HTMLButtonElement {
    return [...row.querySelectorAll<HTMLButtonElement>(".admin-table__actions button")].find(
      (b) => b.textContent === label,
    )!;
  }

  function bulkButton(el: HTMLElement, label: string): HTMLButtonElement {
    return [...el.querySelectorAll<HTMLButtonElement>(".admin-bulk button")].find(
      (b) => b.textContent === label,
    )!;
  }

  /** The row's thrower picker: type a query and click the offered row. */
  function pickThrower(row: HTMLElement, query: string, id: string): void {
    const input = row.querySelector<HTMLInputElement>(".search-select input[type=text]")!;
    input.value = query;
    input.dispatchEvent(new Event("input"));
    row
      .querySelector<HTMLElement>(`.search-select [data-id="${id}"]`)!
      .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  }

  async function renderAll(): Promise<HTMLElement> {
    const el = host();
    await renderUsers(el);
    // Toolbar filters live in module state and survive a re-render on purpose
    // (same as the public thrower list) — clear the previous test's filters.
    choose(selectByLabel(el, "Filtrer på rolle"), "alle");
    choose(selectByLabel(el, "Filtrer på kobling"), "alle");
    return el;
  }

  it("renders read-only rows until one is ticked", async () => {
    const el = await renderAll();

    expect(emails(el)).toEqual(["ola@example.com", "sjef@example.com"]);
    expect(el.querySelector(".admin-table tbody select")).toBeNull();
    expect(el.querySelector(".admin-table__actions button")).toBeNull();
    expect(tableRows(el)[0]!.textContent).toContain("Ola Nordmann");
    expect(tableRows(el)[0]!.textContent).toContain("Kobla");
    // An admin without a link has nothing to show in the link column.
    expect(tableRows(el)[1]!.querySelector(".user-table__link")?.textContent).toBe("—");

    const row = selectRow(el, 0);
    expect(row.querySelector<HTMLSelectElement>("select")!.value).toBe("bruker");
    expect(row.querySelector<HTMLInputElement>(".search-select input[type=text]")!.value).toBe(
      "Nordmann Ola",
    );
    expect(rowButton(row, "Lagre")).toBeDefined();
    expect(el.querySelector(".admin-bulk")?.classList.contains("d-none")).toBe(false);
  });

  it("links a free thrower to a brukar", async () => {
    getAllUsers.mockResolvedValue({
      data: [users[0]!, { ...users[1]!, rolle: "bruker" }],
      error: null,
    });
    const el = await renderAll();

    const row = selectRow(el, 1);
    // Thrower 5 belongs to the first user, so it is not offered here.
    const input = row.querySelector<HTMLInputElement>(".search-select input[type=text]")!;
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    const offered = [...row.querySelectorAll<HTMLElement>(".search-select [data-id]")];
    expect(offered.map((r) => r.dataset["id"])).toEqual(["9"]);

    pickThrower(row, "a", "9");
    rowButton(row, "Lagre").click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u2", 9, "godkjent"));
  });

  it("locks the link picker for roles other than Brukar", async () => {
    const el = await renderAll();
    const input = selectRow(el, 1).querySelector<HTMLInputElement>(
      ".search-select input[type=text]",
    )!;
    expect(input.disabled).toBe(true);
  });

  it("names a link to an inactive thrower, which the active list leaves out", async () => {
    getActiveThrowerList.mockResolvedValue({
      data: [
        { id: 9, fornavn: "Kari", etternavn: "Ås", eraktiv: true, klubb: { navn: "Oslo HK" } },
      ],
      error: null,
    });
    const el = await renderAll();
    const input = selectRow(el, 0).querySelector<HTMLInputElement>(
      ".search-select input[type=text]",
    )!;
    expect(input.value).toBe("Nordmann Ola (inaktiv)");
  });

  it("still names a link another profile once requested", async () => {
    // u2 has a stale kobling_kasterid pointing at u1's approved thrower.
    getAllUsers.mockResolvedValue({
      data: [
        { ...users[0]!, kobling_kasterid: 5 },
        { ...users[1]!, kobling_kasterid: 5, kobling_status: "avvist" },
      ],
      error: null,
    });
    const el = await renderAll();
    const input = selectRow(el, 0).querySelector<HTMLInputElement>(
      ".search-select input[type=text]",
    )!;
    expect(input.value).toBe("Nordmann Ola");
  });

  it("removes an existing link from the row", async () => {
    const el = await renderAll();
    const row = selectRow(el, 0);
    pickThrower(row, "fjern", "");
    rowButton(row, "Lagre").click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "ingen"));
  });

  it("clears the link after confirmation when the role leaves Brukar", async () => {
    confirmDialog.mockResolvedValue(true);
    const el = await renderAll();
    const row = selectRow(el, 0);
    choose(row.querySelector<HTMLSelectElement>("select")!, "klubbadmin");
    expect(row.querySelector<HTMLInputElement>(".search-select input[type=text]")!.disabled).toBe(
      true,
    );

    rowButton(row, "Lagre").click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "ingen"));
    expect(updateUserRole).toHaveBeenCalledWith("u1", "klubbadmin");
  });

  it("clears the link before the role, which the database check requires", async () => {
    confirmDialog.mockResolvedValue(true);
    const order: string[] = [];
    updateLinkStatus.mockImplementation(() => {
      order.push("link");
      return Promise.resolve({ error: null });
    });
    updateUserRole.mockImplementation(() => {
      order.push("role");
      return Promise.resolve({ error: null });
    });
    const el = await renderAll();

    const row = selectRow(el, 0);
    choose(row.querySelector<HTMLSelectElement>("select")!, "admin");
    rowButton(row, "Lagre").click();
    await vi.waitFor(() => expect(order).toEqual(["link", "role"]));

    // Bulk: the same order per user.
    order.length = 0;
    await vi.waitFor(() => expect(el.querySelector(".admin-bulk.d-none")).not.toBeNull());
    selectRow(el, 0);
    choose(selectByLabel(el, "Ny rolle for valde"), "klubbadmin");
    bulkButton(el, "Sett rolle").click();
    await vi.waitFor(() => expect(order).toEqual(["link", "role"]));
  });

  it("sets the role before the link when a user becomes a brukar", async () => {
    const order: string[] = [];
    updateLinkStatus.mockImplementation(() => {
      order.push("link");
      return Promise.resolve({ error: null });
    });
    updateUserRole.mockImplementation(() => {
      order.push("role");
      return Promise.resolve({ error: null });
    });
    const el = await renderAll();

    const row = selectRow(el, 1);
    choose(row.querySelector<HTMLSelectElement>("select")!, "bruker");
    pickThrower(row, "a", "9");
    rowButton(row, "Lagre").click();
    await vi.waitFor(() => expect(order).toEqual(["role", "link"]));
  });

  it("changes nothing when the role change is not confirmed", async () => {
    confirmDialog.mockResolvedValue(false);
    const el = await renderAll();
    const row = selectRow(el, 0);
    choose(row.querySelector<HTMLSelectElement>("select")!, "admin");
    rowButton(row, "Lagre").click();

    await vi.waitFor(() => expect(confirmDialog).toHaveBeenCalled());
    expect(updateUserRole).not.toHaveBeenCalled();
    expect(updateLinkStatus).not.toHaveBeenCalled();
  });

  it("filters on link status", async () => {
    const el = await renderAll();
    const status = selectByLabel(el, "Filtrer på kobling");

    expect([...status.options].map((o) => o.text)).toEqual([
      "Alle statusar",
      "Kobla",
      "Ikkje kobla",
      "Ventar",
      "Avvist",
    ]);
    choose(status, "godkjent");
    expect(emails(el)).toEqual(["ola@example.com"]);
    choose(status, "ingen");
    expect(emails(el)).toEqual(["sjef@example.com"]);
    choose(status, "venter");
    expect(emails(el)).toEqual([]);
    choose(status, "alle");
  });

  it("filters by role", async () => {
    const el = host();
    await renderUsers(el);

    choose(selectByLabel(el, "Filtrer på rolle"), "admin");
    expect(emails(el)).toEqual(["sjef@example.com"]);
  });

  it("deletes an account after confirmation, keeping the thrower", async () => {
    confirmDialog.mockResolvedValue(true);
    deleteUserAccount.mockResolvedValue({ error: null });
    const el = await renderAll();

    rowButton(selectRow(el, 0), "Slett").click();
    await vi.waitFor(() => expect(deleteUserAccount).toHaveBeenCalledWith("u1"));

    const prompt = confirmDialog.mock.calls[0]?.[0] as { message: string } | undefined;
    expect(prompt?.message).toContain("ola@example.com");
    expect(prompt?.message).toContain("Ola Nordmann");
    expect(prompt?.message).toContain("blir verande");
  });

  it("does not delete when the confirmation is declined", async () => {
    confirmDialog.mockResolvedValue(false);
    const el = await renderAll();

    rowButton(selectRow(el, 0), "Slett").click();
    await vi.waitFor(() => expect(confirmDialog).toHaveBeenCalled());
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });

  it("offers no delete on the signed-in admin's own row", async () => {
    const el = await renderAll();
    const labels = (row: HTMLElement) =>
      [...row.querySelectorAll(".admin-table__actions button")].map((b) => b.textContent);

    expect(labels(selectRow(el, 0))).toEqual(["Lagre", "Slett"]);
    const own = selectRow(el, 1);
    expect(labels(own)).toEqual(["Lagre"]);
    expect(own.textContent).toContain("Deg");
  });

  it("shows the server's refusal (e.g. the last admin) without dropping the list", async () => {
    confirmDialog.mockResolvedValue(true);
    deleteUserAccount.mockResolvedValue({
      error: { message: "Cannot delete the last admin account" },
    });
    const el = await renderAll();

    rowButton(selectRow(el, 0), "Slett").click();
    await vi.waitFor(() => {
      expect(el.querySelector(".alert-danger")?.textContent).toBe(
        "Cannot delete the last admin account",
      );
    });
    expect(emails(el)).toHaveLength(2);
  });

  it("surfaces a write failure without losing the list", async () => {
    updateUserRole.mockResolvedValue({ error: { message: "ingen tilgang" } });
    const el = await renderAll();

    // Saving only writes what changed, so the role has to differ to hit the RPC.
    const row = selectRow(el, 1);
    choose(row.querySelector<HTMLSelectElement>("select")!, "klubbadmin");
    rowButton(row, "Lagre").click();
    await vi.waitFor(() => {
      expect(el.querySelector(".alert-danger")?.classList.contains("d-none")).toBe(false);
    });
    expect(el.querySelector(".alert-danger")?.textContent).toBe("ingen tilgang");
    expect(emails(el)).toHaveLength(2);
  });

  it("sets the role for every ticked user and clears their links", async () => {
    confirmDialog.mockResolvedValue(true);
    const el = await renderAll();
    const all = el.querySelector<HTMLInputElement>(".admin-table thead input")!;
    all.checked = true;
    all.dispatchEvent(new Event("change"));

    choose(selectByLabel(el, "Ny rolle for valde"), "klubbadmin");
    bulkButton(el, "Sett rolle").click();
    await vi.waitFor(() => expect(updateUserRole).toHaveBeenCalledTimes(2));
    expect(updateUserRole).toHaveBeenCalledWith("u1", "klubbadmin");
    expect(updateUserRole).toHaveBeenCalledWith("u2", "klubbadmin");
    // Only u1 had a link to clear.
    expect(updateLinkStatus).toHaveBeenCalledTimes(1);
    expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "ingen");
  });

  it("bulk-unlinks and bulk-deletes the ticked users, never the admin's own account", async () => {
    confirmDialog.mockResolvedValue(true);
    deleteUserAccount.mockResolvedValue({ error: null });
    const el = await renderAll();
    selectRow(el, 0);
    selectRow(el, 1);

    bulkButton(el, "Fjern kobling").click();
    await vi.waitFor(() => expect(updateLinkStatus).toHaveBeenCalledWith("u1", null, "ingen"));
    expect(updateLinkStatus).toHaveBeenCalledTimes(1);

    // The reload clears the selection.
    await vi.waitFor(() => expect(el.querySelector(".admin-bulk.d-none")).not.toBeNull());
    selectRow(el, 0);
    selectRow(el, 1);
    bulkButton(el, "Slett").click();
    await vi.waitFor(() => expect(deleteUserAccount).toHaveBeenCalledWith("u1"));
    expect(deleteUserAccount).toHaveBeenCalledTimes(1);
  });
});

describe("forespurnader panel", () => {
  it("shows an empty state when nothing is pending", async () => {
    getPendingLinks.mockResolvedValue({ data: [], error: null });
    const el = host();
    await renderRequests(el);
    expect(el.querySelector(".empty-state")?.textContent).toBe("Ingen ventande forespørslar.");
  });

  it("approves and rejects through the answer rpc", async () => {
    getPendingLinks.mockResolvedValue({
      data: [{ id: "u1", kobling_kasterid: 7 }],
      error: null,
    });
    getUserEmails.mockResolvedValue({ data: [{ id: "u1", epost: "ny@example.com" }], error: null });
    getThrowersById.mockResolvedValue({
      data: [{ id: 7, fornavn: "Ny", etternavn: "Spelar", klubb: { navn: "Oslo HK" } }],
      error: null,
    });
    answerLinkRequest.mockResolvedValue({ error: null });

    const el = host();
    await renderRequests(el);
    expect(el.textContent).toContain("Vil koblast til Ny Spelar");

    clickAction(el, 0, "Godkjenn");
    await vi.waitFor(() => expect(answerLinkRequest).toHaveBeenCalledWith("u1", true));

    answerLinkRequest.mockClear();
    await renderRequests(el);
    clickAction(el, 0, "Avvis");
    await vi.waitFor(() => expect(answerLinkRequest).toHaveBeenCalledWith("u1", false));
  });
});

describe("klubbtilgang panel", () => {
  beforeEach(() => {
    getClubAdminUsers.mockResolvedValue({ data: [{ id: "k1" }], error: null });
    getClubs.mockResolvedValue({
      data: [
        { id: 1, navn: "Oslo HK" },
        { id: 2, navn: "Bergen HK" },
      ],
      error: null,
    });
    getClubAdminAssignments.mockResolvedValue({
      data: [{ bruker_id: "k1", klubbid: 2 }],
      error: null,
    });
    getUserEmails.mockResolvedValue({ data: [{ id: "k1", epost: "k@example.com" }], error: null });
  });

  it("shows each klubbadmin's one club and replaces it on change", async () => {
    setClubAdminClub.mockResolvedValue({ error: null });
    const el = host();
    await renderClubAccess(el);

    const select = selectByLabel(el, "Klubb for k@example.com");
    expect(select.value).toBe("2");
    choose(select, "1");
    expect(setClubAdminClub).toHaveBeenCalledWith("k1", 1);
    choose(select, "");
    expect(setClubAdminClub).toHaveBeenCalledWith("k1", null);
  });

  it("puts the select back when the save fails", async () => {
    setClubAdminClub.mockResolvedValue({ error: { message: "nekta" } });
    const el = host();
    await renderClubAccess(el);

    const select = selectByLabel(el, "Klubb for k@example.com");
    choose(select, "1");
    await vi.waitFor(() => expect(select.value).toBe("2"));
  });
});

describe("admin shell", () => {
  it("gives a klubbadmin the overview and their club's panels, without users or access", async () => {
    signInAs("klubbadmin", 2);
    const el = host();
    await renderAdmin(el, { tab: "brukarar" });

    const links = [...el.querySelectorAll<HTMLAnchorElement>(".admin-nav .nav-link")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#/admin/oversikt",
      "#/admin/stevne",
      "#/admin/utovarar",
      "#/admin/klubb",
      "#/admin/forespurnader",
    ]);
    expect(links[0]!.classList.contains("active")).toBe(true);
    expect(el.querySelector(".admin-head__title")?.textContent).toBe("Dashboard - Klubbadmin");
  });

  it("links organizers to their account settings", async () => {
    const el = host();
    await renderAdmin(el, { tab: "stevne" });
    expect(
      el.querySelector<HTMLAnchorElement>('.admin-head a[href="#/minside/konto"]'),
    ).not.toBeNull();
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
    expect(live?.querySelector(".stevne-card--live")).not.toBeNull();
  });
});
