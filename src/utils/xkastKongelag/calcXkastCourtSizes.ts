/**
 * Splits one pulje into X-kast courts: every court holds 2 players (two
 * throwers score simultaneously on a court). An odd participant count puts
 * the remainder on the last court — 1 player when lanes are unlimited
 * (`hasLaneCap` false, an extra court is free), 3 when a lane cap is set
 * (a lone leftover joins the final pair to conserve courts).
 */
export function calcXkastCourtSizes(participantCount: number, hasLaneCap: boolean): number[] {
  if (!Number.isInteger(participantCount) || participantCount < 0) {
    throw new Error(`participantCount must be a non-negative integer, got ${participantCount}`);
  }
  if (participantCount === 0) return [];
  if (participantCount === 1) return [1];

  const isOdd = participantCount % 2 === 1;
  if (!isOdd) return Array.from({ length: participantCount / 2 }, () => 2);

  const lastCourt = hasLaneCap ? 3 : 1;
  const pairCourts = (participantCount - lastCourt) / 2;
  return [...Array.from({ length: pairCourts }, () => 2), lastCourt];
}
