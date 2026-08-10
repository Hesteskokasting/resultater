/**
 * Digit entry for the score numberpads. The pads hold what has been typed as a
 * string so "" (untouched) stays distinguishable from "0" (typed a zero); these
 * are the transitions on that string, kept free of the DOM so the caps are
 * testable on their own.
 */

/**
 * Types one digit, capped at `max`. A leading zero is replaced rather than
 * extended, so 0 → 7 reads 7 and not 07. Returns `current` unchanged when the
 * digit would take the value past the cap.
 */
export function appendDigit(current: string, digit: string, max: number): string {
  const next = current === "0" ? digit : current + digit;
  return parseInt(next) > max ? current : next;
}

/** Deletes the last digit. Emptying is fine — the pad shows a placeholder 0. */
export function dropDigit(current: string): string {
  return current.slice(0, -1);
}

/** The typed value, with an untouched pad reading 0. */
export function digitValue(current: string): number {
  return parseInt(current || "0");
}
