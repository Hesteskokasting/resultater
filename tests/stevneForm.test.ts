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
  getAllThrowerList: vi.fn(),
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
vi.mock("@/services/kasterService", () => ({ getAllThrowerList: mocks.getAllThrowerList }));
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
    kontaktkasterid: 61,
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
      { id: 32, navn: "NM" },
    ],
    error: null,
  });
  mocks.getInitialThrowingMethods.mockResolvedValue({ data: [XKAST, GLOPPEN], error: null });
  mocks.getFinalThrowingMethods.mockResolvedValue({ data: [KONGELAG, CUP], error: null });
  mocks.getCategories.mockResolvedValue({ data: [{ id: 40, navn: "Singel" }], error: null });
  mocks.getSncParentOptions.mockResolvedValue({ data: [], error: null });
  mocks.getAllThrowerList.mockResolvedValue({
    data: [
      { id: 61, fornavn: "Kari", etternavn: "Nordmann", eraktiv: true },
      { id: 62, fornavn: "Ola", etternavn: "Slutta", eraktiv: false },
    ],
    error: null,
  });
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

  it("sends the chosen kontaktperson on create", async () => {
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountTournamentForm(h);
    field<HTMLInputElement>(h.container, "navn").value = "Nytt stevne";
    field<HTMLInputElement>(h.container, "dato").value = "2026-08-01";
    field<HTMLSelectElement>(h.container, "kontaktkasterid").value = "61";
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({ kontaktkasterid: 61 }),
    );
  });

  it("lists only active kontaktpersonar on create, etternavn first", async () => {
    const h = host();
    await mountTournamentForm(h);

    expect(optionValues(h.container, "kontaktkasterid")).toEqual(["61"]);
    const [, active] = [...field<HTMLSelectElement>(h.container, "kontaktkasterid").options];
    expect(active!.textContent).toBe("Nordmann Kari");
  });

  it("preselects the saved kontaktperson and keeps it on save", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({ data: row(), error: null });
    mocks.updateTournament.mockResolvedValue({ data: { id: 5 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountTournamentForm(h, 5);
    expect(field<HTMLSelectElement>(h.container, "kontaktkasterid").value).toBe("61");
    // Inactive throwers stay listed so an existing contact is never dropped.
    expect(optionValues(h.container, "kontaktkasterid")).toContain("62");

    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(5, false));
    expect(mocks.updateTournament).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ kontaktkasterid: 61 }),
    );
  });

  it("ticks Er NM when stevnetype NM is chosen, and leaves it be otherwise", async () => {
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });
    await mountTournamentForm(h);

    const type = field<HTMLSelectElement>(h.container, "stevnetypeid");
    const nm = field<HTMLInputElement>(h.container, "ernm");
    type.value = "32";
    type.dispatchEvent(new Event("change"));
    expect(nm.checked).toBe(true);

    // Moving away from NM does not silently undo the flag.
    type.value = "30";
    type.dispatchEvent(new Event("change"));
    expect(nm.checked).toBe(true);

    field<HTMLInputElement>(h.container, "navn").value = "NM 2026";
    field<HTMLInputElement>(h.container, "dato").value = "2026-08-01";
    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(expect.objectContaining({ ernm: true }));
  });

  it("clears the kontaktperson when set to none", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({ data: row(), error: null });
    mocks.updateTournament.mockResolvedValue({ data: { id: 5 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });

    await mountTournamentForm(h, 5);
    field<HTMLSelectElement>(h.container, "kontaktkasterid").value = "";
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(5, false));
    expect(mocks.updateTournament).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ kontaktkasterid: null }),
    );
  });
});

