// ── Shared chrome for a stevne fase subpage ───────────────────────────────────
//
// The Kampar/Stilling tab pair, the standing table, the banner meta line and the
// banner menus — everything the innledende, avsluttende and bane views draw
// around their own content. How the standing is derived and ranked is not here;
// that lives in @/utils/stilling.
//
import { sideScore, getMatchSides, type MatchSide } from "@/utils/kamp";
import { throwerNameShort } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { coalesceReload } from "@/utils/coalesceReload";
import { bindExpandableRows, makeRowsFocusable } from "@/components/expandableRows";
import type { Tables } from "@/types";
import { createTable, type ColumnDef } from "@/components/Table";
import type { BannerMenuItem } from "@/components/BannerMenu";
import { openInNewTab } from "@/services/navigationService";
import { completeTournament, type CompleteStep } from "@/services/stevneService";
import { confirmDialog } from "@/components/ConfirmDialog";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import type { StandingMatch, StandingRow } from "@/utils/stilling";

/**
 * Delegated click handler for every element carrying data-scoreboard-kamp-id.
 * Bound once per container (idempotent) and survives innerHTML re-renders,
 * so per-match listeners aren't needed.
 */
export function bindScoreboardClicks(container: HTMLElement): void {
  if (container.dataset.scoreboardClicksBound === "true") return;
  container.dataset.scoreboardClicksBound = "true";
  container.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-scoreboard-kamp-id]",
    );
    if (trigger?.dataset.scoreboardKampId)
      openInNewTab(`#/kamp/${trigger.dataset.scoreboardKampId}`);
  });
}

interface StandingOptions {
  tableId?: string;
  hasGroups?: boolean;
  hasElimination?: boolean;
  hasMatchCount?: boolean;
  positionMap?: Record<number, number>;
  unitLabel?: string;
  /**
   * Number of units qualifying for group A in the avsluttande fase — draws a
   * cut line under that row. Ignored once the table is itself split by group.
   */
  qualifyCutoff?: number | null;
}

/**
 * Display label for one match side, HTML-escaped. Singel: full name (or
 * "Fornavn E." when kort). Par/Mix: always short form, members joined —
 * "Fornavn E. / Fornavn E."
 */
export function sideNameHtml<T extends { kaster?: { fornavn: string; etternavn: string } | null }>(
  side: MatchSide<T> | null,
  short: boolean,
): string {
  if (!side) return "—";
  if (side.members.length > 1) {
    return side.members
      .map((m) => (m.kaster ? escHtml(throwerNameShort(m.kaster)) : "—"))
      .join(" / ");
  }
  const k = side.rep.kaster;
  if (!k) return "—";
  return short ? escHtml(throwerNameShort(k)) : `${escHtml(k.fornavn)} ${escHtml(k.etternavn)}`;
}

function renderPlayerMatchDetails(
  kasterid: number,
  matches: StandingMatch[] | null | undefined,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number> = {},
): string {
  const playerMatches = (matches ?? [])
    .filter((k) => k.spelarar?.some((sp) => sp.kasterid === kasterid))
    .sort((a, b) => a.runde_nummer - b.runde_nummer);

  if (!playerMatches.length) {
    return '<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>';
  }

  return playerMatches
    .map((match) => {
      const sides = getMatchSides(match.spelarar, startNumberMap, positionMap);
      const mySide = sides.find((s) => s?.members.some((m) => m.kasterid === kasterid)) ?? null;
      const oppSide = sides.find((s) => s != null && s !== mySide) ?? null;
      const isWalkoverWin = match.er_walkover && (!oppSide || !oppSide.rep.kaster);

      const opponentName = isWalkoverWin
        ? "Walkover"
        : oppSide
          ? oppSide.members
              .map((m) =>
                m.kaster ? `${escHtml(m.kaster.fornavn)} ${escHtml(m.kaster.etternavn)}` : "—",
              )
              .join(" / ")
          : "—";
      const opponentNumber = isWalkoverWin
        ? ""
        : oppSide
          ? (startNumberMap[oppSide.rep.kasterid] ?? "")
          : "";
      const opponentDisplay = opponentNumber ? `${opponentName} (${opponentNumber})` : opponentName;

      const myScore = isWalkoverWin ? 21 : sideScore(mySide, match.er_bekreftet);
      const oppScore = isWalkoverWin ? 0 : sideScore(oppSide, match.er_bekreftet);
      const scoreDisplay = `${myScore} - ${oppScore}`;

      return `<tr>
      <td class="text-center">${match.runde_nummer}</td>
      <td class="text-center">${match.bane_nummer ?? ""}</td>
      <td>${opponentDisplay}</td>
      <td class="text-center">${scoreDisplay}</td>
    </tr>`;
    })
    .join("");
}

