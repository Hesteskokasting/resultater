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
  getSncParentOptions,
  completeSncParent,
  reopenSncParent,
  type TournamentAdminRow,
  type SncParentOptionRow,
} from "@/services/stevneService";
import { getClubs } from "@/services/klubbService";
import { isXkastMethodName } from "@/utils/kastemetode";
import { formatDate } from "@/utils/shared";
import { formShell } from "./_formHost";
import type { AdminFormHost } from "./_formHost";
import { bindCancelButton, bindDeleteButton } from "./_formButtons";

/** `#/stevne/ny?snc=<id>` — «+ Nytt lokalstevne» frå SNC-sida forvel hovudstevnet. */
function sncParentFromHash(): number | null {
  const raw = new URLSearchParams(location.hash.split("?")[1] ?? "").get("snc");
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

function sncParentOptionsHtml(parents: SncParentOptionRow[], selected: number | null): string {
  let html = `<option value="">— ikkje eit SNC-lokalstevne —</option>`;
  for (const parent of parents) {
    const isSelected = parent.id === selected ? " selected" : "";
    const date = parent.dato ? ` (${formatDate(parent.dato)})` : "";
    html += `<option value="${parent.id}"${isSelected}>${escHtml(parent.navn + date)}</option>`;
  }
  return html;
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

  try {
    const results = await Promise.all([
      getClubs(),
      getTournamentTypes(),
      getInitialThrowingMethods(),
      getFinalThrowingMethods(),
      getCategories(),
      getSncParentOptions(),
    ]);
    clubs = results[0].data;
    tournamentTypes = results[1].data;
    initialMethods = results[2].data;
    finalMethods = results[3].data;
    categories = results[4].data;
    sncParents = results[5].data;
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
  const dateValue = v.dato ?? "";
  const timeValue = v.tid ? v.tid.slice(0, 5) : id ? "" : "11:00";
  const defaultCategory = v.kategoriid ?? categories.find((k) => k.navn === "Singel")?.id;

  const sncParentValue = v.snc_hovudstevne_id ?? (id ? null : sncParentFromHash());
  const isSncParent = v.er_snc_hovudstevne === true;

  const clubOpt = buildDropdownOptions(clubs, v.klubbid);
  const typeOpt = buildDropdownOptions(tournamentTypes, v.stevnetypeid);
  const initialOpt = buildDropdownOptions(initialMethods, v.innledendekastemetodeid);
  const finalOpt = buildDropdownOptions(finalMethods, v.avsluttendekastemetodeid);
  const categoryOpt = buildDropdownOptions(categories, defaultCategory);
  const sncParentOpt = sncParentOptionsHtml(sncParents, sncParentValue);

  const { wrapper, headingHtml } = formShell(host);
  wrapper.innerHTML = `
    ${headingHtml}
    <form id="tournament-form">
      ${formRowHtml("Namn*", `<input type="text" class="form-control" name="navn" value="${escHtml(v.navn)}" required>`)}
      ${formRowHtml("Stad", `<input type="text" class="form-control" name="sted" value="${escHtml(v.sted)}">`)}
      <div class="admin-form-grid">
        ${formRowHtml("Dato", `<input type="date" class="form-control" name="dato" value="${dateValue}" required>`)}
        ${formRowHtml("Tid", `<input type="time" class="form-control" name="tid" value="${timeValue}">`)}
      </div>
      ${formRowHtml("Arrangørklubb", `<select class="form-select" name="klubbid">${clubOpt}</select>`)}
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
      <fieldset class="mb-3 border rounded p-3">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${isSncParent ? " checked" : ""}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne (samlar lokalstevna)</label>
        </div>
        ${formRowHtml("Del av SNC-hovudstevne", `<select class="form-select" name="snc_hovudstevne_id" id="snc-parent">${sncParentOpt}</select>`)}
        <p class="form-text mb-0">
          Eit hovudstevne har ingen eigne kampar — det bind saman lokalstevna og eig den samla
          resultatlista. Eit lokalstevne arvar stevnetype, kategori og kastemetodar frå
          hovudstevnet. SNC må vere X-kast, Kongelag eller begge.
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

  // Eit stevne er anten paraplyen eller ein av stadene — aldri begge (CHECK
  // stevne_snc_ikkje_nesta). Hald dei to felta gjensidig utelukkande i skjemaet
  // òg, så feilen aldri rekk fram til lagringa.
  const sncParentCheckbox = wrapper.querySelector<HTMLInputElement>("#snc-hovud")!;
  const sncParentSelect = wrapper.querySelector<HTMLSelectElement>("#snc-parent")!;
  const select = (name: string): HTMLSelectElement =>
    wrapper.querySelector<HTMLSelectElement>(`[name="${name}"]`)!;
  const typeSelect = select("stevnetypeid");
  const categorySelect = select("kategoriid");
  const initialSelect = select("innledendekastemetodeid");
  const finalSelect = select("avsluttendekastemetodeid");

  /** Byter ut alternativa, men held valet om det framleis finst i lista. */
  function setOptions(target: HTMLSelectElement, items: { id: number; navn: string }[]): void {
    const current = target.value;
    const stillValid = items.some((item) => String(item.id) === current);
    target.innerHTML = buildDropdownOptions(items, stillValid ? current : "");
  }

  function syncSncFields(): void {
    sncParentSelect.disabled = sncParentCheckbox.checked;
    sncParentCheckbox.disabled = sncParentSelect.value !== "";
    const isLocal = sncParentSelect.value !== "";
    const isSnc = isLocal || sncParentCheckbox.checked;

    // SNC er alltid X-kast, Kongelag eller begge — aldri Gloppen, NHM eller cup.
    setOptions(
      initialSelect,
      isSnc ? initialMethods.filter((m) => isXkastMethodName(m.navn)) : initialMethods,
    );
    setOptions(
      finalSelect,
      isSnc ? finalMethods.filter((m) => m.navn.toLowerCase().includes("kongelag")) : finalMethods,
    );

    if (sncParentCheckbox.checked) {
      const sncType = tournamentTypes.find((t) => t.navn === "SNC");
      if (sncType) typeSelect.value = String(sncType.id);
    }

    // Hovudstevnet eig formatet: lokalstevna arvar det, så felta er ikkje deira å setje.
    for (const field of [typeSelect, categorySelect, initialSelect, finalSelect]) {
      field.disabled = isLocal;
    }
  }
  sncParentCheckbox.addEventListener("change", syncSncFields);
  sncParentSelect.addEventListener("change", syncSncFields);
  syncSncFields();

  wrapper
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
        er_snc_hovudstevne: fd.get("er_snc_hovudstevne") === "on",
        snc_hovudstevne_id: formNum(fd.get("snc_hovudstevne_id")),
      };

      const { data: saved, error } = id
        ? await updateTournament(id, payload)
        : await createTournament(payload);

      if (error) {
        showSaveError(wrapper, errMsg(error));
        return;
      }
      showSuccess(wrapper, "Stevnet er lagra.");
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
        showSaveError(wrapper, errMsg(error));
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
        showSaveError(wrapper, errMsg(error));
        return;
      }
      await mountTournamentForm(host, id);
    });
}
