import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createSearchInput } from "@/components/SearchInput";
import { createSearchSelect } from "@/components/SearchSelect";
import { showToast } from "@/components/Toast";
import { createEl } from "@/utils/createEl";
import { errorMessage } from "@/utils/errorMessage";
import { formatDate } from "@/utils/date";
import { throwerName, throwerNameLastFirst } from "@/utils/kaster";
import { getAllUsers, updateLinkStatus, updateUserRole } from "@/services/adminService";
import { getActiveThrowerList } from "@/services/kasterService";
import { deleteUserAccount } from "@/services/accountService";
import { getUser } from "@/services/authService";
import {
  createActionEl,
  createBadge,
  createInlineAlert,
  createLabelledSelect,
  createToolbar,
  flashSaved,
} from "../_adminUi";
import type { AdminBadge } from "../_adminUi";
import { createAdminTable, createBulkBar } from "../_adminTable";
import { loadUserLookups } from "./_userLookups";

const ROLES = ["bruker", "klubbadmin", "admin"] as const;

/** Only this role may be linked to a thrower; admins and klubbadmins never are. */
const LINKABLE_ROLE = "bruker";

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

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, text: ROLE_LABEL[r] ?? r }));

const filter = { searchText: "", role: "alle" };

export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster brukarar…"));

  const [{ data, error }, auth, { data: throwers, error: throwerError }] = await Promise.all([
    getAllUsers(),
    getUser(),
    getActiveThrowerList(),
  ]);
  // Without the register the row pickers would render blank next to a link that
  // is actually set, so a failure here stops the panel rather than misreporting.
  const loadError = error ?? throwerError;
  if (loadError) {
    el.replaceChildren(createErrorBanner(errorMessage(loadError)));
    return;
  }
  if (!data.length) {
    el.replaceChildren(createEmptyState("Ingen brukarar."));
    return;
  }

  type User = (typeof data)[number];

  const ownId = auth?.user.id ?? null;

  const throwerOptions = throwers.map((k) => ({
    id: k.id,
    label: throwerNameLastFirst(k),
    sublabel: k.klubb?.navn ?? null,
  }));

  const { emailMap, throwerMap } = await loadUserLookups(
    data.map((r) => r.id),
    [...data.map((r) => r.kasterid), ...data.map((r) => r.kobling_kasterid)].filter(
      (x): x is number => x !== null,
    ),
  );

  const linkOf = (user: User): number | null => user.kasterid ?? user.kobling_kasterid;
  const emailOf = (user: User): string => emailMap.get(user.id) ?? user.id;

  const selected = new Set<string>();

  const alert = createInlineAlert();
  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const roleSelect = createLabelledSelect(
    "Filtrer på rolle",
    [{ value: "alle", text: "Alle roller" }, ...ROLE_OPTIONS],
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

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const bulkRole = createLabelledSelect("Ny rolle for valde", ROLE_OPTIONS, LINKABLE_ROLE);
  const bulk = createBulkBar([
    bulkRole,
    { label: "Sett rolle", onClick: () => void bulkSetRole() },
    { label: "Fjern kobling", onClick: () => void bulkUnlink() },
    { label: "Slett", variant: "outline-danger", onClick: () => void bulkDelete() },
  ]);

  const selectedUsers = (): User[] => data.filter((u) => selected.has(u.id));

  /** Runs the writes side by side, then reloads so every row shows the stored state. */
  async function runAll(writes: Promise<{ error: unknown }>[], done: string): Promise<void> {
    alert.hide();
    const failed = (await Promise.all(writes)).find((r) => r.error);
    if (failed) alert.show(errorMessage(failed.error));
    else showToast(done, "success");
    await render(el);
  }

  async function bulkSetRole(): Promise<void> {
    const role = bulkRole.value;
    const unlink = role === LINKABLE_ROLE ? [] : selectedUsers().filter((u) => linkOf(u) != null);
    const changed = selectedUsers().filter((u) => u.rolle !== role);
    if (!changed.length && !unlink.length) {
      showToast(`Alle valde er allereie ${ROLE_LABEL[role]}.`, "info");
      return;
    }
    if (
      unlink.length &&
      !(await confirmDialog({
        title: "Sett rolle",
        message: `${ROLE_LABEL[role]} kan ikkje ha utøvarkobling. Koblinga blir fjerna for ${unlink.length} brukar(ar), også ventande førespurnader.`,
        confirmText: "Sett rolle",
      }))
    )
      return;
    await runAll(
      [
        ...changed.map((u) => updateUserRole(u.id, role)),
        ...unlink.map((u) => updateLinkStatus(u.id, null, "ingen")),
      ],
      "Rolla er oppdatert.",
    );
  }

  async function bulkUnlink(): Promise<void> {
    const targets = selectedUsers().filter((u) => linkOf(u) != null);
    if (!targets.length) {
      showToast("Ingen av dei valde er kobla.", "info");
      return;
    }
    if (
      !(await confirmDialog({
        title: "Fjern kobling",
        message: `Fjern utøvarkoblinga for ${targets.length} brukar(ar)? Ventande førespurnader blir også fjerna.`,
        confirmText: "Fjern kobling",
      }))
    )
      return;
    await runAll(
      targets.map((u) => updateLinkStatus(u.id, null, "ingen")),
      "Koblinga er fjerna.",
    );
  }

  async function bulkDelete(): Promise<void> {
    // Your own account is deleted from Min side → Konto, never from here.
    const targets = selectedUsers().filter((u) => u.id !== ownId);
    if (!targets.length) {
      showToast("Du kan ikkje slette din eigen konto her.", "info");
      return;
    }
    if (
      !(await confirmDialog({
        title: "Slett brukarkontoar",
        message: `Slett innlogginga til ${targets.length} brukar(ar)? Utøvarprofilar og resultat blir verande. Dette kan ikkje angrast.`,
        confirmText: "Slett kontoar",
        danger: true,
      }))
    )
      return;
    await runAll(
      targets.map((u) => deleteUserAccount(u.id)),
      "Brukarkontoane er sletta.",
    );
  }

  // ── Rows ───────────────────────────────────────────────────────────────────

  /**
   * Deletes the login account only. The thrower profile stays, along with every
   * result and registration attached to it — this removes a way in, not a
   * person's history — so the confirm text says so plainly.
   */
  async function removeAccount(user: User): Promise<void> {
    const linkedId = linkOf(user);
    const thrower = linkedId ? throwerMap.get(linkedId) : null;
    const kept = thrower
      ? `Utøvarprofilen «${throwerName(thrower)}» og alle resultat blir verande.`
      : "Utøvarprofilar og resultat blir ikkje rørte.";

    const confirmed = await confirmDialog({
      title: "Slett brukarkonto",
      message: `Slett innlogginga til ${emailOf(user)}? ${kept} Dette kan ikkje angrast.`,
      confirmText: "Slett konto",
      danger: true,
    });
    if (!confirmed) return;

    alert.hide();
    const { error: deleteError } = await deleteUserAccount(user.id);
    if (deleteError) {
      alert.show(errorMessage(deleteError));
      return;
    }
    showToast("Brukarkontoen er sletta.", "success");
    await render(el);
  }

  function emailCell(user: User): HTMLElement {
    const cell = createEl("div", null, "user-table__email");
    cell.append(createEl("span", emailOf(user)));
    if (user.id === ownId) cell.append(createBadge({ text: "Deg", tone: "ok" }));
    return cell;
  }

  function linkCell(user: User): HTMLElement {
    const cell = createEl("div", null, "user-table__link");
    const linkedId = linkOf(user);
    // A non-linkable role has nothing to report unless old data still carries a link.
    if (user.rolle !== LINKABLE_ROLE && linkedId == null) {
      cell.append(createEl("span", "—", "admin-table__muted"));
      return cell;
    }
    const thrower = linkedId ? throwerMap.get(linkedId) : null;
    if (thrower) cell.append(createEl("span", throwerName(thrower)));
    const status = user.kobling_status || "ingen";
    cell.append(createBadge(LINK_BADGE[status] ?? { text: status }));
    return cell;
  }

  interface RowEditor {
    role: HTMLSelectElement;
    link: HTMLElement;
    actions: HTMLElement;
  }

  // Role, link and Lagre share state, so a selected row builds them once and
  // its three cells each take their part.
  const editors = new Map<string, RowEditor>();

  function editorFor(user: User): RowEditor {
    let editor = editors.get(user.id);
    if (!editor) {
      editor = buildEditor(user);
      editors.set(user.id, editor);
    }
    return editor;
  }

  function buildEditor(user: User): RowEditor {
    const linkedId = linkOf(user);
    const select = createLabelledSelect("Rolle", ROLE_OPTIONS, user.rolle);

    // Throwers already linked to someone else are left out: the database does
    // not stop two profiles claiming the same one, so the picker is the only
    // guard. Only approved links count — a pending or rejected request still
    // carries the requested id in kobling_kasterid, and treating that as taken
    // hid the thrower a row is actually linked to.
    const taken = new Set(data.filter((u) => u.id !== user.id).map((u) => u.kasterid));
    const items = throwerOptions.filter((k) => k.id === linkedId || !taken.has(k.id));
    // Only active throwers are fetched. A link to an inactive one is added from
    // the lookup so the field names it instead of looking empty.
    const own = linkedId != null ? throwerMap.get(linkedId) : undefined;
    if (own && !items.some((k) => k.id === own.id)) {
      items.unshift({
        id: own.id,
        label: `${throwerNameLastFirst(own)} (inaktiv)`,
        sublabel: own.klubb?.navn ?? null,
      });
    }
    const picker = createSearchSelect({
      items,
      value: linkedId,
      placeholder: "Søk utøvar…",
      clearLabel: "Fjern kobling",
    });

    function lockPicker(): void {
      const locked = select.value !== LINKABLE_ROLE;
      if (locked) picker.setValue(null);
      picker.input.disabled = locked;
      picker.input.placeholder = locked ? "Berre for Brukar" : "Søk utøvar…";
    }
    select.addEventListener("change", lockPicker);
    lockPicker();

    async function saveRow(button: HTMLButtonElement): Promise<void> {
      const role = select.value;
      const picked = picker.getValue();
      if (
        role !== LINKABLE_ROLE &&
        linkedId != null &&
        !(await confirmDialog({
          title: "Endre rolle",
          message: `${ROLE_LABEL[role]} kan ikkje ha utøvarkobling. Koblinga til ${emailOf(user)} blir fjerna, også ein ventande førespurnad.`,
          confirmText: "Lagre",
        }))
      )
        return;

      alert.hide();
      if (role !== user.rolle) {
        const { error: roleError } = await updateUserRole(user.id, role);
        if (roleError) {
          alert.show(errorMessage(roleError));
          return;
        }
        user.rolle = role;
      }

      if (picked === linkedId) {
        flashSaved(button, "Lagre");
        return;
      }
      // An approved link is written straight away — no request queue —
      // and clearing it puts the profile back to unlinked.
      const { error: linkError } = await updateLinkStatus(
        user.id,
        picked,
        picked == null ? "ingen" : "godkjent",
      );
      if (linkError) {
        alert.show(errorMessage(linkError));
        return;
      }
      await render(el);
    }

    const actions = createEl("div", null, "admin-table__buttons");
    actions.append(
      createActionEl({ label: "Lagre", variant: "primary", onClick: (b) => void saveRow(b) }),
    );
    // Your own account is deleted from Min side → Konto, where the sign-out
    // that follows is expected; doing it from here would log the admin out
    // mid-task.
    if (user.id !== ownId) {
      actions.append(
        createActionEl({
          label: "Slett",
          variant: "outline-danger",
          title: "Slettar berre innlogginga — utøvarprofilen blir verande",
          onClick: () => void removeAccount(user),
        }),
      );
    }
    return { role: select, link: picker.el, actions };
  }

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const visible = data.filter((user) => {
      if (filter.role !== "alle" && user.rolle !== filter.role) return false;
      if (!query) return true;
      const linkedId = linkOf(user);
      const name = linkedId ? throwerName(throwerMap.get(linkedId)) : "";
      return emailOf(user).toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
    // Bulk actions only reach rows the admin can see.
    const shown = new Set(visible.map((u) => u.id));
    for (const id of selected) if (!shown.has(id)) selected.delete(id);
    editors.clear();

    countEl.textContent = `${visible.length} av ${data.length} brukarar`;
    listSlot.replaceChildren(
      visible.length
        ? createAdminTable({
            rows: visible,
            key: (u) => u.id,
            rowLabel: emailOf,
            selected,
            onSelectionChange: () => bulk.update(selected.size),
            columns: [
              { header: "E-post", cell: emailCell },
              {
                header: "Registrert",
                className: "admin-table__date",
                cell: (u) => (u.opprettet_at ? formatDate(u.opprettet_at.slice(0, 10)) : ""),
              },
              {
                header: "Rolle",
                cell: (u, sel) => {
                  // Leftmost editor cell, so a deselected row drops its editor here.
                  if (!sel) editors.delete(u.id);
                  return sel ? editorFor(u).role : (ROLE_LABEL[u.rolle] ?? u.rolle);
                },
              },
              { header: "Kobling", cell: (u, sel) => (sel ? editorFor(u).link : linkCell(u)) },
              {
                header: "",
                className: "admin-table__actions",
                cell: (u, sel) => (sel ? editorFor(u).actions : ""),
              },
            ],
          })
        : createEmptyState("Ingen treff."),
    );
    bulk.update(selected.size);
  }

  el.replaceChildren(alert.el, createToolbar([search, roleSelect, countEl, bulk.el]), listSlot);
  update();
}
