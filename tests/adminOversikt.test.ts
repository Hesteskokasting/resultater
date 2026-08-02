/**
 * The dashboard's numbers: which key figures are derived from which query, and
 * what each chart is handed. Chart.js itself is mocked away — happy-dom has no
 * 2D canvas context — so the assertions are on the data reaching the chart layer.
 */

const mocks = vi.hoisted(() => ({
  getAdminEntityCounts: vi.fn(),
  getTournamentStatRows: vi.fn(),
  getRegistrationStatRows: vi.fn(),
  getActiveThrowerList: vi.fn(),
  getAllUsers: vi.fn(),
  drawBarChart: vi.fn(),
  drawLineChart: vi.fn(),
  drawShareBar: vi.fn(),
  openTournamentEditor: vi.fn(),
  openThrowerEditor: vi.fn(),
  openClubEditor: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/adminStatsService", () => ({
  getAdminEntityCounts: mocks.getAdminEntityCounts,
  getTournamentStatRows: mocks.getTournamentStatRows,
  getRegistrationStatRows: mocks.getRegistrationStatRows,
}));
vi.mock("@/services/kasterService", () => ({
  getActiveThrowerList: mocks.getActiveThrowerList,
}));
vi.mock("@/services/adminService", () => ({ getAllUsers: mocks.getAllUsers }));
// The quick actions open the shared editors; the overlay itself is covered in
// adminModal.test.
vi.mock("@/admin/_adminEdit", () => ({
  openTournamentEditor: mocks.openTournamentEditor,
  openThrowerEditor: mocks.openThrowerEditor,
  openClubEditor: mocks.openClubEditor,
}));
vi.mock("@/admin/_adminCharts", () => ({
  drawBarChart: mocks.drawBarChart,
  drawLineChart: mocks.drawLineChart,
  drawShareBar: mocks.drawShareBar,
  seriesColor: () => "#2a78d6",
  destroyAdminCharts: vi.fn(),
}));

import { render as renderOverview } from "@/admin/panels/oversikt";

const YEAR = new Date().getFullYear();

function tile(el: HTMLElement, label: string): HTMLElement | undefined {
  return [...el.querySelectorAll<HTMLElement>(".admin-stat")].find(
    (t) => t.querySelector(".admin-stat__label")?.textContent === label,
  );
}

