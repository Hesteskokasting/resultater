import { scoreForPlayer, getMatchSides, groupStandingsByPair, type MatchSide } from "@/utils/kamp";
import { throwerNameShort } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { coalesceReload } from "@/utils/coalesceReload";
import type { Tables } from "@/types";
import { createTable, type ColumnDef } from "@/components/Table";
import { openInNewTab } from "@/services/navigationService";

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

// Minimal shapes for organizer kamp data (spelarar is an aliased join from kamp_spelar)
export interface OrgMatchPlayer {
  kasterid: number;
  kamp_poeng: number;
  score_poeng: number;
  antall_ringer?: number | null;
  omgangar?: Pick<Tables<"kamp_omgang">, "score" | "antall_ringer">[] | null;
  kaster?: { fornavn: string; etternavn: string } | null;
}

export interface OrgMatch extends Pick<
  Tables<"kamp">,
  "er_bekreftet" | "er_walkover" | "runde_nummer" | "bane_nummer"
> {
  spelarar?: OrgMatchPlayer[] | null;
}

export interface MatchForSorting {
  er_bekreftet: boolean;
  spelarar?:
    | {
        kasterid: number | null;
        kamp_poeng: number | null;
        score_poeng?: number | null;
        omgangar?: { score?: number | null }[] | null;
      }[]
    | null;
}

export interface StandingRow {
  kasterid: number;
  navn?: string | null;
  startnummer?: number | null;
  kamp_poeng?: number | null;
  score_poeng?: number | null;
  /** X-kast innledande poeng/ringere — present when the cup is fed by an X-kast format. */
  poeng_xkast?: number | null;
  antall_ring_xkast?: number | null;
  runde_eliminert?: number | null;
  plassering?: number | null;
  hcp?: number | null;
  gruppe?: { navn: string } | null;
  antall_kamper?: number | null;
}

interface StandingOptions {
  tableId?: string;
  hasGroups?: boolean;
  hasElimination?: boolean;
  hasMatchCount?: boolean;
  positionMap?: Record<number, number>;
  unitLabel?: string;
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
  matches: OrgMatch[] | null | undefined,
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

      // Side total: pair members alternate omgangar, so sum both members' rows
      const sideSum = (side: typeof mySide) =>
        side ? side.members.reduce((sum, m) => sum + scoreForPlayer(m), 0) : 0;
      const myScore = isWalkoverWin ? 21 : sideSum(mySide);
      const oppScore = isWalkoverWin ? 0 : sideSum(oppSide);
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

export function canConfirmMatch(
  kamp: OrgMatch,
  sp: OrgMatchPlayer[],
  hasRounds: boolean,
  hcpMap: Record<number, number> = {},
): boolean {
  if (kamp.er_bekreftet) return false;
  if (kamp.er_walkover) return true;
  if (hasRounds) return false;
  const kasterid1 = sp[0]?.kasterid;
  const kasterid2 = sp[1]?.kasterid;
  const hcp1 = (kasterid1 != null ? hcpMap[kasterid1] : undefined) ?? 0;
  const hcp2 = (kasterid2 != null ? hcpMap[kasterid2] : undefined) ?? 0;
  const s1 = scoreForPlayer(sp[0]);
  const s2 = sp[1] ? scoreForPlayer(sp[1]) : 0;
  return s1 + hcp1 >= 21 || s2 + hcp2 >= 21;
}

export function renderMainContent(matchesHtml: string, standingHtml: string): string {
  return `
    <div class="org-main-content">
      <div class="org-tab-buttons btn-group w-100 mb-2">
        <button class="btn btn-primary org-tab-btn" data-tab="matches">Kampar</button>
        <button class="btn btn-outline-primary org-tab-btn" data-tab="standing">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start org-content-row">
        <div class="flex-grow-1 org-matches-panel">${matchesHtml}</div>
        <div class="org-standing-col">${standingHtml}</div>
      </div>
    </div>`;
}

export function getActiveTab(container: HTMLElement): "matches" | "standing" {
  return container.querySelector(".org-main-content")?.classList.contains("org-show-standing")
    ? "standing"
    : "matches";
}

export function setActiveTab(container: HTMLElement, tab: "matches" | "standing"): void {
  const wrapper = container.querySelector<HTMLElement>(".org-main-content");
  if (!wrapper) return;
  wrapper.classList.toggle("org-show-standing", tab === "standing");
  container.querySelectorAll<HTMLButtonElement>(".org-tab-btn").forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("btn-primary", isActive);
    btn.classList.toggle("btn-outline-primary", !isActive);
  });
}

export function bindTabToggle(container: HTMLElement): void {
  const wrapper = container.querySelector<HTMLElement>(".org-main-content");
  if (!wrapper) return;
  container.querySelectorAll<HTMLButtonElement>(".org-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isStanding = btn.dataset.tab === "standing";
      wrapper.classList.toggle("org-show-standing", isStanding);
      container.querySelectorAll<HTMLButtonElement>(".org-tab-btn").forEach((b) => {
        b.classList.toggle("btn-primary", b.dataset.tab === btn.dataset.tab);
        b.classList.toggle("btn-outline-primary", b.dataset.tab !== btn.dataset.tab);
      });
    });
  });
}

