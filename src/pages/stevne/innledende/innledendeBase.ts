// ── Shared base for innledende-phase renderers ────────────────────────────────
//
// Usage: call createInnledendeRenderer(variant) once at module level in each
// kastemetode file. The factory returns a render() function that owns its own
// realtime channel, admin flag, and banner slot — so two variants running
// simultaneously never share state.
//
// InnledendeVariant config fields:
//   channelName(stevneid)      — realtime channel name, must be unique per variant
//   logPrefix                  — prepended to logError context strings
//   isSwiss                    — whether to offer "Generer neste runde" in the menu
//   onReset?()                 — called on each render(); use to reset variant state
//   bannerMeta(ctx)            — meta line beside the stevne name in the banner
//   getMenuItems(ctx)          — extra banner-menu entries for this variant
//   bindBannerExtra(slot, ctx) — binds click handlers for the entries above
//   filterRounds?(roundMap)    — optionally filter which rounds to display; default: all
//
// To add a new kastemetode: create a thin file (~30-50 lines) that defines
// an InnledendeVariant and exports `createInnledendeRenderer(variant)`.
// See gloppen.ts (no-Swiss) and nordhordland.ts (Swiss) for examples.
//
import { showScoreEditor } from "@/organizer/scoreEditor";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { getMatchSides, groupStandingsByPair, sideScore, type MatchSide } from "@/utils/kamp";
import { autoCompleteInitialRoundMatches } from "@/services/testDataService";
import {
  buildInitialPlayerMap,
  sortStandings,
  initialMenuItems,
  setBannerMeta,
  parseRound1Format,
  createChangeHandler,
  bindStandingDetails,
  renderMainContent,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
  renderStandingTable,
  sideNameHtml,
  bindScoreboardClicks,
  type StandingRow,
} from "@/organizer/org-shared";
import { renderBannerMenu, bindBannerMenu, type BannerMenuItem } from "@/components/BannerMenu";
import { scoreboardButtonHtml } from "@/components/ScoreboardButton";
import { createLoadingState } from "@/components/LoadingState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getInitialRoundMatches,
  hasMatchRounds,
  updateMatchPlayerScoreFast,
  confirmMatch as confirmMatchService,
  toConfirmSide,
  subscribeToMatchChanges,
  unconfirmMatch,
  type InitialMatchRow,
  type InitialMatchPlayerRow,
} from "@/services/kampService";
import {
  getInitialPhaseTournament,
  setTournamentCompleted,
  type InitialPhaseTournamentRow,
} from "@/services/stevneService";
import { unsubscribeChannel } from "@/utils/realtime";
import { livePillHtml } from "@/components/LivePill";
import {
  getResultsForInitialRound,
  writePlacements,
  type InitialResultRow,
} from "@/services/resultatService";

// ── Variant API ───────────────────────────────────────────────────────────────

export interface InnledendeContext {
  container: HTMLElement;
  stevneid: number;
  stevne: InitialPhaseTournamentRow;
  allMatches: InitialMatchRow[];
  roundMap: Map<number, InitialMatchRow[]>;
  startNumberMap: Record<number, number>;
  standing: StandingRow[];
  isAdmin: boolean;
  allMatchesConfirmed: boolean;
  reload: () => Promise<void>;
}

