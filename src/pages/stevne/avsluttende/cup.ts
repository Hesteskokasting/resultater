import { bindGroupAssignment, renderGroupAssignment } from "./gruppefordelingUi";
import { generateFinaleAndBronzeFinal } from "@/services/kampGenereringCupService";
import { openGenerateRoundDialog } from "./_avslCupGenererRundeDialog";
import { openThreeSideConfirmDialog } from "./_avslCupTreSpelarDialog";
import { showNumberpad } from "@/components/ScoreNumberpad";
import { sideScore, getAllMatchSides, type MatchSide } from "@/utils/kamp";
import { bindScoreboardClicks, sideNameHtml } from "../faseView";
import type { StandingRow } from "@/utils/stilling";
import { scoreboardButtonHtml } from "@/components/ScoreboardButton";
import { liveDotHtml } from "@/components/LivePill";
import { showScoreEditor } from "@/components/ScoreEditor";
import { escHtml } from "@/utils/escHtml";
import { groupBy } from "@/utils/groupBy";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import { type FinalMatchRow } from "@/services/kampService";
import {
  fetchCupSideTotals,
  rescoreCupMatch,
  settleCupMatch,
  writeCupSideScores,
  CUP_TIE_MESSAGE,
  type CupRescoreStep,
  type FinalMatchPlayerKnown,
} from "@/services/cupKampService";
import { updateTournamentPhase, setRound1Format } from "@/services/stevneService";
import { isInnledendeComplete } from "@/services/xkastKongelagService";
import { isXkastMethodName } from "@/utils/kastemetode";
import { setGroupAssignment, clearGroupAssignment } from "@/services/resultatService";
import { createFinalPhaseRenderer, type FinalPhaseVariant } from "./avsluttendeBase";

// ── Side helpers (Par/Mix: one side = a pair, grouped by startnummer) ─────────

function matchSides(
  kamp: FinalMatchRow,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
): MatchSide<FinalMatchPlayerKnown>[] {
  const rows = kamp.spelarar.filter((s): s is FinalMatchPlayerKnown => s.kasterid != null);
  return getAllMatchSides(rows, startNumberMap, positionMap);
}

function sideSum(side: MatchSide<FinalMatchPlayerKnown> | null, kamp: FinalMatchRow): number {
  return sideScore(side, kamp.er_bekreftet);
}

// ── Cup variant ───────────────────────────────────────────────────────────────

