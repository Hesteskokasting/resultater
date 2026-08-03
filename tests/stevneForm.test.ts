/**
 * The tournament form is the only one of the three that carries SNC rules: the
 * umbrella owns the format, a local stevne inherits it, and the two SNC fields
 * are mutually exclusive. The DB enforces all of that too — these tests pin down
 * that the form does not offer edits the DB would silently undo.
 */

const mocks = vi.hoisted(() => ({
  getTournamentForAdmin: vi.fn(),
  getTournamentTypes: vi.fn(),
  getInitialThrowingMethods: vi.fn(),
  getFinalThrowingMethods: vi.fn(),
  getCategories: vi.fn(),
  createTournament: vi.fn(),
  updateTournament: vi.fn(),
  deleteTournament: vi.fn(),
  setTournamentCompleted: vi.fn(),
  reopenTournament: vi.fn(),
  getSncParentOptions: vi.fn(),
  completeSncParent: vi.fn(),
  reopenSncParent: vi.fn(),
  getClubs: vi.fn(),
  isAdmin: vi.fn(),
  isClubAdmin: vi.fn(),
  confirmDialog: vi.fn(),
}));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/stevneService", () => ({
  getTournamentForAdmin: mocks.getTournamentForAdmin,
  getTournamentTypes: mocks.getTournamentTypes,
  getInitialThrowingMethods: mocks.getInitialThrowingMethods,
  getFinalThrowingMethods: mocks.getFinalThrowingMethods,
  getCategories: mocks.getCategories,
  createTournament: mocks.createTournament,
  updateTournament: mocks.updateTournament,
  deleteTournament: mocks.deleteTournament,
  setTournamentCompleted: mocks.setTournamentCompleted,
  reopenTournament: mocks.reopenTournament,
  getSncParentOptions: mocks.getSncParentOptions,
  completeSncParent: mocks.completeSncParent,
  reopenSncParent: mocks.reopenSncParent,
}));
vi.mock("@/services/klubbService", () => ({ getClubs: mocks.getClubs }));
vi.mock("@/services/authService", () => ({
  isAdmin: mocks.isAdmin,
  isClubAdmin: mocks.isClubAdmin,
}));
vi.mock("@/components/ConfirmDialog", () => ({ confirmDialog: mocks.confirmDialog }));

import { mountTournamentForm } from "@/admin/forms/stevneForm";

const XKAST = { id: 10, navn: "Minimatch X-kast" };
const GLOPPEN = { id: 11, navn: "Gloppen" };
const KONGELAG = { id: 20, navn: "Kongelag" };
const CUP = { id: 21, navn: "Cup" };

function host(extra: Record<string, unknown> = {}) {
  const container = document.createElement("div");
  document.body.replaceChildren(container);
  return { container, ...extra };
}

function field<T extends HTMLElement>(container: HTMLElement, name: string): T {
  return container.querySelector<T>(`[name="${name}"]`)!;
}

/** Selectable ids, dropping the leading "not chosen" placeholder. */
function optionValues(container: HTMLElement, name: string): string[] {
  return [...field<HTMLSelectElement>(container, name).options]
    .map((o) => o.value)
    .filter((v) => v !== "");
}

function submit(container: HTMLElement): void {
  container.querySelector("form")!.dispatchEvent(new Event("submit", { cancelable: true }));
}

