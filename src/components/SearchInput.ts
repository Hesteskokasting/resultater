export interface SearchState {
  searchText: string;
}

export interface SearchInputProps {
  placeholder?: string;
  /** 'filter' matches the app-select filter rows (default); 'form' matches bootstrap forms. */
  variant?: "filter" | "form";
  /** Placeholder element (from an innerHTML skeleton) that the input replaces. */
  slot?: Element;
  /**
   * Two-way binding: the input starts at state.searchText and writes every keystroke
   * back. Inputs bound to the same state object keep their visible values in sync
   * (e.g. desktop + mobile variants of the same filter).
   */
  state?: SearchState;
  /** Fires on every keystroke, after state (if any) is updated. */
  onInput?: (text: string) => void;
}

// Inputs bound to the same state object, so siblings can mirror each other's value.
// Inputs from re-rendered pages are pruned lazily once they leave the document.
const syncGroups = new WeakMap<SearchState, Set<HTMLInputElement>>();

export function createSearchInput({
  placeholder = "Søk...",
  variant = "filter",
  slot,
  state,
  onInput,
}: SearchInputProps = {}): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "search";
  // Width cap (.search-input) only applies in filter rows; bootstrap forms keep full width.
  input.className = variant === "form" ? "form-control mb-2" : "app-select search-input";
  input.placeholder = placeholder;
  input.setAttribute("aria-label", placeholder);
  input.value = state?.searchText ?? "";

  if (state) {
    let group = syncGroups.get(state);
    if (!group) {
      group = new Set();
      syncGroups.set(state, group);
    }
    group.add(input);
  }

  input.addEventListener("input", () => {
    if (state) {
      state.searchText = input.value;
      for (const sibling of syncGroups.get(state)!) {
        if (sibling === input) continue;
        if (!sibling.isConnected) {
          syncGroups.get(state)!.delete(sibling);
          continue;
        }
        sibling.value = input.value;
      }
    }
    onInput?.(input.value);
  });

  slot?.replaceWith(input);
  return input;
}