type FlatStandingRow = StandingRow & { posInGroup: number };

export function renderStandingTable(
  standings: StandingRow[],
  matches: OrgMatch[],
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
    theadClass: "org-thead",
    rowClass: "standing-player-row",
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

  tableEl.querySelectorAll<HTMLElement>("tr.standing-player-row").forEach((row) => {
    row.setAttribute("tabindex", "0");
    if (!row.hasAttribute("aria-expanded")) row.setAttribute("aria-expanded", "false");
  });

  function toggle(row: HTMLElement): void {
    const kid = row.dataset.kasterid;
    if (!kid) return;
    const detailRow = tableEl!.querySelector<HTMLElement>(
      `tr.standing-detail[data-kasterid="${kid}"]`,
    );
    if (!detailRow) return;
    const wasHidden = !!detailRow.hidden;
    detailRow.hidden = !wasHidden;
    row.classList.toggle("standing-active", wasHidden);
    row.setAttribute("aria-expanded", String(wasHidden));
    if (wasHidden) expandedIds.add(kid);
    else expandedIds.delete(kid);
  }

  tableEl.addEventListener("click", (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>("tr.standing-player-row");
    if (row) toggle(row);
  });

  tableEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = (e.target as HTMLElement).closest<HTMLElement>("tr.standing-player-row");
    if (!row) return;
    e.preventDefault();
    toggle(row);
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

export function renderInitialButtons(
  tournament: Pick<Tables<"stevne">, "erfullfort" | "avsluttendekastemetodeid">,
  erSwiss: boolean,
): string {
  const hasFinalPhase = tournament.avsluttendekastemetodeid != null;
  return `
    ${erSwiss ? `<button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer neste runde</button>` : ""}
    ${!hasFinalPhase ? `<button id="complete-tournament-btn" class="btn btn-sm btn-success"${tournament.erfullfort ? " disabled" : ""}>Fullfør turnering</button>` : ""}
    ${import.meta.env.VITE_ENV === "dev" ? `<button id="test-auto-complete-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>` : ""}
  `;
}

interface FinalPhaseState {
  allMatchesConfirmed: boolean;
  hasFinalMatches: boolean;
  hasGroupAssignment: boolean;
  hasPreconfiguredFormat?: boolean;
}

export function renderFinalButtons(
  tournament: Pick<Tables<"stevne">, "erfullfort" | "stevne_fase">,
  state: FinalPhaseState,
): string {
  const {
    allMatchesConfirmed,
    hasFinalMatches,
    hasGroupAssignment,
    hasPreconfiguredFormat = false,
  } = state;
  const phase = tournament.stevne_fase;

  let actionsHtml = "";

  if (phase !== "avsluttende") {
    if (allMatchesConfirmed) {
      actionsHtml = `
        <button id="start-final-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${hasPreconfiguredFormat ? `<button id="edit-group-assignment-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>` : ""}`;
    }
  } else if (hasGroupAssignment && !hasFinalMatches) {
    actionsHtml = `<button id="edit-group-assignment-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`;
  }

  return `
    ${actionsHtml}
    ${allMatchesConfirmed ? `<button id="complete-tournament-btn" class="btn btn-sm btn-success"${tournament.erfullfort ? " disabled" : ""}>Fullfør turnering</button>` : ""}
  `;
}

export interface PlayerMapRow {
  kasterid: number;
  navn: string;
  startnummer: number | null;
  kamp_poeng: number;
  score_poeng: number;
  antall_kamper: number;
}

export function buildInitialPlayerMap(
  allMatches: OrgMatch[],
  startNumberMap: Record<number, number>,
): { playerMap: Record<number, PlayerMapRow>; realThrowerIds: Set<number> } {
  const playerMap: Record<number, PlayerMapRow> = {};
  const realThrowerIds = new Set<number>();

  for (const match of allMatches) {
    // In a walkover only the bye side counts — exclude any phantom opposing side
    // (side-based: the bye pair's own partner shares the startnummer and stays in).
    const [, byeSide2] = match.er_walkover
      ? getMatchSides(match.spelarar, startNumberMap)
      : [null, null];
    for (const sp of match.spelarar ?? []) {
      if (!sp.kasterid || !sp.kaster) continue;
      if (match.er_walkover && byeSide2?.members.some((m) => m.kasterid === sp.kasterid)) continue;
      realThrowerIds.add(sp.kasterid);
      const playerRow = (playerMap[sp.kasterid] ??= {
        kasterid: sp.kasterid,
        navn: `${sp.kaster.fornavn} ${sp.kaster.etternavn}`,
        startnummer: startNumberMap[sp.kasterid] ?? null,
        kamp_poeng: 0,
        score_poeng: 0,
        antall_kamper: 0,
      });
      if (match.er_bekreftet) {
        playerRow.kamp_poeng += sp.kamp_poeng;
        playerRow.score_poeng += sp.score_poeng;
        playerRow.antall_kamper += 1;
      }
    }
  }

  return { playerMap, realThrowerIds };
}