const cupVariant: FinalPhaseVariant = {
  channelName: (stevneid) => `stevne-avsl-cup-${stevneid}`,

  renderMatchesHtml: (ctx) => {
    const { finalMatches, standings, startNumberMap, positionMap, isTeam, isAdmin } = ctx;
    const groupNames = [
      ...new Set(standings.map((r) => r.gruppe?.navn).filter((n): n is string => n != null)),
    ].sort();
    const groupColumns = groupNames
      .map((g) => {
        const matches = finalMatches.filter((k) => k.gruppe_navn === g);
        const groupStanding = standings.filter((r) => r.gruppe?.navn === g);
        const activeCount = groupStanding.filter((r) => r.runde_eliminert == null).length;
        const totalCount = groupStanding.length;
        const lastRoundNr = matches.length ? Math.max(...matches.map((k) => k.runde_nummer)) : 0;
        const lastRound = matches.filter((k) => k.runde_nummer === lastRoundNr);
        const lastRoundCompleted =
          lastRound.length > 0 && lastRound.every((k) => k.er_bekreftet || k.er_walkover);
        const hasSemifinalInGroup = matches.some((k) => k.runde_navn === "Semifinale");
        const showGenerate =
          isAdmin &&
          (matches.length === 0 || lastRoundCompleted) &&
          activeCount > 1 &&
          !hasSemifinalInGroup;
        const lastRoundIsSemifinal =
          lastRound.length > 0 && lastRound.every((k) => k.runde_navn === "Semifinale");
        const hasFinaleInGroup = matches.some((k) => k.runde_navn === "Finale");
        const showGenerateFinale =
          isAdmin && lastRoundIsSemifinal && lastRoundCompleted && !hasFinaleInGroup;
        return renderGroupColumn(
          g,
          matches,
          activeCount,
          totalCount,
          lastRoundNr,
          showGenerate,
          showGenerateFinale,
          startNumberMap,
          positionMap,
          isTeam ? "par" : "spelarar",
          isAdmin,
        );
      })
      .join("");

    return `<div class="d-flex gap-3 flex-wrap">${groupColumns}</div>`;
  },

  bindMatchEvents: (container, ctx) => {
    if (!ctx.isAdmin && ctx.finalMatches.length === 0) return;
    bindMatchEventsLocal(
      container,
      ctx.stevneid,
      ctx.finalMatches,
      ctx.isAdmin,
      ctx.reload,
      ctx.startNumberMap,
      ctx.positionMap,
    );
  },

  renderSetupHtml: (ctx) => {
    const { stevne, isAdmin, round1Format, unitCount, standings } = ctx;
    const initNa = round1Format?.nA ?? null;

    if (stevne.stevne_fase === "avsluttende") {
      if (!isAdmin)
        return '<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>';
      return renderGroupAssignment(standings, {
        showPlayerList: true,
        initNa,
        initFormat: round1Format,
      });
    }

    if (!isAdmin) return "";

    if (unitCount < 2) {
      const message = stevne.kategori?.erlagbasert
        ? "Minst 2 par må vere oppretta før gruppefordelinga kan setjast."
        : "Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.";
      return `<p class="text-muted fst-italic">${message}</p>`;
    }

    const hasPlayers = standings.length > 0;
    return renderGroupAssignment(hasPlayers ? standings : unitCount, {
      showPlayerList: hasPlayers,
      initNa,
      initFormat: round1Format,
    });
  },

  bannerMeta: ({ standings, round1Format }) => {
    const nA = standings.filter((r) => r.gruppe?.navn === "A").length;
    const nB = standings.filter((r) => r.gruppe?.navn === "B").length;
    if (nA || nB) return `Cup - A:${nA} - B:${nB}`;
    // Not assigned yet — the configured split is the next best thing.
    if (round1Format?.nA != null)
      return `Cup - A:${round1Format.nA} - B:${standings.length - round1Format.nA}`;
    return "Cup";
  },

  bindHeaderEvents: (bannerSlot, ctx) => {
    const {
      container,
      stevneid,
      stevne,
      standings,
      results,
      round1Format,
      allInitialConfirmed,
      hasGroupAssignment,
      groupNameMap,
      reload,
    } = ctx;

    bannerSlot?.querySelector("#start-final-btn")?.addEventListener("click", async () => {
      if (!allInitialConfirmed) return;
      const { error } = await updateTournamentPhase(stevneid, "avsluttende");
      if (error) {
        showToast("Feil ved oppstart av avsluttande fase", "error");
        return;
      }

      if (round1Format?.nA != null) {
        const nA = round1Format.nA;
        const groupAId = groupNameMap["A"] ?? null;
        const groupBId = groupNameMap["B"] ?? null;
        const updates = buildGroupUpdates(standings, results, nA, groupAId, groupBId);
        const { error: grErr } = await setGroupAssignment(stevneid, updates);
        if (grErr) {
          showToast("Feil ved lagring av gruppefordeling: " + errorMessage(grErr), "error");
          return;
        }
      }

      await reload();
    });

    if (!hasGroupAssignment) {
      bindGroupAssignment(container, standings, async ({ nA, setupA, setupB }) => {
        const { error: fmtErr } = await setRound1Format(stevneid, { A: setupA, B: setupB, nA });
        if (fmtErr) {
          showToast("Feil ved lagring av format: " + errorMessage(fmtErr), "error");
          return;
        }

        // X-kast-family innledende (minimatch etc.) creates no kamp rows, so
        // #start-final-btn — gated on confirmed kamp rows — never appears to flip
        // the phase to 'avsluttende' the way it does for head-to-head innledende.
        // Mirror kongelag's start panel: flip it here once the innledende phase
        // is complete. Head-to-head is unaffected (not an X-kast method).
        let phase = stevne.stevne_fase;
        if (phase !== "avsluttende" && isXkastMethodName(stevne.kastemetodeInnl?.navn ?? "")) {
          const { data: innledendeDone } = await isInnledendeComplete(stevneid);
          if (!innledendeDone) {
            showToast("Fullfør den innleiande fasen før cupen kan startast", "error");
            return;
          }
          const { error: phaseErr } = await updateTournamentPhase(stevneid, "avsluttende");
          if (phaseErr) {
            showToast("Feil ved oppstart av avsluttande fase: " + errorMessage(phaseErr), "error");
            return;
          }
          phase = "avsluttende";
        }

        if (phase === "avsluttende") {
          const groupAId = groupNameMap["A"] ?? null;
          const groupBId = groupNameMap["B"] ?? null;
          const updates = buildGroupUpdates(standings, results, nA, groupAId, groupBId);
          const { error } = await setGroupAssignment(stevneid, updates);
          if (error) {
            showToast("Feil ved lagring av gruppefordeling: " + errorMessage(error), "error");
            return;
          }
        }

        showToast("Gruppefordeling lagra", "success");
        await reload();
      });
    }

    bannerSlot?.querySelector("#edit-group-assignment-btn")?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Tilbakestill gruppeinndeling",
          message: "Gruppefordeling og format vert fjerna.",
          danger: true,
        }))
      )
        return;
      await Promise.all([clearGroupAssignment(stevneid), setRound1Format(stevneid, null)]);
      await reload();
    });

    if (hasGroupAssignment) {
      container.querySelectorAll<HTMLElement>("[data-generate-group]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const groupName = btn.dataset.generateGroup ?? "";
          const round = parseInt(btn.dataset.runde ?? "1");
          const groupStanding = standings.filter((r) => r.gruppe?.navn === groupName);
          openGenerateRoundDialog(stevneid, groupName, groupStanding, round, round1Format, reload);
        });
      });

      container
        .querySelectorAll<HTMLButtonElement>("[data-generate-finale-group]")
        .forEach((btn) => {
          btn.addEventListener("click", async () => {
            const groupName = btn.dataset.generateFinaleGroup ?? "";
            btn.disabled = true;
            btn.textContent = "Genererer…";
            try {
              await generateFinaleAndBronzeFinal(stevneid, groupName);
              await reload();
            } catch (e) {
              logError("cup:genererFinale", e);
              showToast("Feil ved generering av finale", "error");
              btn.disabled = false;
              btn.textContent = "Generer finale";
            }
          });
        });
    }
  },
};

