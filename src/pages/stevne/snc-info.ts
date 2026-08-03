// Info tab for an SNC umbrella: the round's local stevner and where the thrower
// is entered. Only one local stevne per round (trigger pamelding_snc_ein_stad),
// so picking another is always a switch — unregister first, then register.

import { getUser } from "@/services/authService";
import { confirmDialog } from "@/components/ConfirmDialog";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { livePillHtml } from "@/components/LivePill";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { formatDateNumeric, formatTime } from "@/utils/shared";
import { registerRefetch } from "@/utils/refetchRegistry";
import {
  getSncParentTournament,
  getSncLocalTournaments,
  completeSncParent,
  reopenSncParent,
} from "@/services/stevneService";
import type { SncLocalTournamentRow, SncParentTournamentRow } from "@/services/stevneService";
import {
  getRegistrationsAcrossTournaments,
  registerForTournament,
  removeRegistration,
} from "@/services/pameldingService";
import type { TournamentRegistrationSummary } from "@/services/pameldingService";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isNotStarted(local: SncLocalTournamentRow): boolean {
  return local.stevne_fase === null || local.stevne_fase === "ikke_startet";
}

function localStatus(local: SncLocalTournamentRow): string {
  if (local.erfullfort) return "Fullført";
  if (local.stevne_fase === "avsluttende") return `Avsluttande ${livePillHtml()}`;
  if (local.stevne_fase === "innledende") return `Innleiande ${livePillHtml()}`;
  return "Ikkje starta";
}

function localTournamentLabel(local: SncLocalTournamentRow): string {
  const parts = [local.klubb?.navn, local.sted].filter((value): value is string => Boolean(value));
  const unique = [...new Set(parts)];
  return unique.length ? unique.join(" · ") : local.navn;
}