export interface InnledendeVariant {
  channelName: (stevneid: number) => string;
  logPrefix: string;
  isSwiss: boolean;
  onReset?: () => void;
  /** Secondary meta line beside the stevne name, e.g. "NHM - 2 av 5 rundar". */
  bannerMeta: (ctx: InnledendeContext) => string;
  getMenuItems: (ctx: InnledendeContext) => BannerMenuItem[];
  bindBannerExtra: (bannerSlot: HTMLElement, ctx: InnledendeContext) => void;
  filterRounds?: (roundMap: Map<number, InitialMatchRow[]>) => Map<number, InitialMatchRow[]>;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createInnledendeRenderer(variant: InnledendeVariant) {
  let channel: RealtimeChannel | null = null;
  let bannerSlot: HTMLElement | null = null;
  let isAdmin = false;
  const standingExpandedIds = new Set<string>();
  let prevConfirmedIds: Set<number> | null = null;
  let pendingAnimationIds = new Set<number>();
  /** kamp_spelar ids in view — scopes the unfiltered kamp_omgang subscription. */
  const ownedSpelarIds = new Set<number>();

  async function render(
    container: HTMLElement,
    { id, isAdmin: _isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot;
    isAdmin = _isAdmin;
    variant.onReset?.();
    if (channel) {
      await unsubscribeChannel(channel);
      channel = null;
    }
    container.replaceChildren(createLoadingState("Laster…"));
    await loadAndRender(container, id);
  }

  async function loadAndRender(container: HTMLElement, stevneid: number): Promise<void> {
    try {
      const [{ data: stevne }, { data: allMatches }, { data: resultat }] = await Promise.all([
        getInitialPhaseTournament(stevneid),
        getInitialRoundMatches(stevneid),
        getResultsForInitialRound(stevneid),
      ]);

      if (!stevne) {
        container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
        return;
      }

      ownedSpelarIds.clear();
      for (const kamp of allMatches) for (const sp of kamp.spelarar) ownedSpelarIds.add(sp.id);

      const { startNumberMap, hcpMap, positionMap, isTeam } = buildParticipantMaps(resultat);
      const roundMap = buildRoundMap(allMatches);
      const standing = buildStanding(allMatches, resultat, startNumberMap, positionMap, isTeam);
      const idsToFlash = calcFlashIds(allMatches);

      const allMatchesConfirmed = allMatches.length > 0 && allMatches.every((k) => k.er_bekreftet);
      const canEditMatches = isAdmin && stevne.stevne_fase !== "avsluttende";

      const ctx: InnledendeContext = {
        container,
        stevneid,
        stevne,
        allMatches,
        roundMap,
        startNumberMap,
        standing,
        isAdmin,
        allMatchesConfirmed,
        reload: () => loadAndRender(container, stevneid),
      };

      setupBanner(ctx);

      const roundsToShow = (variant.filterRounds ?? ((m) => m))(roundMap);
      const matchesHtml =
        [...roundsToShow.entries()]
          .map(([nr, roundMatches]) =>
            renderRound(nr, roundMatches, startNumberMap, canEditMatches, hcpMap, positionMap),
          )
          .join("") + renderMatchLegend();
      const standingHtml = renderStandingTable(standing, allMatches, startNumberMap, {
        tableId: "standing-initial",
        hasMatchCount: true,
        positionMap,
        unitLabel: isTeam ? "par" : "spelarar",
        // Once the avsluttande fase has an A/B split, mark where A ends.
        qualifyCutoff: parseRound1Format(stevne.runde1_format)?.nA ?? null,
      });

      const activeTab = getActiveTab(container);
      container.innerHTML = renderMainContent(matchesHtml, standingHtml);
      bindTabToggle(container);
      if (activeTab === "standing") setActiveTab(container, "standing");
      bindStandingDetails(container, "standing-initial", standingExpandedIds);

      applyFlashClasses(container, idsToFlash, allMatches);

      bindScoreboardClicks(container);
      for (const kamp of allMatches) {
        bindMatchEvents(
          container,
          stevneid,
          kamp,
          startNumberMap,
          hcpMap,
          positionMap,
          canEditMatches,
        );
      }

      subscribeToChanges(container, stevneid);
    } catch (err) {
      logError(`${variant.logPrefix}.loadAndRender`, err);
      container.replaceChildren(createErrorBanner("Kunne ikkje laste innleiande fase."));
    }
  }

  /** Tracks confirmed-match ids across renders so the newly-confirmed rows flash once. */
  function calcFlashIds(allMatches: InitialMatchRow[]): Set<number> {
    const currentConfirmedIds = new Set(allMatches.filter((k) => k.er_bekreftet).map((k) => k.id));
    const newlyConfirmedIds = prevConfirmedIds
      ? new Set([...currentConfirmedIds].filter((id) => !prevConfirmedIds!.has(id)))
      : new Set<number>();
    const idsToFlash = new Set([...newlyConfirmedIds, ...pendingAnimationIds]);
    pendingAnimationIds = new Set(newlyConfirmedIds);
    prevConfirmedIds = currentConfirmedIds;
    return idsToFlash;
  }

  function setupBanner(ctx: InnledendeContext): void {
    setBannerMeta(bannerSlot, variant.bannerMeta(ctx));
    if (!bannerSlot) return;
    const extras = variant.getMenuItems(ctx);
    // The stevne is only finished once every planned runde exists. Legacy stevner
    // with no planned count are unbounded — neither gate applies to them.
    const plannedRounds = ctx.stevne.antall_runder_innl;
    const allRoundsGenerated = plannedRounds != null && ctx.roundMap.size >= plannedRounds;
    bannerSlot.innerHTML = renderBannerMenu(
      isAdmin
        ? initialMenuItems(ctx.stevne, {
            erSwiss: variant.isSwiss,
            canGenerateRound: plannedRounds == null || ctx.roundMap.size < plannedRounds,
            canComplete: ctx.allMatchesConfirmed && (plannedRounds == null || allRoundsGenerated),
            extras,
          })
        : extras,
    );
    bindBannerMenu(bannerSlot);
    variant.bindBannerExtra(bannerSlot, ctx);

    bannerSlot.querySelector("#complete-tournament-btn")?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Fullfør turnering",
          message: "Vil du fullføre turneringa? Dette kan ikkje angrast.",
          danger: true,
        }))
      )
        return;
      const { error: plErr } = await writePlacements(ctx.stevneid, ctx.standing);
      if (plErr) {
        showToast("Feil ved lagring av plasseringar", "error");
        return;
      }
      const { error } = await setTournamentCompleted(ctx.stevneid);
      if (error) {
        showToast("Feil ved lagring", "error");
        return;
      }
      await ctx.reload();
    });

    bannerSlot.querySelector("#test-auto-complete-btn")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      if (
        !(await confirmDialog({
          title: "Autofullfør kampar",
          message: "Autofullfør alle ubekreftede innleiande kampar?",
        }))
      )
        return;
      btn.disabled = true;
      await autoCompleteInitialRoundMatches(ctx.stevneid);
      await ctx.reload();
    });
  }

  function bindScoreEdit(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startNumberMap: Record<number, number>,
    hcpMap: Record<number, number>,
    positionMap: Record<number, number>,
  ): void {
    const [side1, side2] = getMatchSides(kamp.spelarar, startNumberMap, positionMap);
    const p1 = side1?.rep ?? null;
    const p2 = side2?.rep ?? null;
    const playerIds = [...(side1?.members ?? []), ...(side2?.members ?? [])].map((m) => m.id);

    const onScoreClick = async () => {
      const hasRounds = playerIds.length ? await hasMatchRounds(playerIds) : false;
      await showScoreEditor({
        side1Name: sideNavn(side1, false),
        side2Name: sideNavn(side2, false),
        currentS1: sideScore(side1, kamp.er_bekreftet),
        currentS2: sideScore(side2, kamp.er_bekreftet),
        playerIds,
        hasRounds,
        logPrefix: variant.logPrefix,
        onSave: async (newS1, newS2) => {
          await Promise.all([
            p1 ? updateMatchPlayerScoreFast(p1.id, newS1) : Promise.resolve({ error: null }),
            p2 ? updateMatchPlayerScoreFast(p2.id, newS2) : Promise.resolve({ error: null }),
            ...(kamp.er_bekreftet ? [unconfirmMatch(kamp.id)] : []),
          ]);
          return null;
        },
        // Entering a score is the confirmation — there is no separate Bekreft step.
        onSaved: async () => {
          const ok = await confirmMatch(
            container,
            stevneid,
            kamp,
            startNumberMap,
            hcpMap,
            positionMap,
          );
          if (!ok) await loadAndRender(container, stevneid);
        },
      });
    };

    container
      .querySelectorAll(`[data-endre-score="${kamp.id}"]`)
      .forEach((el) => el.addEventListener("click", onScoreClick));
    container.querySelector(`#m-score-${kamp.id}`)?.addEventListener("click", (e) => {
      e.stopPropagation();
      void onScoreClick();
    });
  }

  function bindMobileRow(container: HTMLElement, kamp: InitialMatchRow): void {
    const mobileRow = container.querySelector<HTMLElement>(
      `.match-row-mobile[data-kamp-id="${kamp.id}"]`,
    );
    if (!mobileRow) return;

    // Viewer rows navigate via their data-scoreboard-kamp-id (delegated in
    // bindScoreboardClicks); only admin rows expand.
    if (!isAdmin) return;

    mobileRow.querySelector(".match-row-mobile__header")?.addEventListener("click", () => {
      const expanded = mobileRow.dataset.expanded === "true";
      container
        .querySelectorAll<HTMLElement>('.match-row-mobile[data-expanded="true"]')
        .forEach((r) => {
          r.dataset.expanded = "false";
          r.setAttribute("aria-expanded", "false");
        });
      mobileRow.dataset.expanded = expanded ? "false" : "true";
      mobileRow.setAttribute("aria-expanded", String(!expanded));
    });
  }

  function bindMatchEvents(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startNumberMap: Record<number, number>,
    hcpMap: Record<number, number>,
    positionMap: Record<number, number>,
    canEditMatches: boolean,
  ): void {
    if (canEditMatches)
      bindScoreEdit(container, stevneid, kamp, startNumberMap, hcpMap, positionMap);
    bindMobileRow(container, kamp);
  }

  function subscribeToChanges(container: HTMLElement, stevneid: number): void {
    if (channel) return;
    const onChange = createChangeHandler(stevneid, ["innledende"], container, loadAndRender, () => {
      if (channel) {
        void unsubscribeChannel(channel);
        channel = null;
      }
    });
    channel = subscribeToMatchChanges(stevneid, variant.channelName(stevneid), onChange, (id) =>
      ownedSpelarIds.has(id),
    );
  }

  async function confirmMatch(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startNumberMap: Record<number, number>,
    hcpMap: Record<number, number> = {},
    positionMap: Record<number, number> = {},
  ): Promise<boolean> {
    const [side1, side2] = getMatchSides(kamp.spelarar, startNumberMap, positionMap);
    const p1 = side1?.rep ?? null;
    const p2 = side2?.rep ?? null;
    const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0;
    const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0;

    const { error } = await confirmMatchService({
      kampId: kamp.id,
      sides: [toConfirmSide(side1), toConfirmSide(side2)],
      hcp: [hcp1, hcp2],
      erWalkover: kamp.er_walkover,
      outcome: { type: "innledende" },
    });
    if (error) {
      showToast("DB-feil ved bekreft: " + errorMessage(error), "error");
      return false;
    }
    await loadAndRender(container, stevneid);
    return true;
  }

  return render;
}

