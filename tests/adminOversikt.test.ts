/**
 * The dashboard's numbers: which key figures are derived from which query, and
 * what each chart is handed. Chart.js itself is mocked away — happy-dom has no
 * 2D canvas context — so the assertions are on the data reaching the chart layer.
 */

const mocks = vi.hoisted(() => ({
  getAdminEntityCounts: vi.fn(),
  getTournamentStatRows: vi.fn(),
  getActiveThrowerList: vi.fn(),
  getParticipantsPerYear: vi.fn(),
  drawBarChart: vi.fn(),
  openTournamentEditor: vi.fn(),
  openThrowerEditor: vi.fn(),
  openClubEditor: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/adminStatsService", () => ({
  getAdminEntityCounts: mocks.getAdminEntityCounts,
  getTournamentStatRows: mocks.getTournamentStatRows,
  getParticipantsPerYear: mocks.getParticipantsPerYear,
}));
vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/services/kasterService", () => ({
  getActiveThrowerList: mocks.getActiveThrowerList,
}));
// The quick actions open the shared editors; the overlay itself is covered in
// adminModal.test.
vi.mock("@/admin/_adminEdit", () => ({
  openTournamentEditor: mocks.openTournamentEditor,
  openThrowerEditor: mocks.openThrowerEditor,
  openClubEditor: mocks.openClubEditor,
}));
vi.mock("@/admin/_adminCharts", () => ({
  drawBarChart: mocks.drawBarChart,
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

function signInAs(role: string): void {
  mocks.getUser.mockResolvedValue({
    user: { id: "u1" },
    profil: { role, kasterid: null, kobling_status: "ingen", kobling_kasterid: null },
    club: role === "klubbadmin" ? 1 : null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  signInAs("admin");
  mocks.getAdminEntityCounts.mockResolvedValue({
    activeClubs: 12,
    totalClubs: 15,
    totalUsers: 42,
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
  mocks.getActiveThrowerList.mockResolvedValue({
    data: [
      { id: 1, fornavn: "A", etternavn: "A", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
      { id: 2, fornavn: "B", etternavn: "B", eraktiv: true, klubb: { id: 1, navn: "Oslo HK" } },
      { id: 3, fornavn: "C", etternavn: "C", eraktiv: true, klubb: null },
    ],
    error: null,
  });
  mocks.getParticipantsPerYear.mockResolvedValue({
    data: [
      { ar: YEAR, deltakarar: 2, deltakingar: 5 },
      { ar: YEAR - 2, deltakarar: 1, deltakingar: 1 },
    ],
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
    expect(create.map((i) => label(i))).toEqual(["Nytt stevne", "Ny utøvar", "Ny klubb"]);

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

  it("shows the key figures in order, participation from this year's results", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    const labels = [...el.querySelectorAll(".admin-stat__label")].map((l) => l.textContent);
    expect(labels).toEqual([
      `Stevne i ${YEAR}`,
      "Klubbar",
      `Unike deltakarar i ${YEAR}`,
      `Deltakingar i ${YEAR}`,
      "Brukarkontoar",
    ]);
    expect(value(el, `Stevne i ${YEAR}`)).toBe("3");
    expect(value(el, "Klubbar")).toBe("12");
    expect(value(el, `Unike deltakarar i ${YEAR}`)).toBe("2");
    expect(value(el, `Deltakingar i ${YEAR}`)).toBe("5");
    expect(value(el, "Brukarkontoar")).toBe("42");
  });

  it("links each figure to the tab that manages it", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    expect(tile(el, `Stevne i ${YEAR}`)?.getAttribute("href")).toBe("#/admin/stevne");
    expect(tile(el, "Klubbar")?.getAttribute("href")).toBe("#/admin/klubbar");
  });

  it("feeds each chart its aggregated series", async () => {
    const el = document.createElement("div");
    await renderOverview(el);

    const perYear = mocks.drawBarChart.mock.calls[0]?.[1] as { label: string; count: number }[];
    expect(perYear).toHaveLength(8);
    expect(perYear[perYear.length - 1]).toEqual({ label: String(YEAR), count: 3 });

    const perClub = mocks.drawBarChart.mock.calls[1]?.[1] as { label: string; count: number }[];
    expect(perClub[0]).toEqual({ label: "Oslo HK", count: 2 });
    expect(mocks.drawBarChart.mock.calls[1]?.[2]).toMatchObject({ horizontal: true });

    const perParticipantYear = mocks.drawBarChart.mock.calls[2]?.[1] as {
      label: string;
      count: number;
    }[];
    expect(perParticipantYear).toHaveLength(8);
    expect(perParticipantYear[perParticipantYear.length - 1]).toEqual({
      label: String(YEAR),
      count: 2,
    });
    expect(perParticipantYear[perParticipantYear.length - 3]?.count).toBe(1);
  });

  it("replaces an empty chart with a message instead of a blank canvas", async () => {
    mocks.getParticipantsPerYear.mockResolvedValue({ data: [], error: null });
    const el = document.createElement("div");
    await renderOverview(el);

    expect(mocks.drawBarChart).toHaveBeenCalledTimes(2);
    expect(el.textContent).toContain("Ingen deltakarar registrert.");
    expect(value(el, `Unike deltakarar i ${YEAR}`)).toBe("0");
  });

  it("leaves out club creation and the user count for a klubbadmin", async () => {
    signInAs("klubbadmin");
    const el = document.createElement("div");
    await renderOverview(el);

    const labels = [...el.querySelectorAll(".admin-action__label")].map((l) => l.textContent);
    expect(labels).not.toContain("Ny klubb");
    expect(labels).toContain("Nytt stevne");
    expect(tile(el, "Brukarkontoar")).toBeUndefined();
    expect(tile(el, "Klubbar")?.getAttribute("href")).toBeNull();
    expect(value(el, `Deltakingar i ${YEAR}`)).toBe("5");
  });

  it("shows an error banner when the dashboard queries fail", async () => {
    mocks.getAdminEntityCounts.mockRejectedValue(new Error("boom"));
    const el = document.createElement("div");
    await renderOverview(el);

    expect(el.querySelector(".error-banner")).not.toBeNull();
  });
});
