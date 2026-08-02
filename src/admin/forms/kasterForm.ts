import { formRowHtml, showSaveError, showSuccess, errMsg } from "@/utils/adminForms";
import { isAdmin, isClubAdmin } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { buildDropdownOptions } from "@/utils/buildDropdownOptions";
import { formNum } from "@/utils/formNum";
import { logError } from "@/utils/logError";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import {
  getThrowerForAdmin,
  getClasses,
  getGenders,
  createThrower,
  updateThrower,
  deleteThrower,
  type ThrowerAdminRow,
} from "@/services/kasterService";
import { getClubs } from "@/services/klubbService";
import { formShell } from "./_formHost";
import type { AdminFormHost } from "./_formHost";
import { bindCancelButton, bindDeleteButton } from "./_formButtons";

/** Create/edit form for a thrower. Used by `#/kaster/ny` and by the dashboard overlay. */
export async function mountThrowerForm(host: AdminFormHost, id?: number): Promise<void> {
  const { container } = host;
  container.replaceChildren(createLoadingState());

  let clubs: { id: number; navn: string; logourl: string | null }[] = [];
  let classes: { id: number; navn: string }[] = [];
  let genders: { id: number; navn: string }[] = [];

  try {
    const results = await Promise.all([getClubs(), getClasses(), getGenders()]);
    clubs = results[0].data;
    classes = results[1].data;
    genders = results[2].data;
  } catch (err) {
    logError("kasterForm.mount", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste skjema."));
    return;
  }

  let thrower: ThrowerAdminRow | null = null;
  if (id) {
    const { data, error } = await getThrowerForAdmin(id);
    if (error || !data) {
      container.replaceChildren(createErrorBanner("Utøvar ikkje funne."));
      return;
    }
    thrower = data;

    if (!(await isAdmin()) && !(await isClubAdmin(thrower.klubbid ?? undefined))) {
      container.replaceChildren(createErrorBanner("Ingen tilgang til denne utøvaren."));
      return;
    }
  }

  const v = thrower ?? ({} as Partial<ThrowerAdminRow>);
  const clubOptions = clubs
    .map(
      (k) =>
        `<option value="${k.id}"${k.id === v.klubbid ? " selected" : ""}>${escHtml(k.navn)}</option>`,
    )
    .join("");

  const { wrapper, headingHtml } = formShell(host);
  wrapper.innerHTML = `
    ${headingHtml}
    <form id="thrower-form">
      <div class="admin-form-grid">
        ${formRowHtml("Fornavn*", `<input type="text" class="form-control" name="fornavn" value="${escHtml(v.fornavn)}" required>`)}
        ${formRowHtml("Etternavn*", `<input type="text" class="form-control" name="etternavn" value="${escHtml(v.etternavn)}" required>`)}
      </div>
      <div class="admin-form-grid">
        ${formRowHtml("Kjønn*", `<select class="form-select" name="kjonnid">${buildDropdownOptions(genders, v.kjonnid)}</select>`)}
        ${formRowHtml("Klasse", `<select class="form-select" name="klasseid">${buildDropdownOptions(classes, v.klasseid)}</select>`)}
      </div>
      ${formRowHtml("Klubb", `<select class="form-select" name="klubbid"><option value="">— vel —</option>${clubOptions}</select>`)}
      <div class="admin-form-grid">
        ${formRowHtml("E-post", `<input type="email" class="form-control" name="epost" value="${escHtml(v.epost)}">`)}
        ${formRowHtml("Telefon", `<input type="tel" class="form-control" name="telefon" value="${escHtml(v.telefon)}">`)}
      </div>
      ${formRowHtml("Medlemsnummer", `<input type="number" class="form-control" name="medlemsnummer" value="${v.medlemsnummer ?? ""}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${v.eraktiv !== false ? " checked" : ""}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${host.onCancel ? `<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>` : ""}
        ${id ? `<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>` : ""}
      </div>
    </form>`;

  container.replaceChildren(wrapper);

  wrapper.querySelector<HTMLFormElement>("#thrower-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = {
      fornavn: (fd.get("fornavn") as string).trim(),
      etternavn: (fd.get("etternavn") as string).trim(),
      kjonnid: formNum(fd.get("kjonnid"))!,
      klubbid: formNum(fd.get("klubbid")),
      klasseid: formNum(fd.get("klasseid")),
      epost: (fd.get("epost") as string).trim() || null,
      telefon: (fd.get("telefon") as string).trim() || null,
      medlemsnummer: fd.get("medlemsnummer") ? Number(fd.get("medlemsnummer")) : null,
      eraktiv: fd.get("eraktiv") === "on",
    };

    const { data: saved, error } = id
      ? await updateThrower(id, payload)
      : await createThrower(payload);

    if (error) {
      showSaveError(wrapper, errMsg(error));
      return;
    }
    showSuccess(wrapper, "Utøvaren er lagra.");
    host.onSaved?.(saved?.id ?? id!, !id);
  });

  bindCancelButton(wrapper, host);
  bindDeleteButton(wrapper, {
    title: "Slett utøvar",
    message: `Slett «${thrower?.fornavn} ${thrower?.etternavn}»? Dette kan ikkje angrast.`,
    remove: () => deleteThrower(id!),
    onDeleted: host.onDeleted,
  });
}
