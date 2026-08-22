import { getUser } from "@/services/authService";
import { linkedThrowerId } from "@/utils/kaster";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { formatDate, formatTime } from "@/utils/shared";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { showToast } from "@/components/Toast";
import { escHtml } from "@/utils/escHtml";
import { errorMessage } from "@/utils/errorMessage";
import { throwerName } from "@/utils/kaster";
import { logError } from "@/utils/logError";
import { setPageTitle } from "@/utils/pageTitle";
import { registerRefetch } from "@/utils/refetchRegistry";
import { getTournamentForRegistration, getRelatedTournaments } from "@/services/stevneService";
import { getActiveThrowerList, getThrowersForClubs } from "@/services/kasterService";
import {
  getRegistrationsForTournament,
  getPairsForTournament,
  registerForTournament,
  removeRegistration,
} from "@/services/pameldingService";
import type { RegistrationWithThrowerRow, RegistrationPair } from "@/services/pameldingService";
import type { ThrowerListRow } from "@/services/kasterService";
import type { RelatedTournamentRow } from "@/services/stevneService";
import type { AuthUser, Params } from "@/types";

// ── HTML builders ─────────────────────────────────────────────────────────────

function selfRegistrationHtml(
  auth: AuthUser | null,
  isPrivileged: boolean,
  isLinked: boolean,
  isRegistered: boolean,
  erfullfort: boolean,
  tournamentId: number,
): string {
  if (!auth) {
    return `<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${tournamentId}/pamelding">Logg inn</a> for å melde deg på.
    </div>`;
  }
  if (!isLinked && !isPrivileged) {
    return `<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`;
  }
  if (erfullfort) {
    return `<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`;
  }
  if (isLinked && isRegistered) {
    return `
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="unregister-button" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`;
  }
  if (isLinked) {
    return `
      <form id="registration-form" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="registration-error" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`;
  }
  return "";
}

function adminRegistrationHtml(
  isPrivileged: boolean,
  erfullfort: boolean,
  registrations: RegistrationWithThrowerRow[],
  clubThrowers: ThrowerListRow[],
): string {
  if (!isPrivileged || erfullfort) return "";
  const alreadyRegistered = new Set(registrations.map((p) => p.kasterid));
  const available = clubThrowers.filter((k) => !alreadyRegistered.has(k.id));
  const throwerOptions = available
    .map(
      (k) =>
        `<option value="${k.id}">${escHtml(k.etternavn)}, ${escHtml(k.fornavn)} — ${escHtml(k.klubb?.navn ?? "")}</option>`,
    )
    .join("");
  return `
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${throwerOptions}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`;
}

function relatedTournamentsHtml(relatedTournaments: RelatedTournamentRow[]): string {
  if (!relatedTournaments.length) return "";
  const items = relatedTournaments
    .map((s) => {
      const d = s.dato ? formatDate(s.dato) : "";
      return `<li><a href="#/stevne/${s.id}/pamelding">${escHtml(s.navn ?? "")} — ${d}</a></li>`;
    })
    .join("");
  return `
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${items}</ul>
    </div>`;
}

function pairsListHtml(pairs: RegistrationPair[]): string {
  if (!pairs.length) return '<p class="empty-state">Ingen par registrerte enno.</p>';
  const rows = pairs
    .map((pair) => {
      const a = pair.sideA.kaster;
      const b = pair.sideB.kaster;
      const cell = (k: typeof a) =>
        k
          ? `<a href="#/kastere/${k.id}">${escHtml(throwerName(k))}</a>${k.klubb?.navn ? `<br><small class="text-muted">${escHtml(k.klubb.navn)}</small>` : ""}`
          : "—";
      return `<tr><td>${cell(a)}</td><td>${cell(b)}</td></tr>`;
    })
    .join("");
  return `<table class="table table-sm"><tbody>${rows}</tbody></table>`;
}