export const render = createFinalPhaseRenderer(cupVariant);

// ── Group assignment (Par/Mix: both members of a pair get the gruppe) ─────────

function buildGroupUpdates(
  standings: StandingRow[],
  results: { kasterid: number; startnummer: number | null }[],
  nA: number,
  groupAId: number | null,
  groupBId: number | null,
): { kasterid: number; gruppeid: number | null }[] {
  return standings.flatMap((r, i) => {
    const gruppeid = i < nA ? groupAId : (groupBId ?? groupAId);
    const members =
      r.startnummer != null
        ? results.filter((x) => x.startnummer === r.startnummer).map((x) => x.kasterid)
        : [];
    const kasterids = members.length ? members : [r.kasterid];
    return kasterids.map((kasterid) => ({ kasterid, gruppeid }));
  });
}

// ── Group column rendering ────────────────────────────────────────────────────

function renderGroupColumn(
  groupName: string,
  matches: FinalMatchRow[],
  _activeCount: number,
  totalCount: number,
  lastRoundNr: number,
  showGenerate: boolean,
  showGenerateFinale: boolean,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
  unitLabel: string,
  isAdminLocal = true,
): string {
  const roundsHtml = [...groupBy(matches, (k) => k.runde_nummer)]
    .reverse()
    .map(([nr, roundMatches]) => {
      const title = roundMatches[0]?.runde_navn ?? `Runde ${nr}`;
      const visibleMatches = roundMatches.filter((k) => !k.er_walkover);
      if (!visibleMatches.length) return "";
      return `
      <h6 class="fw-bold text-center mb-1">${escHtml(title)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${visibleMatches.map((k) => renderMatchBlock(k, startNumberMap, positionMap, isAdminLocal)).join("")}
      </div>`;
    })
    .join("");

  const nextRound = lastRoundNr + 1;
  const generateButton = showGenerate
    ? `<button class="btn btn-success w-100 mt-2"
         data-generate-group="${escHtml(groupName)}" data-runde="${nextRound}">
         Generer runde ${nextRound}
       </button>`
    : "";
  const generateFinaleButton = showGenerateFinale
    ? `<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${escHtml(groupName)}">
         Generer finale
       </button>`
    : "";

  return `
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${escHtml(groupName)} (${totalCount} ${escHtml(unitLabel)})</h6>
      ${generateButton}
      ${generateFinaleButton}
      ${roundsHtml}
    </div>`;
}

