import { validRound1Setups } from "@/utils/kastemetoder-logikk";
import {
  renderGroupAssignment,
  renderGroupPreview,
  renderGroupPanelContent,
  renderStructureListHtml,
} from "@/organizer/gruppefordelingUi";
import { generateFinaleAndBronzeFinal } from "@/services/kampGenereringCupService";
import { openGenerateRoundDialog } from "./_avslCupGenererRundeDialog";
import { openThreeSideConfirmDialog } from "./_avslCupTreSpelarDialog";
import { showNumberpad } from "@/components/ScoreNumberpad";
import { matchScoreForPlayer, sideScore, getAllMatchSides, type MatchSide } from "@/utils/kamp";
import { bindScoreboardClicks, sideNameHtml, type StandingRow } from "@/organizer/org-shared";
import { scoreboardButtonHtml } from "@/components/ScoreboardButton";
import { showScoreEditor } from "@/organizer/scoreEditor";
import { escHtml } from "@/utils/escHtml";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import type { RoundSetup } from "@/types";
import {
  confirmMatch,
  toConfirmSide,
  updateWinnerLoser,
  updateMatchPlayerScoreFast,
  deleteMatchRounds,
  getMatchPlayers,
  setMatchPlayerPlacements,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from "@/services/kampService";
import { updateTournamentPhase, setRound1Format } from "@/services/stevneService";
import { isInnledendeComplete } from "@/services/xkastKongelagService";
import { isXkastMethodName } from "@/utils/kastemetode";
import { setGroupAssignment, clearGroupAssignment } from "@/services/resultatService";
import { createFinalPhaseRenderer, type FinalPhaseVariant } from "./avsluttendeBase";

// ── Side helpers (Par/Mix: one side = a pair, grouped by startnummer) ─────────

type FinalMatchPlayerKnown = FinalMatchPlayerRow & { kasterid: number };

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
      const n =
        parseInt(
          container.querySelector<HTMLElement>("#group-assignment-wrapper")?.dataset.n ?? "0",
        ) || standings.length;

      function readSelectedSetup(radioName: string, nGroup: number): RoundSetup | null {
        const selectedRadio = container.querySelector<HTMLInputElement>(
          `input[name="${radioName}"]:checked`,
        );
        if (selectedRadio?.dataset.oppsett) {
          try {
            return JSON.parse(selectedRadio.dataset.oppsett) as RoundSetup;
          } catch {
            /* fall through */
          }
        }
        return validRound1Setups(nGroup)[0] ?? null;
      }

      function updateGroupPreview(
        nA: number,
        setupA: RoundSetup | null,
        setupB: RoundSetup | null,
      ): void {
        const prevEl = container.querySelector("#group-preview");
        if (!prevEl) return;
        prevEl.innerHTML = renderGroupPreview(
          standings.map((r, i) => ({ ...r, cupPlassering: i + 1 })),
          nA,
          setupA?.walkovers ?? 0,
          setupB?.walkovers ?? 0,
        );
      }

      const panelsEl = container.querySelector<HTMLElement>("#group-panels");
      if (panelsEl) {
        panelsEl.addEventListener("change", (e) => {
          const target = e.target as HTMLInputElement;
          if (!target.matches('input[name^="round1-format"]')) return;
          const nA = parseInt(
            container.querySelector<HTMLInputElement>('input[name="group-split"]:checked')?.value ??
              String(n),
          );
          const nB = n - nA;
          const setupA = readSelectedSetup("round1-format-a", nA);
          const setupB = readSelectedSetup("round1-format-b", nB);
          if (target.name === "round1-format-a") {
            const strEl = container.querySelector("#structure-a");
            if (strEl) strEl.outerHTML = renderStructureListHtml(nA, setupA, "a");
          } else {
            const strEl = container.querySelector("#structure-b");
            if (strEl) strEl.outerHTML = renderStructureListHtml(nB, setupB, "b");
          }
          updateGroupPreview(nA, setupA, setupB);
        });
      }

      container.querySelectorAll<HTMLInputElement>('input[name="group-split"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          const nA = parseInt(radio.value);
          const nB = n - nA;
          const setupA = validRound1Setups(nA)[0] ?? null;
          const setupB = nB >= 2 ? (validRound1Setups(nB)[0] ?? null) : null;
          if (panelsEl) {
            panelsEl.innerHTML =
              `<div id="group-panel-a" class="final-group-col">
                ${renderGroupPanelContent("Gruppe A", nA, "round1-format-a", setupA)}
              </div>` +
              (nB >= 2
                ? `<div id="group-panel-b" class="final-group-col">
                ${renderGroupPanelContent("Gruppe B", nB, "round1-format-b", setupB)}
              </div>`
                : "");
          }
          updateGroupPreview(nA, setupA, setupB);
        });
      });

      container.querySelector("#confirm-group-btn")?.addEventListener("click", async () => {
        const selected = container.querySelector<HTMLInputElement>(
          'input[name="group-split"]:checked',
        );
        if (!selected) return;
        const nA = parseInt(selected.value);
        const nB = n - nA;
        const setupA = readSelectedSetup("round1-format-a", nA);
        const setupB = nB >= 2 ? readSelectedSetup("round1-format-b", nB) : null;
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
  const roundMap = new Map<number, FinalMatchRow[]>();
  for (const k of matches) {
    if (!roundMap.has(k.runde_nummer)) roundMap.set(k.runde_nummer, []);
    roundMap.get(k.runde_nummer)!.push(k);
  }

  const roundsHtml = [...roundMap.entries()]
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
        ${hasRounds && !isConfirmed ? '<span class="live-prikk cup-card__live"></span>' : ""}
      </div>
      <div class="cup-card__rows">${playerRowsHtml(kamp, sides, flags)}</div>
      ${placementBtn}
    </div>`;
}

// ── Match event binding ───────────────────────────────────────────────────────

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
    const p1 = side1?.rep ?? null;
    const p2 = side2?.rep ?? null;
    const p1Name = sideNameHtml(side1, false);
    const p2Name = sideNameHtml(side2, false);
    const playerIds = sides.flatMap((s) => s.members.map((m) => m.id));

    // Quick-score writes the side total to the rep; partner rows are zeroed
    // so the side sum is not polluted by stale per-player values.
    const writeSideScore = async (
      newS1: number,
      newS2: number,
    ): Promise<{ error: unknown } | null> => {
      const updates: Promise<{ error: unknown }>[] = [];
      if (p1?.id) updates.push(updateMatchPlayerScoreFast(p1.id, newS1));
      if (p2?.id) updates.push(updateMatchPlayerScoreFast(p2.id, newS2));
      for (const side of [side1, side2]) {
        for (const member of side?.members.slice(1) ?? []) {
          updates.push(updateMatchPlayerScoreFast(member.id, 0));
        }
      }
      try {
        const results = await Promise.all(updates);
        return results.find((r) => r.error) ?? null;
      } catch (e) {
        logError("cup:writeSideScore", e);
        return { error: e };
      }
    };

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
        onSave: writeSideScore,
        onSaved: async () => {
          if (!(await confirmCupMatch2Sides(stevneid, kamp, sides, reload))) await reload();
        },
      });
    };

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener("click", () => {
      openThreeSideConfirmDialog(kamp, sides, stevneid, reload);
    });

    if (isAdminLocal && !kamp.er_tre_spelarar && !kamp.er_walkover) {
      const allKasterids = sides.flatMap((s) => s.members.map((m) => m.kasterid));
      /** Confirmed: a correction, so the placements and the bracket move with it. */
      const rescore = (): void => {
        showNumberpad(
          [
            { name: p1Name, score: sideSum(side1, kamp) },
            { name: p2Name, score: sideSum(side2, kamp) },
          ],
          async ([newS1 = 0, newS2 = 0]) => {
            if (playerIds.length) {
              const { error } = await deleteMatchRounds(playerIds);
              if (error) {
                showToast("DB-feil ved sletting av omgangar", "error");
                return false;
              }
            }
            const feil = await writeSideScore(newS1, newS2);
            if (feil) {
              showToast("DB-feil ved oppdatering av score", "error");
              return false;
            }
            const newWinner = newS1 >= newS2 ? side1 : side2;
            const newLoser = newS1 >= newS2 ? side2 : side1;
            const newWinnerIds = newWinner?.members.map((m) => m.kasterid) ?? [];
            const newLoserIds = newLoser?.members.map((m) => m.kasterid) ?? [];
            const newPlacements = [
              ...newWinnerIds.map((kasterid) => ({ kasterid, plassering: 1 })),
              ...newLoserIds.map((kasterid) => ({ kasterid, plassering: 2 })),
            ];
            const { error: plErr } = await setMatchPlayerPlacements(kamp.id, newPlacements);
            if (plErr) {
              showToast("DB-feil ved oppdatering av plassering", "error");
              return false;
            }
            await updateWinnerLoser({
              stevneId: stevneid,
              roundNumber: kamp.runde_nummer,
              roundName: kamp.runde_navn,
              allThrowerIds: allKasterids,
              newWinnerIds,
              newLoserIds,
            });
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
  const side1 = sides[0] ?? null;
  const side2 = sides[1] ?? null;

  // Re-fetch fresh scores — the rendered rows may be stale. The match is still
  // unconfirmed here, so the live omgangar decide the result.
  const { data: currentPlayers } = await getMatchPlayers(kamp.id);
  const freshSideSum = (side: MatchSide<FinalMatchPlayerKnown> | null): number =>
    side?.members.reduce((sum, m) => {
      const fresh = currentPlayers.find((s) => s.id === m.id);
      return sum + matchScoreForPlayer(fresh ?? m, false);
    }, 0) ?? 0;

  const s1 = freshSideSum(side1);
  const s2 = freshSideSum(side2);

  if (
    s1 === 0 &&
    s2 === 0 &&
    !(await confirmDialog({
      title: "Ingen score registrert",
      message: "Vil du bekrefte kampen likevel?",
    }))
  )
    return false;

  const winner = s1 >= s2 ? side1 : side2;
  const loser = s1 >= s2 ? side2 : side1;
  const allKasterids = sides.flatMap((s) => s.members.map((m) => m.kasterid));

  const { error } = await confirmMatch({
    kampId: kamp.id,
    sides: [toConfirmSide(side1), toConfirmSide(side2)],
    outcome: {
      type: "cup-ranked",
      stevneId: stevneid,
      roundNumber: kamp.runde_nummer,
      roundName: kamp.runde_navn,
      allThrowerIds: allKasterids,
      eliminatedIds: loser?.members.map((m) => m.kasterid) ?? [],
      advancingSides: winner ? [winner.members.map((m) => m.kasterid)] : [],
    },
  });
  if (error) {
    showToast("DB-feil ved bekreft", "error");
    return false;
  }

  await reload();
  return true;
}
