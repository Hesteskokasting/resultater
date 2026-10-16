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
import {
  getInfoMatchSummary,
  getInfoTournament,
  startTournament,
  updateTournamentSettings,
  type StartStep,
} from "@/services/stevneService";
import { FORMAT_COLUMNS, bindInfoEditing, infoEditors } from "./infoEditing";
import {
  getRegistrationCount,
  getPairCount,
  getUnconfirmedCount,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";
import { createRegistrationButton } from "@/components/stevne/RegistrationButton";
import { actionLinkHtml, registrationCtaLink } from "@/components/stevne/StevneCard";
import { createCheckInButton } from "@/components/stevne/CheckInButton";
import { registerRefetch, reloadRoute } from "@/utils/data/refetchRegistry";
import {
  isCascadeMethodName,
  isKongelagMethodName,
  isXkastMethodName,
  maxCascadeRounds,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { canStartTournament } from "@/utils/stevne/stevneStart";
import { parseRound1Format } from "@/utils/kamp/cupStructure";

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

/** The assigned grupper once they exist, else the saved split against today's påmelde. */
function groupSplitLabel(
  groupSizes: Record<string, number>,
  savedNa: number | null | undefined,
  entryCount: number,
): string {
  const assignedA = groupSizes.A ?? 0;
  const assignedB = groupSizes.B ?? 0;
  const [nA, nB] =
    assignedA || assignedB
      ? [assignedA, assignedB]
      : savedNa != null
        ? [savedNa, entryCount - savedNa]
        : [null, 0];
  if (nA == null) return "Ikkje sett";
  return nB > 0 ? `A: ${nA} - B: ${nB}` : "Alle i A";
}

/**
 * Never below the rundar already generated; up to the Gloppen cap when known,
 * else 10, stretched to keep a stored count above that in the list.
 */
function roundChoices(current: number | null, generated: number, cap: number | null): number[] {
  const min = Math.max(1, generated);
  const max = Math.max(cap ?? 10, current ?? 0, min);
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id, isAdmin }));
  container.replaceChildren(createLoadingState());

  try {
    const [stevneRes, count, pairCount, auth, matchSummary] = await Promise.all([
      getInfoTournament(id),
      getRegistrationCount(id),
      getPairCount(id),
      getUser(),
      getInfoMatchSummary(id),
    ]);

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
      return;
    }

    const stevne = stevneRes.data;
    const phase = stevne.stevne_fase ?? null;
    // erfullfort overrides the phase: a stevne can be closed without ever leaving
    // 'ikke_startet' (results imported elsewhere), and closed is never open for registration.
    const isNotStarted = !stevne.erfullfort && (phase === null || phase === "ikke_startet");
    const methodName = stevne.kastemetodeInnl?.navn ?? "—";
    const isCascade = isCascadeMethodName(methodName);
    // Gloppen and NHM both generate against stevne.antall_runder_innl
    const isRoundBased = usesInitialRoundCount(methodName);
    const isTeam = stevne.kategori?.erlagbasert ?? false;
    const categoryName = (stevne.kategori?.navn ?? "").toLowerCase();
    const isTeamOrMix = categoryName.includes("par") || categoryName.includes("mix");
    const entryCount = isTeam ? pairCount : count;

    // ── Method tiles ──────────────────────────────────────────────────────────

    const [initialFact, finalFact] = stevneMethodFacts(stevne);
    // Gloppen generates every runde at start; NHM generates one at a time
    // against the stored count, so it stays adjustable through innleiande.
    const canSetRounds =
      isAdmin &&
      isRoundBased &&
      (isNotStarted || (!isCascade && !stevne.erfullfort && phase === "innledende"));
    const roundCap = isCascade && entryCount > 0 ? maxCascadeRounds(entryCount) : null;
    const roundsHtml = (): string => {
      if (!isRoundBased) return "—";
      if (!canSetRounds) return String(stevne.antall_runder_innl ?? "—");
      const current = stevne.antall_runder_innl;
      const choices = roundChoices(current, matchSummary.initialRounds, roundCap);
      return `<select id="info-rundar" class="form-select form-select-sm" aria-label="Antal rundar">
          ${isNotStarted ? `<option value=""${current == null ? " selected" : ""}>—</option>` : ""}
          ${choices.map((n) => `<option value="${n}"${n === current ? " selected" : ""}>${n}</option>`).join("")}
        </select>`;
    };

    const isCup = (stevne.kastemetodeAvsl?.navn ?? "").toLowerCase().includes("cup");
    const round1Format = parseRound1Format(stevne.runde1_format);
    // The split is set on the Avsl. tab until the cup's first kampar exist.
    const canSetGroups = isAdmin && !stevne.erfullfort && !matchSummary.hasFinalMatches;
    const infoHtml = isCup
      ? escHtml(groupSplitLabel(matchSummary.groupSizes, round1Format?.nA, entryCount)) +
        (canSetGroups
          ? `<a class="stevne-hero__lenke d-block" href="#/stevne/${id}/avsluttende?fra=info">${round1Format ? "Endre" : "Set"} gruppefordeling</a>`
          : "")
      : "—";

    // X-kast pools its spelarar over the baner; the round-based metodar count rundar.
    const initialSide = isXkastMethodName(methodName)
      ? {
          key: "baner",
          label: "Baner",
          html: String(stevne.tilgjengelige_baner ?? "—"),
          editable: isAdmin && !stevne.erfullfort,
        }
      : { label: "Rundar", html: roundsHtml() };

    // A local SNC stevne inherits its format from the umbrella (the DB coerces it
    // back on write), and kampar are generated against the format at start.
    const isSncLocal = stevne.snc_hovudstevne_id != null;
    const editableKeys = new Set([
      ...(isAdmin ? ["dato", "tid", "sted", "kontakt"] : []),
      ...(isAdmin && isNotStarted && !isSncLocal ? ["type", "innl", "avsl"] : []),
    ]);
    const markEditable = <T extends { key?: string }>(fact: T): T => ({
      ...fact,
      editable: fact.key != null && editableKeys.has(fact.key),
    });

    const methods = [
      [markEditable(initialFact!), initialSide],
      [markEditable(finalFact!), { label: "Info", html: infoHtml }],
    ];

    // ── Hero ──────────────────────────────────────────────────────────────────

    const registrationLabel = `Påmelde ${isTeamOrMix ? "par" : "spelarar"}`;
    container.innerHTML = `
      ${stevneHeroHtml({
        title: stevne.navn,
        status: statusBadge(stevne.stevne_fase, stevne.erfullfort),
        subtitle: stevneSubtitle(stevne),
        facts: stevneKeyFacts(stevne).map((f) => markEditable(f)),
        methods,
        details: [
          ...stevneDetails(stevne).map((d) => markEditable(d)),
          { label: registrationLabel, html: String(isTeamOrMix ? pairCount : count) },
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
    // Every input is already in hand, so the organizer is told what is missing
    // up front instead of discovering it in a toast after clicking. Redrawn when
    // the rundar tile changes the round count.
    function renderStartButton(): void {
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
    if (showStartButton) renderStartButton();

    // ── Rundar select ─────────────────────────────────────────────────────────

    const roundsSelect = container.querySelector<HTMLSelectElement>("#info-rundar");
    roundsSelect?.addEventListener("change", async () => {
      const previous = stevne.antall_runder_innl;
      const next = roundsSelect.value ? Number(roundsSelect.value) : null;
      stevne.antall_runder_innl = next;
      const { error } = await updateTournamentSettings(id, { antall_runder_innl: next });
      if (error) {
        showToast("Feil ved lagring av rundar: " + errorMessage(error), "error");
        stevne.antall_runder_innl = previous;
        roundsSelect.value = String(previous ?? "");
      }
      if (showStartButton) renderStartButton();
    });

    // ── In-place editing ──────────────────────────────────────────────────────

    bindInfoEditing(container, infoEditors(stevne), async (patch) => {
      if (patch.dato === null) {
        showToast("Dato må setjast.", "error");
        return false;
      }
      const { error } = await updateTournamentSettings(id, patch);
      if (error) {
        showToast("Feil ved lagring: " + errorMessage(error), "error");
        return false;
      }
      // Format fields shape the tab row above, so the whole route is redrawn.
      if (FORMAT_COLUMNS.some((column) => column in patch)) void reloadRoute();
      else void render(container, { id, isAdmin });
      return true;
    });

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