describe("stevneForm, SNC umbrella", () => {
  const fieldset = (container: HTMLElement): HTMLElement =>
    container.querySelector<HTMLElement>("#snc-fieldset")!;

  it("hides the SNC block until stevnetype SNC is chosen, then ticks the umbrella flag", async () => {
    const h = host();
    await mountTournamentForm(h);

    expect(fieldset(h.container).classList.contains("d-none")).toBe(true);

    const type = field<HTMLSelectElement>(h.container, "stevnetypeid");
    type.value = "31";
    type.dispatchEvent(new Event("change"));

    expect(fieldset(h.container).classList.contains("d-none")).toBe(false);
    expect(field<HTMLInputElement>(h.container, "er_snc_hovudstevne").checked).toBe(true);
    expect(optionValues(h.container, "innledendekastemetodeid")).toEqual([String(XKAST.id)]);
    expect(optionValues(h.container, "avsluttendekastemetodeid")).toEqual([String(KONGELAG.id)]);
  });

  it("hides the block and drops the umbrella flag when the type moves away from SNC", async () => {
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });
    await mountTournamentForm(h);

    const type = field<HTMLSelectElement>(h.container, "stevnetypeid");
    type.value = "31";
    type.dispatchEvent(new Event("change"));
    type.value = "30";
    type.dispatchEvent(new Event("change"));

    expect(fieldset(h.container).classList.contains("d-none")).toBe(true);
    expect(field<HTMLInputElement>(h.container, "er_snc_hovudstevne").checked).toBe(false);

    field<HTMLInputElement>(h.container, "navn").value = "Vårstevnet";
    field<HTMLInputElement>(h.container, "dato").value = "2026-08-01";
    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({ er_snc_hovudstevne: false, snc_hovudstevne_id: null }),
    );
  });

  it("keeps the umbrella's own format and ranking editable", async () => {
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ er_snc_hovudstevne: true, stevnetypeid: 31 }),
      error: null,
    });
    const h = host();
    await mountTournamentForm(h, 5);

    expect(fieldset(h.container).classList.contains("d-none")).toBe(false);
    expect(field<HTMLSelectElement>(h.container, "innledendekastemetodeid").disabled).toBe(false);
    expect(field<HTMLInputElement>(h.container, "ernorgesranking").disabled).toBe(false);
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
  /** An umbrella carries the format its locals inherit. */
  function parent(extra: Record<string, unknown> = {}) {
    return {
      id: 9,
      navn: "SNC runde 1",
      dato: "2026-07-01",
      tid: "12:30:00",
      erfullfort: false,
      stevnetypeid: 31,
      kategoriid: 40,
      innledendekastemetodeid: XKAST.id,
      avsluttendekastemetodeid: KONGELAG.id,
      ernorgesranking: true,
      ...extra,
    };
  }
  const parents = [
    parent(),
    parent({ id: 8, navn: "SNC runde 0", dato: "2026-06-01", erfullfort: true }),
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
    // A local stevne cannot also be the umbrella, so the block is not offered.
    expect(h.container.querySelector("#snc-fieldset")!.classList.contains("d-none")).toBe(true);
    expect(h.container.querySelector(".alert-info")!.textContent).toContain("SNC runde 1");
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

  it("names the umbrella and prefills the name when added from the SNC page", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    location.hash = "#/stevne/ny?snc=9";
    const h = host();
    await mountTournamentForm(h);

    expect(h.container.querySelector(".alert-info")!.textContent).toContain("SNC runde 1");
    expect(field<HTMLInputElement>(h.container, "navn").value).toBe("SNC runde 1");
    expect(field<HTMLSelectElement>(h.container, "innledendekastemetodeid").disabled).toBe(true);
  });

  it("saves the umbrella from the hash even though no control carries it", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    location.hash = "#/stevne/ny?snc=9";
    const onSaved = vi.fn();
    const h = host({ onSaved });
    await mountTournamentForm(h);

    field<HTMLInputElement>(h.container, "navn").value = "Lokalt i Førde";
    submit(h.container);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({ snc_hovudstevne_id: 9, er_snc_hovudstevne: false }),
    );
  });

  it("falls back to an ordinary stevne when the hash points at no known umbrella", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    location.hash = "#/stevne/ny?snc=999";
    const h = host();
    await mountTournamentForm(h);

    expect(h.container.querySelector(".alert-info")).toBeNull();
    expect(field<HTMLSelectElement>(h.container, "stevnetypeid").disabled).toBe(false);
  });

  it("fills date, time and the inherited format from the umbrella on a new local", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.createTournament.mockResolvedValue({ data: { id: 7 }, error: null });
    location.hash = "#/stevne/ny?snc=9";
    const onSaved = vi.fn();
    const h = host({ onSaved });
    await mountTournamentForm(h);

    expect(field<HTMLInputElement>(h.container, "dato").value).toBe("2026-07-01");
    expect(field<HTMLInputElement>(h.container, "tid").value).toBe("12:30");
    expect(field<HTMLSelectElement>(h.container, "stevnetypeid").value).toBe("31");
    expect(field<HTMLSelectElement>(h.container, "kategoriid").value).toBe("40");
    expect(field<HTMLSelectElement>(h.container, "innledendekastemetodeid").value).toBe(
      String(XKAST.id),
    );
    expect(field<HTMLSelectElement>(h.container, "avsluttendekastemetodeid").value).toBe(
      String(KONGELAG.id),
    );
    expect(field<HTMLInputElement>(h.container, "ernorgesranking").checked).toBe(true);

    field<HTMLInputElement>(h.container, "navn").value = "Lokalt i Førde";
    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(7, true));
    expect(mocks.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        dato: "2026-07-01",
        tid: "12:30",
        stevnetypeid: 31,
        kategoriid: 40,
        innledendekastemetodeid: XKAST.id,
        avsluttendekastemetodeid: KONGELAG.id,
        ernorgesranking: true,
      }),
    );
  });

  it("keeps the local's own date when editing", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({ snc_hovudstevne_id: 9, stevnetypeid: 31, dato: "2026-07-02", tid: "09:00:00" }),
      error: null,
    });
    const h = host();
    await mountTournamentForm(h, 5);

    expect(field<HTMLInputElement>(h.container, "dato").value).toBe("2026-07-02");
    expect(field<HTMLInputElement>(h.container, "tid").value).toBe("09:00");
  });

  it("refuses NM and the record exemption on a local, and saves them false", async () => {
    mocks.getSncParentOptions.mockResolvedValue({ data: parents, error: null });
    mocks.getTournamentForAdmin.mockResolvedValue({
      data: row({
        snc_hovudstevne_id: 9,
        stevnetypeid: 31,
        ernm: true,
        erekskludertfrarekorder: true,
      }),
      error: null,
    });
    mocks.updateTournament.mockResolvedValue({ data: { id: 5 }, error: null });
    const onSaved = vi.fn();
    const h = host({ onSaved });
    await mountTournamentForm(h, 5);

    for (const name of ["ernm", "erekskludertfrarekorder"]) {
      const flag = field<HTMLInputElement>(h.container, name);
      expect(flag.disabled, name).toBe(true);
      expect(flag.checked, name).toBe(false);
    }

    submit(h.container);
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(5, false));
    expect(mocks.updateTournament).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ ernm: false, erekskludertfrarekorder: false }),
    );
  });
});
