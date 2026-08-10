// Seat-level scoring state for X-kast/Kongelag courts. Pure — the view passes
// service rows straight in (CourtRow/CourtParticipantRow are structurally
// compatible with these shapes).

export interface CourtSeat {
  totalsum_manuelt: boolean;
  omgangar: unknown[];
}

export interface SeatCourt {
  er_bekreftet: boolean;
}

/**
 * A seat is unscored when it carries neither omganger nor a manual total. Both
 * forms of score live on the SEAT — omgang rows hang off it, a manual total sits
 * in its own poeng/antall_ringer with no omgang rows at all — so a check for
 * omganger alone silently misses manual totals. Single definition of "nothing
 * recorded here yet"; the guards in swap_xkast_kongelag_deltaker mirror it.
 */
export function isSeatUnscored(seat: CourtSeat): boolean {
  return !seat.totalsum_manuelt && seat.omgangar.length === 0;
}

/**
 * Row-level swap eligibility, matching what swap_xkast_kongelag_deltaker will
 * accept: an open court and an unscored seat. The swap rewrites the seat's
 * kasterid, so a scored seat would hand its score to the other player. Callers
 * still check the admin role and that the two seats sit on different courts.
 */
export function canSwapSeat(court: SeatCourt, seat: CourtSeat): boolean {
  return !court.er_bekreftet && isSeatUnscored(seat);
}