export function renderMainContent(matchesHtml: string, standingHtml: string): string {
  return `
    <div class="stevne-main-content">
      <div class="stevne-tab-buttons" role="tablist">
        <button type="button" class="stevne-tab-btn" role="tab" data-tab="matches"
                aria-selected="true" aria-controls="stevne-panel-matches">Kampar</button>
        <button type="button" class="stevne-tab-btn" role="tab" data-tab="standing"
                aria-selected="false" aria-controls="stevne-panel-standing">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start stevne-content-row">
        <div id="stevne-panel-matches" class="flex-grow-1 stevne-matches-panel">${matchesHtml}</div>
        <div id="stevne-panel-standing" class="stevne-standing-col">${standingHtml}</div>
      </div>
    </div>`;
}

export function getActiveTab(container: HTMLElement): "matches" | "standing" {
  return container.querySelector(".stevne-main-content")?.classList.contains("stevne-show-standing")
    ? "standing"
    : "matches";
}

export function setActiveTab(container: HTMLElement, tab: "matches" | "standing"): void {
  const wrapper = container.querySelector<HTMLElement>(".stevne-main-content");
  if (!wrapper) return;
  wrapper.classList.toggle("stevne-show-standing", tab === "standing");
  container.querySelectorAll<HTMLButtonElement>(".stevne-tab-btn").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });
}

export function bindTabToggle(container: HTMLElement): void {
  if (!container.querySelector(".stevne-main-content")) return;
  container.querySelectorAll<HTMLButtonElement>(".stevne-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(container, btn.dataset.tab === "standing" ? "standing" : "matches");
    });
  });
}

type FlatStandingRow = StandingRow & { posInGroup: number };