// ── Data-bygging (pure — no closure state) ────────────────────────────────────

interface ParticipantMaps {
  startNumberMap: Record<number, number>;
  hcpMap: Record<number, number>;
  positionMap: Record<number, number>;
  /** Par/Mix: two players share a startnummer */
  isTeam: boolean;
}

function buildParticipantMaps(resultat: InitialResultRow[]): ParticipantMaps {
  const startNumberMap: Record<number, number> = Object.fromEntries(
    resultat.filter((r) => r.kasterid != null).map((r) => [r.kasterid!, r.startnummer ?? 0]),
  );
  const hcpMap: Record<number, number> = Object.fromEntries(
    resultat
      .filter((r) => r.kasterid != null && (r.hcp ?? 0) > 0)
      .map((r) => [r.kasterid!, r.hcp ?? 0]),
  );
  const positionMap: Record<number, number> = Object.fromEntries(
    resultat
      .filter((r) => r.kasterid != null && r.posisjon != null)
      .map((r) => [r.kasterid!, r.posisjon!]),
  );
  const snrCount = new Map<number, number>();
  for (const r of resultat) {
    if (r.kasterid == null || r.startnummer == null) continue;
    snrCount.set(r.startnummer, (snrCount.get(r.startnummer) ?? 0) + 1);
  }
  return { startNumberMap, hcpMap, positionMap, isTeam: [...snrCount.values()].some((c) => c > 1) };
}

