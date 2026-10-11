import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createEl } from "@/utils/createEl";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import {
  getClubAdminAssignments,
  getClubAdminUsers,
  getUserEmails,
  setClubAdminClub,
} from "@/services/adminService";
import { getClubs } from "@/services/klubbService";
import { createInlineAlert } from "../_adminUi";

/**
 * Which club each klubbadmin runs. One row per klubbadmin user with a club
 * select; a klubbadmin has at most one club (UNIQUE on bruker_id).
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
  const assigned = new Map(assignments.map((row) => [row.bruker_id, row.klubbid] as const));

  const alert = createInlineAlert();
  const wrap = createEl("div", null, "admin-access-list");

  for (const user of users) {
    const email = emailMap.get(user.id) ?? user.id;
    const card = createEl("div", null, "admin-access-card");
    card.appendChild(createEl("span", email, "admin-access-card__title"));

    const select = createEl("select", null, "app-select admin-select");
    select.setAttribute("aria-label", `Klubb for ${email}`);
    const none = createEl("option", "Ingen klubb");
    none.value = "";
    select.appendChild(none);
    for (const club of clubs) {
      const option = createEl("option", club.navn);
      option.value = String(club.id);
      select.appendChild(option);
    }
    select.value = String(assigned.get(user.id) ?? "");
    let saved = select.value;
    select.addEventListener("change", async () => {
      alert.hide();
      const { error } = await setClubAdminClub(user.id, select.value ? Number(select.value) : null);
      if (error) {
        select.value = saved;
        alert.show(errorMessage(error));
        return;
      }
      saved = select.value;
    });
    card.appendChild(select);

    wrap.appendChild(card);
  }

  el.replaceChildren(alert.el, wrap);
}