/** A saved tournament row, overridable per test. */
function row(extra: Record<string, unknown> = {}) {
  return {
    id: 5,
    navn: "Vårstevnet",
    sted: "Førde",
    dato: "2026-07-01",
    tid: "11:00:00",
    klubbid: 1,
    stevnetypeid: 30,
    innledendekastemetodeid: XKAST.id,
    avsluttendekastemetodeid: KONGELAG.id,
    kategoriid: 40,
    ernm: false,
    ernorgesranking: true,
    erfullfort: false,
    erekskludertfrarekorder: false,
    resultaturl: null,
    er_snc_hovudstevne: false,
    snc_hovudstevne_id: null,
    ...extra,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  location.hash = "#/stevne/ny";
  mocks.isAdmin.mockResolvedValue(true);
  mocks.isClubAdmin.mockResolvedValue(false);
  mocks.getClubs.mockResolvedValue({
    data: [{ id: 1, navn: "Førde HK", logourl: null }],
    error: null,
  });
  mocks.getTournamentTypes.mockResolvedValue({
    data: [
      { id: 30, navn: "Trening" },
      { id: 31, navn: "SNC" },
    ],
    error: null,
  });
  mocks.getInitialThrowingMethods.mockResolvedValue({ data: [XKAST, GLOPPEN], error: null });
  mocks.getFinalThrowingMethods.mockResolvedValue({ data: [KONGELAG, CUP], error: null });
  mocks.getCategories.mockResolvedValue({ data: [{ id: 40, navn: "Singel" }], error: null });
  mocks.getSncParentOptions.mockResolvedValue({ data: [], error: null });
});

describe("stevneForm, ordinary tournament", () => {
  it("offers every kastemetode and leaves the format fields editable", async () => {
    const h = host();
    await mountTournamentForm(h);

    expect(optionValues(h.container, "innledendekastemetodeid")).toContain(String(GLOPPEN.id));
    expect(optionValues(h.container, "avsluttendekastemetodeid")).toContain(String(CUP.id));
    expect(field<HTMLSelectElement>(h.container, "stevnetypeid").disabled).toBe(false);
    expect(field<HTMLInputElement>(h.container, "ernorgesranking").disabled).toBe(false);
  });

  it("sends the chosen values on create", async () => {
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountTournamentForm(h);
    field<HTMLInputElement>(h.container, "navn").value = "Nytt stevne";
    field<HTMLInputElement>(h.container, "dato").value = "2026-08-01";
    field<HTMLSelectElement>(h.container, "innledendekastemetodeid").value = String(GLOPPEN.id);
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        navn: "Nytt stevne",
        dato: "2026-08-01",
        innledendekastemetodeid: GLOPPEN.id,
        er_snc_hovudstevne: false,
        snc_hovudstevne_id: null,
      }),
    );
  });
});

describe("stevneForm, SNC umbrella", () => {
  it("narrows the methods to X-kast and Kongelag and forces stevnetype SNC", async () => {
    const h = host();
    await mountTournamentForm(h);

    field<HTMLInputElement>(h.container, "er_snc_hovudstevne").checked = true;
    field<HTMLInputElement>(h.container, "er_snc_hovudstevne").dispatchEvent(new Event("change"));

    expect(optionValues(h.container, "innledendekastemetodeid")).toEqual([String(XKAST.id)]);
    expect(optionValues(h.container, "avsluttendekastemetodeid")).toEqual([String(KONGELAG.id)]);
    expect(field<HTMLSelectElement>(h.container, "stevnetypeid").value).toBe("31");
  });

  it("keeps the umbrella's own format and ranking editable", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ er_snc_hovudstevne: true, stevnetypeid: 31 }),
      error: null,
    });
    const h = host();
    await mountTournamentForm(h, 5);

    expect(field<HTMLSelectElement>(h.container, "innledendekastemetodeid").disabled).toBe(false);
    expect(field<HTMLInputElement>(h.container, "ernorgesranking").disabled).toBe(false);
    // The umbrella cannot also be a local stevne.
    expect(field<HTMLSelectElement>(h.container, "snc_hovudstevne_id").disabled).toBe(true);
  });

  it("consolidates through the SNC rpc rather than complete_stevne", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ er_snc_hovudstevne: true, stevnetypeid: 31 }),
      error: null,
    });
    mocks.confirmDialog.mockResolvedValue(true);
    mocks.completeSncParent.mockResolvedValue({ error: null });
    const h = host();

    await mountTournamentForm(h, 5);
    h.container.querySelector<HTMLButtonElement>("#complete-button")!.click();

    await vi.waitFor(() => expect(mocks.completeSncParent).toHaveBeenCalledWith(5));
    expect(mocks.setTournamentCompleted).not.toHaveBeenCalled();
  });

  it("reopens through the SNC rpc rather than reopen_stevne", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ er_snc_hovudstevne: true, stevnetypeid: 31, erfullfort: true }),
      error: null,
    });
    mocks.confirmDialog.mockResolvedValue(true);
    mocks.reopenSncParent.mockResolvedValue({ error: null });
    const h = host();

    await mountTournamentForm(h, 5);
    h.container.querySelector<HTMLButtonElement>("#reopen-button")!.click();

    await vi.waitFor(() => expect(mocks.reopenSncParent).toHaveBeenCalledWith(5));
    expect(mocks.reopenTournament).not.toHaveBeenCalled();
  });
});

