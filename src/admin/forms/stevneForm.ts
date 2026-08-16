import { showToast } from "@/components/Toast";
import { formRowHtml, showFormError } from "@/utils/adminForms";
import { errorMessage } from "@/utils/errorMessage";
import { confirmDialog } from "@/components/ConfirmDialog";
import { isAdmin, isClubAdmin } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { buildDropdownOptions } from "@/utils/buildDropdownOptions";
import { createSearchSelect } from "@/components/SearchSelect";
import { formNum } from "@/utils/formNum";
import { logError } from "@/utils/logError";
import { createErrorBanner, createLoadingState } from "@/components/states";
import {
  getTournamentForAdmin,
  getTournamentTypes,
  getInitialThrowingMethods,
  getFinalThrowingMethods,
  getCategories,
  createTournament,
  updateTournament,
  deleteTournament,
  setTournamentCompleted,
  reopenTournament,
  getSncParentOptions,
  completeSncParent,
  reopenSncParent,
  type TournamentAdminRow,
  type SncParentOptionRow,
} from "@/services/stevneService";
import { getClubs } from "@/services/klubbService";
import { getAllThrowerList, type ThrowerListRow } from "@/services/kasterService";
import { throwerNameLastFirst } from "@/utils/kaster";
import { isKongelagMethodName, isXkastMethodName } from "@/utils/kastemetode";
import { formatDate } from "@/utils/shared";
import { formShell } from "./_formHost";
import type { AdminFormHost } from "./_formHost";
import { bindCancelButton, bindDeleteButton } from "./_formButtons";