function buildRoundMap(allMatches: InitialMatchRow[]): Map<number, InitialMatchRow[]> {
  const roundMap = new Map<number, InitialMatchRow[]>();
  for (const kamp of allMatches) {
    if (!roundMap.has(kamp.runde_nummer)) roundMap.set(kamp.runde_nummer, []);
    roundMap.get(kamp.runde_nummer)!.push(kamp);
  }
  return roundMap;
}

function buildStanding(
  allMatches: InitialMatchRow[],
  resultat: InitialResultRow[],
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
  isTeam: boolean,
): StandingRow[] {
  const { playerMap, realThrowerIds } = buildInitialPlayerMap(allMatches, startNumberMap);
  const standingRows = Object.values(playerMap)
    .filter((s) => realThrowerIds.has(s.kasterid))
    .map((s) => ({ ...s, hcp: resultat.find((r) => r.kasterid === s.kasterid)?.hcp ?? 0 }));
  return sortStandings(
    isTeam ? groupStandingsByPair(standingRows, positionMap) : standingRows,
    allMatches,
  );
}

/** Adds the one-shot flash class to rows whose match was just confirmed. */
function applyFlashClasses(
  container: HTMLElement,
  idsToFlash: Set<number>,
  allMatches: InitialMatchRow[],
): void {
  for (const matchId of idsToFlash) {
    container
      .querySelectorAll(`[data-kamp-id="${matchId}"]`)
      .forEach((el) => el.classList.add("match-newly-confirmed"));
    const kamp = allMatches.find((k) => k.id === matchId);
    if (!kamp) continue;
    for (const sp of kamp.spelarar) {
      container
        .querySelectorAll(
          `#standing-initial tr.standing-player-row[data-kasterid="${sp.kasterid}"] td`,
        )
        .forEach((el) => el.classList.add("standing-new-confirmed"));
    }
  }
}

