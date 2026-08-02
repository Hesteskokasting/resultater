import { createEmptyState } from "@/components/EmptyState";
import { createSearchInput } from "@/components/SearchInput";
import { escHtml } from "@/utils/escHtml";
import { throwerName } from "@/utils/kaster";
import { invalidateUserCache } from "@/services/authService";
import { getActiveThrowerList } from "@/services/kasterService";
import { sendProfileLinkRequest } from "@/services/brukerProfilService";
import { runRefetch } from "@/utils/refetchRegistry";
import type { User } from "@supabase/supabase-js";
import type { LinkStatus, Profile } from "@/types";
import type { ThrowerListRow } from "@/services/kasterService";

export interface MinSideContext {
  user: User;
  profil: Profile | null;
  status: LinkStatus;
}

function unlinkedHtml(status: LinkStatus): string {
  return `
    ${status === "avvist" ? '<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>' : ""}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`;
}

function pendingHtml(): string {
  return '<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>';
}

function bindThrowerSearch(container: HTMLElement, userId: string): void {
  let timer: number | null = null;
  let throwersCache: ThrowerListRow[] | null = null;
  const resultsDiv = container.querySelector<HTMLElement>("#thrower-matches")!;
  const errorDiv = container.querySelector<HTMLElement>("#thrower-error")!;

  createSearchInput({
    slot: container.querySelector("#thrower-search-slot")!,
    placeholder: "Søk på navn…",
    variant: "form",
    onInput: (text) => {
      if (timer !== null) clearTimeout(timer);
      const q = text.trim().toLowerCase();
      if (q.length < 2) {
        resultsDiv.innerHTML = "";
        return;
      }

      timer = setTimeout(async () => {
        if (!throwersCache) {
          const { data } = await getActiveThrowerList();
          throwersCache = data;
        }
        const results = throwersCache
          .filter(
            (k) => k.fornavn.toLowerCase().includes(q) || k.etternavn.toLowerCase().includes(q),
          )
          .slice(0, 8);

        if (!results.length) {
          const el = createEmptyState("Ingen treff.");
          el.classList.add("small");
          resultsDiv.replaceChildren(el);
          return;
        }
        resultsDiv.innerHTML = results
          .map(
            (k) =>
              `<button class="list-group-item list-group-item-action" data-id="${k.id}">
            ${escHtml(throwerName(k))} <span class="text-muted small">· ${escHtml(k.klubb?.navn ?? "")}</span>
          </button>`,
          )
          .join("");
      }, 300);
    },
  });

  resultsDiv.addEventListener("click", async (e) => {
    const button = (e.target as Element).closest<HTMLElement>("[data-id]");
    if (!button) return;
    errorDiv.classList.add("d-none");

    const { error } = await sendProfileLinkRequest(userId, Number(button.dataset.id));
    if (error) {
      errorDiv.textContent = "Kunne ikkje sende forespørsel.";
      errorDiv.classList.remove("d-none");
      return;
    }
    // The cached auth profile still says 'ingen'/'avvist'; drop it so the
    // re-render below sees the new 'venter' status.
    invalidateUserCache();
    await runRefetch();
  });
}

/**
 * Renders the link-request card or pending alert when the user has no approved
 * thrower link, and returns null. Returns the approved kasterid otherwise,
 * leaving the container untouched.
 */
export function renderLinkGate(container: HTMLElement, ctx: MinSideContext): number | null {
  if (ctx.status === "godkjent" && ctx.profil?.kasterid != null) return ctx.profil.kasterid;
  if (ctx.status === "venter") {
    container.innerHTML = pendingHtml();
    return null;
  }
  container.innerHTML = unlinkedHtml(ctx.status);
  bindThrowerSearch(container, ctx.user.id);
  return null;
}
