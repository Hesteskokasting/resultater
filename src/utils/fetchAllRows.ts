/**
 * PostgREST answers with at most `db-max-rows` (1000 on Supabase) however many
 * rows match, and says nothing about the ones it left out. A table past that size
 * therefore comes back silently truncated — sorted by etternavn, everyone from
 * T onwards simply disappears. Anything reading a whole table goes through here.
 */
const PAGE_SIZE = 1000;

/**
 * Pages `range(from, to)` until a request comes back empty, and returns the rows
 * gathered so far if one of them fails.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];
  for (let from = 0; ;) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    const batch = data ?? [];
    rows.push(...batch);
    // Advance by what actually arrived, so a lower server cap still pages
    // correctly, and stop only on an empty page.
    if (!batch.length) return { data: rows, error: null };
    from += batch.length;
  }
}
