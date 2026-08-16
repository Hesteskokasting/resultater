import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/utils/errorMessage";
import { throwerName } from "@/utils/kaster";
import { getPendingLinks, updateLinkStatus } from "@/services/adminService";
import { createAdminList, createInlineAlert } from "../_adminUi";
import type { AdminListItem } from "../_adminUi";
import { loadUserLookups } from "./_userLookups";

/**
 * Approval queue for users asking to be linked to a thrower. Approving writes the
 * requested `kasterid` onto the profile; rejecting clears the request.
 */
export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster forespørslar…"));

  const { data, error } = await getPendingLinks();
  if (error) {
    el.replaceChildren(createErrorBanner(errorMessage(error)));
    return;
  }
  if (!data.length) {
    el.replaceChildren(createEmptyState("Ingen ventande forespørslar."));
    return;
  }

  const { emailMap, throwerMap } = await loadUserLookups(
    data.map((r) => r.id),
    data.map((r) => r.kobling_kasterid).filter((x): x is number => x !== null),
  );

  const alert = createInlineAlert();

  async function decide(userId: string, kasterid: number | null, status: string): Promise<void> {
    alert.hide();
    const { error: writeError } = await updateLinkStatus(userId, kasterid, status);
    if (writeError) {
      alert.show(errorMessage(writeError));
      return;
    }
    await render(el);
  }

  const items: AdminListItem[] = data.map((row) => {
    const thrower = row.kobling_kasterid ? throwerMap.get(row.kobling_kasterid) : null;
    const clubName = thrower?.klubb?.navn ?? null;
    return {
      title: emailMap.get(row.id) ?? row.id,
      meta: [thrower ? `Vil koblast til ${throwerName(thrower)}` : "Ingen utøvar vald", clubName],
      stripe: "warn",
      actions: [
        {
          label: "Godkjenn",
          variant: "success",
          onClick: () => void decide(row.id, row.kobling_kasterid, "godkjent"),
        },
        {
          label: "Avvis",
          variant: "outline-danger",
          onClick: () => void decide(row.id, null, "avvist"),
        },
      ],
    };
  });

  el.replaceChildren(alert.el, createAdminList(items));
}
