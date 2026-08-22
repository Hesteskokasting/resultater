import type { MatchRoundRow, MatchRow } from "@/services/kampService";
import type { BoardConfig, ScoreboardSide } from "@/components/scoreboard/Scoreboard";
import { getOmgangStarterIndex, pointButtonLocks } from "@/utils/kamp";
import { createEl } from "@/utils/createEl";
import {
  computeWinOrder,
  lastOmgangNumber,
  loadRounds,
  roundFor,
  saveOmgang,
  setupScoreboardRealtime,
  sideTotal,
} from "@/components/scoreboard/scoreboardData";
import {
  bindPointButtons,
  confirmButtonEl,
  nextButtonEl,
  placeBadgeEl,
  playerPanelEl,
  pointButtonsEl,
  setOmgangTitle,
  undoLastOmgang,
  undoRowEl,
} from "@/components/scoreboard/scoreboardUi";
import { showToast } from "@/components/Toast";

/**
 * Deliberately a separate board, not a generalization of the duel. A cup match
 * of three is a placement race — sides drop out one by one and get a rank —
 * where a duel is a race to 21 with handicap and ring statistics. They share a
 * visual language and the modules beside this one, nothing else: merging them
 * would take six config flags to keep the two behaviours apart.
 */
export async function renderThreePlayerScoreboard(
  container: HTMLElement,
  kamp: MatchRow,
  sides: ScoreboardSide[],
  config: BoardConfig,
): Promise<() => void> {
  const { pointValues, canEdit, onBekreft, onKampBekreft, omgangEl } = config;
  const sideIds = sides.map((side) => side.ids);
  const allIds = sideIds.flat();

  let rounds: MatchRoundRow[] = [];
  let winOrder: number[] = [];
  /** Last omgang each side played, so the starter rotation skips finished sides. */
  let finishedAtOmgang: (number | null)[] = sides.map(() => null);
  const selected: (number | null)[] = sides.map(() => null);

  await reload();

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
    rounds = await loadRounds(allIds);
    const outcome = computeWinOrder(rounds, sideIds);
    winOrder = outcome.order;
    finishedAtOmgang = outcome.finishedAtOmgang;
  }

  /** Reload, drop the half-entered omgang, redraw — what every write ends with. */
  async function refresh(): Promise<void> {
    await reload();
    selected.fill(null);
    render();
  }

  function activeIdxar(): number[] {
    return sides.map((_, i) => i).filter((i) => !winOrder.includes(i));
  }

  function nextOmgang(): number {
    return lastOmgangNumber(rounds) + 1;
  }

  function statusFooterEl(isFinished: boolean): HTMLElement | null {
    if (isFinished && !kamp.er_bekreftet && onBekreft && canEdit) {
      return confirmButtonEl(() => onBekreft(winOrder.map((i) => sides[i]!.ks!.kasterid)));
    }
    if (kamp.er_bekreftet) return createEl("div", "Kamp fullført", "alert alert-success mt-2");
    return null;
  }

  function render(): void {
    container.innerHTML = "";

    const active = activeIdxar();
    const isFinished = winOrder.length === sides.length;
    const locks = pointButtonLocks(selected, pointValues, active);
    const starterIdx = isFinished
      ? -1
      : getOmgangStarterIndex(nextOmgang(), sides.length, finishedAtOmgang);

    setOmgangTitle(omgangEl, {
      confirmed: kamp.er_bekreftet,
      finished: isFinished,
      next: nextOmgang(),
    });

    const wrap = createEl("div", null, "sb-wrap sb-wrap--3p");
    sides.forEach((side, i) => {
      const place = winOrder.indexOf(i);
      const canPick = active.includes(i) && canEdit && !kamp.er_bekreftet;
      wrap.appendChild(
        playerPanelEl({
          label: side.label,
          isPairLabel: side.isPairLabel,
          isStarter: i === starterIdx && active.includes(i),
          total: sideTotal(rounds, side.ids),
          hasFinished: place >= 0,
          detail: place >= 0 ? placeBadgeEl(place + 1) : null,
          buttons: canPick
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

    if (canEdit && !kamp.er_bekreftet) {
      container.appendChild(undoRowEl(rounds.length > 0, undoLast));
      if (!isFinished) {
        const hasPick = active.some((i) => selected[i] !== null);
        container.appendChild(nextButtonEl(!hasPick, advance));
      }
    }

    const footer = statusFooterEl(isFinished);
    if (footer) container.appendChild(footer);

    bindPointButtons(container, selected, render);
  }

  async function advance(): Promise<void> {
    const omgang = nextOmgang();
    const { error } = await saveOmgang(
      omgang,
      activeIdxar().map((i) => ({ ids: sideIds[i] ?? [], score: selected[i] ?? 0 })),
    );
    if (error) {
      showToast("Feil ved lagring", "error");
      return;
    }
    await refresh();
  }

  async function undoLast(): Promise<void> {
    if (!rounds.length) return;
    const omgang = lastOmgangNumber(rounds);
    const scorar = sides
      .map((side) => roundFor(rounds, side.ids, omgang)?.score ?? null)
      .filter((score): score is number => score !== null);
    if (!(await undoLastOmgang(allIds, omgang, scorar))) return;

    await refresh();
  }

  render();

  return cleanup;
}
