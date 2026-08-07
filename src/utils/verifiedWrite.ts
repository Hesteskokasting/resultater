// Under RLS, an UPDATE/DELETE whose USING clause matches zero rows returns
// success with an empty result, not an error — a denied write looks identical
// to a real one unless the affected rows are checked explicitly.
const NO_ROWS_AFFECTED_MESSAGE = "Ingen rader blei endra (ikkje funne eller ikkje tillatt).";

export async function verifyRowsAffected<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
  notFoundMessage: string = NO_ROWS_AFFECTED_MESSAGE,
): Promise<{ error: unknown }> {
  const { error } = await verifyRowsAffectedReturning(query, notFoundMessage);
  return { error };
}

/** Same guarantee, but hands back the first affected row (e.g. a trigger-set column). */
export async function verifyRowsAffectedReturning<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
  notFoundMessage: string = NO_ROWS_AFFECTED_MESSAGE,
): Promise<{ data: T | null; error: unknown }> {
  const { data, error } = await query;
  if (error) return { data: null, error };
  const first = data?.[0];
  if (!first) return { data: null, error: new Error(notFoundMessage) };
  return { data: first, error: null };
}
