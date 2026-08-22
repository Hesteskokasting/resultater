import type { MatchRow } from "@/services/kampService";
import type { BoardConfig, ScoreboardSide } from "@/components/scoreboard/Scoreboard";
import { deleteMatchRounds } from "@/services/kampService";
import {
  calcRingCount,
  getOmgangStarterIndex,
  matchIsDecided,
  pointButtonLocks,
} from "@/utils/kamp";
import { createEl } from "@/utils/createEl";
import {
  loadDuelRounds,
  saveOmgang,
  setupScoreboardRealtime,
  type DuelRound,
} from "@/components/scoreboard/scoreboardData";
import {
  bindPointButtons,
  confirmButtonEl,
  confirmUndo,
  nextButtonEl,
  playerPanelEl,
  pointButtonsEl,
  ringInfoEl,
  setOmgangTitle,
  undoRowEl,
} from "@/components/scoreboard/scoreboardUi";
import { showToast } from "@/components/Toast";

/**
 * The duel: two sides racing to the phase target, with handicap and ring
 * statistics. One omgang is entered at a time and saved as a whole, so the
 * board only ever holds the current selection.
 */
export async function renderTwoPlayerScoreboard(
  container: HTMLElement,
  kamp: MatchRow,
  sides: [ScoreboardSide, ScoreboardSide],
  config: BoardConfig,
): Promise<() => void> {
  const { pointValues, canEdit, onBekreft, onKampBekreft, omgangEl } = config;
  const allIds = sides.flatMap((side) => side.ids);

  let rounds: DuelRound[] = [];
  let selected: (number | null)[] = [null, null];
  let matchOver = kamp.er_bekreftet || kamp.er_walkover;

  await reload();
  render();

  const cleanup = setupScoreboardRealtime(
    kamp,
    allIds,
    async () => {
      await reload();
      render();
    },
    onKampBekreft,
  );

  async function reload(): Promise<void> {
    rounds = await loadDuelRounds(sides[0].ids, sides[1].ids);
    const [t1, t2] = effectiveTotals();
    matchOver = matchIsDecided(t1, t2, kamp.fase) || kamp.er_bekreftet || kamp.er_walkover;
  }

  /** Totals with handicap — what the panels show and what decides the kamp. */
  function effectiveTotals(): [number, number] {
    const sum = (pick: (r: DuelRound) => number): number => rounds.reduce((s, r) => s + pick(r), 0);
    return [sum((r) => r.s1) + sides[0].hcp, sum((r) => r.s2) + sides[1].hcp];
  }

  function ringTotals(): [number, number] {
    return [rounds.reduce((s, r) => s + r.r1, 0), rounds.reduce((s, r) => s + r.r2, 0)];
  }

  function nextOmgang(): number {
    return (rounds[rounds.length - 1]?.omgang ?? 0) + 1;
  }

  function canConfirm(): boolean {
    return matchOver && !kamp.er_bekreftet && canEdit && !!onBekreft;
  }

  function render(): void {
    container.innerHTML = "";

    const totals = effectiveTotals();
    const ringer = ringTotals();
    const locks = pointButtonLocks(selected, pointValues);
    const maxRinger = rounds.length * 2;
    const starterIdx = matchOver ? -1 : getOmgangStarterIndex(nextOmgang(), 2);

    setOmgangTitle(omgangEl, {
      confirmed: kamp.er_bekreftet,
      finished: matchOver,
      next: nextOmgang(),
    });

    const wrap = createEl("div", null, "sb-wrap");
    sides.forEach((side, i) => {
      wrap.appendChild(
        playerPanelEl({
          label: side.label,
          isPairLabel: side.isPairLabel,
          isStarter: i === starterIdx,
          total: totals[i] ?? 0,
          detail: ringInfoEl(ringer[i] ?? 0, maxRinger),
          buttons: canEdit
            ? pointButtonsEl({
                values: pointValues,
                index: i,
                selected: selected[i] ?? null,
                locked: locks[i],
              })
            : null,
        }),
      );
    });
    container.appendChild(wrap);

    if (canEdit && !kamp.er_bekreftet)
      container.appendChild(undoRowEl(rounds.length > 0, undoLast));

    if (canConfirm()) {
      container.appendChild(confirmButtonEl(() => onBekreft!()));
    } else if (canEdit) {
      const hasPick = selected.some((v) => v !== null);
      container.appendChild(nextButtonEl(!(hasPick && !matchOver), advance));
    }

    bindPointButtons(container, (i, value) => {
      selected[i] = selected[i] === value ? null : value;
      render();
    });
  }

  async function advance(): Promise<void> {
    const omgang = nextOmgang();
    const [s1 = 0, s2 = 0] = sides.map((_, i) => selected[i] ?? 0);
    const { error } = await saveOmgang(omgang, [
      { ids: sides[0].ids, score: s1 },
      { ids: sides[1].ids, score: s2 },
    ]);
    if (error) {
      showToast("Feil ved lagring", "error");
      return;
    }

    rounds.push({ omgang, s1, s2, r1: calcRingCount(s1), r2: calcRingCount(s2) });
    const [t1, t2] = effectiveTotals();
    matchOver = matchIsDecided(t1, t2, kamp.fase);
    selected = [null, null];
    render();
  }

  async function undoLast(): Promise<void> {
    const last = rounds[rounds.length - 1];
    if (!last) return;
    if (!(await confirmUndo(last.omgang, [last.s1, last.s2]))) return;

    const { error } = await deleteMatchRounds(allIds, last.omgang);
    if (error) {
      showToast("Feil ved angring", "error");
      return;
    }
    await reload();
    selected = [null, null];
    render();
  }

  return cleanup;
}
