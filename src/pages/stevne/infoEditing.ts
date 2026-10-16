import {
  getActiveThrowingMethods,
  getCategories,
  getTournamentTypes,
  type TournamentSettingsUpdatePayload,
} from "@/services/stevneService";
import { getAllThrowerList } from "@/services/kasterService";
import { createSearchSelect } from "@/components/SearchSelect";
import { buildDropdownOptions } from "@/utils/dropdown";
import { escHtml } from "@/utils/escHtml";
import { throwerNameLastFirst } from "@/utils/kaster";

export type InfoPatch = TournamentSettingsUpdatePayload;

/**
 * Builds the controls in place of a tile's value and calls `commit` with what
 * to save. May be async, for editors whose options load on first open.
 */
type InfoEditor = (
  valueEl: HTMLElement,
  commit: (patch: InfoPatch) => void,
) => void | Promise<void>;

/**
 * An editor of plain selects and inputs: each control's `name` is the stevne
 * column it saves, and its change event commits that one column.
 */
function fieldEditor(
  html: () => string | Promise<string>,
  parse: (field: HTMLInputElement | HTMLSelectElement) => InfoPatch | null,
): InfoEditor {
  return async (valueEl, commit) => {
    valueEl.innerHTML = await html();
    valueEl.addEventListener("change", (e) => {
      const patch = parse(e.target as HTMLInputElement | HTMLSelectElement);
      if (patch) commit(patch);
    });
  };
}

/** "" → null, numeric columns as numbers. */
function parseField(field: HTMLInputElement | HTMLSelectElement): InfoPatch {
  const raw = field.value.trim();
  const isNumber = field.type === "number" || field.tagName === "SELECT";
  return { [field.name]: raw === "" ? null : isNumber ? Number(raw) : raw };
}

/**
 * Turns every `[data-felt]` tile that has an editor into an in-place field on
 * tap. Esc or focus leaving the tile puts the value back; a commit hands the
 * patch to `save`, which re-renders on success.
 */
export function bindInfoEditing(
  root: HTMLElement,
  editors: Record<string, InfoEditor>,
  save: (patch: InfoPatch) => Promise<boolean>,
): void {
  root.querySelectorAll<HTMLElement>("[data-felt]").forEach((tile) => {
    const editor = editors[tile.dataset.felt ?? ""];
    const valueEl = tile.querySelector<HTMLElement>(".stevne-hero__verdi, dd");
    if (!editor || !valueEl) return;
    const original = valueEl.innerHTML;
    let editing = false;
    let saving = false;

    function close(): void {
      editing = false;
      // The editor lived in its own host node, so its listeners go with it.
      valueEl!.innerHTML = original;
      tile.classList.remove("is-editing");
    }

    async function open(): Promise<void> {
      if (editing) return;
      editing = true;
      tile.classList.add("is-editing");
      const host = document.createElement("div");
      valueEl!.replaceChildren(host);
      await editor!(host, async (patch) => {
        saving = true;
        host.querySelectorAll<HTMLInputElement>("input, select").forEach((f) => {
          f.disabled = true;
        });
        const ok = await save(patch);
        saving = false;
        if (!ok) close();
      });
      host.querySelector<HTMLElement>("input:not([type=hidden]), select")?.focus();
    }

    tile.addEventListener("click", () => void open());
    tile.addEventListener("keydown", (e) => {
      if (!editing && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        void open();
      } else if (editing && e.key === "Escape") {
        close();
        tile.focus();
      }
    });
    tile.addEventListener("focusout", (e) => {
      if (editing && !saving && !tile.contains(e.relatedTarget as Node | null)) close();
    });
  });
}

// ── Editors for the info tab ──────────────────────────────────────────────────

export const FORMAT_COLUMNS: (keyof InfoPatch)[] = [
  "stevnetypeid",
  "kategoriid",
  "innledendekastemetodeid",
  "avsluttendekastemetodeid",
];

interface EditableStevne {
  dato: string;
  tid: string | null;
  sted: string | null;
  stevnetypeid: number | null;
  kategoriid: number | null;
  innledendekastemetodeid: number | null;
  avsluttendekastemetodeid: number | null;
  tilgjengelige_baner: number | null;
  kontaktkasterid: number | null;
}

