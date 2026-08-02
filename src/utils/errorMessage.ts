/**
 * Human-readable message from any error value. Supabase PostgrestError is a
 * plain object (not an Error instance), so String(err) yields
 * "[object Object]" — this reads .message off both shapes.
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return String(err);
}
