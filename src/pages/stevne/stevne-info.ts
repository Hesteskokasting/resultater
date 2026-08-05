import { getUser } from "@/services/authService";
import { formatDateNumeric, formatTime } from "@/utils/shared";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { getInfoTournament, updateTournamentPhase } from "@/services/stevneService";
import { livePillHtml } from "@/components/LivePill";
import {
  getRegistrationCount,
  getPairCount,
  getUnconfirmedCount,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";
import { createRegistrationButton } from "@/components/PameldingKnapp";
import { generateInitialRoundMatches } from "@/services/kampGenereringInnledendeService";
import { generateKongelagCourts } from "@/services/xkastKongelagService";
import { registerRefetch } from "@/utils/refetchRegistry";
import { isKongelagMethodName } from "@/utils/kastemetode";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(fase: string | null, erfullfort: boolean | null): string {
  if (erfullfort) return "Fullført";
  if (fase === "avsluttende") return `Avsluttande fase ${livePillHtml()}`;
  if (fase === "innledende") return `Innleiande fase ${livePillHtml()}`;
  return "Ikkje starta";
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  registerRefetch(() => render(container, { id, isAdmin }, bannerSlot));
  container.replaceChildren(createLoadingState());

  try {
    const [stevneRes, count, pairCount, auth] = await Promise.all([
      getInfoTournament(id),
      getRegistrationCount(id),
      getPairCount(id),
      getUser(),
    ]);

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }

    const stevne = stevneRes.data;
    const phase = stevne.stevne_fase ?? null;
    const isNotStarted = phase === null || phase === "ikke_startet";
    const methodName = stevne.kastemetodeInnl?.navn ?? "—";
    const isCascade = methodName.toLowerCase().includes("gloppen");
    const isTeam = stevne.kategori?.erlagbasert ?? false;
    const categoryName = (stevne.kategori?.navn ?? "").toLowerCase();
    const isTeamOrMix = categoryName.includes("par") || categoryName.includes("mix");

    const typeAndCategory =
      [stevne.stevnetype?.navn, stevne.kategori?.navn].filter(Boolean).join(" ") || "—";
    const contactName = stevne.kontakt
      ? `${stevne.kontakt.fornavn} ${stevne.kontakt.etternavn}`.trim()
      : "";

    // ── Start-tournament button (admin, not started) ──────────────────────────

    // No innleiande metode + Kongelag avsluttande = standalone Kongelag:
    // the stevne starts directly in the avsluttende phase.
    const isStandaloneKongelag =
      !stevne.kastemetodeInnl && isKongelagMethodName(stevne.kastemetodeAvsl?.navn ?? "");

    if (bannerSlot && isNotStarted && isAdmin) {
      bannerSlot.innerHTML = `<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;
      const startBtn = bannerSlot.querySelector<HTMLButtonElement>("#start-stevne-btn")!;
      startBtn.addEventListener("click", async () => {
        if (!stevne.kastemetodeInnl && !isStandaloneKongelag) {
          showToast(
            "Du må velje kastemetode for innleiande fase. Gå til Innstillingar for å endre.",
            "error",
          );
          return;
        }
        if (isTeam ? count < 4 : count < 2) {
          showToast(
            isTeam
              ? "Stevnet treng minst 2 par (4 spelarar) for å startast."
              : "Stevnet må ha minst 2 spelarar for å startast.",
            "error",
          );
          return;
        }
        if (isCascade && !stevne.antall_runder_innl) {
          showToast(
            "Du må setje antal rundar for innleiande fase. Gå til Innstillingar for å endre.",
            "error",
          );
          return;
        }
        const unconfirmedCount = await getUnconfirmedCount(id);
        if (unconfirmedCount > 0) {
          const ok = await confirmDialog({
            title: "Ubekrefta spelarar",
            message: `${unconfirmedCount} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`,
          });
          if (!ok) return;
        }
        startBtn.disabled = true;
        startBtn.textContent = "Starter…";

        if (isStandaloneKongelag) {
          // Phase first: if generation fails, the avsluttende tab still shows
          // the Start Kongelag panel as a retry path.
          const { error: phaseError } = await updateTournamentPhase(id, "avsluttende");
          if (phaseError) {
            showToast("Feil ved oppdatering av fase.", "error");
            startBtn.disabled = false;
            startBtn.textContent = "Start stevne";
            return;
          }
          const { error: generateError } = await generateKongelagCourts(id);
          if (generateError) {
            showToast(
              "Feil ved generering av Kongelag-banar: " + errorMessage(generateError),
              "error",
            );
            startBtn.disabled = false;
            startBtn.textContent = "Start stevne";
            return;
          }
          location.hash = `#/stevne/${id}/avsluttende`;
          return;
        }

        try {
          await generateInitialRoundMatches(id, methodName, stevne.antall_runder_innl ?? 1, isTeam);
        } catch (err) {
          showToast("Feil ved kampgenerering: " + errorMessage(err), "error");
          startBtn.disabled = false;
          startBtn.textContent = "Start stevne";
          return;
        }
        const { error: phaseError } = await updateTournamentPhase(id, "innledende");
        if (phaseError) {
          showToast("Feil ved oppdatering av fase.", "error");
          startBtn.disabled = false;
          startBtn.textContent = "Start stevne";
          return;
        }
        location.hash = `#/stevne/${id}/innledende`;
      });
    }

    // ── Info card ─────────────────────────────────────────────────────────────

    container.innerHTML = `
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Status</th><td>${statusBadge(stevne.stevne_fase, stevne.erfullfort)}</td></tr>
              <tr><th>Stad</th><td>${escHtml(stevne.sted ?? "—")}</td></tr>
              <tr><th>Dato</th><td>${stevne.dato ? formatDateNumeric(stevne.dato) : "—"}</td></tr>
              <tr><th>Tid</th><td>${stevne.tid ? formatTime(stevne.tid) : "—"}</td></tr>
              <tr><th>Type / Kategori</th><td>${escHtml(typeAndCategory)}</td></tr>
              <tr><th>Arrangør</th><td>${escHtml(stevne.klubb?.navn ?? "—")}</td></tr>
              <tr><th>Kontaktperson</th><td>${escHtml(contactName || "—")}</td></tr>
              <tr><th>Kastemetode innleiande</th><td>${escHtml(methodName)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${escHtml(stevne.kastemetodeAvsl?.navn ?? "—")}</td></tr>
              <tr><th>Antal rundar innleiande</th><td>${stevne.antall_runder_innl ?? "—"}</td></tr>
              <tr><th>Påmelde ${isTeamOrMix ? "par" : "spelarar"}</th><td>${isTeamOrMix ? pairCount : count}</td></tr>
              ${
                stevne.snc_hovudstevne_id != null
                  ? `<tr><th>SNC-runde</th><td><a href="#/stevne/${stevne.snc_hovudstevne_id}/info">Sjå alle lokale stevne</a></td></tr>`
                  : ""
              }
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;

    // ── Action buttons ────────────────────────────────────────────────────────

    const actionButtons = container.querySelector<HTMLElement>("#info-handling-knapper")!;
    if (auth?.profil?.kobling_status === "godkjent" && isNotStarted) {
      const kasterid = auth.profil.kasterid;
      if (kasterid === null) return;

      const myRegistration = (await getMyRegistrationForTournament(id, kasterid)).data;

      actionButtons.appendChild(
        createRegistrationButton({
          tournamentId: id,
          throwerId: kasterid,
          userId: auth.user.id,
          isRegistered: myRegistration !== null,
          registrationId: myRegistration?.id,
          onAction: () => {
            void render(container, { id, isAdmin }, bannerSlot);
          },
        }),
      );
    }

    const viewLink = document.createElement("a");
    viewLink.href = `#/stevne/${id}/pamelding`;
    viewLink.className = "btn btn-sm btn-outline-secondary";
    viewLink.textContent = "Sjå påmeldingar";
    actionButtons.appendChild(viewLink);

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "btn btn-sm btn-outline-secondary";
    refreshButton.textContent = "Oppdater";
    refreshButton.addEventListener("click", () => {
      void render(container, { id, isAdmin }, bannerSlot);
    });
    actionButtons.appendChild(refreshButton);
  } catch (err) {
    logError("stevne-info.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste info."));
  }
}