function methodSummary(parent: SncParentTournamentRow): string {
  const parts = [parent.kastemetodeInnl?.navn, parent.kastemetodeAvsl?.navn].filter(Boolean);
  return parts.length ? parts.join(" → ") : "—";
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function overviewHtml(
  parent: SncParentTournamentRow,
  locals: SncLocalTournamentRow[],
  totalRegistrations: number,
): string {
  const completed = locals.filter((l) => l.erfullfort).length;
  const status = parent.erfullfort
    ? "Samla resultat er klart"
    : locals.length
      ? `${completed} av ${locals.length} lokale stevne fullført`
      : "Ingen lokale stevne registrerte";

  return `
    <div class="card mb-3 org-max-480">
      <div class="card-body">
        <table class="table table-sm mb-0">
          <tbody>
            <tr><th>Status</th><td>${escHtml(status)}</td></tr>
            <tr><th>Dato</th><td>${parent.dato ? formatDateNumeric(parent.dato) : "—"}</td></tr>
            <tr><th>Tid</th><td>${parent.tid ? formatTime(parent.tid) : "—"}</td></tr>
            <tr><th>Kategori</th><td>${escHtml(parent.kategori?.navn ?? "—")}</td></tr>
            <tr><th>Kastemetode</th><td>${escHtml(methodSummary(parent))}</td></tr>
            <tr><th>Lokale stevne</th><td>${locals.length}</td></tr>
            <tr><th>Påmelde i alt</th><td>${totalRegistrations}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

function ownRegistrationNoticeHtml(
  locals: SncLocalTournamentRow[],
  summary: TournamentRegistrationSummary,
  canRegister: boolean,
  isLoggedIn: boolean,
  parentId: number,
): string {
  if (!isLoggedIn) {
    return `<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${parentId}/info">Logg inn</a> for å melde deg på eitt av dei lokale stevna.
    </div>`;
  }
  if (!canRegister) return "";
  if (summary.ownStevneId == null) {
    return `<div class="alert alert-info">Vel kva lokalt stevne du vil delta på. Du kan berre stå på eitt per SNC-runde.</div>`;
  }
  const own = locals.find((l) => l.id === summary.ownStevneId);
  return `<div class="alert alert-success">
    Du er påmeld <strong>${escHtml(own ? localTournamentLabel(own) : "eit lokalt stevne")}</strong>.
  </div>`;
}

function actionCellHtml(
  local: SncLocalTournamentRow,
  summary: TournamentRegistrationSummary,
  canRegister: boolean,
): string {
  if (!canRegister) return "";
  if (!isNotStarted(local) || local.erfullfort) {
    return '<span class="text-muted small">Stengt</span>';
  }
  if (summary.ownStevneId === local.id) {
    return `<button class="btn btn-sm btn-outline-danger snc-avmeld">Meld av</button>`;
  }
  if (summary.ownStevneId != null) {
    return `<button class="btn btn-sm btn-outline-primary snc-byt" data-stevneid="${local.id}">Byt hit</button>`;
  }
  return `<button class="btn btn-sm btn-primary snc-meldpa" data-stevneid="${local.id}">Meld på</button>`;
}

function localsListHtml(
  locals: SncLocalTournamentRow[],
  summary: TournamentRegistrationSummary,
  canRegister: boolean,
): string {
  const rows = locals
    .map((local) => {
      const isOwn = summary.ownStevneId === local.id;
      const time = local.tid ? formatTime(local.tid) : "";
      return `<tr${isOwn ? ' class="table-success"' : ""}>
        <td>
          <a href="#/stevne/${local.id}/info">${escHtml(localTournamentLabel(local))}</a>
          <div class="text-muted small">${escHtml(local.navn)}${time ? ` · ${time}` : ""}</div>
        </td>
        <td>${localStatus(local)}</td>
        <td class="text-center">${summary.counts.get(local.id) ?? 0}</td>
        <td class="text-end">${actionCellHtml(local, summary, canRegister)}</td>
      </tr>`;
    })
    .join("");

  return `<div class="table-responsive">
    <table class="table table-sm align-middle">
      <thead>
        <tr><th>Lokalt stevne</th><th>Status</th><th class="text-center">Påmelde</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  const rerender = (): Promise<void> => render(container, { id, isAdmin }, bannerSlot);
  registerRefetch(rerender);
  container.replaceChildren(createLoadingState("Laster lokale stevne…"));

  try {
    const [parentResult, localsResult, auth] = await Promise.all([
      getSncParentTournament(id),
      getSncLocalTournaments(id),
      getUser(),
    ]);

    if (parentResult.error || !parentResult.data) {
      container.replaceChildren(createErrorBanner("Fann ikkje SNC-hovudstevnet."));
      return;
    }
    const parent = parentResult.data;
    const locals = localsResult.data;

    const kasterid = auth?.profil?.kobling_status === "godkjent" ? auth.profil.kasterid : null;
    const summary = await getRegistrationsAcrossTournaments(
      locals.map((l) => l.id),
      kasterid,
    );
    const totalRegistrations = [...summary.counts.values()].reduce((sum, n) => sum + n, 0);
    const canRegister = kasterid != null && !parent.erfullfort;

    renderBanner(bannerSlot, parent, locals, isAdmin, rerender);

    container.innerHTML = `
      ${overviewHtml(parent, locals, totalRegistrations)}
      ${ownRegistrationNoticeHtml(locals, summary, canRegister, auth != null, id)}
      <h6 class="mb-2">Lokale stevne (${locals.length})</h6>
      <div id="snc-locals"></div>
      ${
        isAdmin
          ? `<div class="mt-3"><a class="btn btn-sm btn-outline-success" href="#/stevne/ny?snc=${id}">+ Nytt lokalstevne</a></div>`
          : ""
      }`;

    const listSlot = container.querySelector<HTMLElement>("#snc-locals")!;
    if (!locals.length) {
      listSlot.replaceChildren(
        createEmptyState("Ingen lokale stevne er kopla til denne SNC-runden enno."),
      );
    } else {
      listSlot.innerHTML = localsListHtml(locals, summary, canRegister);
      if (kasterid != null) bindRegistrationActions(listSlot, kasterid, summary, rerender);
    }
  } catch (err) {
    logError("snc-info.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste dei lokale stevna."));
  }
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindRegistrationActions(
  root: HTMLElement,
  kasterid: number,
  summary: TournamentRegistrationSummary,
  rerender: () => Promise<void>,
): void {
  root.querySelectorAll<HTMLButtonElement>(".snc-meldpa").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      const { error } = await registerForTournament(Number(button.dataset.stevneid), kasterid);
      if (error) {
        showToast("Kunne ikkje melde på: " + errorMessage(error), "error");
        button.disabled = false;
        return;
      }
      showToast("Du er meldt på.", "success");
      await rerender();
    });
  });

  root.querySelectorAll<HTMLButtonElement>(".snc-byt").forEach((button) => {
    button.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Byt lokalt stevne",
          message:
            "Du blir meldt av det lokale stevnet du står på no, og påmeld dette i staden. Fortsette?",
        }))
      )
        return;
      button.disabled = true;
      if (summary.ownRegistrationId != null) {
        const { error } = await removeRegistration(summary.ownRegistrationId);
        if (error) {
          showToast("Kunne ikkje melde av det gamle lokalstevnet: " + errorMessage(error), "error");
          button.disabled = false;
          return;
        }
      }
      const { error } = await registerForTournament(Number(button.dataset.stevneid), kasterid);
      if (error) {
        // Unregistered but not re-registered: say so, or the thrower assumes
        // they are entered at the new local stevne.
        showToast(
          "Du er meldt av det gamle lokalstevnet, men påmeldinga feila: " + errorMessage(error),
          "error",
        );
        await rerender();
        return;
      }
      showToast("Du er meldt på det nye lokalstevnet.", "success");
      await rerender();
    });
  });

  root.querySelector<HTMLButtonElement>(".snc-avmeld")?.addEventListener("click", async () => {
    if (
      summary.ownRegistrationId == null ||
      !(await confirmDialog({ title: "Meld av", message: "Vil du melde deg av SNC-runden?" }))
    )
      return;
    const { error } = await removeRegistration(summary.ownRegistrationId);
    if (error) {
      showToast("Kunne ikkje melde av: " + errorMessage(error), "error");
      return;
    }
    showToast("Du er meldt av.", "success");
    await rerender();
  });
}

