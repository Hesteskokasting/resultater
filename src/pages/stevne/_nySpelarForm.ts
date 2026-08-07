import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { buildDropdownOptions } from "@/utils/buildDropdownOptions";
import { formNum } from "@/utils/formNum";
import { createThrower, getGenders } from "@/services/kasterService";
import type { ThrowerListRow } from "@/services/kasterService";
import { getClubs } from "@/services/klubbService";
import { addRegistrationAdmin } from "@/services/pameldingService";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewPlayerFormHandle {
  /** The collapsible panel — insert it where the form should appear */
  element: HTMLElement;
  /** The "Ny spelar" toggle — insert it where the trigger should sit */
  toggle: HTMLButtonElement;
}

export interface NewPlayerFormProps {
  tournamentId: number;
  /**
   * A player was created. `registered` is false when the player was saved to the
   * registry but the enrollment call failed, so the caller can still show them
   * in the available column.
   */
  onCreated: (player: ThrowerListRow, registered: boolean) => void;
}

// Ids must be unique per instance so <label for> stays correct if the page ever
// renders two columns.
let instanceCount = 0;

// ── Factory ───────────────────────────────────────────────────────────────────

export function createNewPlayerForm(props: NewPlayerFormProps): NewPlayerFormHandle {
  const { tournamentId, onCreated } = props;
  const uid = `np${++instanceCount}`;

  let clubs: { id: number; navn: string }[] = [];
  let optionsLoaded = false;
  let submitting = false;

  // ── Toggle button ───────────────────────────────────────────────────────────

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn btn-primary btn-sm flex-shrink-0";
  toggle.textContent = "+ Ny spelar";

  // ── Panel ───────────────────────────────────────────────────────────────────

  const panel = document.createElement("div");
  panel.className = "card card-body p-3 mb-2 d-none";
  panel.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0">Ny spelar</h6>
      <button type="button" class="btn-close" aria-label="Lukk"></button>
    </div>
    <form novalidate>
      <div class="row g-2">
        <div class="col-6">
          <label class="form-label small mb-1" for="${uid}-fornavn">Fornamn</label>
          <input class="form-control form-control-sm" id="${uid}-fornavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${uid}-etternavn">Etternamn</label>
          <input class="form-control form-control-sm" id="${uid}-etternavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${uid}-klubb">Klubb</label>
          <select class="form-select form-select-sm" id="${uid}-klubb"></select>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${uid}-kjonn">Kjønn</label>
          <select class="form-select form-select-sm" id="${uid}-kjonn" required></select>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 mt-3">
        <button type="submit" class="btn btn-primary btn-sm" disabled>Opprett og meld på</button>
        <button type="button" class="btn btn-link btn-sm text-decoration-none px-0">Avbryt</button>
        <span class="text-muted small ms-auto">Lagrast i spelarregisteret</span>
      </div>
    </form>`;

  const form = panel.querySelector("form")!;
  const closeBtn = panel.querySelector<HTMLButtonElement>(".btn-close")!;
  const firstName = panel.querySelector<HTMLInputElement>(`#${uid}-fornavn`)!;
  const lastName = panel.querySelector<HTMLInputElement>(`#${uid}-etternavn`)!;
  const clubSelect = panel.querySelector<HTMLSelectElement>(`#${uid}-klubb`)!;
  const genderSelect = panel.querySelector<HTMLSelectElement>(`#${uid}-kjonn`)!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const cancelBtn = form.querySelector<HTMLButtonElement>('button[type="button"]')!;

  // ── State helpers ───────────────────────────────────────────────────────────

  function isValid(): boolean {
    return (
      firstName.value.trim() !== "" &&
      lastName.value.trim() !== "" &&
      formNum(genderSelect.value) !== null
    );
  }

  function syncSubmitState(): void {
    submitBtn.disabled = submitting || !optionsLoaded || !isValid();
  }

  function setBusy(busy: boolean): void {
    submitting = busy;
    for (const el of [firstName, lastName, clubSelect, genderSelect, cancelBtn, closeBtn]) {
      el.disabled = busy;
    }
    syncSubmitState();
  }

  function reset(): void {
    form.reset();
    syncSubmitState();
  }

  function close(): void {
    panel.classList.add("d-none");
    toggle.classList.remove("d-none");
    reset();
  }

  /** Clubs and genders are only needed once an admin actually opens the form. */
  async function loadOptions(): Promise<void> {
    if (optionsLoaded) return;
    const [clubRes, genderRes] = await Promise.all([getClubs(), getGenders()]);
    if (clubRes.error || genderRes.error) {
      showToast("Kunne ikkje laste klubbar og kjønn.", "error");
      close();
      return;
    }
    clubs = clubRes.data;
    clubSelect.innerHTML = buildDropdownOptions(clubs, null, "— vel —");
    genderSelect.innerHTML = buildDropdownOptions(genderRes.data, null, "— vel —");
    optionsLoaded = true;
    syncSubmitState();
  }

  async function open(): Promise<void> {
    panel.classList.remove("d-none");
    toggle.classList.add("d-none");
    await loadOptions();
    firstName.focus();
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  toggle.addEventListener("click", () => void open());
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);

  for (const el of [firstName, lastName, genderSelect]) {
    el.addEventListener("input", syncSubmitState);
  }

  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !submitting) {
      e.stopPropagation();
      close();
      toggle.focus();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting || !isValid()) return;

    const fornavn = firstName.value.trim();
    const etternavn = lastName.value.trim();
    const kjonnid = formNum(genderSelect.value);
    const klubbid = formNum(clubSelect.value);
    if (kjonnid === null) return;

    setBusy(true);

    const { data: created, error } = await createThrower({
      fornavn,
      etternavn,
      kjonnid,
      klubbid,
      klasseid: null,
      eraktiv: true,
    });

    if (error || !created) {
      showToast("Kunne ikkje opprette spelar: " + errorMessage(error), "error");
      setBusy(false);
      return;
    }

    // The player exists from here on, so a failed enrollment must not look like a
    // failed create — report it separately and still hand the row to the caller.
    const { error: registrationError } = await addRegistrationAdmin(tournamentId, created.id);
    if (registrationError) {
      showToast(
        "Spelaren blei oppretta, men ikkje meldt på: " + errorMessage(registrationError),
        "error",
      );
    }

    const club = klubbid === null ? null : (clubs.find((c) => c.id === klubbid) ?? null);
    onCreated(
      {
        id: created.id,
        fornavn,
        etternavn,
        eraktiv: true,
        avatarurl: null,
        kjonnid,
        klubb: club && { id: club.id, navn: club.navn },
      },
      !registrationError,
    );

    setBusy(false);
    close();
    toggle.focus();
  });

  return { element: panel, toggle };
}
