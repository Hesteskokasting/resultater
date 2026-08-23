import { throwerName } from "@/utils/kaster";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { logError } from "@/utils/logError";
import { getActiveThrowerList } from "@/services/kasterService";
import type { ThrowerListRow } from "@/services/kasterService";
import {
  getRegistrationStatusForTournament,
  subscribeToRegistrationChanges,
} from "@/services/pameldingService";
import type { RegistrationStatusRow } from "@/services/pameldingService";
import { getTournamentHeader, getInitialMethodName } from "@/services/stevneService";
import type { TournamentHeaderRow } from "@/services/stevneService";
import { setOnDisconnect } from "@/services/receiptPrinterService";
import { createPrinterBanner } from "@/pages/stevne/PrinterBanner";
import type { PrinterBanner } from "@/pages/stevne/PrinterBanner";
import { createAvailableColumn, createRegisteredColumn } from "@/pages/stevne/_deltakereColumns";
import type { AvailableColumnHandle } from "@/pages/stevne/_deltakereColumns";
import { createTabs } from "@/components/Tabs";
import { createPairTab } from "@/pages/stevne/parTab";
import { createNewPlayerForm } from "@/pages/stevne/_nySpelarForm";
import { buildRegistrationLookup } from "@/utils/stevne/registrationLookup";
import { unsubscribeChannel } from "@/utils/realtime";
import { onNavigateAway } from "@/utils/navigation";
import { registerRefetch } from "@/utils/refetchRegistry";

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortThrowers(throwers: ThrowerListRow[]): ThrowerListRow[] {
  return [...throwers].sort((a, b) => {
    const clubCmp = (a.klubb?.navn ?? "").localeCompare(b.klubb?.navn ?? "", "nb");
    if (clubCmp !== 0) return clubCmp;
    const lastNameCmp = (a.etternavn ?? "").localeCompare(b.etternavn ?? "", "nb");
    if (lastNameCmp !== 0) return lastNameCmp;
    return (a.fornavn ?? "").localeCompare(b.fornavn ?? "", "nb");
  });
}

function filterAvailable(throwers: ThrowerListRow[], search: string): ThrowerListRow[] {
  const q = search.toLowerCase();
  if (!q) return throwers;
  return throwers.filter(
    (p) =>
      throwerName(p).toLowerCase().includes(q) || (p.klubb?.navn ?? "").toLowerCase().includes(q),
  );
}

// ── Data loading ──────────────────────────────────────────────────────────────

interface DeltakereData {
  stevne: TournamentHeaderRow;
  throwers: ThrowerListRow[];
  registration: RegistrationStatusRow[];
  isGloppen: boolean;
}