interface MatchBlockFlags {
  isConfirmed: boolean;
  hasRounds: boolean;
  canEditScore: boolean;
  isThreeSides: boolean;
}

/**
 * One unit's row: name left, score in a fixed cell right. A confirmed match
 * carries its result as colour — winner green, loser red — which is the only
 * signal that the match is settled.
 */
function sideRowHtml(
  kamp: FinalMatchRow,
  side: MatchSide<FinalMatchPlayerKnown>,
  nSides: number,
  flags: MatchBlockFlags,
): string {
  const tot = sideSum(side, kamp);
  const score =
    tot > 0 || (flags.isConfirmed && !flags.isThreeSides) || flags.hasRounds ? tot : "—";
  const matchPlacement = side.rep.kamp_plassering;
  const isEliminated = kamp.er_bekreftet && matchPlacement != null && matchPlacement >= nSides;
  const isAdvancing = kamp.er_bekreftet && matchPlacement != null && matchPlacement < nSides;
  const rowCss = isEliminated ? " cup-row--tapar" : isAdvancing ? " cup-row--vinnar" : "";
  const scoreCss = `cup-row__score${flags.canEditScore ? " score-editable" : ""}`;
  const scoreAttr = flags.canEditScore ? ` data-endre-score="${kamp.id}"` : "";
  return `<div class="cup-row${rowCss}">
      <span class="cup-row__name">${sideNameHtml(side, false)}</span>
      <span class="${scoreCss}"${scoreAttr}>${score}</span>
    </div>`;
}

function playerRowsHtml(
  kamp: FinalMatchRow,
  sides: MatchSide<FinalMatchPlayerKnown>[],
  flags: MatchBlockFlags,
): string {
  if (kamp.er_walkover) {
    return `<div class="cup-row">
        <span class="cup-row__name">${sideNameHtml(sides[0] ?? null, false)} <span class="badge bg-secondary">Walkover</span></span>
        <span class="cup-row__score">—</span>
      </div>`;
  }
  return sides.map((side) => sideRowHtml(kamp, side, sides.length, flags)).join("");
}

function renderMatchBlock(
  kamp: FinalMatchRow,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
  isAdminLocal = true,
): string {
  const sides = matchSides(kamp, startNumberMap, positionMap);

  const isConfirmed = kamp.er_bekreftet || kamp.er_walkover;
  const hasRounds = kamp.spelarar.some((s) => (s.omgangar?.length ?? 0) > 0);
  const flags: MatchBlockFlags = {
    isConfirmed,
    hasRounds,
    // Clicking the score both enters it and settles the match. A confirmed
    // match with live omgangar belongs to the scoreboard, not the numberpad.
    canEditScore:
      isAdminLocal &&
      !kamp.er_tre_spelarar &&
      !kamp.er_walkover &&
      (!kamp.er_bekreftet || !hasRounds),
    isThreeSides: kamp.er_tre_spelarar,
  };

  // A match settled without the scoreboard has no omgangar to look at, so its
  // scoreboard would open empty; one played on it stays worth opening.
  const scoreboardBtn =
    isAdminLocal && !(isConfirmed && !hasRounds) ? scoreboardButtonHtml(kamp.id) : "";
  // A 3-unit match carries no score of its own — the placement dialog settles it.
  const placementBtn =
    isAdminLocal && kamp.er_tre_spelarar
      ? `<div class="cup-card__footer">
          <button class="btn ${isConfirmed ? "btn-secondary" : "btn-outline-secondary"} btn-sm" id="bekrft-${kamp.id}">${isConfirmed ? "Endre plassering" : "Sett plassering"}</button>
        </div>`
      : "";

  return `
    <div class="cup-card">
      <div class="cup-card__header">
        <span class="cup-card__lane">Bane ${kamp.bane_nummer}</span>
        ${scoreboardBtn}
        ${hasRounds && !isConfirmed ? liveDotHtml("cup-card__live") : ""}
      </div>
      <div class="cup-card__rows">${playerRowsHtml(kamp, sides, flags)}</div>
      ${placementBtn}
    </div>`;
}

// ── Match event binding ───────────────────────────────────────────────────────

