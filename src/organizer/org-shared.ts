import {
  scoreForPlayer,
  matchScoreForPlayer,
  sideScore,
  getMatchSides,
  groupStandingsByPair,
  type MatchSide,
} from "@/utils/kamp";
import { throwerNameShort } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { coalesceReload } from "@/utils/coalesceReload";
import { bindExpandableRows, makeRowsFocusable } from "@/utils/expandableRows";
import type { Tables, Json, Round1FormatTyped } from "@/types";
import { createTable, type ColumnDef } from "@/components/Table";
import type { BannerMenuItem } from "@/components/BannerMenu";
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
  /**
   * Number of units qualifying for group A in the avsluttande fase — draws a
   * cut line under that row. Ignored once the table is itself split by group.
   */
  qualifyCutoff?: number | null;
}

/** stevne.runde1_format holds the avsluttande A/B split; nA is the group-A size. */
export function parseRound1Format(json: Json | null): Round1FormatTyped | null {
  if (json == null || typeof json !== "object" || Array.isArray(json)) return null;
  return json as unknown as Round1FormatTyped;
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
      <div class="org-tab-buttons" role="tablist">
        <button type="button" class="org-tab-btn" role="tab" data-tab="matches"
                aria-selected="true" aria-controls="org-panel-matches">Kampar</button>
        <button type="button" class="org-tab-btn" role="tab" data-tab="standing"
                aria-selected="false" aria-controls="org-panel-standing">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start org-content-row">
        <div id="org-panel-matches" class="flex-grow-1 org-matches-panel">${matchesHtml}</div>
        <div id="org-panel-standing" class="org-standing-col">${standingHtml}</div>
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
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });
}

export function bindTabToggle(container: HTMLElement): void {
  if (!container.querySelector(".org-main-content")) return;
  container.querySelectorAll<HTMLButtonElement>(".org-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(container, btn.dataset.tab === "standing" ? "standing" : "matches");
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
    theadClass: "org-thead",
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
    ?.closest(".org-fase-header")
    ?.querySelector<HTMLElement>(".org-fase-header__meta");
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

  if (allMatchesConfirmed)
    items.push({
      id: "complete-tournament-btn",
      label: "Fullfør turnering",
      tone: "success",
      disabled: tournament.erfullfort === true,
    });

  return items;
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

/**
 * Head-to-head points within one tied block: kamp_poeng from the confirmed
 * matches where at least two members of the block met, as a mini round-robin.
 * Deliberately one number per player rather than a pairwise comparison — A beats
 * B, B beats C, C beats A is an ordinary result, and a comparator that can
 * contradict itself lets Array.sort land on an order no ranking rule justifies.
 *
 * NB: the written rules drop head-to-head entirely once three or more are tied.
 * We keep it as this mini round-robin instead, which stays decisive in the cases
 * the rules leave to the scores alone. Deliberate — to follow the rules to the
 * letter, skip the block when it holds more than two rows.
 */
function headToHeadPoints(block: StandingRow[], confirmed: MatchForSorting[]): Map<number, number> {
  const points = new Map<number, number>(block.map((r) => [r.kasterid, 0]));
  for (const kamp of confirmed) {
    const met = (kamp.spelarar ?? []).filter((s) => s.kasterid != null && points.has(s.kasterid));
    if (met.length < 2) continue;
    for (const sp of met) {
      points.set(sp.kasterid!, (points.get(sp.kasterid!) ?? 0) + (sp.kamp_poeng ?? 0));
    }
  }
  return points;
}

export function sortStandings(standings: StandingRow[], matches: MatchForSorting[]): StandingRow[] {
  const confirmed = matches.filter((k) => k.er_bekreftet);

  // X-kast innledande ranks on poeng_xkast → ringere, kamp-based innledande on
  // kamp_poeng → score_poeng. Decided once for the table, as the columns are.
  const useXkast = standings.some((r) => r.poeng_xkast != null);
  const primaryOf = (r: StandingRow): number =>
    useXkast ? (r.poeng_xkast ?? 0) : (r.kamp_poeng ?? 0);
  const secondaryOf = (r: StandingRow): number =>
    useXkast ? (r.antall_ring_xkast ?? 0) : (r.score_poeng ?? 0);

  // Each player's confirmed match scores, best first. Every match here is
  // confirmed, so this reads the stored totals the SP column adds up.
  const scoreCache = new Map<number, number[]>();
  const scoresFor = (kasterid: number): number[] => {
    let scores = scoreCache.get(kasterid);
    if (!scores) {
      scores = confirmed
        .flatMap((k) => k.spelarar?.filter((s) => s.kasterid === kasterid) ?? [])
        .map((s) => matchScoreForPlayer(s, true))
        .sort((x, y) => y - x);
      scoreCache.set(kasterid, scores);
    }
    return scores;
  };

  const ordered = [...standings].sort((a, b) => {
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

    const primaryDiff = primaryOf(b) - primaryOf(a);
    if (primaryDiff !== 0) return primaryDiff;
    const secondaryDiff = secondaryOf(b) - secondaryOf(a);
    if (secondaryDiff !== 0) return secondaryDiff;

    // Highest score in a single match, then next-highest. A match the other
    // player does not have counts as 0, so unequal match counts still compare
    // the same way round whichever order the pair arrives in.
    const sA = scoresFor(a.kasterid);
    const sB = scoresFor(b.kasterid);
    for (let i = 0; i < Math.max(sA.length, sB.length); i++) {
      const scoreDiff = (sB[i] ?? 0) - (sA[i] ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
    }

    return (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity) || a.kasterid - b.kasterid;
  });

  // Head-to-head outranks the single-match scores, so it is applied afterwards
  // to each block the criteria above left tied. Rows with a final plassering are
  // ranked by it alone and never join a block.
  const blockKey = (r: StandingRow): string | null =>
    r.plassering != null ? null : `${r.runde_eliminert ?? ""}|${primaryOf(r)}|${secondaryOf(r)}`;

  const resolved: StandingRow[] = [];
  for (let i = 0; i < ordered.length;) {
    const key = blockKey(ordered[i]!);
    let end = i + 1;
    if (key != null) while (end < ordered.length && blockKey(ordered[end]!) === key) end++;
    const block = ordered.slice(i, end);
    if (block.length > 1) {
      const points = headToHeadPoints(block, confirmed);
      // Stable sort: players level on h2h keep the order the criteria above gave them
      block.sort((a, b) => (points.get(b.kasterid) ?? 0) - (points.get(a.kasterid) ?? 0));
    }
    resolved.push(...block);
    i = end;
  }
  return resolved;
}
