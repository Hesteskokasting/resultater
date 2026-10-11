import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { errorMessage } from "@/utils/errorMessage";
import { throwerName } from "@/utils/kaster";
import { answerLinkRequest, getPendingLinks } from "@/services/adminService";
import { createAdminList, createInlineAlert } from "../_adminUi";
import type { AdminListItem } from "../_adminUi";
import { loadUserLookups } from "./_userLookups";

/**
 * Approval queue for users asking to be linked to a thrower. Approving writes the
 * requested `kasterid` onto the profile; rejecting clears the request. RLS hands
 * a klubbadmin only the requests for their own club's throwers.
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

  async function decide(userId: string, approve: boolean): Promise<void> {
    alert.hide();
    const { error: writeError } = await answerLinkRequest(userId, approve);
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
          onClick: () => void decide(row.id, true),
        },
        {
          label: "Avvis",
          variant: "outline-danger",
          onClick: () => void decide(row.id, false),
        },
      ],
    };
  });

  el.replaceChildren(alert.el, createAdminList(items));
}
