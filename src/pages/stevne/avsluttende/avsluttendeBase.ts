// ── Shared base for avsluttende-phase renderers ───────────────────────────────
//
// Usage: call createFinalPhaseRenderer(variant) once at module level in each
// kastemetode file. The factory returns a render() function that owns its own
// realtime channel, admin flag, and banner slot.
//
// FinalPhaseVariant config fields:
//   channelName(stevneid)         — realtime channel name, must be unique per variant
//   renderMatchesHtml(ctx)        — HTML for the "Kampar" tab (shown when group assignment exists)
//   bindMatchEvents(el, ctx)      — bind match interaction handlers
//   renderSetupHtml(ctx)          — HTML shown before group assignment is set up
//   bannerMeta(ctx)               — meta line beside the stevne name in the banner
//   bindHeaderEvents(slot, ctx)   — bind variant-specific banner menu handlers
//
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  renderStandingTable,
  renderMainContent,
  finalMenuItems,
  setBannerMeta,
  bindStandingDetails,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
  createChangeHandler,
  bindAutoComplete,
  bindCompleteTournament,
} from "../faseView";
import {
  buildFinalStandings,
  orderStandingsByGroup,
  type StandingRow,
  type StandingMatch,
} from "@/utils/kamp/stilling";
import { parseRound1Format } from "@/utils/kamp/kastemetoder-logikk";
import { renderStevneBannerMenu, bindStevneBannerMenu } from "@/components/stevne/StevneBannerMenu";
import { createErrorBanner, createLoadingState } from "@/components/states";
import { logError } from "@/utils/logError";
import { unsubscribeChannel } from "@/utils/realtime";
import { buildParticipantMaps } from "@/utils/participantMaps";
import {
  getFinalRoundMatches,
  subscribeToMatchChanges,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import {
  getFinalPhaseTournament,
  getTournamentRegistrationCount,
  type FinalPhaseTournamentRow,
} from "@/services/stevneService";
import {
  getResultsForFinalRound,
  getGroups,
  type FinalResultRow,
} from "@/services/resultatService";
import { getPairsForTournament } from "@/services/pameldingService";
import { autoCompleteFinalMatches } from "@/services/testDataService";
import type { Round1FormatTyped } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type FinalResultKnown = FinalResultRow & { kasterid: number };

export interface FinalPhaseContext {
  container: HTMLElement;
  stevneid: number;
  stevne: FinalPhaseTournamentRow;
  standings: StandingRow[];
  startNumberMap: Record<number, number>;
  positionMap: Record<number, number>;
  /** Par/Mix stevne — two players share a startnummer */
  isTeam: boolean;
  nameMap: Record<number, string>;
  initialMatches: FinalMatchRow[];
  finalMatches: FinalMatchRow[];
  results: FinalResultKnown[];
  isAdmin: boolean;
  hasGroupAssignment: boolean;
  allInitialConfirmed: boolean;
  hasFinalMatches: boolean;
  round1Format: Round1FormatTyped | null;
  /** Competing units for setup: complete pairs for lag-based stevner, enrolled players otherwise */
  unitCount: number;
  groupNameMap: Record<string, number>;
  reload: () => Promise<void>;
}

export interface FinalPhaseVariant {
  channelName: (stevneid: number) => string;
  renderMatchesHtml: (ctx: FinalPhaseContext) => string;
  bindMatchEvents: (container: HTMLElement, ctx: FinalPhaseContext) => void;
  renderSetupHtml: (ctx: FinalPhaseContext) => string;
  /** Secondary meta line beside the stevne name, e.g. "Cup - A:13 - B:6". */
  bannerMeta: (ctx: FinalPhaseContext) => string;
  bindHeaderEvents: (bannerSlot: HTMLElement | null, ctx: FinalPhaseContext) => void;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function toStandingMatch(matches: FinalMatchRow[]): StandingMatch[] {
  return matches.map((k) => ({
    er_bekreftet: k.er_bekreftet,
    er_walkover: k.er_walkover,
    runde_nummer: k.runde_nummer,
    bane_nummer: k.bane_nummer,
    spelarar: toStandingPlayer(k.spelarar),
  }));
}

function toStandingPlayer(sp: FinalMatchPlayerRow[]) {
  return sp.map((s) => ({
    kasterid: s.kasterid ?? 0,
    kamp_poeng: s.kamp_poeng ?? 0,
    score_poeng: s.score_poeng ?? 0,
    antall_ringer: s.antall_ringer,
    omgangar: s.omgangar,
    kaster: s.kaster,
  }));
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createFinalPhaseRenderer(variant: FinalPhaseVariant) {
  let channel: RealtimeChannel | null = null;
  let bannerSlot: HTMLElement | null = null;
  let isAdmin = false;
  const standingExpandedIds = new Set<string>();
  /** kamp_spelar ids in view — scopes the unfiltered kamp_omgang subscription. */
  const ownedSpelarIds = new Set<number>();

  async function render(
    container: HTMLElement,
    { id, isAdmin: _isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot;
    isAdmin = _isAdmin;
    if (channel) {
      await unsubscribeChannel(channel);
      channel = null;
    }
    container.replaceChildren(createLoadingState("Laster…"));
    await loadAndRender(container, id);
  }

  async function loadAndRender(container: HTMLElement, stevneid: number): Promise<void> {
    try {
      const [
        { data: stevne },
        { data: rawMatches },
        { data: rawResults },
        { data: rawGroups },
        { count: registrationCount },
      ] = await Promise.all([
        getFinalPhaseTournament(stevneid),
        getFinalRoundMatches(stevneid),
        getResultsForFinalRound(stevneid),
        getGroups(["A", "B"]),
        getTournamentRegistrationCount(stevneid),
      ]);

      if (!stevne) {
        container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
        return;
      }

      ownedSpelarIds.clear();
      for (const kamp of rawMatches) for (const sp of kamp.spelarar) ownedSpelarIds.add(sp.id);

      const typedResults = rawResults.filter((r): r is FinalResultKnown => r.kasterid != null);
      const initialMatches = rawMatches.filter((k) => k.fase === "innledende");
      const finalMatches = rawMatches.filter((k) => k.fase === "avsluttende");

      const { startNumberMap, positionMap, isTeam } = buildParticipantMaps(typedResults);

      const nameMap: Record<number, string> = {};
      for (const k of rawMatches) {
        for (const sp of k.spelarar) {
          if (sp.kasterid && sp.kaster && !nameMap[sp.kasterid]) {
            nameMap[sp.kasterid] = `${sp.kaster.fornavn} ${sp.kaster.etternavn}`;
          }
        }
      }
      // X-kast-family innledende (minimatch etc.) produces no kamp rows, so the
      // loop above finds no names. resultat rows cover every participant — use
      // them so standings/preview show names instead of "Spelar <kasterid>".
      for (const r of typedResults) {
        if (r.kaster && !nameMap[r.kasterid]) {
          nameMap[r.kasterid] = `${r.kaster.fornavn} ${r.kaster.etternavn}`;
        }
      }

      const standingMatches = toStandingMatch(initialMatches);
      const standings = buildFinalStandings(
        standingMatches,
        typedResults,
        nameMap,
        startNumberMap,
        positionMap,
      );

      const allInitialConfirmed =
        initialMatches.length > 0 && initialMatches.every((k) => k.er_bekreftet);
      const hasFinalMatches = finalMatches.length > 0;
      const hasAnyMatches = initialMatches.length > 0 || hasFinalMatches;
      const allMatchesConfirmed =
        hasAnyMatches &&
        initialMatches.every((k) => k.er_bekreftet) &&
        finalMatches.every((k) => k.er_bekreftet);
      const hasGroupAssignment = typedResults.some((r) => r.gruppe != null);
      const groupNameMap: Record<string, number> = Object.fromEntries(
        rawGroups.map((g) => [g.navn, g.id]),
      );
      const round1Format = parseRound1Format(stevne.runde1_format);

      // Lag-based: the competing unit is a pair, so setup must count
      // complete pairs — not enrolled players
      let unitCount = registrationCount ?? 0;
      if (stevne.kategori?.erlagbasert) {
        const { data: pairs } = await getPairsForTournament(stevneid);
        unitCount = pairs.length;
      }

      const ctx: FinalPhaseContext = {
        container,
        stevneid,
        stevne,
        standings,
        startNumberMap,
        positionMap,
        isTeam,
        nameMap,
        initialMatches,
        finalMatches,
        results: typedResults,
        isAdmin,
        hasGroupAssignment,
        allInitialConfirmed,
        hasFinalMatches,
        round1Format,
        unitCount,
        groupNameMap,
        reload: () => loadAndRender(container, stevneid),
      };

      setBannerMeta(bannerSlot, variant.bannerMeta(ctx));

      if (isAdmin && bannerSlot) {
        bannerSlot.innerHTML = renderStevneBannerMenu(
          finalMenuItems(stevne, {
            allMatchesConfirmed,
            hasFinalMatches,
            hasGroupAssignment,
            hasPreconfiguredFormat: round1Format != null && stevne.stevne_fase !== "avsluttende",
          }),
        );
        bindStevneBannerMenu(bannerSlot);
      }

      const activeTab = getActiveTab(container);

      if (hasGroupAssignment) {
        const standingHtml = renderStandingTable(standings, standingMatches, startNumberMap, {
          tableId: "standing-final",
          hasGroups: true,
          hasElimination: true,
          positionMap,
          unitLabel: isTeam ? "par" : "spelarar",
        });
        container.innerHTML = renderMainContent(variant.renderMatchesHtml(ctx), standingHtml);
        bindStandingDetails(container, "standing-final", standingExpandedIds);
        bindTabToggle(container);
        if (activeTab === "standing") setActiveTab(container, "standing");
        variant.bindMatchEvents(container, ctx);
        subscribeToChanges(container, stevneid);
      } else {
        container.innerHTML = variant.renderSetupHtml(ctx);
      }

      if (bannerSlot) {
        bindAutoComplete(
          bannerSlot,
          {
            title: "Autofullfør kampar",
            message: "Autofullfør alle ubekrefta avsluttande kampar?",
          },
          async () => {
            await autoCompleteFinalMatches(stevneid);
            await loadAndRender(container, stevneid);
          },
        );

        bindCompleteTournament(
          bannerSlot,
          stevneid,
          () => orderStandingsByGroup(standings),
          () => loadAndRender(container, stevneid),
        );
      }

      variant.bindHeaderEvents(bannerSlot, ctx);
    } catch (err) {
      logError("avsluttendeBase.loadAndRender", err);
      container.replaceChildren(createErrorBanner("Kunne ikkje laste avsluttande fase."));
    }
  }

  function subscribeToChanges(container: HTMLElement, stevneid: number): void {
    if (channel) return;
    const onChange = createChangeHandler(
      stevneid,
      ["avsluttende"],
      container,
      loadAndRender,
      () => {
        if (channel) {
          void unsubscribeChannel(channel);
          channel = null;
        }
      },
    );
    channel = subscribeToMatchChanges(stevneid, variant.channelName(stevneid), onChange, (id) =>
      ownedSpelarIds.has(id),
    );
  }

  return render;
}
