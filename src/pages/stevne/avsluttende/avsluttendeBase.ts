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
  buildFinalStandings,
  renderStandingTable,
  renderMainContent,
  finalMenuItems,
  setBannerMeta,
  parseRound1Format,
  bindStandingDetails,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
  createChangeHandler,
  type StandingRow,
  type OrgMatch,
} from "@/organizer/org-shared";
import { renderBannerMenu, bindBannerMenu } from "@/components/BannerMenu";
import { createLoadingState } from "@/components/LoadingState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { logError } from "@/utils/logError";
import { unsubscribeChannel } from "@/utils/realtime";
import {
  getFinalRoundMatches,
  subscribeToMatchChanges,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import {
  getFinalPhaseTournament,
  setTournamentCompleted,
  getTournamentRegistrationCount,
  type FinalPhaseTournamentRow,
} from "@/services/stevneService";
import {
  getResultsForFinalRound,
  getGroups,
  writePlacements,
  type FinalResultRow,
} from "@/services/resultatService";
import { getPairsForTournament } from "@/services/pameldingService";
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

function toOrgMatch(matches: FinalMatchRow[]): OrgMatch[] {
  return matches.map((k) => ({
    er_bekreftet: k.er_bekreftet,
    er_walkover: k.er_walkover,
    runde_nummer: k.runde_nummer,
    bane_nummer: k.bane_nummer,
    spelarar: toOrgPlayer(k.spelarar),
  }));
}

function toOrgPlayer(sp: FinalMatchPlayerRow[]) {
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

      const startNumberMap: Record<number, number> = {};
      const positionMap: Record<number, number> = {};
      const snrCount = new Map<number, number>();
      for (const r of typedResults) {
        if (r.startnummer != null) {
          startNumberMap[r.kasterid] = r.startnummer;
          snrCount.set(r.startnummer, (snrCount.get(r.startnummer) ?? 0) + 1);
        }
        if (r.posisjon != null) positionMap[r.kasterid] = r.posisjon;
      }
      // Par/Mix: two players share a startnummer
      const isTeam = [...snrCount.values()].some((c) => c > 1);

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

      const initialMatchesOrg = toOrgMatch(initialMatches);
      const standings = buildFinalStandings(
        initialMatchesOrg,
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
        bannerSlot.innerHTML = renderBannerMenu(
          finalMenuItems(stevne, {
            allMatchesConfirmed,
            hasFinalMatches,
            hasGroupAssignment,
            hasPreconfiguredFormat: round1Format != null && stevne.stevne_fase !== "avsluttende",
          }),
        );
        bindBannerMenu(bannerSlot);
      }

      const activeTab = getActiveTab(container);

      if (hasGroupAssignment) {
        const standingHtml = renderStandingTable(standings, initialMatchesOrg, startNumberMap, {
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

      bannerSlot?.querySelector("#complete-tournament-btn")?.addEventListener("click", async () => {
        if (
          !(await confirmDialog({
            title: "Fullfør turnering",
            message: "Vil du fullføre turneringa? Dette kan ikkje angrast.",
            danger: true,
          }))
        )
          return;
        // Sort by gruppe so A gets 1..nA, B gets nA+1..nA+nB.
        // sortStandings mixes groups together; filtering preserves correct within-group order.
        const standingsByGroup = [
          ...standings.filter((r) => r.gruppe?.navn === "A"),
          ...standings.filter((r) => r.gruppe?.navn === "B"),
          ...standings.filter((r) => r.gruppe?.navn !== "A" && r.gruppe?.navn !== "B"),
        ];
        const { error: plErr } = await writePlacements(stevneid, standingsByGroup);
        if (plErr) {
          showToast("Feil ved lagring av plasseringar", "error");
          return;
        }
        const { error } = await setTournamentCompleted(stevneid);
        if (error) {
          showToast("Feil ved fullføring av turnering", "error");
          return;
        }
        await loadAndRender(container, stevneid);
      });

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