// ── Banner (consolidation) ────────────────────────────────────────────────────

function renderBanner(
  bannerSlot: HTMLElement | null,
  parent: SncParentTournamentRow,
  locals: SncLocalTournamentRow[],
  isAdmin: boolean,
  rerender: () => Promise<void>,
): void {
  if (!bannerSlot) return;
  if (!isAdmin) {
    bannerSlot.innerHTML = "";
    return;
  }

  const allCompleted = locals.length > 0 && locals.every((l) => l.erfullfort);

  if (parent.erfullfort) {
    bannerSlot.innerHTML = `<button id="snc-reopen-btn" class="btn btn-sm btn-outline-warning">Gjenopne SNC-runden</button>`;
    bannerSlot.querySelector("#snc-reopen-btn")?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Gjenopne SNC-runden",
          message:
            "Den samla lista og NC-poenga blir nullstilte, og lokalstevna kan endrast igjen. Fortsette?",
          danger: true,
        }))
      )
        return;
      const { error } = await reopenSncParent(parent.id);
      if (error) {
        showToast("Kunne ikkje gjenopne: " + errorMessage(error), "error");
        return;
      }
      await rerender();
    });
    return;
  }

  bannerSlot.innerHTML = `<button id="snc-complete-btn" class="btn btn-sm btn-success"${allCompleted ? "" : " disabled"}>Konsolider SNC-runden</button>`;
  bannerSlot.querySelector("#snc-complete-btn")?.addEventListener("click", async () => {
    if (
      !(await confirmDialog({
        title: "Konsolider SNC-runden",
        message:
          "Alle lokalresultata blir slåtte saman til éi liste, og NC-poenga blir rekna ut frå den samla plasseringa. Fortsette?",
        danger: true,
      }))
    )
      return;
    const { error } = await completeSncParent(parent.id);
    if (error) {
      showToast("Kunne ikkje konsolidere: " + errorMessage(error), "error");
      return;
    }
    showToast("SNC-runden er konsolidert.", "success");
    await rerender();
  });
}
