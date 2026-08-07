import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { createRemoveButton } from "@/components/RemoveButton";
import { createPlayerTable } from "@/components/PlayerTable";
import { createSearchInput } from "@/components/SearchInput";
import type { PlayerTableHandle } from "@/components/PlayerTable";
import type { ThrowerListRow } from "@/services/kasterService";
import {
  addRegistrationAdmin,
  confirmRegistrationForThrower,
  removeRegistrationForThrower,
} from "@/services/pameldingService";
import type { PrinterBanner } from "@/pages/stevne/PrinterBanner";

// ── Available (left) column ────────────────────────────────────────────────────

export interface AvailableColumnHandle {
  element: HTMLElement;
  searchInput: HTMLInputElement;
  table: PlayerTableHandle;
}

export interface AvailableColumnProps {
  canEdit: boolean;
  tournamentId: number;
  /** Map/dirty-flag/banner bookkeeping for a newly registered thrower, owned by the caller */
  onRegistered: (kasterid: number) => void;
  /** Re-render both tables after a change */
  refreshLists: () => void;
}

export function createAvailableColumn(props: AvailableColumnProps): AvailableColumnHandle {
  const { canEdit, tournamentId, onRegistered, refreshLists } = props;

  const leftWrapper = document.createElement("div");
  leftWrapper.className =
    "col-md-6 d-flex flex-column participant-column participant-column-available";

  const searchInput = createSearchInput({
    placeholder: "Søk etter navn eller klubb…",
    variant: "form",
  });

  async function register(player: ThrowerListRow): Promise<void> {
    const { error } = await addRegistrationAdmin(tournamentId, player.id);
    if (error) {
      showToast("Feil ved innmelding: " + errorMessage(error), "error");
      return;
    }
    onRegistered(player.id);
    refreshLists();
  }

  const table = createPlayerTable({
    formatTitle: () => "Tilgjengelege spelarar",
    emptyText: "Ingen spelarar funne",
    clubFallback: "Ingen klubb",
    stackClub: true,
    onRowClick: canEdit ? (player) => void register(player) : undefined,
    // Visible add affordance — the row click alone is invisible on touch devices.
    renderTrailing: canEdit
      ? [
          (player) => {
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.textContent = "+";
            addBtn.className = "btn btn-outline-primary btn-sm p-0 lh-1 participant-add-btn";
            addBtn.title = "Meld på spelar";
            addBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              void register(player);
            });
            return addBtn;
          },
        ]
      : undefined,
  });

  leftWrapper.append(searchInput, table.element);

  return { element: leftWrapper, searchInput, table };
}

// ── Registered (right) column ───────────────────────────────────────────────────

export interface RegisteredColumnHandle {
  element: HTMLElement;
  table: PlayerTableHandle;
}

export interface RegisteredColumnProps {
  isStarted: boolean;
  canEdit: boolean;
  tournamentId: number;
  registeredMap: Map<number, boolean>;
  pairedIds: Set<number>;
  printerBanner: PrinterBanner | undefined;
  onConfirmed: (kasterid: number) => void;
  onRemoved: (kasterid: number) => void;
  refreshRegisteredList: () => void;
  refreshBothLists: () => void;
}

export function createRegisteredColumn(props: RegisteredColumnProps): RegisteredColumnHandle {
  const {
    isStarted,
    canEdit,
    tournamentId,
    registeredMap,
    pairedIds,
    printerBanner,
    onConfirmed,
    onRemoved,
    refreshRegisteredList,
    refreshBothLists,
  } = props;

  const rightWrapper = document.createElement("div");
  rightWrapper.className = `${isStarted ? "col-12" : "col-md-6"} d-flex flex-column participant-column participant-column-registered`;

  if (!isStarted) {
    const searchSpacer = document.createElement("input");
    searchSpacer.type = "text";
    searchSpacer.className = "form-control mb-2 participant-search-spacer";
    searchSpacer.tabIndex = -1;
    searchSpacer.disabled = true;
    rightWrapper.appendChild(searchSpacer);
  }

  // Print column exists whenever the banner does; the per-row button is
  // re-evaluated on every render so it tracks the live printer connection.
  const renderPrintCell = printerBanner
    ? (sp: ThrowerListRow): HTMLElement | null => {
        const handler = printerBanner.getPrintHandler();
        if (!handler) return null;
        const printBtn = document.createElement("button");
        printBtn.textContent = "🖨";
        printBtn.className = "btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn";
        printBtn.title = "Skriv ut startkort";
        printBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handler(sp);
        });
        return printBtn;
      }
    : null;

  const table = createPlayerTable({
    formatTitle: (n) => `Påmelde spelarar: ${n}`,
    emptyText: "Ingen spelarar påmelde",
    stackClub: true,
    renderLeading: (sp) => {
      if (registeredMap.get(sp.id) ?? false) {
        const checkmark = document.createElement("span");
        checkmark.className = "text-success fw-bold";
        checkmark.textContent = "✓";
        return checkmark;
      }
      if (!canEdit) return null;
      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "✓";
      confirmBtn.className =
        "btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn";
      confirmBtn.title = "Bekreft spelar";
      confirmBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const { error } = await confirmRegistrationForThrower(tournamentId, sp.id);
        if (error) {
          showToast("Feil ved bekreftelse: " + errorMessage(error), "error");
          return;
        }
        onConfirmed(sp.id);
        refreshRegisteredList();
      });
      return confirmBtn;
    },
    renderTrailing: [
      (sp) =>
        canEdit
          ? createRemoveButton({
              title: "Fjern spelar",
              onClick: async () => {
                if (pairedIds.has(sp.id)) {
                  showToast(
                    "Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.",
                    "error",
                  );
                  return;
                }
                const { error } = await removeRegistrationForThrower(tournamentId, sp.id);
                if (error) {
                  showToast("Feil ved fjerning: " + errorMessage(error), "error");
                  return;
                }
                onRemoved(sp.id);
                refreshBothLists();
              },
            })
          : null,
      ...(renderPrintCell ? [renderPrintCell] : []),
    ],
  });
  rightWrapper.appendChild(table.element);
  return { element: rightWrapper, table };
}