// ── Shared rendering (pure — no closure state) ────────────────────────────────

/** Any member of the side has omgang rows (pair members alternate omgangar). */
function sideHasRounds(side: MatchSide<InitialMatchPlayerRow> | null): boolean {
  return side?.members.some((m) => (m.omgangar?.length ?? 0) > 0) ?? false;
}

const sideNavn = sideNameHtml;

type MatchStatus = "done" | "in-progress" | "not-started";

function resolveMatchStatus(
  kamp: InitialMatchRow,
  hasPoints: boolean,
  hasRounds: boolean,
): MatchStatus {
  if (kamp.er_bekreftet) return "done";
  if (hasRounds || hasPoints) return "in-progress";
  return "not-started";
}

function renderMatchLegend(): string {
  return `
    <div class="match-legend">
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--not-started"></div> Ikke startet</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--in-progress"></div> Pågår</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--done"></div> Ferdig</div>
    </div>`;
}

function renderRound(
  nr: number,
  matches: InitialMatchRow[],
  startNumberMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const desktopRows = matches
    .map((k) => matchRow(k, startNumberMap, admin, hcpMap, positionMap))
    .join("");
  const mobileRows = matches
    .map((k) => matchRowMobile(k, startNumberMap, admin, hcpMap, positionMap))
    .join("");

  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-sm match-table mb-0 match-table--desktop">
        <thead class="org-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-96 text-center initial-score-th">SCORE</th>
            <th>P2</th>
            ${admin ? '<th class="th-148"></th>' : '<th class="th-80"></th>'}
          </tr>
        </thead>
        <tbody>${desktopRows}</tbody>
      </table>
      <ul class="match-list-mobile list-unstyled mb-0">${mobileRows}</ul>
    </div>`;
}

/** A side's raw score: confirmed total, or live omgang sum plus handicap. */
function sideRawScore(
  side: MatchSide<InitialMatchPlayerRow> | null,
  isConfirmed: boolean,
  hasRounds: boolean,
  hcp: number,
): number {
  if (isConfirmed) return sideScore(side, true);
  return sideScore(side, false) + (hasRounds ? hcp : 0);
}

/** Displayed scores: an unconfirmed walkover shows 21–0; otherwise the raw side totals. */
function calcRowScores(
  kamp: InitialMatchRow,
  side1: MatchSide<InitialMatchPlayerRow> | null,
  side2: MatchSide<InitialMatchPlayerRow> | null,
  hasRounds1: boolean,
  hasRounds2: boolean,
  hcp1: number,
  hcp2: number,
): { s1: number; s2: number; hasPoints: boolean } {
  const s1Raw = sideRawScore(side1, kamp.er_bekreftet, hasRounds1, hcp1);
  const s2Raw = sideRawScore(side2, kamp.er_bekreftet, hasRounds2, hcp2);
  const isUnconfirmedWalkover = kamp.er_walkover && !kamp.er_bekreftet;
  const hasPoints =
    kamp.er_bekreftet || kamp.er_walkover || hasRounds1 || hasRounds2 || s1Raw > 0 || s2Raw > 0;
  return {
    s1: isUnconfirmedWalkover ? 21 : s1Raw,
    s2: isUnconfirmedWalkover ? 0 : s2Raw,
    hasPoints,
  };
}

/** Per-match view state shared by the desktop and mobile row renderers. */
function calcMatchRowState(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  hcpMap: Record<number, number>,
  positionMap: Record<number, number>,
) {
  const [side1, side2] = getMatchSides(kamp.spelarar, startNumberMap, positionMap);
  const p1 = side1?.rep ?? null;
  const p2 = side2?.rep ?? null;
  const p2IsBye = kamp.er_walkover && !p2?.kaster;

  const hasRounds1 = sideHasRounds(side1);
  const hasRounds2 = sideHasRounds(side2);
  const hasRounds = hasRounds1 || hasRounds2;
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0;
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0;

  const { s1, s2, hasPoints } = calcRowScores(
    kamp,
    side1,
    side2,
    hasRounds1,
    hasRounds2,
    hcp1,
    hcp2,
  );

  return {
    side1,
    side2,
    p1,
    p2,
    p2IsBye,
    hasRounds,
    s1,
    s2,
    hasPoints,
    status: resolveMatchStatus(kamp, hasPoints, hasRounds),
    isLive: hasRounds && !kamp.er_bekreftet,
  };
}

function scoreInnerHtml(s1: number | string, s2: number | string, sep = "–"): string {
  return `<span class="initial-score-inner"><span class="initial-s1">${s1}</span><span class="initial-sep">${sep}</span><span class="initial-s2">${s2}</span></span>`;
}

/** Prefixes the startnummer in parentheses when present. */
function withStartNumber(name: string, nr: number | string): string {
  return nr ? `${name} (${nr})` : name;
}

/** The right-hand action cell for a desktop match row. */
function matchRowButtonTd(kamp: InitialMatchRow, isLive: boolean): string {
  return `<td class="pe-2">
        <span class="d-flex align-items-center justify-content-end gap-2">
          ${isLive ? livePillHtml() : ""}
          ${scoreboardButtonHtml(kamp.id)}
        </span>
      </td>`;
}

function matchRow(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  admin = true,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const { side1, side2, p1, p2, p2IsBye, s1, s2, hasPoints, status, isLive } = calcMatchRowState(
    kamp,
    startNumberMap,
    hcpMap,
    positionMap,
  );

  const p1Nr = p1?.kasterid ? (startNumberMap[p1.kasterid] ?? "") : "";
  const p2Nr = p2?.kasterid ? (startNumberMap[p2.kasterid] ?? "") : "";
  const p1Display = withStartNumber(sideNavn(side1, false), p1Nr);
  const p2Display = withStartNumber(p2IsBye ? "Walkover" : sideNavn(side2, false), p2Nr);

  const canEditScore = admin && !kamp.er_walkover;
  const scoreCss = `text-center initial-score-cell${canEditScore ? " score-editable" : ""}`;
  const scoreAttr = canEditScore ? ` data-endre-score="${kamp.id}"` : "";

  return `
    <tr class="match-row-desktop" data-kamp-id="${kamp.id}" data-status="${status}">
      <td class="text-center">${kamp.bane_nummer ?? ""}</td>
      <td>${p1Display}</td>
      <td class="${scoreCss}"${scoreAttr}>${hasPoints ? scoreInnerHtml(s1, s2) : "—"}</td>
      <td>${p2Display}</td>
      ${matchRowButtonTd(kamp, isLive)}
    </tr>`;
}

function matchRowMobile(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const { side1, side2, p2IsBye, s1, s2, hasPoints, status, isLive } = calcMatchRowState(
    kamp,
    startNumberMap,
    hcpMap,
    positionMap,
  );

  const p1NameShort = sideNavn(side1, true);
  const p2NameShort = p2IsBye ? "Walkover" : sideNavn(side2, true);
  const resultText = hasPoints ? scoreInnerHtml(s1, s2) : scoreInnerHtml("", "", "—");

  const canEditScore = admin && !kamp.er_walkover;
  const resultAttr = canEditScore ? ` id="m-score-${kamp.id}"` : "";
  const resultCss = canEditScore ? " score-editable" : "";
  const roleCss = admin ? "" : " match-row-mobile--viewer";

  return `
    <li class="match-row-mobile${roleCss}" data-kamp-id="${kamp.id}"${admin ? "" : ` data-scoreboard-kamp-id="${kamp.id}"`} data-status="${status}" role="button" tabindex="0">
      <div class="match-row-mobile__header">
        <span class="match-mobile-lane">${kamp.bane_nummer ?? ""}</span>
        <span class="match-mobile-name"><span class="match-mobile-name__p1">${p1NameShort}</span><span class="match-mobile-name__p2"><span class="match-mobile-vs">vs</span> ${p2NameShort}</span></span>
        <span class="match-mobile-pill-slot">${isLive ? livePillHtml() : ""}</span>
        <span class="match-mobile-result${resultCss}"${resultAttr}>${resultText}</span>
      </div>
      ${admin ? matchRowMobileButtons(kamp) : ""}
    </li>`;
}

/** The mobile action row, shown only to admins. */
function matchRowMobileButtons(kamp: InitialMatchRow): string {
  return `
      <div class="match-mobile-buttons">
        ${scoreboardButtonHtml(kamp.id, "scoreboard-btn--touch")}
      </div>`;
}
