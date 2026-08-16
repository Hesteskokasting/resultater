import { formRowHtml, showAlert } from "@/utils/adminForms";
import { errorMessage } from "@/utils/errorMessage";
import { isAdmin, isClubAdmin } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import {
  createClub,
  getClubForAdmin,
  updateClub,
  type ClubAdminPayload,
  type ClubAdminRow,
} from "@/services/klubbService";
import { formShell } from "./_formHost";
import type { AdminFormHost } from "./_formHost";
import { bindCancelButton } from "./_formButtons";

/**
 * Create/edit form for a club. Creating is admin-only; a klubbadmin may edit the
 * clubs they administer (mirrors the RLS policies on `klubb`).
 */
export async function mountClubForm(host: AdminFormHost, id?: number): Promise<void> {
  const { container } = host;
  container.replaceChildren(createLoadingState());

  let club: ClubAdminRow | null = null;

  if (id) {
    const { data, error } = await getClubForAdmin(id);
    if (error || !data) {
      container.replaceChildren(createErrorBanner("Klubb ikkje funne."));
      return;
    }
    club = data;

    if (!(await isAdmin()) && !(await isClubAdmin(id))) {
      container.replaceChildren(createErrorBanner("Ingen tilgang til denne klubben."));
      return;
    }
  } else if (!(await isAdmin())) {
    container.replaceChildren(createErrorBanner("Ingen tilgang."));
    return;
  }

  const { wrapper, headingHtml } = formShell(host);
  wrapper.innerHTML = `
    ${headingHtml}
    <form id="club-form">
      <div class="admin-form-grid">
        ${formRowHtml("Namn*", `<input type="text" class="form-control" name="navn" value="${escHtml(club?.navn)}" required>`)}
        ${formRowHtml("Kortnavn", `<input type="text" class="form-control" name="kortnavn" value="${escHtml(club?.kortnavn)}">`)}
      </div>
      ${formRowHtml("Logo-URL", `<input type="url" class="form-control" name="logourl" value="${escHtml(club?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${club === null || club.eraktiv ? " checked" : ""}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${host.onCancel ? `<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>` : ""}
      </div>
    </form>`;

  container.replaceChildren(wrapper);

  wrapper.querySelector<HTMLFormElement>("#club-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload: ClubAdminPayload = {
      navn: (fd.get("navn") as string).trim(),
      kortnavn: (fd.get("kortnavn") as string).trim(),
      logourl: (fd.get("logourl") as string).trim() || null,
      eraktiv: fd.get("eraktiv") === "on",
    };

    if (id) {
      const { error } = await updateClub(id, payload);
      if (error) {
        showAlert(wrapper, errorMessage(error), "danger");
        return;
      }
      showAlert(wrapper, "Klubben er lagra.", "success");
      host.onSaved?.(id, false);
      return;
    }

    const { data: saved, error } = await createClub(payload);
    if (error) {
      showAlert(wrapper, errorMessage(error), "danger");
      return;
    }
    showAlert(wrapper, "Klubben er oppretta.", "success");
    host.onSaved?.(saved!.id, true);
  });

  bindCancelButton(wrapper, host);
}
