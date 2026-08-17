import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { prependAdminLinkBar } from "@/components/AdminLinkBar";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { createTable } from "@/components/Table";
import { createSearchInput } from "@/components/SearchInput";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { setPageTitle } from "@/utils/pageTitle";
import { getClubById } from "@/services/klubbService";
import { getClubMembers } from "@/services/kasterService";
import { filterMembers } from "@/utils/klubbLogikk";
import type { ClubListRow } from "@/services/klubbService";
import type { MemberRow } from "@/services/kasterService";

// Lives here rather than in klubber.ts so the import runs one way only: the list
// page pulls from the detail page, never the reverse.
export const PLACEHOLDER_LOGO = "https://placehold.co/200x200/444/888?text=?";

const filterDetail = { searchText: "" };

// ── HTML builders ─────────────────────────────────────────────────────────────

function detailSkeletonHtml(club: ClubListRow, count: number): string {
  return `
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${escHtml(club.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(club.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${escHtml(club.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${count})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`;
}

function createMemberTable(members: MemberRow[], searchText: string): HTMLElement {
  const filtered = filterMembers(members, searchText);
  if (!filtered.length) return createEmptyState("Ingen aktive utøvarar funnet.");

  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive";
  wrapper.appendChild(
    createTable<MemberRow>({
      rows: filtered,
      columns: [
        {
          label: "#",
          render: (_, i) => String(i + 1),
        },
        {
          label: "Utøvar",
          render: (item) => {
            const a = document.createElement("a");
            a.href = `#/kastere/${buildThrowerSlug(item)}`;
            a.className = "app-link";
            a.textContent = throwerName(item);
            return a;
          },
        },
        {
          label: "Klasse",
          render: (item) => item.klasse?.navn ?? "–",
        },
        {
          label: "Nr.",
          render: (item) => String(item.medlemsnummer ?? "–"),
        },
      ],
    }),
  );
  return wrapper;
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function renderDetail(container: HTMLElement, id: number): Promise<void> {
  filterDetail.searchText = "";
  container.replaceChildren(createLoadingState("Laster klubb..."));

  try {
    const [clubRes, { data: members }] = await Promise.all([getClubById(id), getClubMembers(id)]);

    if (clubRes.error || !clubRes.data) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste klubb."));
      return;
    }

    const club = clubRes.data;

    setPageTitle(club.navn);

    container.innerHTML = detailSkeletonHtml(club, members.length);

    const listContainer = container.querySelector<HTMLElement>("#club-detail-list")!;

    function updateList(): void {
      listContainer.replaceChildren(createMemberTable(members, filterDetail.searchText));
    }

    createSearchInput({
      slot: container.querySelector("#club-detail-search-slot")!,
      placeholder: "Søk på utøvar",
      state: filterDetail,
      onInput: updateList,
    });

    updateList();

    prependAdminLinkBar(container, {
      href: `#/klubber/${id}/admin`,
      label: "Rediger klubb",
      variant: "warning",
      canShow: (auth) =>
        auth.profil?.role === "admin" ||
        (auth.profil?.role === "klubbadmin" && auth.clubs.includes(id)),
    });
  } catch (err) {
    logError("klubber.renderDetail", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste klubb."));
  }
}
