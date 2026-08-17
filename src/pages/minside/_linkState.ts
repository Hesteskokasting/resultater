import { confirmDialog } from "@/components/ConfirmDialog";
import { createSearchSelect, type SearchSelectHandle } from "@/components/SearchSelect";
import { throwerName, throwerNameLastFirst } from "@/utils/kaster";
import { invalidateUserCache } from "@/services/authService";
import { getActiveThrowerList, getThrowerForLink } from "@/services/kasterService";
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
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Ein administrator godkjenner koblinga manuelt, så det kan ta litt tid.</p>
        <p class="card-text text-muted">Etter godkjenning kan du melde deg på stevne, sjå dine eigne kampar og få varsel når eit stevne startar.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-error" class="alert alert-danger d-none mt-2"></div>
        <p class="card-text text-muted small mt-3 mb-0">Har du ikkje delteke på eit stevne før? Ta
           kontakt med klubben din — eller send e-post til
           <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a>, så hjelper vi deg.</p>
      </div>
    </div>`;
}

function pendingHtml(): string {
  return `
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning frå ein administrator.</p>
      <p class="mb-1 small">Mens du ventar kan du klikke deg inn på dei forskjellige sidene for å gjere deg kjent med det nye systemet.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`;
}

/** Fills the pending alert with the requested thrower's name once the lookup lands. */
function fillPendingName(container: HTMLElement, kasterid: number | null): void {
  const slot = container.querySelector<HTMLElement>("#pending-name");
  if (!slot || kasterid == null) return;
  void (async () => {
    const { data } = await getThrowerForLink(kasterid);
    if (data) slot.textContent = ` for ${throwerName(data)}`;
  })();
}

function bindThrowerSearch(container: HTMLElement, userId: string): void {
  const errorDiv = container.querySelector<HTMLElement>("#thrower-error")!;
  let throwers: { id: number; label: string; sublabel: string | null }[] = [];
  let handle: SearchSelectHandle | null = null;

  handle = createSearchSelect({
    slot: container.querySelector("#thrower-search-slot")!,
    // The register is only fetched once someone actually starts typing here.
    loadItems: async () => {
      const { data } = await getActiveThrowerList();
      throwers = data.map((k) => ({
        id: k.id,
        label: throwerNameLastFirst(k),
        sublabel: k.klubb?.navn ?? null,
      }));
      return throwers;
    },
    placeholder: "Søk på navn…",
    onSelect: (kasterid) => {
      if (kasterid == null) return;
      void (async () => {
        errorDiv.classList.add("d-none");
        const chosen = throwers.find((t) => t.id === kasterid);
        const name = chosen ? chosen.label + (chosen.sublabel ? ` (${chosen.sublabel})` : "") : "";
        // The request cannot be withdrawn or changed by the user afterwards.
        const ok = await confirmDialog({
          title: "Er dette deg?",
          message: `Send koblingforespørsel for ${name}?`,
          confirmText: "Send forespørsel",
        });
        if (!ok) {
          handle?.setValue(null);
          return;
        }
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
    fillPendingName(container, ctx.profil?.kobling_kasterid ?? null);
    return null;
  }
  container.innerHTML = unlinkedHtml(ctx.status);
  bindThrowerSearch(container, ctx.user.id);
  return null;
}
