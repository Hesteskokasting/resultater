import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { escHtml } from "@/utils/escHtml";
import { createErrorBanner, createLoadingState } from "@/components/states";
import {
  getTournamentSettings,
  getActiveThrowingMethods,
  updateTournamentSettings,
} from "@/services/stevneService";
import type { ActiveThrowingMethodRow } from "@/services/stevneService";
import { resetTournament } from "@/services/testDataService";
import {
  isCascadeMethodName,
  isKongelagMethodName,
  isXkastMethodName,
  maxCascadeRounds,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { getPairCount, getRegistrationCount } from "@/services/pameldingService";
import { registerRefetch, reloadRoute } from "@/utils/refetchRegistry";

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id }));
  container.replaceChildren(createLoadingState());

  try {
    const [tournamentRes, methodsRes, playerCount, pairCount] = await Promise.all([
      getTournamentSettings(id),
      getActiveThrowingMethods(),
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
    // back on write, so an editable field here would silently do nothing.
    const sncParentId = stevne.snc_hovudstevne_id;
    const isSncLocal = sncParentId != null;
    const methodsLocked = isSncLocal ? " disabled" : "";
    const initialMethods = methods.filter(
      (m) => m.er_innledende && (!isSncParent || isXkastMethodName(m.navn)),
    );
    const finalMethods = methods.filter(
      (m) => m.er_avsluttende && (!isSncParent || isKongelagMethodName(m.navn)),
    );

    // Only a lagbasert stevne can have lag_id rows, so a non-zero pairCount
    // identifies the unit the round cap applies to. With no påmelde at all
    // there is no cap to show yet.
    const isTeam = pairCount > 0;
    const entryCount = isTeam ? pairCount : playerCount;
    const roundCap = entryCount > 0 ? maxCascadeRounds(entryCount) : null;
    const capUnit = isTeam ? "par" : "spelarar";

    function optionsHtml(list: ActiveThrowingMethodRow[], selectedId: number | null): string {
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
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innleiande</label>
            <select id="innl-metode" class="form-select"${methodsLocked}>
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(initialMethods, stevne.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select"${methodsLocked}>
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(finalMethods, stevne.avsluttendekastemetodeid)}
            </select>
          </div>
          ${
            isSncLocal
              ? `<p class="form-text mb-3">Kastemetoden kjem frå
                   <a href="#/stevne/${sncParentId}/innstillinger">SNC-hovudstevnet</a>
                   og kan berre endrast der.</p>`
              : ""
          }
          <div id="rundar-felt" class="mb-3 d-none">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${stevne.antall_runder_innl ?? ""}" placeholder="t.d. 6">
            <p id="rundar-hjelp" class="form-text d-none"></p>
          </div>
          ${
            isSncParent
              ? `<p class="form-text mb-4">Kastemetoden gjeld heile SNC-runden og blir arva av alle lokalstevna.</p>`
              : `<div class="mb-4">
            <label class="form-label fw-semibold">Tilgjengelege baner (X-kast/Kongelag)</label>
            <input id="tilgjengelege-banar" type="number" min="1" class="form-control"
              value="${stevne.tilgjengelige_baner ?? ""}" placeholder="Valfritt">
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
      roundsHelp.textContent = "Påkravd — kampgenereringa stoppar på dette talet.";
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
        const rounds = container.querySelector<HTMLInputElement>("#antall-rundar")!.value;
        const lanesInput = container.querySelector<HTMLInputElement>("#tilgjengelege-banar");

        // Gloppen/NHM generate against this count, so it can't be left unset.
        if (usesInitialRoundCount(selectedMethodName()) && !Number(rounds)) {
          showToast("Antal rundar innleiande må setjast for Gloppen/NHM.", "error");
          roundsInput.focus();
          return;
        }

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
          tilgjengelige_baner: lanesInput?.value ? Number(lanesInput.value) : null,
        });

        if (error) {
          logError("stevne-innstillingar.lagre", error);
          showToast("Feil ved lagring: " + errorMessage(error), "error");
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
