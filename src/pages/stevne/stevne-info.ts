import { getUser } from "@/services/authService";
import { escHtml } from "@/utils/escHtml";
import { linkedThrowerId } from "@/utils/kaster";
import { createErrorBanner, createLoadingState } from "@/components/states";
import {
  heroActionSlot,
  stevneDetails,
  stevneHeroHtml,
  stevneKeyFacts,
  stevneMethodFacts,
  stevneSubtitle,
  type StevneHeroOptions,
} from "@/components/stevne/StevneHero";
import { logError } from "@/utils/logError";
import { errorMessage } from "@/utils/errorMessage";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { getInfoTournament, startTournament, type StartStep } from "@/services/stevneService";
import {
  getRegistrationCount,
  getPairCount,
  getUnconfirmedCount,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";
import { createRegistrationButton } from "@/components/stevne/RegistrationButton";
import { actionLinkHtml, registrationCtaLink } from "@/components/stevne/StevneCard";
import { createCheckInButton } from "@/components/stevne/CheckInButton";
import { registerRefetch } from "@/utils/refetchRegistry";
import {
  isCascadeMethodName,
  isKongelagMethodName,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { canStartTournament } from "@/utils/stevne/stevneStart";

// ── Helpers ───────────────────────────────────────────────────────────────────

const START_ERROR: Record<StartStep, string> = {
  fase: "Feil ved oppdatering av fase",
  kampar: "Feil ved kampgenerering",
  kongelag: "Feil ved generering av Kongelag-banar",
};

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
    const isCascade = isCascadeMethodName(methodName);
    // Gloppen and NHM both generate against stevne.antall_runder_innl
    const isRoundBased = usesInitialRoundCount(methodName);
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
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap stevne-max-480"></div>`;

    const actionSlot = heroActionSlot(container);

    // ── Start-tournament button (admin, not started) ──────────────────────────

    // No innleiande metode + Kongelag avsluttande = standalone Kongelag:
    // the stevne starts directly in the avsluttende phase.
    const isStandaloneKongelag =
      !stevne.kastemetodeInnl && isKongelagMethodName(stevne.kastemetodeAvsl?.navn ?? "");

    const showStartButton = isNotStarted && isAdmin;
    if (showStartButton) {
      // Every input is already in hand, so the organizer is told what is missing
      // up front instead of discovering it in a toast after clicking.
      const blocked = canStartTournament({
        hasInitialMethod: Boolean(stevne.kastemetodeInnl),
        isStandaloneKongelag,
        isTeam,
        playerCount: count,
        pairCount,
        isRoundBased,
        isCascade,
        roundCount: stevne.antall_runder_innl,
      });

      const startButtonHtml =
        `<button id="start-stevne-btn" class="btn btn-sm btn-success"` +
        `${blocked ? ` disabled title="${escHtml(blocked)}"` : ""}>Start stevne</button>`;
      // Blocked: button and reason stack as one flex item in the hero row, the
      // same shape .check-in-row uses. Unblocked, the button stays a direct child.
      actionSlot.innerHTML = blocked
        ? `<div class="stevne-start-boks">${startButtonHtml}` +
          `<p class="stevne-start-hindring">${escHtml(blocked)}</p></div>`
        : startButtonHtml;
      const startBtn = actionSlot.querySelector<HTMLButtonElement>("#start-stevne-btn")!;
      startBtn.addEventListener("click", async () => {
        if (blocked) {
          showToast(blocked, "error");
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

        const {
          error,
          step,
          phase: startedPhase,
        } = await startTournament({
          stevneid: id,
          methodName,
          roundCount: stevne.antall_runder_innl ?? 1,
          isTeam,
          isStandaloneKongelag,
        });
        if (error) {
          showToast(`${START_ERROR[step!]}: ${errorMessage(error)}`, "error");
          startBtn.disabled = false;
          startBtn.textContent = "Start stevne";
          return;
        }
        location.hash = `#/stevne/${id}/${startedPhase}`;
      });
    }

    // ── Action buttons ────────────────────────────────────────────────────────

    const actionButtons = container.querySelector<HTMLElement>("#info-handling-knapper")!;
    const kasterid = linkedThrowerId(auth);

    // The hero slot is the primary action; an admin already fills it with
    // Start stevne, so registration controls join the row below.
    const registrationTarget = showStartButton ? actionButtons : actionSlot;

    // Without an approved thrower link there is no registration button to show.
    // Say what is missing rather than leaving the page looking like registration
    // isn't a thing here at all.
    const cta = isNotStarted ? registrationCtaLink(id, auth) : undefined;
    if (cta) registrationTarget.insertAdjacentHTML("beforeend", actionLinkHtml(cta));

    if (kasterid !== null && isNotStarted) {
      const myRegistration = (await getMyRegistrationForTournament(id, kasterid)).data;

      const registrationButton = createRegistrationButton({
        tournamentId: id,
        throwerId: kasterid,
        isRegistered: myRegistration !== null,
        registrationId: myRegistration?.id,
        onAction: () => {
          void render(container, { id, isAdmin });
        },
      });

      // Registered players confirm their own attendance from here; the button
      // itself stays locked until two hours before start.
      if (myRegistration) {
        const attendance = createCheckInButton({
          tournamentId: id,
          throwerId: kasterid,
          dato: stevne.dato,
          tid: stevne.tid,
          confirmed: myRegistration.er_bekreftet,
          confirmedAt: myRegistration.bekreftet_at,
        });
        const row = document.createElement("div");
        row.className = "check-in-row";
        row.append(attendance.element, registrationButton);
        registrationTarget.appendChild(row);
      } else {
        registrationTarget.appendChild(registrationButton);
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