async function loadDeltakereData(
  id: number,
): Promise<{ ok: true; data: DeltakereData } | { ok: false; error: string }> {
  const [stevneRes, throwersRes, registrationRes, methodRes] = await Promise.all([
    getTournamentHeader(id),
    getActiveThrowerList(),
    getRegistrationStatusForTournament(id),
    getInitialMethodName(id),
  ]);

  if (stevneRes.error || !stevneRes.data) return { ok: false, error: "Stevne ikkje funne." };
  if (throwersRes.error) return { ok: false, error: "Kunne ikkje laste kasterliste." };

  return {
    ok: true,
    data: {
      stevne: stevneRes.data,
      throwers: throwersRes.data,
      registration: registrationRes.data,
      isGloppen: !methodRes.error && methodRes.navn.includes("gloppen"),
    },
  };
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState());

  // Drop any disconnect callback from a previous render; the banner block re-registers a fresh one.
  setOnDisconnect(null);

  try {
    const result = await loadDeltakereData(id);
    if (!result.ok) {
      container.replaceChildren(createErrorBanner(result.error));
      return;
    }
    const { stevne, throwers: allThrowers, registration, isGloppen } = result.data;

    const phase = stevne.stevne_fase ?? null;
    const canEdit = isAdmin && (phase === null || phase === "ikke_startet");
    const isStarted = phase !== null && phase !== "ikke_startet";
    const isTeam = stevne.kategori?.erlagbasert ?? false;

    const { registeredMap, pairedIds } = buildRegistrationLookup(registration);

    // Pair tab renders lazily on first activation; true again whenever
    // enrollment changes so the next activation re-fetches
    let pairTabDirty = true;

    const wrapper = document.createElement("div");

    // ── Printer connect banner (admin + Gloppen only) ─────────────────────────

    let printerBanner: PrinterBanner | undefined;
    if (isAdmin && isGloppen && isStarted) {
      printerBanner = createPrinterBanner({
        tournamentId: id,
        tournamentName: stevne.navn,
        isTeam,
        onStateChange: () => renderRegisteredList(),
      });
      wrapper.appendChild(printerBanner.element);
    }

    // ── Players panel: header, inline create form, mobile switcher, columns ───

    // Capped to the width the columns actually occupy, so the header sits over
    // the lists rather than stretching to the window edge on wide screens.
    const playersPanel = document.createElement("div");
    playersPanel.className = `participant-panel${isStarted ? " participant-panel-single" : ""}`;

    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center gap-2 mb-2";
    const heading = document.createElement("h5");
    heading.className = "fw-bold mb-0";
    heading.textContent = "Deltakarar";
    header.appendChild(heading);
    playersPanel.appendChild(header);

    // Inline create — admins only, and only while the tournament can still be edited.
    if (canEdit) {
      const newPlayerForm = createNewPlayerForm({
        tournamentId: id,
        onCreated: (player, registered) => {
          allThrowers.push(player);
          if (registered) {
            registeredMap.set(player.id, false);
            pairTabDirty = true;
            printerBanner?.invalidateMatchData();
          }
          renderRegisteredList();
          renderAvailableList();
        },
      });
      header.appendChild(newPlayerForm.toggle);
      playersPanel.appendChild(newPlayerForm.element);
    }

    const layout = document.createElement("div");
    layout.className = `row g-3${isStarted ? "" : " participant-layout-split"}`;

    // ── Left column: available throwers (only when tournament not started) ──

    let leftColumn: AvailableColumnHandle | null = null;
    if (!isStarted) {
      leftColumn = createAvailableColumn({
        canEdit,
        tournamentId: id,
        onRegistered: (kasterid) => {
          registeredMap.set(kasterid, false);
          pairTabDirty = true;
          printerBanner?.invalidateMatchData();
        },
        refreshLists: () => {
          renderRegisteredList();
          renderAvailableList();
        },
        isRegistered: (kasterid) => registeredMap.has(kasterid),
      });
      layout.appendChild(leftColumn.element);
    }

    // ── Right column: registered throwers ────────────────────────────────────

    const registeredColumn = createRegisteredColumn({
      isStarted,
      canEdit,
      tournamentId: id,
      registeredMap,
      pairedIds,
      printerBanner,
      onConfirmedChange: (kasterid, confirmed) => registeredMap.set(kasterid, confirmed),
      onRemoved: (kasterid) => {
        registeredMap.delete(kasterid);
        pairTabDirty = true;
        printerBanner?.invalidateMatchData();
      },
      refreshRegisteredList: () => renderRegisteredList(),
      refreshBothLists: () => {
        renderRegisteredList();
        renderAvailableList();
      },
    });
    layout.appendChild(registeredColumn.element);

    // ── Mobile switcher: only one column fits on a phone ──────────────────────

    let registeredBadge: HTMLElement | null = null;
    if (!isStarted) {
      const switcher = document.createElement("div");
      switcher.className = "participant-switch mb-2";

      const availableBtn = document.createElement("button");
      availableBtn.type = "button";
      availableBtn.className = "participant-switch-btn active";
      availableBtn.textContent = "Tilgjengelege";

      const registeredBtn = document.createElement("button");
      registeredBtn.type = "button";
      registeredBtn.className = "participant-switch-btn";
      registeredBtn.textContent = "Påmelde ";
      registeredBadge = document.createElement("span");
      registeredBadge.className = "participant-switch-badge";
      registeredBtn.appendChild(registeredBadge);

      const showRegistered = (show: boolean): void => {
        layout.classList.toggle("participant-show-registered", show);
        availableBtn.classList.toggle("active", !show);
        registeredBtn.classList.toggle("active", show);
      };

      availableBtn.addEventListener("click", () => showRegistered(false));
      registeredBtn.addEventListener("click", () => showRegistered(true));

      switcher.append(availableBtn, registeredBtn);
      playersPanel.appendChild(switcher);
    }

    playersPanel.appendChild(layout);

    // ── Render helpers ────────────────────────────────────────────────────────

    function renderRegisteredList(): void {
      const registered = sortThrowers(allThrowers.filter((p) => registeredMap.has(p.id)));
      registeredColumn.table.setPlayers(registered);
      if (registeredBadge) registeredBadge.textContent = String(registered.length);
    }

    function renderAvailableList(): void {
      if (!leftColumn) return;
      leftColumn.table.setPlayers(
        sortThrowers(filterAvailable(allThrowers, leftColumn.searchInput.value)),
      );
    }

    if (isTeam) {
      const pairTab = createPairTab({
        tournamentId: id,
        isAdmin: canEdit,
        isMix: (stevne.kategori?.navn ?? "").toLowerCase().includes("mix"),
        getRegisteredIds: () => new Set(registeredMap.keys()),
        allThrowers,
        onPairsChanged: (ids) => {
          pairedIds.clear();
          for (const kid of ids) pairedIds.add(kid);
        },
      });
      wrapper.appendChild(
        createTabs({
          tabs: [
            { id: "players", label: "Spelarar", panel: playersPanel },
            { id: "pairs", label: "Administrer par", panel: pairTab.element },
          ],
          onChange: (tabId) => {
            if (tabId === "pairs" && pairTabDirty) {
              pairTabDirty = false;
              pairTab.refresh();
            }
          },
        }),
      );
    } else {
      wrapper.appendChild(playersPanel);
    }

    container.replaceChildren(wrapper);

    leftColumn?.searchInput.addEventListener("input", renderAvailableList);
    renderRegisteredList();
    renderAvailableList();

    // ── Realtime: other devices registering/removing throwers concurrently ───

    async function reloadRegistrations(): Promise<void> {
      const { data: freshRows, error } = await getRegistrationStatusForTournament(id);
      if (error) return;
      const { registeredMap: freshMap, pairedIds: freshPaired } =
        buildRegistrationLookup(freshRows);
      registeredMap.clear();
      freshMap.forEach((confirmed, kasterid) => registeredMap.set(kasterid, confirmed));
      pairedIds.clear();
      freshPaired.forEach((kasterid) => pairedIds.add(kasterid));
      pairTabDirty = true;
      printerBanner?.invalidateMatchData();
      renderRegisteredList();
      renderAvailableList();
    }

    const registrationChannel = subscribeToRegistrationChanges(id, () => {
      void reloadRegistrations();
    });
    onNavigateAway(() => {
      void unsubscribeChannel(registrationChannel);
    });
    // Fallback for events missed while the socket was disconnected (e.g. app backgrounded).
    registerRefetch(() => {
      void reloadRegistrations();
    });
  } catch (err) {
    logError("stevne-deltakere.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste deltakarliste."));
  }
}
