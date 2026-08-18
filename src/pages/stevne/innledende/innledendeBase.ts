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
import { showScoreEditor } from "@/components/ScoreEditor";
import { showToast } from "@/components/Toast";
import { getMatchSides, groupStandingsByPair, sideScore } from "@/utils/kamp";
import { applyFlashClasses, renderMatchLegend, renderRound } from "./innledendeView";
import { autoCompleteInitialRoundMatches } from "@/services/testDataService";
import {
  initialMenuItems,
  setBannerMeta,
  createChangeHandler,
  bindStandingDetails,
  renderMainContent,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
  renderStandingTable,
  sideNameHtml,
  bindScoreboardClicks,
  bindAutoComplete,
  bindCompleteTournament,
} from "../faseView";
import { buildInitialPlayerMap, sortStandings, type StandingRow } from "@/utils/stilling";
import { parseRound1Format } from "@/utils/kastemetoder-logikk";
import { renderBannerMenu, bindBannerMenu, type BannerMenuItem } from "@/components/BannerMenu";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getInitialRoundMatches,
  confirmMatch as confirmMatchService,
  toConfirmSide,
  subscribeToMatchChanges,
  type InitialMatchRow,
} from "@/services/kampService";
import {
  getInitialPhaseTournament,
  type InitialPhaseTournamentRow,
} from "@/services/stevneService";
import { unsubscribeChannel } from "@/utils/realtime";
import { buildParticipantMaps } from "@/utils/participantMaps";
import { groupBy } from "@/utils/groupBy";
import { getResultsForInitialRound, type InitialResultRow } from "@/services/resultatService";

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
  /** The realtime handler's coalesced reload — our own writes queue through it too. */
  let scheduleReload: (() => void) | null = null;

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
      const roundMap = groupBy(allMatches, (kamp) => kamp.runde_nummer);
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

    bindCompleteTournament(bannerSlot, ctx.stevneid, () => ctx.standing, ctx.reload);

    bindAutoComplete(
      bannerSlot,
      { title: "Autofullfør kampar", message: "Autofullfør alle ubekreftede innleiande kampar?" },
      async () => {
        await autoCompleteInitialRoundMatches(ctx.stevneid);
        await ctx.reload();
      },
    );
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
    const playerIds = [...(side1?.members ?? []), ...(side2?.members ?? [])].map((m) => m.id);

    const onScoreClick = async () => {
      await showScoreEditor({
        side1Name: sideNameHtml(side1, false),
        side2Name: sideNameHtml(side2, false),
        currentS1: sideScore(side1, kamp.er_bekreftet),
        currentS2: sideScore(side2, kamp.er_bekreftet),
        baneLabel: `Bane ${kamp.bane_nummer ?? "?"}`,
        rundeLabel: `Runde ${kamp.runde_nummer}`,
        playerIds,
        hasRounds: kamp.spelarar.some((s) => (s.omgangar?.length ?? 0) > 0),
        logPrefix: variant.logPrefix,
        // Entering a score is the confirmation — there is no separate Bekreft step.
        onSaved: async (newS1, newS2) => {
          const ok = await confirmMatch(
            container,
            stevneid,
            kamp,
            startNumberMap,
            hcpMap,
            positionMap,
            [newS1, newS2],
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

    // Only admin rows carry the detail panel, so only they expand.
    if (!isAdmin) return;

    mobileRow.querySelector(".match-row-mobile__header")?.addEventListener("click", (e) => {
      // The scoreboard icon lives in the header; opening it must not expand.
      if ((e.target as HTMLElement).closest("[data-scoreboard-kamp-id]")) return;
      const expanded = mobileRow.dataset.expanded === "true";
      container
        .querySelectorAll<HTMLElement>('.match-row-mobile[data-expanded="true"]')
        .forEach((r) => {
          r.dataset.expanded = "false";
        });
      mobileRow.dataset.expanded = expanded ? "false" : "true";
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
    scheduleReload = onChange;
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
    /** Side totals just entered on the numberpad; omitted = use the stored score. */
    enteredScores?: [number, number],
  ): Promise<boolean> {
    const [side1, side2] = getMatchSides(kamp.spelarar, startNumberMap, positionMap);
    const p1 = side1?.rep ?? null;
    const p2 = side2?.rep ?? null;
    const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0;
    const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0;

    const { error } = await confirmMatchService({
      kampId: kamp.id,
      sides: [
        toConfirmSide(side1, { baseScore: enteredScores?.[0] }),
        toConfirmSide(side2, { baseScore: enteredScores?.[1] }),
      ],
      hcp: [hcp1, hcp2],
      erWalkover: kamp.er_walkover,
      outcome: { type: "innledende" },
    });
    if (error) {
      showToast("DB-feil ved bekreft: " + errorMessage(error), "error");
      return false;
    }
    // Queued, not awaited: the numberpad closes on the write, and this reload
    // collapses into the realtime burst our own write is about to trigger.
    if (scheduleReload) scheduleReload();
    else await loadAndRender(container, stevneid);
    return true;
  }

  return render;
}

// ── Data-bygging (pure — no closure state) ────────────────────────────────────

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