export function renderStandingTable(
  standings: StandingRow[],
  matches: StandingMatch[],
  startNumberMap: Record<number, number>,
  opts: StandingOptions = {},
): string {
  const {
    tableId = "standing-table",
    hasGroups = false,
    hasElimination = false,
    hasMatchCount = false,
    positionMap = {},
    unitLabel = "spelarar",
    qualifyCutoff = null,
  } = opts;

  const thW = hasMatchCount ? "th-32" : "th-28";

  const groupMap = new Map<string, StandingRow[]>();
  for (const r of standings) {
    const g = hasGroups ? (r.gruppe?.navn ?? "_") : "_";
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(r);
  }
  const hasMultipleGroups = groupMap.size > 1 || !groupMap.has("_");
  const title = hasMatchCount ? `${standings.length} ${unitLabel}` : "Stilling";

  const flatList: FlatStandingRow[] = [...groupMap.entries()]
    .sort(([a], [b]) => (a === "_" ? 1 : b === "_" ? -1 : a.localeCompare(b)))
    .flatMap(([, groupPlayers]) => groupPlayers.map((r, i) => ({ ...r, posInGroup: i + 1 })));

  // X-kast-fed cups carry poeng_xkast; show R (ringere) / X (poeng) instead of KP / SP.
  const isXkast = standings.some((r) => r.poeng_xkast != null);
  const scoreColumns: ColumnDef<FlatStandingRow>[] = isXkast
    ? [
        {
          label: "R",
          thClass: "th-44 standing-number standing-kp-th",
          cellClass: "standing-number standing-kp-cell",
          render: (r) => String(r.antall_ring_xkast ?? 0),
        },
        {
          label: "X",
          thClass: "th-44 standing-number standing-sp-th",
          cellClass: "standing-number standing-sp-cell",
          render: (r) => String(r.poeng_xkast ?? 0),
        },
      ]
    : [
        {
          label: "KP",
          thClass: "th-44 standing-number standing-kp-th",
          cellClass: "standing-number standing-kp-cell",
          render: (r) => String(r.kamp_poeng ?? 0),
        },
        {
          label: "SP",
          thClass: "th-44 standing-number standing-sp-th",
          cellClass: "standing-number standing-sp-cell",
          render: (r) => String(r.score_poeng ?? 0),
        },
      ];

  const columns: ColumnDef<FlatStandingRow>[] = [
    {
      label: "#",
      thClass: thW,
      cellClass: (r) => {
        const base = "standing-dim-cell";
        return hasElimination && r.runde_eliminert != null ? `final-elim-position ${base}` : base;
      },
      render: (r) => String(r.posInGroup),
    },
    { label: "NAMN", render: (r) => escHtml(r.navn ?? `Spelar ${r.kasterid}`) },
    ...(hasMatchCount
      ? [
          {
            label: "K",
            thClass: "th-50 standing-number",
            cellClass: "standing-number standing-dim-cell" as const,
            render: (r: FlatStandingRow) => String(r.antall_kamper ?? 0),
          },
        ]
      : []),
    ...scoreColumns,
  ];

  const colspan = columns.length;

  // A cut line only means something in an ungrouped list, and never under the
  // last row — there'd be nothing below it to separate.
  const cutoffRow =
    !hasGroups && qualifyCutoff != null && qualifyCutoff > 0 && qualifyCutoff < flatList.length
      ? qualifyCutoff
      : null;

  let lastGroup: string | null = null;
  const sectionHeaderFn = (item: FlatStandingRow): HTMLElement | null => {
    const g = hasGroups ? (item.gruppe?.navn ?? "_") : "_";
    if (g === lastGroup) return null;
    lastGroup = g;
    if (!hasMultipleGroups || g === "_") return null;
    const tr = document.createElement("tr");
    const td = tr.insertCell();
    td.colSpan = colspan;
    td.className = "fw-semibold ps-2";
    td.textContent = `Gruppe ${item.gruppe?.navn ?? ""}`;
    return tr;
  };

  const buildDetailElement = (item: FlatStandingRow): HTMLElement => {
    const innerTable = document.createElement("table");
    innerTable.className = "standing-detail-table table table-sm table-bordered mb-0";
    const thead = innerTable.createTHead();
    const hr = thead.insertRow();
    [
      ["Runde", true],
      ["Bane", true],
      ["Motstandar", false],
      ["Resultat", true],
    ].forEach(([label, centered]) => {
      const th = document.createElement("th");
      th.textContent = label as string;
      if (centered) th.className = "text-center";
      hr.appendChild(th);
    });
    innerTable.createTBody().innerHTML = renderPlayerMatchDetails(
      item.kasterid,
      matches,
      startNumberMap,
      positionMap,
    );
    return innerTable;
  };

  const table = createTable<FlatStandingRow>({
    columns,
    rows: flatList,
    tableClass: "table table-sm match-table mb-0",
    theadClass: "stevne-thead",
    rowClass: (r) =>
      cutoffRow != null && r.posInGroup === cutoffRow
        ? "standing-player-row standing-cutoff"
        : "standing-player-row",
    rowAttrs: (r) => ({ "data-kasterid": String(r.kasterid) }),
    sectionHeader: sectionHeaderFn,
    detailRowClass: "standing-detail",
    detailRowAttrs: () => ({ hidden: "" }),
    detailCellClass: "p-0",
    detailRow: buildDetailElement,
  });
  table.id = tableId;

  const wrapper = document.createElement("div");
  wrapper.className = "standing-table-wrap";
  const h6 = document.createElement("h6");
  h6.className = "text-center fw-bold mb-1";
  h6.textContent = title;
  wrapper.appendChild(h6);
  const scroller = document.createElement("div");
  scroller.className = "table-scroll";
  scroller.appendChild(table);
  wrapper.appendChild(scroller);

  return wrapper.outerHTML;
}

