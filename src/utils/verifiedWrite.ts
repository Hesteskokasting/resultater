// Under RLS, an UPDATE/DELETE whose USING clause matches zero rows returns
// success with an empty result, not an error — a denied write looks identical
// to a real one unless the affected rows are checked explicitly.
const NO_ROWS_AFFECTED_MESSAGE = 'Ingen rader blei endra (ikkje funne eller ikkje tillatt).'

export async function verifyRowsAffected<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>,
  notFoundMessage: string = NO_ROWS_AFFECTED_MESSAGE,
): Promise<{ error: unknown }> {
  const { data, error } = await query
  if (error) return { error }
  if (!data || data.length === 0) return { error: new Error(notFoundMessage) }
  return { error: null }
}
