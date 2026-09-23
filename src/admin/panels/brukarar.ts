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
import { getAllThrowerList } from "@/services/kasterService";
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

function createCheckbox(label: string, checked: boolean): HTMLInputElement {
  const box = createEl("input", null, "form-check-input");
  box.type = "checkbox";
  box.checked = checked;
  box.setAttribute("aria-label", label);
  return box;
}

export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster brukarar…"));

  const [{ data, error }, auth, { data: throwers, error: throwerError }] = await Promise.all([
    getAllUsers(),
    getUser(),
    getAllThrowerList(),
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
    active: k.eraktiv ?? false,
    label: throwerNameLastFirst(k) + (k.eraktiv ? "" : " (inaktiv)"),
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
  let visible: User[] = [];

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

  const bulkCount = createEl("span", null, "admin-count");
  const bulkRole = createLabelledSelect("Ny rolle for valde", ROLE_OPTIONS, LINKABLE_ROLE);
  const bulk = createEl("div", null, "user-bulk admin-toolbar__end d-none");
  bulk.append(
    bulkCount,
    bulkRole,
    createActionEl({ label: "Sett rolle", onClick: () => void bulkSetRole() }),
    createActionEl({ label: "Fjern kobling", onClick: () => void bulkUnlink() }),
    createActionEl({ label: "Slett", variant: "outline-danger", onClick: () => void bulkDelete() }),
  );

  const selectedUsers = (): User[] => data.filter((u) => selected.has(u.id));

  function refreshBulk(): void {
    bulk.classList.toggle("d-none", selected.size === 0);
    bulkCount.textContent = `${selected.size} valde`;
    const all = el.querySelector<HTMLInputElement>(".user-table thead input");
    if (all) {
      all.checked = visible.length > 0 && visible.every((u) => selected.has(u.id));
      all.indeterminate = !all.checked && visible.some((u) => selected.has(u.id));
    }
  }

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

  function buildLinkCell(user: User): HTMLElement {
    const cell = createEl("div", null, "user-table__link");
    const linkedId = linkOf(user);
    // A non-linkable role has nothing to report unless old data still carries a link.
    if (user.rolle !== LINKABLE_ROLE && linkedId == null) {
      cell.append(createEl("span", "—", "user-table__muted"));
      return cell;
    }
    const thrower = linkedId ? throwerMap.get(linkedId) : null;
    if (thrower) cell.append(createEl("span", throwerName(thrower), "user-table__name"));
    const status = user.kobling_status || "ingen";
    cell.append(createBadge(LINK_BADGE[status] ?? { text: status }));
    return cell;
  }

  function buildEditor(user: User, actionsCell: HTMLElement): [HTMLElement, HTMLElement] {
    const linkedId = linkOf(user);
    const select = createLabelledSelect("Rolle", ROLE_OPTIONS, user.rolle);

    // Throwers already linked to someone else are left out: the database does
    // not stop two profiles claiming the same one, so the picker is the only
    // guard. Only approved links count — a pending or rejected request still
    // carries the requested id in kobling_kasterid, and treating that as taken
    // hid the thrower a row is actually linked to.
    const taken = new Set(data.filter((u) => u.id !== user.id).map((u) => u.kasterid));
    // This row's own link always stays in the list, whatever its state, so the
    // field names it instead of looking empty. Inactive throwers are not offered.
    const picker = createSearchSelect({
      items: throwerOptions.filter((k) => k.id === linkedId || (k.active && !taken.has(k.id))),
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

    const save = createActionEl({
      label: "Lagre",
      variant: "primary",
      onClick: (button) => void saveRow(button),
    });
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
    actionsCell.append(save);
    // Your own account is deleted from Min side → Konto, where the sign-out
    // that follows is expected; doing it from here would log the admin out
    // mid-task.
    if (user.id !== ownId) {
      actionsCell.append(
        createActionEl({
          label: "Slett",
          variant: "outline-danger",
          title: "Slettar berre innlogginga — utøvarprofilen blir verande",
          onClick: () => void removeAccount(user),
        }),
      );
    }
    return [select, picker.el];
  }

  function buildRow(user: User): HTMLTableRowElement {
    const isSelected = selected.has(user.id);
    const email = emailOf(user);
    const tr = createEl("tr", null, isSelected ? "user-table__row--selected" : undefined);

    const box = createCheckbox(`Vel ${email}`, isSelected);
    box.addEventListener("change", () => {
      if (box.checked) selected.add(user.id);
      else selected.delete(user.id);
      tr.replaceWith(buildRow(user));
      refreshBulk();
    });

    const emailCell = createEl("td", null, "user-table__email");
    emailCell.append(createEl("span", email));
    if (user.id === ownId) emailCell.append(createBadge({ text: "Deg", tone: "ok" }));

    const actionsCell = createEl("td", null, "user-table__actions");
    const [roleCell, linkCell] = isSelected
      ? buildEditor(user, actionsCell)
      : [createEl("span", ROLE_LABEL[user.rolle] ?? user.rolle), buildLinkCell(user)];

    const checkTd = createEl("td", null, "user-table__check");
    const roleTd = createEl("td", null);
    const linkTd = createEl("td", null);
    checkTd.append(box);
    roleTd.append(roleCell);
    linkTd.append(linkCell);
    const date = user.opprettet_at ? formatDate(user.opprettet_at.slice(0, 10)) : "";
    tr.append(
      checkTd,
      emailCell,
      createEl("td", date, "user-table__date"),
      roleTd,
      linkTd,
      actionsCell,
    );
    return tr;
  }

  function buildTable(rows: User[]): HTMLElement {
    const all = createCheckbox("Vel alle", false);
    all.addEventListener("change", () => {
      for (const u of rows) {
        if (all.checked) selected.add(u.id);
        else selected.delete(u.id);
      }
      update();
    });

    const headRow = createEl("tr", null);
    const checkHead = createEl("th", null, "user-table__check");
    checkHead.append(all);
    headRow.append(
      checkHead,
      ...["E-post", "Registrert", "Rolle", "Kobling"].map((t) => createEl("th", t)),
      createEl("th", null, "user-table__actions"),
    );

    const table = createEl("table", null, "user-table");
    const thead = createEl("thead", null);
    const tbody = createEl("tbody", null);
    thead.append(headRow);
    tbody.append(...rows.map((u) => buildRow(u)));
    table.append(thead, tbody);

    const wrap = createEl("div", null, "table-scroll");
    wrap.append(table);
    return wrap;
  }

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    visible = data.filter((user) => {
      if (filter.role !== "alle" && user.rolle !== filter.role) return false;
      if (!query) return true;
      const linkedId = linkOf(user);
      const name = linkedId ? throwerName(throwerMap.get(linkedId)) : "";
      return emailOf(user).toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
    // Bulk actions only reach rows the admin can see.
    const shown = new Set(visible.map((u) => u.id));
    for (const id of selected) if (!shown.has(id)) selected.delete(id);

    countEl.textContent = `${visible.length} av ${data.length} brukarar`;
    listSlot.replaceChildren(
      visible.length ? buildTable(visible) : createEmptyState("Ingen treff."),
    );
    refreshBulk();
  }

  el.replaceChildren(alert.el, createToolbar([search, roleSelect, countEl, bulk]), listSlot);
  update();
}