export function bindStandingDetails(
  container: HTMLElement,
  tableId: string,
  expandedIds: Set<string> = new Set(),
): void {
  const tableEl = container.querySelector<HTMLElement>(`#${tableId}`);
  if (!tableEl) return;

  // Restore rows that were open before the last re-render
  expandedIds.forEach((kid) => {
    const detailRow = tableEl.querySelector<HTMLElement>(
      `tr.standing-detail[data-kasterid="${kid}"]`,
    );
    const playerRow = tableEl.querySelector<HTMLElement>(
      `tr.standing-player-row[data-kasterid="${kid}"]`,
    );
    if (detailRow) detailRow.removeAttribute("hidden");
    if (playerRow) {
      playerRow.classList.add("standing-active");
      playerRow.setAttribute("aria-expanded", "true");
    }
  });

  makeRowsFocusable(tableEl, "tr.standing-player-row");

  // The detail is a row of its own further down the table, tied to its player
  // row by kasterid rather than by sitting next to it.
  bindExpandableRows(tableEl, {
    trigger: "tr.standing-player-row",
    panel: (row) => {
      const kid = row.dataset.kasterid;
      return kid
        ? tableEl.querySelector<HTMLElement>(`tr.standing-detail[data-kasterid="${kid}"]`)
        : null;
    },
    onToggle: (row, open) => {
      row.classList.toggle("standing-active", open);
      const kid = row.dataset.kasterid;
      if (!kid) return;
      // The live standing re-renders on every change; this is what reopens the
      // rows the user had open.
      if (open) expandedIds.add(kid);
      else expandedIds.delete(kid);
    },
  });
}

export function createChangeHandler(
  tournamentId: number,
  tabs: string[],
  container: HTMLElement,
  fetchAndRenderFn: (container: HTMLElement, tournamentId: number) => void | Promise<void>,
  stopFn: () => void,
): () => void {
  // Coalesced: a bulk write emits one realtime event per row, and one refetch
  // per event exhausts the browser connection pool.
  const refetch = coalesceReload(() => fetchAndRenderFn(container, tournamentId));
  return function onChange() {
    const hash = location.hash;
    const isOnPage = tabs.some((f) => hash === `#/stevne/${tournamentId}/${f}`);
    if (isOnPage) {
      refetch();
    } else {
      stopFn();
    }
  };
}

/** Writes the secondary meta line beside the stevne name in the banner. */
export function setBannerMeta(bannerSlot: HTMLElement | null, text: string): void {
  const meta = bannerSlot
    ?.closest(".stevne-fase-header")
    ?.querySelector<HTMLElement>(".stevne-fase-header__meta");
  if (meta) meta.textContent = text;
}

export interface InitialMenuState {
  erSwiss: boolean;
  /** Rounds still left to generate against stevne.antall_runder_innl (Swiss only). */
  canGenerateRound: boolean;
  /** Every planned round exists and every kamp is confirmed. */
  canComplete: boolean;
  /** Variant entries — placed between "Generer neste runde" and the dev/complete entries. */
  extras?: BannerMenuItem[];
}

