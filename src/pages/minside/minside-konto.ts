import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { formatDate } from "@/utils/shared";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { signOut, updatePassword } from "@/services/authService";
import { getThrowerForLink } from "@/services/kasterService";
import { getLinkedAccounts, deleteUserAccount } from "@/services/accountService";
import type { MinSideContext } from "./_linkState";
import type { LinkedAccountRow } from "@/services/accountService";

const DELETE_WARNING = "Resultater og statistikk for koblet utøver blir ikkje slettet.";

async function linkedThrowerHtml(throwerId: number): Promise<string> {
  const { data, error } = await getThrowerForLink(throwerId);
  if (error || !data) return "";
  return `
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${escHtml(throwerName(data))}</strong> · ${escHtml(data.klubb?.navn ?? "")}</p>
    <a href="#/kastere/${buildThrowerSlug(data)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`;
}

function passwordCardHtml(hasPasswordLogin: boolean): string {
  const title = hasPasswordLogin ? "Bytt passord" : "Opprett passord";
  const providerHint = hasPasswordLogin
    ? ""
    : '<p class="card-text text-muted">Du er innlogga med Google eller Apple. Opprettar du eit passord, kan du også logge inn med e-post og passord.</p>';
  return `
    <h5 class="card-title">${title}</h5>
    ${providerHint}
    <form id="password-form">
      <div class="mb-3">
        <label class="form-label" for="ko-password">Nytt passord</label>
        <input type="password" class="form-control" id="ko-password" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="ko-password2">Gjenta nytt passord</label>
        <input type="password" class="form-control" id="ko-password2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="ko-password-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary">${title}</button>
    </form>`;
}

function linkedAccountsHtml(accounts: LinkedAccountRow[], ownUserId: string): string {
  const rows = accounts
    .map((account) => {
      const isOwn = account.id === ownUserId;
      const buttons = isOwn
        ? '<span class="badge bg-secondary">deg</span>'
        : `<button class="btn btn-sm btn-outline-primary" data-login-email="${escHtml(account.epost)}">Logg inn</button>`;
      return `<tr>
      <td class="linked-accounts-table__email">${escHtml(account.epost)}</td>
      <td class="linked-accounts-table__date">${escHtml(formatDate(account.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${buttons}</td>
    </tr>`;
    })
    .join("");

  return `
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function bindPasswordForm(container: HTMLElement): void {
  container.querySelector("#password-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const errorDiv = container.querySelector<HTMLElement>("#ko-password-error")!;
    errorDiv.classList.add("d-none");

    const password = container.querySelector<HTMLInputElement>("#ko-password")!.value;
    const password2 = container.querySelector<HTMLInputElement>("#ko-password2")!.value;
    if (password !== password2) {
      errorDiv.textContent = "Passorda er ikkje like.";
      errorDiv.classList.remove("d-none");
      return;
    }

    const button = form.querySelector<HTMLButtonElement>("[type=submit]")!;
    button.disabled = true;
    const { error } = await updatePassword(password);
    button.disabled = false;

    if (error) {
      logError("minsideKonto.updatePassword", error);
      errorDiv.textContent = `Kunne ikkje endre passord: ${errorMessage(error)}`;
      errorDiv.classList.remove("d-none");
      return;
    }
    showToast("Passordet er endra.", "success");
    form.reset();
  });
}

function bindAccountActions(container: HTMLElement): void {
  container
    .querySelector<HTMLElement>('[data-slot="accounts"]')!
    .addEventListener("click", async (e) => {
      const loginButton = (e.target as Element).closest<HTMLElement>("[data-login-email]");
      if (loginButton) {
        await signOut();
        location.hash = `#/logginn?email=${encodeURIComponent(loginButton.dataset.loginEmail!)}`;
      }
    });
}

function bindDeleteOwnAccount(container: HTMLElement, ctx: MinSideContext): void {
  container
    .querySelector<HTMLButtonElement>("#delete-own-account")!
    .addEventListener("click", async () => {
      const confirmed = await confirmDialog({
        title: "Slette kontoen?",
        message: `Innloggingskontoen ${ctx.user.email ?? ""} vert sletta permanent. ${DELETE_WARNING}`,
        confirmText: "Slett konto",
        danger: true,
      });
      if (!confirmed) return;

      const { error } = await deleteUserAccount(ctx.user.id);
      if (error) {
        showToast(`Kunne ikkje slette kontoen: ${errorMessage(error)}`, "error");
        return;
      }
      // The account is already gone server-side, so the logout call may 401 —
      // supabase-js clears the local session regardless.
      try {
        await signOut();
      } catch {
        /* session already invalid */
      }
      location.hash = "#/logginn";
    });
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  const throwerId = ctx.status === "godkjent" ? (ctx.profil?.kasterid ?? null) : null;
  const isLinked = throwerId != null;
  // OAuth-only users (e.g. Google) have no 'email' identity; updateUser({ password })
  // then ADDS password login rather than changing an existing one.
  const hasPasswordLogin =
    ctx.user.identities?.some((identity) => identity.provider === "email") ?? true;

  container.innerHTML = `
    ${isLinked ? '<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>' : ""}
    <div class="card mb-4"><div class="card-body">${passwordCardHtml(hasPasswordLogin)}</div></div>
    ${
      isLinked
        ? `
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`
        : ""
    }
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${DELETE_WARNING}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`;

  bindPasswordForm(container);
  bindDeleteOwnAccount(container, ctx);

  if (throwerId == null) return;

  bindAccountActions(container);

  const throwerSlot = container.querySelector<HTMLElement>('[data-slot="thrower"]')!;
  const accountsSlot = container.querySelector<HTMLElement>('[data-slot="accounts"]')!;
  try {
    const [throwerHtml, accounts] = await Promise.all([
      linkedThrowerHtml(throwerId),
      getLinkedAccounts(),
    ]);
    throwerSlot.innerHTML = throwerHtml;
    accountsSlot.innerHTML = accounts.error
      ? '<p class="text-muted">Kunne ikkje laste kontoar.</p>'
      : linkedAccountsHtml(accounts.data, ctx.user.id);
  } catch (err) {
    logError("minsideKonto.render", err);
    accountsSlot.innerHTML = '<p class="text-muted">Kunne ikkje laste kontoar.</p>';
  }
}
