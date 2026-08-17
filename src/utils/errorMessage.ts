const UNKNOWN = "Ukjend feil";

/**
 * Human-readable message from any error value.
 *
 * Supabase's PostgrestError is a plain object rather than an Error instance, so
 * String(err) would yield "[object Object]". Reading `.message` covers both
 * shapes at once — an Error carries it as an own property — so no separate
 * instanceof branch is needed.
 *
 * Every caller concatenates the result into a sentence the user reads
 * ("Kunne ikkje melde på: …"), so anything unrecognised falls back to a phrase
 * rather than leaking "null" or "[object Object]" into the UI.
 */
export function errorMessage(err: unknown): string {
  if (typeof err === "string") return err.trim() || UNKNOWN;
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string") return msg.trim() || UNKNOWN;
  }
  return UNKNOWN;
}
