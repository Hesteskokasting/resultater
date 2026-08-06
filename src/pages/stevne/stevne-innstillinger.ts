import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { escHtml } from "@/utils/escHtml";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import {
  getTournamentSettings,
  getActiveThrowingMethods,
  updateTournamentSettings,
} from "@/services/stevneService";
import type { ActiveThrowingMethodRow } from "@/services/stevneService";
import { resetTournament } from "@/services/testDataService";
import {
  isKongelagMethodName,
  isXkastMethodName,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { registerRefetch } from "@/utils/refetchRegistry";

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id }));
  container.replaceChildren(createLoadingState());

  try {
    const [tournamentRes, methodsRes] = await Promise.all([
      getTournamentSettings(id),
      getActiveThrowingMethods(),
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
        <div class="mb-3">
          <a href="#/stevne/${id}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
        </div>
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
          <div class="mb-3">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${stevne.antall_runder_innl ?? ""}" placeholder="t.d. 6">
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

    // antall_runder_innl only drives Gloppen/NHM kamp generation — X-kast
    // methods get their omgang count from kastemetode.antall_omganger.
    const initialSelect = container.querySelector<HTMLSelectElement>("#innl-metode")!;
    const roundsInput = container.querySelector<HTMLInputElement>("#antall-rundar")!;
    function syncRoundsInput(): void {
      const method = initialMethods.find((m) => m.id === Number(initialSelect.value));
      const isRoundBased = method != null && usesInitialRoundCount(method.navn);
      roundsInput.disabled = !isRoundBased;
      if (!isRoundBased) roundsInput.value = "";
      roundsInput.placeholder = isRoundBased ? "t.d. 6" : "Berre for Gloppen/NHM";
    }
    syncRoundsInput();
    initialSelect.addEventListener("change", syncRoundsInput);

    container
      .querySelector<HTMLFormElement>("#innstillingar-form")!
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const initialId = container.querySelector<HTMLSelectElement>("#innl-metode")!.value || null;
        const finalId = container.querySelector<HTMLSelectElement>("#avsl-metode")!.value || null;
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
