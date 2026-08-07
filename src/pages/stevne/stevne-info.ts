import { getUser } from "@/services/authService";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import {
  heroActionSlot,
  stevneDetails,
  stevneHeroHtml,
  stevneKeyFacts,
  stevneMethodFacts,
  stevneSubtitle,
  type StevneHeroOptions,
} from "@/components/StevneHero";
import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { getInfoTournament, updateTournamentPhase } from "@/services/stevneService";
import {
  getRegistrationCount,
  getPairCount,
  getUnconfirmedCount,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";
import { createRegistrationButton } from "@/components/PameldingKnapp";
import { createOppmoteButton } from "@/components/OppmoteKnapp";
import { generateInitialRoundMatches } from "@/services/kampGenereringInnledendeService";
import { generateKongelagCourts } from "@/services/xkastKongelagService";
import { registerRefetch } from "@/utils/refetchRegistry";
import { isKongelagMethodName } from "@/utils/kastemetode";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(fase: string | null, erfullfort: boolean | null): StevneHeroOptions["status"] {
  if (erfullfort) return { text: "Fullført", variant: "ok" };
  if (fase === "avsluttende") return { text: "Avsluttande fase", variant: "live" };
  if (fase === "innledende") return { text: "Innleiande fase", variant: "live" };
  return { text: "Ikkje starta", variant: "warn" };
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id, isAdmin }));
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

    // ── Hero ──────────────────────────────────────────────────────────────────

    const registrationLabel = `Påmelde ${isTeamOrMix ? "par" : "spelarar"}`;
    container.innerHTML = `
      ${stevneHeroHtml({
        title: stevne.navn,
        status: statusBadge(stevne.stevne_fase, stevne.erfullfort),
        subtitle: stevneSubtitle(stevne),
        facts: stevneKeyFacts(stevne),
        methods: stevneMethodFacts(stevne),
        details: [
          ...stevneDetails(stevne),
          { label: registrationLabel, html: String(isTeamOrMix ? pairCount : count) },
          ...(stevne.antall_runder_innl != null
            ? [
                {
                  label: "Antal rundar innleiande",
                  html: String(stevne.antall_runder_innl),
                },
              ]
            : []),
          ...(stevne.snc_hovudstevne_id != null
            ? [
                {
                  label: "SNC-runde",
                  html: `<a href="#/stevne/${stevne.snc_hovudstevne_id}/info">Sjå alle lokale stevne</a>`,
                },
              ]
            : []),
        ],
      })}
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap org-max-480"></div>`;

    const actionSlot = heroActionSlot(container);

    // ── Start-tournament button (admin, not started) ──────────────────────────

    // No innleiande metode + Kongelag avsluttande = standalone Kongelag:
    // the stevne starts directly in the avsluttende phase.
    const isStandaloneKongelag =
      !stevne.kastemetodeInnl && isKongelagMethodName(stevne.kastemetodeAvsl?.navn ?? "");

    const showStartButton = isNotStarted && isAdmin;
    if (showStartButton) {
      actionSlot.innerHTML = `<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;
      const startBtn = actionSlot.querySelector<HTMLButtonElement>("#start-stevne-btn")!;
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

    // ── Action buttons ────────────────────────────────────────────────────────

    const actionButtons = container.querySelector<HTMLElement>("#info-handling-knapper")!;
    if (auth?.profil?.kobling_status === "godkjent" && isNotStarted) {
      const kasterid = auth.profil.kasterid;
      if (kasterid === null) return;

      const myRegistration = (await getMyRegistrationForTournament(id, kasterid)).data;

      const registrationButton = createRegistrationButton({
        tournamentId: id,
        throwerId: kasterid,
        userId: auth.user.id,
        isRegistered: myRegistration !== null,
        registrationId: myRegistration?.id,
        onAction: () => {
          void render(container, { id, isAdmin });
        },
      });

      // The hero slot is the primary action; an admin already fills it with
      // Start stevne, so their own registration button joins the row below.
      const target = showStartButton ? actionButtons : actionSlot;

      // Registered players confirm their own attendance from here; the button
      // itself stays locked until two hours before start.
      if (myRegistration) {
        const attendance = createOppmoteButton({
          tournamentId: id,
          throwerId: kasterid,
          dato: stevne.dato,
          tid: stevne.tid,
          confirmed: myRegistration.er_bekreftet,
          confirmedAt: myRegistration.bekreftet_at,
        });
        const row = document.createElement("div");
        row.className = "d-flex align-items-start gap-2 org-max-480";
        row.append(attendance.element, registrationButton);
        target.appendChild(row);
      } else {
        target.appendChild(registrationButton);
      }
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
      void render(container, { id, isAdmin });
    });
    actionButtons.appendChild(refreshButton);
  } catch (err) {
    logError("stevne-info.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste info."));
  }
}
