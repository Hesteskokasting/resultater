import { formRowHtml, showSaveError, showSuccess, errMsg } from "@/utils/adminForms";
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
import type { Params } from "@/types";

export async function render(container: HTMLElement, params: Params = {}): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined;

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
    // Creating a club is admin-only; klubbadmin may edit the ones they administer.
    container.replaceChildren(createErrorBanner("Ingen tilgang."));
    return;
  }

  const title = club ? `Rediger klubb: ${escHtml(club.navn)}` : "Ny klubb";

  container.innerHTML = `
    <div class="container py-4 admin-form-sm">
      <h2 class="mb-4">${title}</h2>
      <form id="club-form">
        ${formRowHtml("Namn*", `<input type="text" class="form-control" name="navn" value="${escHtml(club?.navn)}" required>`)}
        ${formRowHtml("Kortnavn", `<input type="text" class="form-control" name="kortnavn" value="${escHtml(club?.kortnavn)}">`)}
        ${formRowHtml("Logo-URL", `<input type="url" class="form-control" name="logourl" value="${escHtml(club?.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${club === null || club.eraktiv ? " checked" : ""}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`;

  container.querySelector<HTMLFormElement>("#club-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload: ClubAdminPayload = {
      navn: (fd.get("navn") as string).trim(),
      kortnavn: (fd.get("kortnavn") as string).trim(),
      logourl: (fd.get("logourl") as string).trim() || null,
      eraktiv: fd.get("eraktiv") === "on",
    };

    if (id) {
      const { error: saveError } = await updateClub(id, payload);
      if (saveError) {
        showSaveError(container, errMsg(saveError));
        return;
      }
      showSuccess(container, "Klubben er lagra.");
      return;
    }

    const { data: saved, error: createError } = await createClub(payload);
    if (createError) {
      showSaveError(container, errMsg(createError));
      return;
    }
    showSuccess(container, "Klubben er oppretta.");
    setTimeout(() => {
      location.hash = `#/klubber/${saved!.id}/admin`;
    }, 1500);
  });
}
