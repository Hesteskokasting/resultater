import { createEmptyState } from "@/components/EmptyState";
import { createEl } from "@/utils/createEl";

export interface SearchSelectItem {
  id: number;
  label: string;
  /** Muted second line, e.g. the club. */
  sublabel?: string | null;
}

export interface SearchSelectProps {
  /** Placeholder element (from an innerHTML skeleton) that the picker replaces. */
  slot?: Element;
  items?: SearchSelectItem[];
  /** Lazy alternative to `items`, called once on the first search. */
  loadItems?: () => Promise<SearchSelectItem[]>;
  /** Renders a hidden input so a surrounding form's FormData carries the id. */
  name?: string;
  value?: number | null;
  placeholder?: string;
  /** Row that clears the selection. Omit for a required field. */
  clearLabel?: string;
  emptyText?: string;
  /** Characters needed before the list opens. Defaults to 0 with `items`, 2 when lazy. */
  minChars?: number;
  /** Rows rendered at most. Anything beyond is reported in a footer, never dropped silently. */
  maxResults?: number;
  onSelect?: (id: number | null) => void;
}

export interface SearchSelectHandle {
  el: HTMLElement;
  input: HTMLInputElement;
  getValue: () => number | null;
  setValue: (id: number | null) => void;
}

/** Case- and accent-insensitive, so "ostbo" finds "Østbø" and vice versa. */
function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[æä]/g, "ae")
    .replace(/[øö]/g, "o")
    .replace(/å/g, "a");
}

/** Every whitespace-separated term must hit the label or sublabel, in any order. */
function matches(item: SearchSelectItem, terms: string[]): boolean {
  const hay = fold(`${item.label} ${item.sublabel ?? ""}`);
  return terms.every((t) => hay.includes(t));
}

/**
 * Type-to-search replacement for a long `<select>`: a text input that filters a
 * list of people and writes the chosen id to a hidden field.
 */
export function createSearchSelect({
  slot,
  items,
  loadItems,
  name,
  value = null,
  placeholder = "Søk på namn…",
  clearLabel,
  emptyText = "Ingen treff.",
  minChars,
  maxResults = 50,
  onSelect,
}: SearchSelectProps): SearchSelectHandle {
  const threshold = minChars ?? (items ? 0 : 2);
  let all: SearchSelectItem[] | null = items ?? null;
  let selected: number | null = value;
  let active = -1;

  const el = createEl("div", null, "search-select");
  const hidden = createEl("input", null);
  hidden.type = "hidden";
  if (name) hidden.name = name;
  hidden.value = selected == null ? "" : String(selected);

  const input = createEl("input", null, "form-control");
  input.type = "text";
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-label", placeholder);

  const menu = createEl("div", null, "search-select__menu list-group d-none");
  el.append(hidden, input, menu);

  const labelOf = (id: number | null): string =>
    (id != null && all?.find((k) => k.id === id)?.label) || "";

  function close(): void {
    menu.classList.add("d-none");
    menu.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    active = -1;
  }

  function setValue(id: number | null): void {
    selected = id;
    hidden.value = id == null ? "" : String(id);
    input.value = labelOf(id);
    close();
  }

  function highlight(): void {
    for (const [i, row] of [...menu.children].entries()) {
      row.classList.toggle("active", i === active);
    }
    if (active >= 0) menu.children[active]?.scrollIntoView({ block: "nearest" });
  }

  function render(query: string): void {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    const hits = (all ?? []).filter((k) => matches(k, terms));

    const rows: HTMLElement[] = hits.slice(0, maxResults).map((k) => {
      const row = createEl("button", null, "list-group-item list-group-item-action");
      row.type = "button";
      row.dataset["id"] = String(k.id);
      row.append(createEl("span", k.label));
      if (k.sublabel) row.append(createEl("span", ` · ${k.sublabel}`, "text-muted small"));
      return row;
    });

    // The clear row is an option like any other — it is filtered by the query and
    // takes part in the arrow-key walk, hence a sentinel id over its own handler.
    if (clearLabel != null && selected != null && matches({ id: -1, label: clearLabel }, terms)) {
      const row = createEl(
        "button",
        clearLabel,
        "list-group-item list-group-item-action text-muted",
      );
      row.type = "button";
      row.dataset["id"] = "";
      rows.unshift(row);
    }

    if (!rows.length) {
      const empty = createEmptyState(emptyText);
      empty.classList.add("small");
      menu.replaceChildren(empty);
    } else {
      menu.replaceChildren(...rows);
      // Say so rather than letting a cut-off list look complete.
      if (hits.length > maxResults) {
        menu.append(
          createEl(
            "div",
            `Viser ${maxResults} av ${hits.length} treff — skriv meir for å snevre inn.`,
            "list-group-item small text-muted",
          ),
        );
      }
    }
    menu.classList.remove("d-none");
    input.setAttribute("aria-expanded", "true");
    active = -1;
  }

  async function open(query: string): Promise<void> {
    if (query.length < threshold) {
      close();
      return;
    }
    if (!all && loadItems) all = await loadItems();
    render(query);
  }

  input.addEventListener("input", () => {
    void open(input.value.trim());
  });
  input.addEventListener("focus", () => {
    void open(input.value.trim());
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = labelOf(selected);
      close();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (menu.classList.contains("d-none")) {
        void open(input.value.trim());
        return;
      }
      const count = menu.querySelectorAll("[data-id]").length;
      if (!count) return;
      if (e.key === "ArrowDown") active = active + 1 >= count ? 0 : active + 1;
      else active = active <= 0 ? count - 1 : active - 1;
      highlight();
      return;
    }
    if (e.key === "Enter" && !menu.classList.contains("d-none")) {
      const row = active >= 0 ? menu.children[active] : null;
      if (row instanceof HTMLElement && row.dataset["id"] !== undefined) {
        e.preventDefault();
        pick(row.dataset["id"]);
      }
    }
  });

  function pick(raw: string | undefined): void {
    const id = raw ? Number(raw) : null;
    setValue(id);
    onSelect?.(id);
  }

  // mousedown, because blur fires before click and would close the menu first.
  menu.addEventListener("mousedown", (e) => {
    const row = (e.target as Element).closest<HTMLElement>("[data-id]");
    if (!row) return;
    e.preventDefault();
    pick(row.dataset["id"]);
  });

  input.addEventListener("blur", () => {
    // Free text is not a value: fall back to whatever is actually selected.
    input.value = labelOf(selected);
    close();
  });

  input.value = labelOf(selected);
  slot?.replaceWith(el);
  return { el, input, getValue: () => selected, setValue };
}