/** `#/stevne/ny?snc=<id>` preselects the umbrella when added from the SNC page. */
function sncParentFromHash(): number | null {
  const raw = new URLSearchParams(location.hash.split("?")[1] ?? "").get("snc");
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Create/edit form for a tournament. Used by `#/stevne/ny` and by the dashboard overlay. */
export async function mountTournamentForm(host: AdminFormHost, id?: number): Promise<void> {
  const { container } = host;
  container.replaceChildren(createLoadingState());

  let clubs: { id: number; navn: string; logourl: string | null }[] = [];
  let tournamentTypes: { id: number; navn: string }[] = [];
  let initialMethods: { id: number; navn: string }[] = [];
  let finalMethods: { id: number; navn: string }[] = [];
  let categories: { id: number; navn: string }[] = [];
  let sncParents: SncParentOptionRow[] = [];
  let throwers: ThrowerListRow[] = [];

  try {
    const results = await Promise.all([
      getClubs(),
      getTournamentTypes(),
      getInitialThrowingMethods(),
      getFinalThrowingMethods(),
      getCategories(),
      getSncParentOptions(),
      getAllThrowerList(),
    ]);
    clubs = results[0].data;
    tournamentTypes = results[1].data;
    initialMethods = results[2].data;
    finalMethods = results[3].data;
    categories = results[4].data;
    sncParents = results[5].data;
    throwers = results[6].data;
  } catch (err) {
    logError("stevneForm.mount", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste skjema."));
    return;
  }

  let tournament: TournamentAdminRow | null = null;
  if (id) {
    const { data, error } = await getTournamentForAdmin(id);
    if (error || !data) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }
    tournament = data;

    if (!(await isAdmin()) && !(await isClubAdmin(tournament.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner("Ingen tilgang til dette stevnet."));
      return;
    }
  }

  const v = tournament ?? ({} as Partial<TournamentAdminRow>);
  const defaultCategory = v.kategoriid ?? categories.find((k) => k.navn === "Singel")?.id;

  // A local stevne is only ever created from the umbrella's own page.
  const sncParentValue = id ? (v.snc_hovudstevne_id ?? null) : sncParentFromHash();
  const sncParent = sncParents.find((p) => p.id === sncParentValue) ?? null;
  const isLocal = id ? v.snc_hovudstevne_id != null : sncParent !== null;
  const localParentId = isLocal ? sncParentValue : null;
  const isSncParent = v.er_snc_hovudstevne === true;

  const newLocal = isLocal && !id;
  const nameValue = v.navn ?? (newLocal ? (sncParent?.navn ?? "") : "");
  const dateValue = v.dato ?? (newLocal ? (sncParent?.dato ?? "") : "");
  const timeValue = v.tid
    ? v.tid.slice(0, 5)
    : id
      ? ""
      : newLocal
        ? (sncParent?.tid?.slice(0, 5) ?? "")
        : "11:00";

  const clubOpt = buildDropdownOptions(clubs, v.klubbid);
  const typeOpt = buildDropdownOptions(tournamentTypes, v.stevnetypeid);
  const initialOpt = buildDropdownOptions(initialMethods, v.innledendekastemetodeid);
  const finalOpt = buildDropdownOptions(finalMethods, v.avsluttendekastemetodeid);
  const categoryOpt = buildDropdownOptions(categories, defaultCategory);
  // A new stevne only offers active throwers. On edit, inactive ones stay listed
  // so an existing contact never falls out of the picker and gets nulled on save.
  const contactItems = throwers
    .filter((k) => k.eraktiv || id != null)
    .map((k) => ({
      id: k.id,
      label: throwerNameLastFirst(k) + (k.eraktiv ? "" : " (inaktiv)"),
      sublabel: k.klubb?.navn ?? null,
    }));
  const sncParentLabel = sncParent
    ? escHtml(sncParent.navn) + (sncParent.dato ? ` (${formatDate(sncParent.dato)})` : "")
    : "";

  const { wrapper, headingHtml } = formShell(host);
  wrapper.innerHTML = `
    ${headingHtml}
    <form id="tournament-form">
      ${
        isLocal
          ? `<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${sncParentLabel ? ` ${sncParentLabel}` : ""}.</div>
        </div>`
          : ""
      }
      ${formRowHtml("Namn*", `<input type="text" class="form-control" name="navn" value="${escHtml(nameValue)}" required>`)}
      ${formRowHtml("Stad", `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
      <div class="admin-form-grid">
        ${formRowHtml("Dato", `<input type="date" class="form-control" name="dato" value="${dateValue}" required>`)}
        ${formRowHtml("Tid", `<input type="time" class="form-control" name="tid" value="${timeValue}">`)}
      </div>
      <div class="admin-form-grid">
        ${formRowHtml("Arrangørklubb", `<select class="form-select" name="klubbid">${clubOpt}</select>`)}
        ${formRowHtml("Kontaktperson", `<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${formRowHtml("Stevnetype", `<select class="form-select" name="stevnetypeid">${typeOpt}</select>`)}
        ${formRowHtml("Kategori", `<select class="form-select" name="kategoriid">${categoryOpt}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${formRowHtml("Innleiande kastemetode", `<select class="form-select" name="innledendekastemetodeid">${initialOpt}</select>`)}
        ${formRowHtml("Avsluttande kastemetode", `<select class="form-select" name="avsluttendekastemetodeid">${finalOpt}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${v.ernm ? " checked" : ""}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${v.ernorgesranking ? " checked" : ""}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${v.erekskludertfrarekorder ? " checked" : ""}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${formRowHtml("Resultat-URL", `<input type="url" class="form-control" name="resultaturl" value="${escHtml(v.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3 d-none" id="snc-fieldset">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${isSncParent ? " checked" : ""}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne</label>
        </div>
        <p class="form-text mb-0">

        </p>
      </fieldset>
      ${
        id
          ? `
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${v.erfullfort ? (isSncParent ? "Konsolidert" : "Fullført") : "Ikkje fullført"}</span>
          ${
            v.erfullfort
              ? `<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${isSncParent ? "Gjenopne SNC-runden" : "Gjenåpne turnering"}</button>`
              : `<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${isSncParent ? "Konsolider SNC-runden" : "Fullfør turnering"}</button>`
          }
        </div>`
          : ""
      }
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${host.onCancel ? `<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>` : ""}
        ${id ? `<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>` : ""}
      </div>
    </form>`;

  container.replaceChildren(wrapper);

  createSearchSelect({
    slot: wrapper.querySelector("#kontakt-slot")!,
    items: contactItems,
    name: "kontaktkasterid",
    value: v.kontaktkasterid ?? null,
    placeholder: "Søk på etternamn eller fornamn…",
    clearLabel: "— ingen kontaktperson —",
  });

  const sncParentCheckbox = wrapper.querySelector<HTMLInputElement>("#snc-hovud")!;
  const sncFieldset = wrapper.querySelector<HTMLElement>("#snc-fieldset")!;
  const select = (name: string): HTMLSelectElement =>
    wrapper.querySelector<HTMLSelectElement>(`[name="${name}"]`)!;
  const typeSelect = select("stevnetypeid");
  const categorySelect = select("kategoriid");
  const initialSelect = select("innledendekastemetodeid");
  const finalSelect = select("avsluttendekastemetodeid");
  const rankingCheckbox = wrapper.querySelector<HTMLInputElement>("#ernr")!;
  const nmCheckbox = wrapper.querySelector<HTMLInputElement>("#ernm")!;
  const excludeCheckbox = wrapper.querySelector<HTMLInputElement>("#ekskl")!;

  // ernm is the authoritative NM flag, so stevnetype NM ticks it.
  const nmTypeId = tournamentTypes.find((t) => t.navn === "NM")?.id;
  const sncTypeId = tournamentTypes.find((t) => t.navn === "SNC")?.id;
  // The SNC block keys off the chosen type, so the saved one has to be the
  // select's value and not just a `selected` attribute in the markup.
  if (v.stevnetypeid != null) typeSelect.value = String(v.stevnetypeid);
  const isSncType = (): boolean => sncTypeId != null && typeSelect.value === String(sncTypeId);

  typeSelect.addEventListener("change", () => {
    if (nmTypeId != null && typeSelect.value === String(nmTypeId)) nmCheckbox.checked = true;
    // Stevnetype SNC only makes sense as an umbrella here — locals are added
    // from the SNC page and never reach this branch.
    if (isSncType()) sncParentCheckbox.checked = true;
    syncSncFields();
  });

  /** Replaces the options, keeping the current value if it is still listed. */
  function setOptions(target: HTMLSelectElement, items: { id: number; navn: string }[]): void {
    const current = target.value;
    const stillValid = items.some((item) => String(item.id) === current);
    target.innerHTML = buildDropdownOptions(items, stillValid ? current : "");
  }

  function syncSncFields(): void {
    // The umbrella flag is only offered on stevnetype SNC — the DB rejects it on
    // anything else — and never on a local, which is one of the umbrella's own.
    if (!isSncType()) sncParentCheckbox.checked = false;
    sncFieldset.classList.toggle("d-none", isLocal || !isSncType());
    const isSnc = isLocal || sncParentCheckbox.checked;

    // SNC is always X-kast, Kongelag or both — never Gloppen, NHM or cup.
    setOptions(
      initialSelect,
      isSnc ? initialMethods.filter((m) => isXkastMethodName(m.navn)) : initialMethods,
    );
    setOptions(
      finalSelect,
      isSnc ? finalMethods.filter((m) => isKongelagMethodName(m.navn)) : finalMethods,
    );

    // Show the values the local stevne will actually be saved with instead of
    // "— velg —": the trigger coerces them to the umbrella's on write anyway.
    if (isLocal && sncParent) {
      const setValue = (target: HTMLSelectElement, value: number | null): void => {
        target.value = value == null ? "" : String(value);
      };
      setValue(typeSelect, sncParent.stevnetypeid);
      setValue(categorySelect, sncParent.kategoriid);
      setValue(initialSelect, sncParent.innledendekastemetodeid);
      setValue(finalSelect, sncParent.avsluttendekastemetodeid);
      rankingCheckbox.checked = sncParent.ernorgesranking;
    }

    // NM and the record exemption belong to the round as a whole, never to one
    // venue in it — the merged list is what counts.
    for (const flag of [nmCheckbox, excludeCheckbox]) {
      flag.disabled = isLocal;
      if (isLocal) flag.checked = false;
    }

    // The umbrella owns the format and the ranking flag; locals inherit both, and
    // trg_stevne_snc_invariantar coerces them back on write — so an editable
    // control here would silently do nothing.
    for (const field of [typeSelect, categorySelect, initialSelect, finalSelect, rankingCheckbox]) {
      field.disabled = isLocal;
    }
  }
  sncParentCheckbox.addEventListener("change", syncSncFields);
  syncSncFields();

  wrapper
    .querySelector<HTMLFormElement>("#tournament-form")!
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      // The inherited fields are disabled for a local stevne, so FormData omits
      // them. Send the umbrella's values instead of nulls — the DB would coerce
      // them anyway, but the payload should say what it means.
      const parent = sncParent;
      const payload = {
        navn: (fd.get("navn") as string).trim(),
        sted: (fd.get("sted") as string).trim() || null,
        dato: fd.get("dato") as string,
        tid: (fd.get("tid") as string) || null,
        klubbid: formNum(fd.get("klubbid")),
        stevnetypeid: isLocal
          ? (parent?.stevnetypeid ?? v.stevnetypeid ?? null)
          : formNum(fd.get("stevnetypeid")),
        innledendekastemetodeid: isLocal
          ? (parent?.innledendekastemetodeid ?? v.innledendekastemetodeid ?? null)
          : formNum(fd.get("innledendekastemetodeid")),
        avsluttendekastemetodeid: isLocal
          ? (parent?.avsluttendekastemetodeid ?? v.avsluttendekastemetodeid ?? null)
          : formNum(fd.get("avsluttendekastemetodeid")),
        kategoriid: isLocal
          ? (parent?.kategoriid ?? v.kategoriid ?? null)
          : formNum(fd.get("kategoriid")),
        kontaktkasterid: formNum(fd.get("kontaktkasterid")),
        ernm: isLocal ? false : fd.get("ernm") === "on",
        ernorgesranking: isLocal
          ? (parent?.ernorgesranking ?? v.ernorgesranking ?? false)
          : fd.get("ernorgesranking") === "on",
        erekskludertfrarekorder: isLocal ? false : fd.get("erekskludertfrarekorder") === "on",
        resultaturl: (fd.get("resultaturl") as string).trim() || null,
        er_snc_hovudstevne: !isLocal && sncParentCheckbox.checked,
        snc_hovudstevne_id: localParentId,
      };

      const { data: saved, error } = id
        ? await updateTournament(id, payload)
        : await createTournament(payload);

      if (error) {
        showFormError(wrapper, errorMessage(error));
        return;
      }
      showToast(id ? "Stevnet er lagra." : "Stevnet er oppretta.", "success");
      host.onSaved?.(saved?.id ?? id!, !id);
    });

  bindCancelButton(wrapper, host);
  bindDeleteButton(wrapper, {
    title: "Slett stevne",
    message: `Slett «${tournament?.navn}»? Dette kan ikkje angrast.`,
    remove: () => deleteTournament(id!),
    onDeleted: host.onDeleted,
  });

  wrapper
    .querySelector<HTMLButtonElement>("#complete-button")
    ?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: isSncParent ? "Konsolider SNC-runden" : "Fullfør turnering",
          message: isSncParent
            ? `Slå saman lokalresultata i «${tournament?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`
            : `Fullfør «${tournament?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,
          danger: true,
        }))
      )
        return;
      const { error } = isSncParent
        ? await completeSncParent(id!)
        : await setTournamentCompleted(id!);
      if (error) {
        showFormError(wrapper, errorMessage(error));
        return;
      }
      await mountTournamentForm(host, id);
    });

  wrapper
    .querySelector<HTMLButtonElement>("#reopen-button")
    ?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: isSncParent ? "Gjenopne SNC-runden" : "Gjenåpne turnering",
          message: isSncParent
            ? `Gjenopne «${tournament?.navn}»? Den samla lista og NC-poenga blir nullstilte.`
            : `Gjenåpne «${tournament?.navn}»? Kampar og resultat kan då endres igjen.`,
          danger: isSncParent,
        }))
      )
        return;
      const { error } = isSncParent ? await reopenSncParent(id!) : await reopenTournament(id!);
      if (error) {
        showFormError(wrapper, errorMessage(error));
        return;
      }
      await mountTournamentForm(host, id);
    });
}
