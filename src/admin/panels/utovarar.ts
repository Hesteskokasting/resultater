import { createEmptyState } from "@/components/EmptyState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createSearchInput } from "@/components/SearchInput";
import { createEl } from "@/utils/createEl";
import { buildThrowerSlug, throwerName } from "@/utils/kaster";
import { getActiveThrowerList, getAllThrowerList } from "@/services/kasterService";
import type { ThrowerListRow } from "@/services/kasterService";
import { createAdminList, createLabelledSelect, createToolbar } from "../_adminUi";
import type { AdminListItem } from "../_adminUi";

/** Rendered in chunks: the full list is well over a thousand rows on a real season. */
const PAGE_SIZE = 40;

const filter = { searchText: "", scope: "aktive", shown: PAGE_SIZE };

function buildItem(thrower: ThrowerListRow): AdminListItem {
  return {
    title: throwerName(thrower),
    meta: [thrower.klubb?.navn ?? "Utan klubb"],
    badges: thrower.eraktiv ? [] : [{ text: "Inaktiv", tone: "muted" }],
    actions: [
      { label: "Profil", href: `#/kastere/${buildThrowerSlug(thrower)}` },
      { label: "Rediger", href: `#/kaster/${thrower.id}/admin`, variant: "outline-primary" },
    ],
  };
}

export async function render(el: HTMLElement): Promise<void> {
  const countEl = createEl("span", null, "admin-count");
  const listSlot = createEl("div", null);
  const moreSlot = createEl("div", null, "admin-more");

  const newButton = createEl("a", "+ Ny utøvar", "btn btn-sm btn-success admin-toolbar__end");
  newButton.href = "#/kaster/ny";

  const scopeSelect = createLabelledSelect(
    "Vis utøvarar",
    [
      { value: "aktive", text: "Berre aktive" },
      { value: "alle", text: "Alle utøvarar" },
    ],
    filter.scope,
  );

  const search = createSearchInput({
    placeholder: "Søk på namn eller klubb",
    state: filter,
    onInput: () => {
      filter.shown = PAGE_SIZE;
      update();
    },
  });

  let rows: ThrowerListRow[] = [];

  function update(): void {
    const query = filter.searchText.trim().toLowerCase();
    const matches = query
      ? rows.filter(
          (row) =>
            throwerName(row).toLowerCase().includes(query) ||
            (row.klubb?.navn ?? "").toLowerCase().includes(query),
        )
      : rows;

    const visible = matches.slice(0, filter.shown);
    countEl.textContent = `${matches.length} av ${rows.length} utøvarar`;
    listSlot.replaceChildren(
      visible.length
        ? createAdminList(visible.map(buildItem))
        : createEmptyState("Ingen utøvarar å vise."),
    );

    moreSlot.replaceChildren();
    if (matches.length > visible.length) {
      const button = createEl(
        "button",
        `Vis fleire (${matches.length - visible.length} igjen)`,
        "btn btn-sm btn-outline-secondary",
      );
      button.type = "button";
      button.addEventListener("click", () => {
        filter.shown += PAGE_SIZE;
        update();
      });
      moreSlot.appendChild(button);
    }
  }

  async function load(): Promise<void> {
    listSlot.replaceChildren(createLoadingState("Laster utøvarar…"));
    const { data, error } =
      filter.scope === "alle" ? await getAllThrowerList() : await getActiveThrowerList();
    if (error) {
      listSlot.replaceChildren(createErrorBanner("Kunne ikkje laste utøvarar."));
      return;
    }
    rows = data;
    update();
  }

  scopeSelect.addEventListener("change", () => {
    filter.scope = scopeSelect.value;
    filter.shown = PAGE_SIZE;
    void load();
  });

  el.replaceChildren(createToolbar([search, scopeSelect, countEl, newButton]), listSlot, moreSlot);
  await load();
}