describe("stevneForm, local SNC stevne", () => {
  const parents = [
    { id: 9, navn: "SNC runde 1", dato: "2026-07-01", erfullfort: false },
    { id: 8, navn: "SNC runde 0", dato: "2026-06-01", erfullfort: true },
  ];

  it("locks every field the umbrella owns and explains why", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ snc_hovudstevne_id: 9, stevnetypeid: 31 }),
      error: null,
    });
    const h = host();
    await mountTournamentForm(h, 5);

    for (const name of [
      "stevnetypeid",
      "kategoriid",
      "innledendekastemetodeid",
      "avsluttendekastemetodeid",
      "ernorgesranking",
    ]) {
      expect(field<HTMLInputElement>(h.container, name).disabled, name).toBe(true);
    }
    // A local stevne cannot also be the umbrella.
    expect(field<HTMLInputElement>(h.container, "er_snc_hovudstevne").disabled).toBe(true);
    expect(h.container.querySelector("#snc-arva-note")!.classList.contains("d-none")).toBe(false);
  });

  it("saves the inherited values instead of the nulls a disabled field would submit", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ snc_hovudstevne_id: 9, stevnetypeid: 31 }),
      error: null,
    });
    mocks.updateTournament.mockResolvedValue({ data: { id: 5 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountTournamentForm(h, 5);
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(5, false));
    expect(mocks.updateTournament).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        stevnetypeid: 31,
        kategoriid: 40,
        innledendekastemetodeid: XKAST.id,
        avsluttendekastemetodeid: KONGELAG.id,
        ernorgesranking: true,
        snc_hovudstevne_id: 9,
        er_snc_hovudstevne: false,
      }),
    );
  });

  it("shows a consolidated umbrella but refuses to attach to it", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    const h = host();
    await mountTournamentForm(h);

    const options = [...field<HTMLSelectElement>(h.container, "snc_hovudstevne_id").options];
    const consolidated = options.find((o) => o.value === "8")!;
    expect(consolidated.disabled).toBe(true);
    expect(consolidated.textContent).toContain("konsolidert");
    expect(options.find((o) => o.value === "9")!.disabled).toBe(false);
  });

  it("never lists the stevne being edited as its own umbrella", async () => {
    mocks.getSncParentOptions.mockResolvedValue({
      data: [{ id: 5, navn: "Seg sjølv", dato: "2026-07-01", erfullfort: false }, ...parents],
      error: null,
    });
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ er_snc_hovudstevne: true, stevnetypeid: 31 }),
      error: null,
    });
    const h = host();
    await mountTournamentForm(h, 5);

    expect(optionValues(h.container, "snc_hovudstevne_id")).not.toContain("5");
  });

  it("preselects the umbrella when added from the SNC page", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    location.hash = "#/stevne/ny?snc=9";
    const h = host();
    await mountTournamentForm(h);

    expect(field<HTMLSelectElement>(h.container, "snc_hovudstevne_id").value).toBe("9");
    expect(field<HTMLSelectElement>(h.container, "innledendekastemetodeid").disabled).toBe(true);
  });
});
