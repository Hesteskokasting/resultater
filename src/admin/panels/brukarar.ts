import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { errMsg } from "@/utils/adminForms";
import { formatDate } from "@/utils/shared";
import { throwerName } from "@/utils/kaster";
import { getAllUsers, getUserEmails, updateUserRole } from "@/services/adminService";
import { getThrowersById } from "@/services/kasterService";
import {
  createAdminList,
  createInlineAlert,
  createLabelledSelect,
  createToolbar,
  flashSaved,
} from "../_adminUi";
import type { AdminBadge, AdminListItem } from "../_adminUi";

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

  const { data, error } = await getAllUsers();
  if (error) {
    el.replaceChildren(createErrorBanner(errMsg(error)));
    return;
  }
  if (!data.length) {
    el.replaceChildren(createEmptyState("Ingen brukarar."));
    return;
  }

  const throwerIds = [
    ...data.map((r) => r.kasterid),
    ...data.map((r) => r.kobling_kasterid),
  ].filter((x): x is number => x !== null);

  const [{ data: emails }, { data: throwers }] = await Promise.all([
    getUserEmails(data.map((r) => r.id)),
    getThrowersById([...new Set(throwerIds)]),
  ]);

  const emailMap = new Map((emails ?? []).map((r) => [r.id, r.epost] as const));
  const throwerMap = new Map((throwers ?? []).map((k) => [k.id, k] as const));

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

  function buildItem(user: (typeof data)[number]): AdminListItem {
    const linkedId = user.kasterid ?? user.kobling_kasterid;
    const thrower = linkedId ? throwerMap.get(linkedId) : null;
    const status = user.kobling_status || "ingen";

    const select = createLabelledSelect(
      "Rolle",
      ROLES.map((r) => ({ value: r, text: ROLE_LABEL[r] ?? r })),
      user.rolle,
    );

    return {
      title: emailMap.get(user.id) ?? user.id,
      meta: [
        thrower ? throwerName(thrower) : "Ingen utøvarkobling",
        user.opprettet_at ? `Registrert ${formatDate(user.opprettet_at.slice(0, 10))}` : null,
      ],
      badges: [LINK_BADGE[status] ?? { text: status, tone: "muted" }],
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