export function buildFinalStandings(
  initialRoundMatches: OrgMatch[],
  resultat: Array<{
    kasterid: number;
    startnummer: number | null;
    plassering: number | null;
    runde_eliminert: number | null;
    gruppe: { navn: string } | null;
    poeng_xkast?: number | null;
    antall_ring_xkast?: number | null;
  }>,
  nameMap: Record<number, string>,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number> = {},
): StandingRow[] {
  const { playerMap } = buildInitialPlayerMap(initialRoundMatches, startNumberMap);
  const rows = resultat.map((r) => ({
    kasterid: r.kasterid,
    navn: nameMap[r.kasterid] ?? `Spelar ${r.kasterid}`,
    startnummer: r.startnummer,
    plassering: r.plassering,
    runde_eliminert: r.runde_eliminert,
    kamp_poeng: playerMap[r.kasterid]?.kamp_poeng ?? 0,
    score_poeng: playerMap[r.kasterid]?.score_poeng ?? 0,
    // X-kast innledande scores live on resultat, not in kamp rows
    poeng_xkast: r.poeng_xkast ?? null,
    antall_ring_xkast: r.antall_ring_xkast ?? null,
    gruppe: r.gruppe,
  }));
  // Par/Mix: one row per pair (no-op for Singel — every startnummer is unique)
  return sortStandings(groupStandingsByPair(rows, positionMap), initialRoundMatches);
}

export function sortStandings(standings: StandingRow[], matches: MatchForSorting[]): StandingRow[] {
  const confirmed = matches.filter((k) => k.er_bekreftet);

  return [...standings].sort((a, b) => {
    // Players with a final plassering (1–4) always rank above non-plassered players.
    if (a.plassering != null && b.plassering != null) return a.plassering - b.plassering;
    if (a.plassering != null) return -1;
    if (b.plassering != null) return 1;

    // Active players (runde_eliminert == null) always come first
    const aActive = a.runde_eliminert == null;
    const bActive = b.runde_eliminert == null;
    if (aActive !== bActive) return aActive ? -1 : 1;

    // For eliminated: later round = better placement
    if (!aActive) {
      const roundDiff = (b.runde_eliminert ?? 0) - (a.runde_eliminert ?? 0);
      if (roundDiff !== 0) return roundDiff;
    }

    // plassering tiebreaker applies to both active and eliminated players
    // (champion plassering=1 must sort before 3rd place plassering=3 when both are null)
    const pA = a.plassering ?? Infinity;
    const pB = b.plassering ?? Infinity;
    if (pA !== pB) return pA - pB;

    // Initial-standing tiebreaker: X-kast innledande ranks on poeng_xkast → ringere,
    // kamp-based innledande on kamp_poeng → score_poeng.
    const useXkast = a.poeng_xkast != null || b.poeng_xkast != null;
    const primaryA = useXkast ? (a.poeng_xkast ?? 0) : (a.kamp_poeng ?? 0);
    const primaryB = useXkast ? (b.poeng_xkast ?? 0) : (b.kamp_poeng ?? 0);
    if (primaryA !== primaryB) return primaryB - primaryA;
    const secondaryA = useXkast ? (a.antall_ring_xkast ?? 0) : (a.score_poeng ?? 0);
    const secondaryB = useXkast ? (b.antall_ring_xkast ?? 0) : (b.score_poeng ?? 0);
    if (secondaryA !== secondaryB) return secondaryB - secondaryA;

    // Head-to-head (match points in matches where both met)
    let kpA = 0,
      kpB = 0;
    for (const kamp of confirmed) {
      const spA = kamp.spelarar?.find((s) => s.kasterid === a.kasterid);
      const spB = kamp.spelarar?.find((s) => s.kasterid === b.kasterid);
      if (spA && spB) {
        kpA += spA.kamp_poeng ?? 0;
        kpB += spB.kamp_poeng ?? 0;
      }
    }
    if (kpA !== kpB) return kpB - kpA;

    // Highest score in a single match — stored score_poeng, matching the SP column.
    // Omgang rows can be incomplete or miss HCP on a confirmed match.
    const scoresFor = (kid: number) =>
      confirmed
        .flatMap((k) => k.spelarar?.filter((s) => s.kasterid === kid) ?? [])
        .map((s) => s.score_poeng ?? 0)
        .sort((x, y) => y - x);
    const sA = scoresFor(a.kasterid);
    const sB = scoresFor(b.kasterid);
    for (let i = 0; i < Math.min(sA.length, sB.length); i++) {
      const scoreA = sA[i] ?? 0;
      const scoreB = sB[i] ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
    }

    return (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity);
  });
}