interface InfoOptions {
  methods: {
    id: number;
    navn: string;
    er_innledende: boolean | null;
    er_avsluttende: boolean | null;
  }[];
  types: { id: number; navn: string }[];
  categories: { id: number; navn: string }[];
}

let optionsPromise: Promise<InfoOptions> | null = null;

/** Option lists for the format tiles, loaded on first open and kept for the session. */
function loadOptions(): Promise<InfoOptions> {
  if (!optionsPromise) {
    optionsPromise = Promise.all([
      getActiveThrowingMethods(),
      getTournamentTypes(),
      getCategories(),
    ]).then(([methods, types, categories]) => ({
      methods: methods.data,
      types: types.data,
      categories: categories.data,
    }));
  }
  return optionsPromise;
}

function fieldSelectHtml(name: string, label: string, options: string): string {
  return `<select name="${name}" class="form-select form-select-sm" aria-label="${label}">${options}</select>`;
}

export function infoEditors(stevne: EditableStevne): Record<string, InfoEditor> {
  const none = "— Ikkje vald —";
  return {
    dato: fieldEditor(
      () =>
        `<input name="dato" type="date" class="form-control form-control-sm" value="${stevne.dato}" required>`,
      parseField,
    ),
    tid: fieldEditor(
      () =>
        `<input name="tid" type="time" class="form-control form-control-sm" value="${stevne.tid?.slice(0, 5) ?? ""}">`,
      parseField,
    ),
    sted: fieldEditor(
      () =>
        `<input name="sted" type="text" class="form-control form-control-sm" value="${escHtml(stevne.sted ?? "")}">`,
      parseField,
    ),
    baner: fieldEditor(
      () =>
        `<input name="tilgjengelige_baner" type="number" min="1" class="form-control form-control-sm" value="${stevne.tilgjengelige_baner ?? ""}" aria-label="Tilgjengelege baner">`,
      parseField,
    ),
    type: fieldEditor(async () => {
      const { types, categories } = await loadOptions();
      return (
        fieldSelectHtml(
          "stevnetypeid",
          "Stevnetype",
          buildDropdownOptions(types, stevne.stevnetypeid, none),
        ) +
        fieldSelectHtml(
          "kategoriid",
          "Kategori",
          buildDropdownOptions(categories, stevne.kategoriid, none),
        )
      );
    }, parseField),
    innl: fieldEditor(async () => {
      const { methods } = await loadOptions();
      return fieldSelectHtml(
        "innledendekastemetodeid",
        "Innleiande kastemetode",
        buildDropdownOptions(
          methods.filter((m) => m.er_innledende),
          stevne.innledendekastemetodeid,
          none,
        ),
      );
    }, parseField),
    avsl: fieldEditor(async () => {
      const { methods } = await loadOptions();
      return fieldSelectHtml(
        "avsluttendekastemetodeid",
        "Avsluttande kastemetode",
        buildDropdownOptions(
          methods.filter((m) => m.er_avsluttende),
          stevne.avsluttendekastemetodeid,
          none,
        ),
      );
    }, parseField),
    kontakt: async (host, commit) => {
      const { data } = await getAllThrowerList();
      // Inactive throwers stay pickable only as the current contact, so an
      // existing one never falls out of the list.
      const items = data
        .filter((k) => k.eraktiv || k.id === stevne.kontaktkasterid)
        .map((k) => ({
          id: k.id,
          label: throwerNameLastFirst(k) + (k.eraktiv ? "" : " (inaktiv)"),
          sublabel: k.klubb?.navn ?? null,
        }));
      const slot = document.createElement("span");
      host.append(slot);
      createSearchSelect({
        slot,
        items,
        value: stevne.kontaktkasterid,
        placeholder: "Søk på etternamn eller fornamn…",
        clearLabel: "— ingen kontaktperson —",
        onSelect: (kontaktkasterid) => commit({ kontaktkasterid }),
      });
    },
  };
}
