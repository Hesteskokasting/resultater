import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEl } from "@/utils/createEl";
import { errMsg } from "@/utils/adminForms";
import { logError } from "@/utils/logError";
import {
  addClubAdminAccess,
  getClubAdminAssignments,
  getClubAdminUsers,
  getUserEmails,
  removeClubAdminAccess,
} from "@/services/adminService";
import { getClubs } from "@/services/klubbService";
import { createInlineAlert } from "../_adminUi";

/**
 * Which clubs each klubbadmin may administer. One card per klubbadmin user with
 * their assigned clubs as removable chips.
 */
export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster tilgangar…"));

  let users: { id: string }[];
  let clubs: { id: number; navn: string }[];
  let assignments: { bruker_id: string; klubbid: number }[];

  try {
    const [usersRes, clubsRes, assignmentsRes] = await Promise.all([
      getClubAdminUsers(),
      getClubs(),
      getClubAdminAssignments(),
    ]);
    users = usersRes.data;
    clubs = clubsRes.data;
    assignments = assignmentsRes.data;
  } catch (err) {
    logError("admin.klubbtilgang", err);
    el.replaceChildren(createErrorBanner("Kunne ikkje laste data."));
    return;
  }

  if (!users.length) {
    el.replaceChildren(createEmptyState('Ingen brukarar med rolle "klubbadmin".'));
    return;
  }

  const { data: emails } = await getUserEmails(users.map((u) => u.id));
  const emailMap = new Map((emails ?? []).map((r) => [r.id, r.epost] as const));
  const clubMap = new Map(clubs.map((k) => [k.id, k.navn] as const));

  const assigned = new Map<string, number[]>();
  for (const row of assignments) {
    assigned.set(row.bruker_id, [...(assigned.get(row.bruker_id) ?? []), row.klubbid]);
  }

  const alert = createInlineAlert();
  const wrap = createEl("div", null, "admin-access-list");

  async function mutate(action: Promise<{ error: unknown }>): Promise<void> {
    alert.hide();
    const { error } = await action;
    if (error) {
      alert.show(errMsg(error));
      return;
    }
    await render(el);
  }

  for (const user of users) {
    const card = createEl("div", null, "admin-access-card");
    card.appendChild(createEl("h4", emailMap.get(user.id) ?? user.id, "admin-access-card__title"));

    const chips = createEl("div", null, "admin-access-chips");
    const userClubs = assigned.get(user.id) ?? [];
    if (!userClubs.length) {
      chips.appendChild(createEl("span", "Ingen klubbar tildelt", "admin-access-empty"));
    }
    for (const clubId of userClubs) {
      const chip = createEl("span", null, "admin-chip");
      chip.appendChild(createEl("span", clubMap.get(clubId) ?? `#${clubId}`));
      const remove = createEl("button", "×", "admin-chip__remove");
      remove.type = "button";
      remove.setAttribute("aria-label", `Fjern ${clubMap.get(clubId) ?? "klubb"}`);
      remove.addEventListener("click", () => {
        void mutate(removeClubAdminAccess(user.id, clubId));
      });
      chip.appendChild(remove);
      chips.appendChild(chip);
    }
    card.appendChild(chips);

    const row = createEl("div", null, "admin-access-add");
    const select = createEl("select", null, "tl-select admin-select");
    select.setAttribute("aria-label", "Vel klubb");
    const placeholder = createEl("option", "Legg til klubb…");
    placeholder.value = "";
    select.appendChild(placeholder);
    for (const club of clubs) {
      if (userClubs.includes(club.id)) continue;
      const option = createEl("option", club.navn);
      option.value = String(club.id);
      select.appendChild(option);
    }
    const addButton = createEl("button", "Legg til", "btn btn-sm btn-success");
    addButton.type = "button";
    addButton.addEventListener("click", () => {
      const clubId = Number(select.value);
      if (!clubId) return;
      void mutate(addClubAdminAccess(user.id, clubId));
    });
    row.appendChild(select);
    row.appendChild(addButton);
    card.appendChild(row);

    wrap.appendChild(card);
  }

  el.replaceChildren(alert.el, wrap);
}