function value(el: HTMLElement, label: string): string | undefined {
  return tile(el, label)?.querySelector(".admin-stat__value")?.textContent ?? undefined;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAdminEntityCounts.mockResolvedValue({
    activeThrowers: 120,
    totalThrowers: 200,
    activeClubs: 12,
    totalClubs: 15,
    totalUsers: 42,
    pendingLinks: 2,
  });
  mocks.getTournamentStatRows.mockResolvedValue({
    data: [
      { dato: `${YEAR}-01-10`, erfullfort: true, stevne_fase: "avsluttende" },
      { dato: `${YEAR}-12-24`, erfullfort: false, stevne_fase: null },
      { dato: `${YEAR}-06-01`, erfullfort: false, stevne_fase: "innledende" },
      { dato: `${YEAR - 2}-06-01`, erfullfort: true, stevne_fase: null },
    ],
    error: null,
  });
  mocks.getRegistrationStatRows.mockResolvedValue({
    data: [
      { opprettet_at: `${YEAR}-03-01T09:00:00Z` },
      { opprettet_at: `${YEAR}-03-02T09:00:00Z` },
    ],
    error: null,
  });
  mocks.getActiveThrowerList.mockResolvedValue({
    data: [
      { id: 1, fornavn: "A", etternavn: "A", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
      { id: 2, fornavn: "B", etternavn: "B", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
      { id: 3, fornavn: "C", etternavn: "C", eraktiv: true, klubb: null },
    ],
    error: null,
  });
  mocks.getAllUsers.mockResolvedValue({
    data: [{ rolle: "admin" }, { rolle: "bruker" }, { rolle: "bruker" }],
    error: null,
  });
});

describe("oversikt dashboard", () => {
  it("opens the create flows in the overlay and links out only for navigation", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    const actions = [...el.querySelectorAll<HTMLElement>(".admin-action")];
    const label = (a: HTMLElement) => a.querySelector(".admin-action__label")?.textContent;

    const create = actions.filter((a) => a instanceof HTMLButtonElement);
    expect(create.map(label)).toEqual(["Nytt stevne", "Ny utøvar", "Ny klubb"]);

    const links = actions.filter((a): a is HTMLAnchorElement => a instanceof HTMLAnchorElement);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#/terminliste",
      "#/norgesranking",
      "#/rekorder",
    ]);

    create[0]!.click();
    expect(mocks.openTournamentEditor).toHaveBeenCalledWith(undefined, expect.any(Function));
    create[2]!.click();
    expect(mocks.openClubEditor).toHaveBeenCalledWith(undefined, expect.any(Function));
  });

  it("derives the key figures from counts and this year's tournaments", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    expect(value(el, `Stevne i ${YEAR}`)).toBe("3");
    expect(value(el, "Pågåande stevne")).toBe("1");
    expect(value(el, "Aktive utøvarar")).toBe("120");
    expect(value(el, "Klubbar")).toBe("12");
    expect(value(el, "Brukarkontoar")).toBe("42");
    expect(value(el, "Ventande forespørslar")).toBe("2");
    expect(value(el, `Påmeldingar i ${YEAR}`)).toBe("2");
  });

  it("links each figure to the tab that manages it and flags pending work", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    expect(tile(el, "Aktive utøvarar")?.getAttribute("href")).toBe("#/admin/utovarar");
    expect(tile(el, "Ventande forespørslar")?.getAttribute("href")).toBe("#/admin/forespurnader");
    expect(tile(el, "Ventande forespørslar")?.classList.contains("admin-stat--warn")).toBe(true);
    expect(tile(el, "Pågåande stevne")?.classList.contains("admin-stat--live")).toBe(true);
  });

  it("feeds each chart its aggregated series", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    const perYear = mocks.drawBarChart.mock.calls[0]?.[1] as { label: string; count: number }[];
    expect(perYear).toHaveLength(8);
    expect(perYear[perYear.length - 1]).toEqual({ label: String(YEAR), count: 3 });

    const perMonth = mocks.drawLineChart.mock.calls[0]?.[1] as { count: number }[];
    expect(perMonth).toHaveLength(12);
    expect(perMonth[2]?.count).toBe(2);

    const perClub = mocks.drawBarChart.mock.calls[1]?.[1] as { label: string; count: number }[];
    expect(perClub[0]).toEqual({ label: "Oslo HK", count: 2 });
    expect(mocks.drawBarChart.mock.calls[1]?.[2]).toMatchObject({ horizontal: true });

    const perRole = mocks.drawShareBar.mock.calls[0]?.[1] as { label: string; count: number }[];
    expect(perRole).toEqual([
      { label: "admin", count: 1 },
      { label: "klubbadmin", count: 0 },
      { label: "bruker", count: 2 },
    ]);
  });

  it("labels the share legend with counts and percentages", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    // Only the share chart carries a legend; the single-series cards leave theirs empty.
    const legends = [...el.querySelectorAll(".admin-legend")];
    const legend = legends[legends.length - 1];
    expect(legend?.textContent).toContain("Admin");
    expect(legend?.textContent).toContain("33 %");
    expect(legend?.textContent).toContain("67 %");
  });

  it("replaces an empty chart with a message instead of a blank canvas", async () => {
    mocks.getRegistrationStatRows.mockResolvedValue({ data: [], error: null });
    const el = document.createElement("div");
    await renderOverview(el);

    expect(mocks.drawLineChart).not.toHaveBeenCalled();
    expect(el.textContent).toContain("Ingen påmeldingar i år.");
  });

  it("shows an error banner when the dashboard queries fail", async () => {
    mocks.getAdminEntityCounts.mockRejectedValue(new Error("boom"));
    const el = document.createElement("div");
    await renderOverview(el);

    expect(el.querySelector(".error-banner")).not.toBeNull();
  });
});