export function initialMenuItems(
  tournament: Pick<Tables<"stevne">, "erfullfort" | "avsluttendekastemetodeid">,
  state: InitialMenuState,
): BannerMenuItem[] {
  const hasFinalPhase = tournament.avsluttendekastemetodeid != null;
  const items: BannerMenuItem[] = [];
  if (state.erSwiss && state.canGenerateRound)
    items.push({ id: "neste-runde-btn", label: "Generer neste runde" });
  items.push(...(state.extras ?? []));
  if (import.meta.env.VITE_ENV === "dev")
    items.push({ id: "test-auto-complete-btn", label: "TEST: Autofullfør" });
  if (!hasFinalPhase)
    items.push({
      id: "complete-tournament-btn",
      label: "Fullfør turnering",
      tone: "success",
      disabled: tournament.erfullfort === true || !state.canComplete,
      hint: state.canComplete
        ? undefined
        : "Alle rundar må vere genererte og alle kampar bekrefta.",
    });
  return items;
}

interface FinalPhaseState {
  allMatchesConfirmed: boolean;
  hasFinalMatches: boolean;
  hasGroupAssignment: boolean;
  hasPreconfiguredFormat?: boolean;
}

export function finalMenuItems(
  tournament: Pick<Tables<"stevne">, "erfullfort" | "stevne_fase">,
  state: FinalPhaseState,
): BannerMenuItem[] {
  const {
    allMatchesConfirmed,
    hasFinalMatches,
    hasGroupAssignment,
    hasPreconfiguredFormat = false,
  } = state;
  const items: BannerMenuItem[] = [];

  if (tournament.stevne_fase !== "avsluttende") {
    if (allMatchesConfirmed) {
      items.push({ id: "start-final-btn", label: "Start avsluttande fase" });
      if (hasPreconfiguredFormat)
        items.push({ id: "edit-group-assignment-btn", label: "Endre gruppefordeling" });
    }
  } else if (hasGroupAssignment && !hasFinalMatches) {
    items.push({ id: "edit-group-assignment-btn", label: "Endre gruppeinndeling" });
  }

  if (import.meta.env.VITE_ENV === "dev" && hasFinalMatches && !allMatchesConfirmed)
    items.push({ id: "test-auto-complete-btn", label: "TEST: Autofullfør" });

  if (allMatchesConfirmed)
    items.push({
      id: "complete-tournament-btn",
      label: "Fullfør turnering",
      tone: "success",
      disabled: tournament.erfullfort === true,
    });

  return items;
}

// ── Banner menu actions ───────────────────────────────────────────────────────

const COMPLETE_ERROR: Record<CompleteStep, string> = {
  plassering: "Feil ved lagring av plasseringar",
  fullfor: "Feil ved fullføring av turnering",
};

/**
 * Binds the Fullfør turnering entry. The placements are read at click time —
 * the standing is rebuilt on every reload, so a captured array goes stale.
 */
export function bindCompleteTournament(
  bannerSlot: HTMLElement,
  stevneid: number,
  placements: () => { kasterid: number }[],
  reload: () => Promise<void>,
): void {
  bannerSlot.querySelector("#complete-tournament-btn")?.addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Fullfør turnering",
      message: "Vil du fullføre turneringa? Dette kan ikkje angrast.",
      danger: true,
    });
    if (!ok) return;
    const { error, step } = await completeTournament(stevneid, placements());
    if (error) {
      showToast(`${COMPLETE_ERROR[step!]}: ${errorMessage(error)}`, "error");
      return;
    }
    await reload();
  });
}

/** Binds the TEST: Autofullfør entry. Dev builds only — see the menu items above. */
export function bindAutoComplete(
  bannerSlot: HTMLElement,
  confirm: { title: string; message: string },
  run: () => Promise<void>,
): void {
  bannerSlot.querySelector("#test-auto-complete-btn")?.addEventListener("click", async (e) => {
    const button = e.currentTarget as HTMLButtonElement;
    if (!(await confirmDialog(confirm))) return;
    button.disabled = true;
    await run();
  });
}