function registrationListHtml(
  registrations: RegistrationWithThrowerRow[],
  isPrivileged: boolean,
): string {
  if (!registrations.length) return '<p class="empty-state">Ingen påmeldingar enno.</p>';
  const sorted = [...registrations].sort((a, b) => {
    const clubA = a.kaster?.klubb?.navn ?? "";
    const clubB = b.kaster?.klubb?.navn ?? "";
    const clubCmp = clubA.localeCompare(clubB, "nb");
    if (clubCmp !== 0) return clubCmp;
    return (a.kaster?.etternavn ?? "").localeCompare(b.kaster?.etternavn ?? "", "nb");
  });
  const rows = sorted
    .map(
      (p) => `<tr>
    <td>${
      p.kaster
        ? `<a href="#/kastere/${p.kaster.id}">${escHtml(p.kaster.fornavn)} ${escHtml(p.kaster.etternavn)}</a>`
        : "—"
    }</td>
    <td>${escHtml(p.kaster?.klubb?.navn ?? "")}</td>
    ${isPrivileged ? `<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${p.id}">Fjern</button></td>` : ""}
  </tr>`,
    )
    .join("");
  return `<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${isPrivileged ? "<th></th>" : ""}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindEventHandlers(
  container: HTMLElement,
  params: Record<string, string | number | undefined>,
  registrations: RegistrationWithThrowerRow[],
  kasterid: number | null,
  tournamentId: number,
): void {
  const registrationForm = container.querySelector<HTMLFormElement>("#registration-form");
  registrationForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector<HTMLElement>("#registration-error")!;
    errorEl.classList.add("d-none");
    if (kasterid == null) return;
    const { error } = await registerForTournament(tournamentId, kasterid);
    if (error) {
      errorEl.textContent = "Feil ved påmelding.";
      errorEl.classList.remove("d-none");
      return;
    }
    void render(container, params);
  });

  const adminRegistrationForm = container.querySelector<HTMLFormElement>(
    "#admin-registration-form",
  );
  adminRegistrationForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector<HTMLElement>("#admin-registration-error")!;
    errorEl.classList.add("d-none");
    const fd = new FormData(adminRegistrationForm);
    const selectedThrowerId = Number(fd.get("admin_kasterid"));
    if (!selectedThrowerId) {
      errorEl.textContent = "Vel ein utøvar.";
      errorEl.classList.remove("d-none");
      return;
    }
    const { error } = await registerForTournament(tournamentId, selectedThrowerId);
    if (error) {
      errorEl.textContent = "Feil ved påmelding.";
      errorEl.classList.remove("d-none");
      return;
    }
    void render(container, params);
  });

  container
    .querySelector<HTMLButtonElement>("#unregister-button")
    ?.addEventListener("click", async () => {
      if (kasterid == null) return;
      const ownReg = registrations.find((p) => p.kasterid === kasterid);
      if (!ownReg || !(await confirmDialog({ title: "Avmeld", message: "Vil du melde deg av?" })))
        return;
      const { error } = await removeRegistration(ownReg.id);
      if (error) {
        showToast("Kunne ikkje melde av: " + errorMessage(error), "error");
        return;
      }
      void render(container, params);
    });

  container.querySelectorAll<HTMLButtonElement>(".remove-registration").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!(await confirmDialog({ title: "Fjern påmelding", message: "Fjern påmelding?" }))) return;
      const id = Number(button.dataset.id);
      if (!id) return;
      const { error } = await removeRegistration(id);
      if (error) {
        showToast("Kunne ikkje fjerne påmelding: " + errorMessage(error), "error");
        return;
      }
      void render(container, params);
    });
  });
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement, params: Params = {}): Promise<void> {
  const rawId = params.id;
  if (!rawId) {
    container.replaceChildren(createErrorBanner("Manglande stevne-ID."));
    return;
  }
  const tournamentId = Number(rawId);

  registerRefetch(() => render(container, params));
  container.replaceChildren(createLoadingState("Laster påmelding…"));

  try {
    const [auth, tournamentResult] = await Promise.all([
      getUser(),
      getTournamentForRegistration(tournamentId),
    ]);

    if (tournamentResult.error || !tournamentResult.data) {
      container.replaceChildren(createErrorBanner("Stevnet finst ikkje."));
      return;
    }
    const tournament = tournamentResult.data;

    // An SNC umbrella has no registrations of its own — pick a local stevne.
    if (tournament.er_snc_hovudstevne) {
      location.hash = `#/stevne/${tournamentId}/info`;
      return;
    }

    setPageTitle(`Påmelding – ${tournament.navn}`);

    const isAdminRole = auth?.profil?.role === "admin";
    const isClubAdminRole = auth?.profil?.role === "klubbadmin";
    const isPrivileged = isAdminRole || isClubAdminRole;
    const categoryName = (tournament.kategori?.navn ?? "").toLowerCase();
    const isPairOrMix = categoryName.includes("par") || categoryName.includes("mix");

    const dateWindow = tournament.dato
      ? {
          fromDate: new Date(new Date(tournament.dato + "T12:00:00").getTime() - 2 * 864e5)
            .toISOString()
            .slice(0, 10),
          toDate: new Date(new Date(tournament.dato + "T12:00:00").getTime() + 2 * 864e5)
            .toISOString()
            .slice(0, 10),
        }
      : null;

    const throwersFetch: Promise<{ data: ThrowerListRow[]; error: unknown }> = (() => {
      if (!isPrivileged) return Promise.resolve({ data: [], error: null });
      if (isAdminRole) return getActiveThrowerList();
      if (auth && auth.clubs.length) return getThrowersForClubs(auth.clubs);
      return Promise.resolve({ data: [], error: null });
    })();

    const [regResult, relatedResult, throwersResult, pairsResult] = await Promise.all([
      getRegistrationsForTournament(tournamentId),
      tournament.klubbid != null && dateWindow
        ? getRelatedTournaments(
            tournament.klubbid,
            dateWindow.fromDate,
            dateWindow.toDate,
            tournamentId,
          )
        : Promise.resolve({ data: [] as RelatedTournamentRow[], error: null }),
      throwersFetch,
      isPairOrMix
        ? getPairsForTournament(tournamentId)
        : Promise.resolve({ data: [] as RegistrationPair[], error: null }),
    ]);

    const registrations = regResult.data;
    const relatedTournaments = relatedResult.data;
    const clubThrowers = throwersResult.data;
    const pairs = pairsResult.data;

    const kasterid = auth?.profil?.kasterid ?? null;
    const isLinked = linkedThrowerId(auth) !== null;
    const isRegistered = kasterid != null && registrations.some((p) => p.kasterid === kasterid);
    const dateStr = tournament.dato ? formatDate(tournament.dato) : "";
    const metaParts = [
      dateStr,
      tournament.tid ? formatTime(tournament.tid) : "",
      tournament.kategori?.navn ? escHtml(tournament.kategori.navn) : "",
      tournament.sted ? escHtml(tournament.sted) : "",
    ]
      .filter(Boolean)
      .join(" · ");

    container.innerHTML = `
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${escHtml(tournament.navn ?? "")}</h2>
        <p class="text-muted mb-4">${metaParts}</p>
        ${selfRegistrationHtml(auth, isPrivileged, isLinked, isRegistered, tournament.erfullfort ?? false, tournamentId)}
        ${adminRegistrationHtml(isPrivileged, tournament.erfullfort ?? false, registrations, clubThrowers)}
        ${relatedTournamentsHtml(relatedTournaments)}
        <h5 class="mt-4 mb-2">${isPairOrMix ? `Par (${pairs.length})` : `Påmeldingar (${registrations.length})`}</h5>
        ${isPairOrMix ? pairsListHtml(pairs) : registrationListHtml(registrations, isPrivileged)}
      </div>`;

    if (auth) {
      bindEventHandlers(container, params, registrations, kasterid, tournamentId);
    }
  } catch (err) {
    logError("pamelding.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste påmelding."));
  }
}
