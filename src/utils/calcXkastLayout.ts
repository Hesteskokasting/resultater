import { calcPuljeSizes } from "@/utils/calcPuljeSizes";
import { calcXkastCourtSizes } from "@/utils/calcXkastCourtSizes";

const MAX_PLAYERS_PER_COURT = 3;

/**
 * Full X-kast court layout: one array of court sizes per pulje.
 *
 * Without a lane cap everyone throws in one pulje as pairs (odd player
 * alone on the last court). With a lane cap the players are packed onto
 * the available courts directly — pairs while they fit, courts of 3 when
 * they don't — and puljer only appear when the count exceeds the physical
 * capacity of one wave (lanes × 3).
 */
export function calcXkastLayout(participantCount: number, lanes: number | null): number[][] {
  if (lanes == null) {
    const sizes = calcXkastCourtSizes(participantCount, false);
    return sizes.length ? [sizes] : [];
  }
  if (!Number.isInteger(lanes) || lanes < 1) {
    throw new Error(`lanes must be a positive integer, got ${lanes}`);
  }

  return calcPuljeSizes(participantCount, lanes * MAX_PLAYERS_PER_COURT).map((puljeSize) =>
    puljeSize <= lanes * 2
      ? calcXkastCourtSizes(puljeSize, true)
      : calcPuljeSizes(puljeSize, MAX_PLAYERS_PER_COURT),
  );
}