/** Blocks a draw at the pad, before the editor deletes any omgang detail. */
function noTie(s1: number, s2: number): string | null {
  return s1 === s2 ? CUP_TIE_MESSAGE : null;
}

const RESCORE_ERROR: Record<CupRescoreStep, string> = {
  uavgjort: CUP_TIE_MESSAGE,
  omgangar: "DB-feil ved sletting av omgangar",
  score: "DB-feil ved oppdatering av score",
  plassering: "DB-feil ved oppdatering av plassering",
  bracket: "DB-feil ved oppdatering av cupstigen",
};

function bindMatchEventsLocal(
  container: HTMLElement,
  stevneid: number,
  finalMatches: FinalMatchRow[],
  isAdminLocal: boolean,
  reload: () => Promise<void>,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
): void {
  bindScoreboardClicks(container);
  for (const kamp of finalMatches) {
    const sides = matchSides(kamp, startNumberMap, positionMap);
    const side1 = sides[0] ?? null;
    const side2 = sides[1] ?? null;
    const p1Name = sideNameHtml(side1, false);
    const p2Name = sideNameHtml(side2, false);
    const playerIds = sides.flatMap((s) => s.members.map((m) => m.id));

    /** Unconfirmed: entering the score settles the match, no separate Bekreft step. */
    const scoreAndConfirm = (): void => {
      void showScoreEditor({
        side1Name: p1Name,
        side2Name: p2Name,
        currentS1: sideSum(side1, kamp),
        currentS2: sideSum(side2, kamp),
        baneLabel: `Bane ${kamp.bane_nummer ?? "?"}`,
        rundeLabel: kamp.runde_navn ?? `Runde ${kamp.runde_nummer}`,
        playerIds,
        hasRounds: kamp.spelarar.some((s) => (s.omgangar?.length ?? 0) > 0),
        logPrefix: "cup",
        validate: noTie,
        onSave: (newS1, newS2) => writeCupSideScores(side1, side2, newS1, newS2),
        onSaved: async () => {
          if (!(await confirmCupMatch2Sides(stevneid, kamp, sides, reload))) await reload();
        },
      });
    };

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener("click", () => {
      openThreeSideConfirmDialog(kamp, sides, stevneid, reload);
    });

    if (isAdminLocal && !kamp.er_tre_spelarar && !kamp.er_walkover) {
      /** Confirmed: a correction, so the placements and the bracket move with it. */
      const rescore = (): void => {
        showNumberpad(
          [
            { name: p1Name, score: sideSum(side1, kamp) },
            { name: p2Name, score: sideSum(side2, kamp) },
          ],
          async ([newS1 = 0, newS2 = 0]) => {
            const { error, step } = await rescoreCupMatch({
              stevneId: stevneid,
              kamp,
              sides,
              s1: newS1,
              s2: newS2,
            });
            if (error) {
              logError(`cup:rescore:${step}`, error);
              showToast(RESCORE_ERROR[step ?? "score"], "error");
              return false;
            }
            await reload();
            return true;
          },
          {
            baneLabel: `Bane ${kamp.bane_nummer ?? "?"}`,
            rundeLabel: kamp.runde_navn ?? `Runde ${kamp.runde_nummer}`,
          },
        );
      };
      const onScoreClick = kamp.er_bekreftet ? rescore : scoreAndConfirm;
      container
        .querySelectorAll<HTMLElement>(`[data-endre-score="${kamp.id}"]`)
        .forEach((cell) => cell.addEventListener("click", onScoreClick));
    }
  }
}

// ── Confirm 2-side cup match (Singel: 2 players; Par/Mix: 2 pairs) ────────────

async function confirmCupMatch2Sides(
  stevneid: number,
  kamp: FinalMatchRow,
  sides: MatchSide<FinalMatchPlayerKnown>[],
  reload: () => Promise<void>,
): Promise<boolean> {
  const { s1, s2 } = await fetchCupSideTotals(kamp.id, sides[0] ?? null, sides[1] ?? null);

  // A draw — 0–0 included — is refused by settleCupMatch, so the message it
  // returns is what the arrangør needs to see here.
  const { error } = await settleCupMatch({ stevneId: stevneid, kamp, sides, s1, s2 });
  if (error) {
    showToast(errorMessage(error), "error");
    return false;
  }

  await reload();
  return true;
}
