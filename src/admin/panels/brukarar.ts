import { confirmDialog } from "@/components/ConfirmDialog";
import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { showToast } from "@/components/Toast";
import { createEl } from "@/utils/createEl";
import { errMsg } from "@/utils/adminForms";
import { formatDate } from "@/utils/shared";
import { throwerName } from "@/utils/kaster";
import { getAllUsers, updateUserRole } from "@/services/adminService";
import { deleteUserAccount } from "@/services/accountService";
import { getUser } from "@/services/authService";
import {
  createAdminList,
  createInlineAlert,
  createLabelledSelect,
  createToolbar,
  flashSaved,
} from "../_adminUi";
import type { AdminBadge, AdminListItem } from "../_adminUi";
import { loadUserLookups } from "./_userLookups";

const ROLES = ["bruker", "klubbadmin", "admin"] as const;

const ROLE_LABEL: Record<string, string> = {
  bruker: "Brukar",
  klubbadmin: "Klubbadmin",
  admin: "Admin",
};

const LINK_BADGE: Record<string, AdminBadge> = {
  godkjent: { text: "Kobla", tone: "ok" },
  venter: { text: "Ventar", tone: "warn" },
  avvist: { text: "Avvist", tone: "danger" },
  ingen: { text: "Ikkje kobla", tone: "muted" },
};

const filter = { searchText: "", role: "alle" };

export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster brukarar…"));

  const [{ data, error }, auth] = await Promise.all([getAllUsers(), getUser()]);
  if (error) {
    el.replaceChildren(createErrorBanner(errMsg(error)));
    return;
  }
  if (!data.length) {
    el.replaceChildren(createEmptyState("Ingen brukarar."));
    return;
  }

  const ownId = auth?.user.id ?? null;

  const { emailMap, throwerMap } = await loadUserLookups(
    data.map((r) => r.id),
    [...data.map((r) => r.kasterid), ...data.map((r) => r.kobling_kasterid)].filter(
      (x): x is number => x !== null,
    ),
  );

  const alert = createInlineAlert();
  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const roleSelect = createLabelledSelect(
    "Filtrer på rolle",
    [
      { value: "alle", text: "Alle roller" },
      ...ROLES.map((r) => ({ value: r, text: ROLE_LABEL[r] ?? r })),
    ],
    filter.role,
  );
  roleSelect.addEventListener("change", () => {
    filter.role = roleSelect.value;
    update();
  });

  const search = createSearchInput({
    placeholder: "Søk på e-post eller utøvar",
    state: filter,
    onInput: () => update(),
  });

  /**
   * Deletes the login account only. The thrower profile stays, along with every
   * result and registration attached to it — this removes a way in, not a
   * person's history — so the confirm text says so plainly.
   */
  async function removeAccount(user: (typeof data)[number], email: string): Promise<void> {
    const thrower = user.kasterid ? throwerMap.get(user.kasterid) : null;
    const kept = thrower
      ? `Utøvarprofilen «${throwerName(thrower)}» og alle resultat blir verande.`
      : "Utøvarprofilar og resultat blir ikkje rørte.";

    const confirmed = await confirmDialog({
      title: "Slett brukarkonto",
      message: `Slett innlogginga til ${email}? ${kept} Dette kan ikkje angrast.`,
      confirmText: "Slett konto",
      danger: true,
    });
    if (!confirmed) return;

    alert.hide();
    const { error: deleteError } = await deleteUserAccount(user.id);
    if (deleteError) {
      alert.show(errMsg(deleteError));
      return;
    }
    showToast("Brukarkontoen er sletta.", "success");
    await render(el);
  }

  function buildItem(user: (typeof data)[number]): AdminListItem {
    const linkedId = user.kasterid ?? user.kobling_kasterid;
    const thrower = linkedId ? throwerMap.get(linkedId) : null;
    const status = user.kobling_status || "ingen";
    const email = emailMap.get(user.id) ?? user.id;
    const isSelf = user.id === ownId;

    const select = createLabelledSelect(
      "Rolle",
      ROLES.map((r) => ({ value: r, text: ROLE_LABEL[r] ?? r })),
      user.rolle,
    );

    const badges = [LINK_BADGE[status] ?? { text: status, tone: "muted" as const }];
    if (isSelf) badges.push({ text: "Deg", tone: "ok" });

    return {
      title: email,
      meta: [
        thrower ? throwerName(thrower) : "Ingen utøvarkobling",
        user.opprettet_at ? `Registrert ${formatDate(user.opprettet_at.slice(0, 10))}` : null,
      ],
      badges,
      control: select,
      actions: [
        {
          label: "Lagre",
          variant: "primary",
          onClick: (button) => {
            void (async () => {
              alert.hide();
              const { error: writeError } = await updateUserRole(user.id, select.value);
              if (writeError) {
                alert.show(errMsg(writeError));
                return;
              }
              user.rolle = select.value;
              flashSaved(button, "Lagre");
            })();
          },
        },
        // Your own account is deleted from Min side → Konto, where the sign-out
        // that follows is expected; doing it from here would log the admin out
        // mid-task.
        ...(isSelf
          ? []
          : [
              {
                label: "Slett",
                variant: "outline-danger",
                title: "Slettar berre innlogginga — utøvarprofilen blir verande",
                onClick: () => {
                  void removeAccount(user, email);
                },
              },
            ]),
      ],
    };
  }

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const rows = data.filter((user) => {
      if (filter.role !== "alle" && user.rolle !== filter.role) return false;
      if (!query) return true;
      const linkedId = user.kasterid ?? user.kobling_kasterid;
      const name = linkedId ? throwerName(throwerMap.get(linkedId)) : "";
      return (
        (emailMap.get(user.id) ?? "").toLowerCase().includes(query) ||
        name.toLowerCase().includes(query)
      );
    });

    countEl.textContent = `${rows.length} av ${data.length} brukarar`;
    listSlot.replaceChildren(
      rows.length ? createAdminList(rows.map(buildItem)) : createEmptyState("Ingen treff."),
    );
  }

  el.replaceChildren(alert.el, createToolbar([search, roleSelect, countEl]), listSlot);
  update();
}
