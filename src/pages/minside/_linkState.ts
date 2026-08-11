import { createSearchSelect } from "@/components/SearchSelect";
import { throwerNameLastFirst } from "@/utils/kaster";
import { invalidateUserCache } from "@/services/authService";
import { getActiveThrowerList } from "@/services/kasterService";
import { sendProfileLinkRequest } from "@/services/brukerProfilService";
import { runRefetch } from "@/utils/refetchRegistry";
import type { User } from "@supabase/supabase-js";
import type { LinkStatus, Profile } from "@/types";

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
        <div id="thrower-error" class="alert alert-danger d-none mt-2"></div>
      </div>
    </div>`;
}

function pendingHtml(): string {
  return '<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>';
}

function bindThrowerSearch(container: HTMLElement, userId: string): void {
  const errorDiv = container.querySelector<HTMLElement>("#thrower-error")!;

  createSearchSelect({
    slot: container.querySelector("#thrower-search-slot")!,
    // The register is only fetched once someone actually starts typing here.
    loadItems: async () => {
      const { data } = await getActiveThrowerList();
      return data.map((k) => ({
        id: k.id,
        label: throwerNameLastFirst(k),
        sublabel: k.klubb?.navn ?? null,
      }));
    },
    placeholder: "Søk på navn…",
    onSelect: (kasterid) => {
      if (kasterid == null) return;
      void (async () => {
        errorDiv.classList.add("d-none");
        const { error } = await sendProfileLinkRequest(userId, kasterid);
        if (error) {
          errorDiv.textContent = "Kunne ikkje sende forespørsel.";
          errorDiv.classList.remove("d-none");
          return;
        }
        // The cached auth profile still says 'ingen'/'avvist'; drop it so the
        // re-render below sees the new 'venter' status.
        invalidateUserCache();
        await runRefetch();
      })();
    },
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
