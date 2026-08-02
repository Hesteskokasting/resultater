import {
  confirmCupMatch,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import { sideNameHtml } from "@/organizer/org-shared";
import type { MatchSide } from "@/utils/kamp";
import { showToast } from "@/components/Toast";

type FinalMatchPlayerKnown = FinalMatchPlayerRow & { kasterid: number };

/**
 * Confirm a 3-side cup match: pick the two sides that advance, the remaining
 * side is eliminated. A side is one player (Singel) or a pair (Par/Mix).
 * Sides are identified by their rep's kasterid.
 */
export function openThreeSideConfirmDialog(
  kamp: FinalMatchRow,
  sides: MatchSide<FinalMatchPlayerKnown>[],
  stevneid: number,
  afterConfirm: () => Promise<void>,
): void {
  const names = sides.map((side) => sideNameHtml(side, false));
  const selected: number[] = []; // rep kasterids of advancing sides, in rank order

  const modal = document.createElement("div");
  modal.className = "final-dialog-overlay";
  document.body.appendChild(modal);

  function renderDialog(): void {
    const eliminated =
      selected.length === 2 ? sides.find((s) => !selected.includes(s.rep.kasterid)) : null;
    modal.innerHTML = `
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${sides
            .map((side, i) => {
              const idx = selected.indexOf(side.rep.kasterid);
              const isSelected = idx !== -1;
              const isEliminated = !!eliminated && eliminated.rep.kasterid === side.rep.kasterid;
              const placementLabel = idx === 0 ? "1. plass" : idx === 1 ? "2. plass" : "";
              return `<button
              class="btn ${isSelected ? "btn-success" : isEliminated ? "btn-outline-danger" : "btn-outline-secondary"} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${side.rep.kasterid}"
              ${isEliminated ? "disabled" : ""}
            ><span>${names[i]}</span>${
              placementLabel
                ? `<span class="badge bg-success-subtle text-success-emphasis">${placementLabel}</span>`
                : isEliminated
                  ? `<span class="badge bg-danger">Utslått</span>`
                  : ""
            }</button>`;
            })
            .join("")}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${selected.length !== 2 ? "disabled" : ""}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `;

    modal.querySelector("#avbryt-tre-btn")!.addEventListener("click", () => modal.remove());

    modal.querySelectorAll<HTMLElement>("[data-kasterid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kid = Number(btn.dataset.kasterid);
        const idx = selected.indexOf(kid);
        if (idx !== -1) selected.splice(idx, 1);
        else if (selected.length < 2) selected.push(kid);
        renderDialog();
      });
    });

    modal.querySelector("#bekreft-tre-btn")?.addEventListener("click", async () => {
      if (selected.length !== 2) return;
      const eliminatedSide = sides.find((s) => !selected.includes(s.rep.kasterid)) ?? null;
      const advancingSides = selected
        .map((kid) => sides.find((s) => s.rep.kasterid === kid))
        .filter((s): s is MatchSide<FinalMatchPlayerKnown> => s != null)
        .map((s) => s.members.map((m) => m.kasterid));
      const allThrowerIds = sides.flatMap((s) => s.members.map((m) => m.kasterid));
      modal.remove();
      const { error } = await confirmCupMatch({
        kampId: kamp.id,
        stevneId: stevneid,
        roundNumber: kamp.runde_nummer,
        roundName: kamp.runde_navn,
        allThrowerIds,
        eliminatedIds: eliminatedSide?.members.map((m) => m.kasterid) ?? [],
        advancingSides,
      });
      if (error) {
        showToast("DB-feil ved bekreft", "error");
        return;
      }
      await afterConfirm();
    });
  }

  renderDialog();
}
