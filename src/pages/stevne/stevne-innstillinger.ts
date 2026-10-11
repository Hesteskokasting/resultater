import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { escHtml } from "@/utils/escHtml";
import { createErrorBanner, createLoadingState } from "@/components/states";
import {
  getTournamentSettings,
  getActiveThrowingMethods,
  getCategories,
  getTournamentTypes,
  updateTournamentSettings,
} from "@/services/stevneService";
import { resetTournament } from "@/services/testDataService";
import {
  isCascadeMethodName,
  isKongelagMethodName,
  isXkastMethodName,
  maxCascadeRounds,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { getPairCount, getRegistrationCount } from "@/services/pameldingService";
import { registerRefetch, reloadRoute } from "@/utils/data/refetchRegistry";

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id }));
  container.replaceChildren(createLoadingState());

  try {
    const [tournamentRes, methodsRes, typesRes, categoriesRes, playerCount, pairCount] =
      await Promise.all([
        getTournamentSettings(id),
        getActiveThrowingMethods(),
        getTournamentTypes(),
        getCategories(),
        getRegistrationCount(id),
        getPairCount(id),
      ]);

    if (tournamentRes.error || !tournamentRes.data) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }

    const stevne = tournamentRes.data;
    const methods = methodsRes.data;

    const isSncParent = stevne.er_snc_hovudstevne === true;
    // A local stevne inherits the format from its umbrella — the DB coerces it
    // back on write, so the format fields are hidden there.
    const sncParentId = stevne.snc_hovudstevne_id;
    const isSncLocal = sncParentId != null;
    // The DB requires stevnetype SNC on an umbrella.
    const typeLocked = isSncParent ? " disabled" : "";
    const initialMethods = methods.filter(
      (m) => m.er_innledende && (!isSncParent || isXkastMethodName(m.navn)),
    );
    const finalMethods = methods.filter(
      (m) => m.er_avsluttende && (!isSncParent || isKongelagMethodName(m.navn)),
    );

    // lag_id rows survive a switch from par to singel, so the kategori decides
    // the unit, not pairCount. With no påmelde there is no cap to show yet.
    const isTeam = stevne.kategori?.erlagbasert ?? false;
    const entryCount = isTeam ? pairCount : playerCount;
    const roundCap = entryCount > 0 ? maxCascadeRounds(entryCount) : null;
    const capUnit = isTeam ? "par" : "spelarar";

    function optionsHtml(list: { id: number; navn: string }[], selectedId: number | null): string {
      return list
        .map(
          (m) =>
            `<option value="${m.id}"${m.id === selectedId ? " selected" : ""}>${escHtml(m.navn)}</option>`,
        )
        .join("");
    }

    container.innerHTML = `
      <div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="stevne-max-480">
          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold">Dato</label>
              <input id="dato" type="date" class="form-control" value="${stevne.dato}" required>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Tid</label>
              <input id="tid" type="time" class="form-control" value="${stevne.tid?.slice(0, 5) ?? ""}">
            </div>
          </div>
          <div class="row g-3 mb-3${isSncLocal ? " d-none" : ""}">
            <div class="col-6">
              <label class="form-label fw-semibold">Stevnetype</label>
              <select id="stevnetype" class="form-select"${typeLocked}>
                <option value="">— Ikkje vald —</option>
                ${optionsHtml(typesRes.data, stevne.stevnetypeid)}
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Innleiande</label>
              <select id="innl-metode" class="form-select">
                <option value="">— Ikkje vald —</option>
                ${optionsHtml(initialMethods, stevne.innledendekastemetodeid)}
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Kategori</label>
              <select id="kategori" class="form-select">
                <option value="">— Ikkje vald —</option>
                ${optionsHtml(categoriesRes.data, stevne.kategoriid)}
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Avsluttande</label>
              <select id="avsl-metode" class="form-select">
                <option value="">— Ikkje vald —</option>
                ${optionsHtml(finalMethods, stevne.avsluttendekastemetodeid)}
              </select>
            </div>
          </div>
          ${
            isSncLocal
              ? `<p class="form-text mb-3">Stevnetype, kategori og kastemetode settes på
                   <a href="#/stevne/${sncParentId}/innstillinger">SNC-hovudstevnet</a>.
                </p>`
              : ""
          }
          <div id="rundar-felt" class="mb-3 d-none">
            <label class="form-label fw-semibold">Antall runder</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${stevne.antall_runder_innl ?? ""}" placeholder="Innleiande">
            <p id="rundar-hjelp" class="form-text d-none"></p>
          </div>
          ${
            isSncParent
              ? `<p class="form-text mb-4">Kastemetoden gjeld heile SNC-runden og blir arva av alle lokalstevna.</p>`
              : `<div class="mb-4">
            <label class="form-label fw-semibold">Tilgjengelege baner</label>
            <input id="tilgjengelege-banar" type="number" min="1" class="form-control"
              value="${stevne.tilgjengelige_baner ?? ""}" placeholder="(X-kast/Kongelag)">
            <p class="form-text">Utan verdi blir X-kast éi pulje. Kongelag blir alltid delt i minst to puljer.</p>
          </div>`
          }
          <button type="submit" class="btn btn-primary">Lagre</button>
          <button type="button" id="rediger-stevne" class="btn btn-outline-secondary ms-2">Fleire innstillingar</button>
          <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
          ${
            isSncParent
              ? ""
              : `<hr class="my-4">
          <div class="border border-danger rounded p-3">
            <h6 class="text-danger mb-2">Farleg sone</h6>
            <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
            <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
          </div>`
          }
        </form>
      </div>`;

    // Editing runs in the overlay so the arrangør keeps this page. A save can
    // change the name and the kastemetodar, which the page header and the tab
    // row above this subpage are drawn from, so the whole route re-renders. A
    // delete leaves nothing to come back to, so it returns to the terminliste.
    // The admin form is loaded on demand — it is far larger than this page.
    container
      .querySelector<HTMLButtonElement>("#rediger-stevne")!
      .addEventListener("click", async () => {
        const { openTournamentEditor } = await import("@/admin/_adminEdit");
        openTournamentEditor(
          id,
          () => void reloadRoute(),
          () => {
            location.hash = "#/terminliste";
          },
        );
      });

    // antall_runder_innl only drives Gloppen/NHM kamp generation — X-kast
    // methods get their omgang count from kastemetode.antall_omganger.
    const initialSelect = container.querySelector<HTMLSelectElement>("#innl-metode")!;
    const roundsField = container.querySelector<HTMLElement>("#rundar-felt")!;
    const roundsInput = container.querySelector<HTMLInputElement>("#antall-rundar")!;
    const roundsHelp = container.querySelector<HTMLParagraphElement>("#rundar-hjelp")!;
    // The selected="" attribute above sets the initial option; assigning value
    // as well keeps the select in sync with the row for the code below, which
    // reads the live select rather than the markup.
    initialSelect.value = String(stevne.innledendekastemetodeid ?? "");

    function selectedMethodName(): string {
      return initialMethods.find((m) => m.id === Number(initialSelect.value))?.navn ?? "";
    }

    // Gloppen pairs the first half of the startnummer against the second, one
    // offset per runde, so it runs out of fresh matchups after ceil(N/2).
    function syncRoundsHelp(): void {
      const method = selectedMethodName();
      const isRoundBased = method !== "" && usesInitialRoundCount(method);
      if (!isRoundBased) {
        roundsHelp.classList.add("d-none");
        return;
      }
      if (isCascadeMethodName(method) && roundCap != null) {
        const overCap = Number(roundsInput.value) > roundCap;
        roundsHelp.textContent = overCap
          ? `For mange rundar: ${entryCount} ${capUnit} gjev maks ${roundCap} rundar utan omkampar.`
          : `Maks ${roundCap} rundar med ${entryCount} ${capUnit} påmelde.`;
        roundsHelp.classList.toggle("text-danger", overCap);
        roundsHelp.classList.remove("d-none");
        return;
      }
      roundsHelp.textContent = "Må setjast før stevnet kan startast.";
      roundsHelp.classList.remove("text-danger");
      roundsHelp.classList.remove("d-none");
    }

    // The field means nothing outside Gloppen/NHM, so it is hidden rather than
    // shown disabled, and its value cleared so a leftover count is not saved.
    function syncRoundsInput(): void {
      const method = selectedMethodName();
      const isRoundBased = method !== "" && usesInitialRoundCount(method);
      roundsField.classList.toggle("d-none", !isRoundBased);
      if (!isRoundBased) roundsInput.value = "";
      syncRoundsHelp();
    }
    syncRoundsInput();
    initialSelect.addEventListener("change", syncRoundsInput);
    roundsInput.addEventListener("input", syncRoundsHelp);

    container
      .querySelector<HTMLFormElement>("#innstillingar-form")!
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const initialId = container.querySelector<HTMLSelectElement>("#innl-metode")!.value || null;
        const finalId = container.querySelector<HTMLSelectElement>("#avsl-metode")!.value || null;
        const date = container.querySelector<HTMLInputElement>("#dato")!.value;
        const time = container.querySelector<HTMLInputElement>("#tid")!.value;
        if (!date) {
          showToast("Dato må setjast.", "error");
          return;
        }
        const typeId = container.querySelector<HTMLSelectElement>("#stevnetype")!.value;
        const categoryId = container.querySelector<HTMLSelectElement>("#kategori")!.value;
        const rounds = container.querySelector<HTMLInputElement>("#antall-rundar")!.value;
        const lanesInput = container.querySelector<HTMLInputElement>("#tilgjengelege-banar");

        const { error } = await updateTournamentSettings(id, {
          innledendekastemetodeid: isSncLocal
            ? stevne.innledendekastemetodeid
            : initialId
              ? Number(initialId)
              : null,
          avsluttendekastemetodeid: isSncLocal
            ? stevne.avsluttendekastemetodeid
            : finalId
              ? Number(finalId)
              : null,
          antall_runder_innl: rounds ? Number(rounds) : null,
          dato: date,
          tid: time || null,
          tilgjengelige_baner: lanesInput?.value ? Number(lanesInput.value) : null,
          stevnetypeid:
            isSncLocal || isSncParent ? stevne.stevnetypeid : typeId ? Number(typeId) : null,
          kategoriid: isSncLocal ? stevne.kategoriid : categoryId ? Number(categoryId) : null,
        });

        if (error) {
          logError("stevne-innstillingar.lagre", error);
          showToast("Feil ved lagring: " + errorMessage(error), "error");
          return;
        }

        // The kategori sets par vs singel for the round cap here and for the
        // tabs above, so the whole route is drawn again.
        if ((categoryId ? Number(categoryId) : null) !== stevne.kategoriid) {
          void reloadRoute();
          return;
        }

        const status = container.querySelector<HTMLElement>("#lagre-status")!;
        status.classList.remove("d-none");
        setTimeout(() => {
          status.classList.add("d-none");
        }, 2000);
      });

    container
      .querySelector<HTMLButtonElement>("#nullstill-btn")
      ?.addEventListener("click", async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        if (
          !(await confirmDialog({
            title: "Nullstill stevne",
            message:
              "Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?",
            danger: true,
          }))
        )
          return;
        btn.disabled = true;
        const { error } = await resetTournament(id);
        if (error) {
          showToast("Feil ved nullstilling: " + errorMessage(error), "error");
          btn.disabled = false;
          return;
        }
        await render(container, { id });
      });
  } catch (err) {
    logError("stevne-innstillingar.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste innstillingar."));
  }
}
