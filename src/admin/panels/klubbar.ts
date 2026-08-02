import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { buildClubSlug } from "@/utils/kaster";
import { getAllClubsForAdmin } from "@/services/klubbService";
import type { ClubAdminRow } from "@/services/klubbService";
import { getActiveThrowerList } from "@/services/kasterService";
import { createAdminList, createToolbar } from "../_adminUi";
import type { AdminListItem } from "../_adminUi";

const filter = { searchText: "" };

function memberLabel(count: number): string {
  return count === 1 ? "1 aktiv utøvar" : `${count} aktive utøvarar`;
}

function buildItem(club: ClubAdminRow, members: number): AdminListItem {
  return {
    title: club.navn,
    meta: [club.kortnavn, memberLabel(members)],
    badges: club.eraktiv ? [] : [{ text: "Inaktiv", tone: "muted" }],
    actions: [
      { label: "Vis", href: `#/klubber/${buildClubSlug(club)}` },
      { label: "Rediger", href: `#/klubber/${club.id}/admin`, variant: "outline-primary" },
    ],
  };
}

export async function render(el: HTMLElement): Promise<void> {
  el.replaceChildren(createLoadingState("Laster klubbar…"));

  const [{ data: clubs, error }, { data: throwers }] = await Promise.all([
    getAllClubsForAdmin(),
    getActiveThrowerList(),
  ]);

  if (error) {
    el.replaceChildren(createErrorBanner("Kunne ikkje laste klubbar."));
    return;
  }

  const memberCounts = new Map<number, number>();
  for (const thrower of throwers) {
    const clubId = thrower.klubb?.id;
    if (clubId != null) memberCounts.set(clubId, (memberCounts.get(clubId) ?? 0) + 1);
  }

  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);

  const newButton = createEl("a", "+ Ny klubb", "btn btn-sm btn-success admin-toolbar__end");
  newButton.href = "#/klubber/ny";

  const search = createSearchInput({
    placeholder: "Søk på klubbnamn",
    state: filter,
    onInput: () => update(),
  });

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = query
      ? clubs.filter((club) =>
          [club.navn, club.kortnavn]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
        )
      : clubs;

    countEl.textContent = `${matches.length} av ${clubs.length} klubbar`;
    listSlot.replaceChildren(
      matches.length
        ? createAdminList(matches.map((club) => buildItem(club, memberCounts.get(club.id) ?? 0)))
        : createEmptyState("Ingen klubbar å vise."),
    );
  }

  el.replaceChildren(createToolbar([search, countEl, newButton]), listSlot);
  update();
}
