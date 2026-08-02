import { formRowHtml, showSaveError, showSuccess, errMsg } from "@/utils/adminForms";
import { confirmDialog } from "@/components/ConfirmDialog";
import { isAdmin, isClubAdmin } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { buildDropdownOptions } from "@/utils/buildDropdownOptions";
import { formNum } from "@/utils/formNum";
import { logError } from "@/utils/logError";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
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
  type TournamentAdminRow,
} from "@/services/stevneService";
import { getClubs } from "@/services/klubbService";
import type { Params } from "@/types";

export async function render(container: HTMLElement, params: Params = {}): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined;
  container.replaceChildren(createLoadingState());

  let clubs: { id: number; navn: string; logourl: string | null }[] = [];
  let tournamentTypes: { id: number; navn: string }[] = [];
  let initialMethods: { id: number; navn: string }[] = [];
  let finalMethods: { id: number; navn: string }[] = [];
  let categories: { id: number; navn: string }[] = [];

  try {
    const results = await Promise.all([
      getClubs(),
      getTournamentTypes(),
      getInitialThrowingMethods(),
      getFinalThrowingMethods(),
      getCategories(),
    ]);
    clubs = results[0].data;
    tournamentTypes = results[1].data;
    initialMethods = results[2].data;
    finalMethods = results[3].data;
    categories = results[4].data;
  } catch (err) {
    logError("stevneadmin.render", err);
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

  const title = id ? `Rediger stevne: ${escHtml(tournament?.navn ?? "")}` : "Nytt stevne";
  const v = tournament ?? ({} as Partial<TournamentAdminRow>);
  const dateValue = v.dato ?? "";
  const timeValue = v.tid ? v.tid.slice(0, 5) : id ? "" : "11:00";
  const defaultCategory = v.kategoriid ?? categories.find((k) => k.navn === "Singel")?.id;

  const clubOpt = buildDropdownOptions(clubs, v.klubbid);
  const typeOpt = buildDropdownOptions(tournamentTypes, v.stevnetypeid);
  const initialOpt = buildDropdownOptions(initialMethods, v.innledendekastemetodeid);
  const finalOpt = buildDropdownOptions(finalMethods, v.avsluttendekastemetodeid);
  const categoryOpt = buildDropdownOptions(categories, defaultCategory);

  container.innerHTML = `
    <div class="container py-4 admin-form-lg">
      <h2 class="mb-4">${title}</h2>
      <form id="tournament-form">
        ${formRowHtml("Namn*", `<input type="text" class="form-control" name="navn" value="${escHtml(v.navn)}" required>`)}
        ${formRowHtml("Stad", `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
        ${formRowHtml("Dato", `<input type="date" class="form-control" name="dato" value="${dateValue}" required>`)}
        ${formRowHtml("Tid", `<input type="time" class="form-control" name="tid" value="${timeValue}">`)}
        ${formRowHtml("Arrangørklubb", `<select class="form-select" name="klubbid">${clubOpt}</select>`)}
        ${formRowHtml("Stevnetype", `<select class="form-select" name="stevnetypeid">${typeOpt}</select>`)}
        ${formRowHtml("Innleiande kastemetode", `<select class="form-select" name="innledendekastemetodeid">${initialOpt}</select>`)}
        ${formRowHtml("Avsluttande kastemetode", `<select class="form-select" name="avsluttendekastemetodeid">${finalOpt}</select>`)}
        ${formRowHtml("Kategori", `<select class="form-select" name="kategoriid">${categoryOpt}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${v.ernm ? " checked" : ""}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${v.ernorgesranking ? " checked" : ""}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${v.erekskludertfrarekorder ? " checked" : ""}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${formRowHtml("Resultat-URL", `<input type="url" class="form-control" name="resultaturl" value="${escHtml(v.resultaturl)}">`)}
        ${
          id
            ? `
          <div class="mb-3 d-flex align-items-center gap-2">
            <span class="fw-semibold">Status:</span>
            <span>${v.erfullfort ? "Fullført" : "Ikkje fullført"}</span>
            ${
              v.erfullfort
                ? `<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">Gjenåpne turnering</button>`
                : `<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">Fullfør turnering</button>`
            }
          </div>`
            : ""
        }
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${id ? `<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>` : ""}
        </div>
      </form>
    </div>`;

  container
    .querySelector<HTMLFormElement>("#tournament-form")!
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const payload = {
        navn: (fd.get("navn") as string).trim(),
        sted: (fd.get("sted") as string).trim() || null,
        dato: fd.get("dato") as string,
        tid: (fd.get("tid") as string) || null,
        klubbid: formNum(fd.get("klubbid")),
        stevnetypeid: formNum(fd.get("stevnetypeid")),
        innledendekastemetodeid: formNum(fd.get("innledendekastemetodeid")),
        avsluttendekastemetodeid: formNum(fd.get("avsluttendekastemetodeid")),
        kategoriid: formNum(fd.get("kategoriid")),
        ernm: fd.get("ernm") === "on",
        ernorgesranking: fd.get("ernorgesranking") === "on",
        erekskludertfrarekorder: fd.get("erekskludertfrarekorder") === "on",
        resultaturl: (fd.get("resultaturl") as string).trim() || null,
      };

      const { data: saved, error } = id
        ? await updateTournament(id, payload)
        : await createTournament(payload);

      if (error) {
        showSaveError(container, errMsg(error));
        return;
      }
      showSuccess(container, "Stevnet er lagra.");
      if (!id)
        setTimeout(() => {
          location.hash = `#/stevne/${saved!.id}/rediger`;
        }, 1500);
    });

  container
    .querySelector<HTMLButtonElement>("#delete-button")
    ?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Slett stevne",
          message: `Slett «${tournament?.navn}»? Dette kan ikkje angrast.`,
          danger: true,
        }))
      )
        return;
      const { error } = await deleteTournament(id!);
      if (error) {
        showSaveError(container, errMsg(error));
        return;
      }
      location.hash = "#/terminliste";
    });

  container
    .querySelector<HTMLButtonElement>("#complete-button")
    ?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Fullfør turnering",
          message: `Fullfør «${tournament?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,
          danger: true,
        }))
      )
        return;
      const { error } = await setTournamentCompleted(id!);
      if (error) {
        showSaveError(container, errMsg(error));
        return;
      }
      showSuccess(container, "Stevnet er fullført.");
      setTimeout(() => {
        void render(container, params);
      }, 1500);
    });

  container
    .querySelector<HTMLButtonElement>("#reopen-button")
    ?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Gjenåpne turnering",
          message: `Gjenåpne «${tournament?.navn}»? Kampar og resultat kan då endres igjen.`,
        }))
      )
        return;
      const { error } = await reopenTournament(id!);
      if (error) {
        showSaveError(container, errMsg(error));
        return;
      }
      showSuccess(container, "Stevnet er gjenåpna.");
      setTimeout(() => {
        void render(container, params);
      }, 1500);
    });
}
