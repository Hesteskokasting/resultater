/**
 * Splits one pulje into X-kast courts: every court holds 2 players, except
 * the last court which takes 3 when the count is odd (a lone leftover player
 * joins the final pair instead of throwing alone). A single participant is
 * the only case that yields a court of 1.
 */
export function calcXkastCourtSizes(participantCount: number): number[] {
  if (!Number.isInteger(participantCount) || participantCount < 0) {
    throw new Error(`participantCount must be a non-negative integer, got ${participantCount}`)
  }
  if (participantCount === 0) return []
  if (participantCount === 1) return [1]

  const isOdd = participantCount % 2 === 1
  const pairCourts = (participantCount - (isOdd ? 3 : 0)) / 2
  return [...Array.from({ length: pairCourts }, () => 2), ...(isOdd ? [3] : [])]
}
