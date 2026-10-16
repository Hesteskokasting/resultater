import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { getTournamentSettings, updateTournamentSettings } from "@/services/stevneService";
import { resetTournament } from "@/services/testDataService";
import { completionLabel, toggleCompletion } from "@/components/stevne/completionActions";
import { registerRefetch, reloadRoute } from "@/utils/data/refetchRegistry";

// Dato, tid, stad, kontaktperson and the format are edited on the Info tiles;
// what is left here are the flags and the actions that change the whole stevne.

type FlagColumn = "ernm" | "ernorgesranking" | "erekskludertfrarekorder";

const FLAGS: { column: FlagColumn; label: string }[] = [
  { column: "ernm", label: "Er NM" },
  { column: "ernorgesranking", label: "Er Norgesranking" },
  { column: "erekskludertfrarekorder", label: "Ekskl. frå rekordar" },
];

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id }));
  container.replaceChildren(createLoadingState());

  try {
    const { data: stevne, error } = await getTournamentSettings(id);
    if (error || !stevne) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }

    const isSncParent = stevne.er_snc_hovudstevne === true;
    const isSncLocal = stevne.snc_hovudstevne_id != null;
    const erfullfort = stevne.erfullfort === true;
    // NM and the record exemption belong to the SNC round as a whole, and the
    // umbrella's ranking flag is inherited — the DB coerces all three on a local.
    const completion = { id, navn: stevne.navn, erfullfort, isSncParent };

    container.innerHTML = `
      <div class="stevne-max-480">
        <h4 class="mb-3">Innstillingar</h4>
        <div class="mb-3">
          ${FLAGS.map(
            ({ column, label }) => `
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="flag-${column}" name="${column}"${stevne[column] ? " checked" : ""}${isSncLocal ? " disabled" : ""}>
            <label class="form-check-label" for="flag-${column}">${label}</label>
          </div>`,
          ).join("")}
          ${
            isSncLocal
              ? `<p class="form-text mb-0">Arva frå
                   <a href="#/stevne/${stevne.snc_hovudstevne_id}/innstillinger">SNC-hovudstevnet</a>.
                </p>`
              : ""
          }
        </div>
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${erfullfort ? (isSncParent ? "Konsolidert" : "Fullført") : "Ikkje fullført"}</span>
          <button type="button" id="fullfor-btn" class="btn btn-sm ${erfullfort ? "btn-outline-warning" : "btn-outline-success"}">${completionLabel(completion)}</button>
        </div>
        <button type="button" id="rediger-stevne" class="btn btn-outline-secondary">Fleire innstillingar</button>
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
      </div>`;

    container.querySelectorAll<HTMLInputElement>("[id^=flag-]").forEach((box) => {
      box.addEventListener("change", async () => {
        box.disabled = true;
        const { error: saveError } = await updateTournamentSettings(id, {
          [box.name as FlagColumn]: box.checked,
        });
        box.disabled = false;
        if (saveError) {
          showToast("Feil ved lagring: " + errorMessage(saveError), "error");
          box.checked = !box.checked;
          return;
        }
        showToast("Lagra", "success");
      });
    });

    // The status badge and the tabs follow erfullfort, so the whole route redraws.
    container.querySelector("#fullfor-btn")!.addEventListener("click", async () => {
      const result = await toggleCompletion(completion);
      if (!result) return;
      if (result.error) {
        showToast(errorMessage(result.error), "error");
        return;
      }
      void reloadRoute();
    });

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
        const { error: resetError } = await resetTournament(id);
        if (resetError) {
          showToast("Feil ved nullstilling: " + errorMessage(resetError), "error");
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
