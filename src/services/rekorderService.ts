import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { fetchAllRows } from "@/utils/data/fetchAllRows";

// ── Typar ─────────────────────────────────────────────────────────────────────

const _rekorderQuery = supabase
  .from("kaster_rekorder")
  .select(
    "metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar",
  );

export type RecordRow = QueryData<typeof _rekorderQuery>[number];

// ── Cache ─────────────────────────────────────────────────────────────────────

let _cache: RecordRow[] | null = null;

/** Drops the buffer so a pull-to-refresh actually re-reads the view. */
export function clearRecordsCache(): void {
  _cache = null;
}

// ── Eksportert funksjon ───────────────────────────────────────────────────────

export async function getAllRecords(): Promise<{ data: RecordRow[]; error: unknown }> {
  if (_cache) return { data: _cache, error: null };
  // Paged, and ordered on the view's unique (kasterid, metode) so the pages line
  // up — the row count sits just under PostgREST's 1000-row cap.
  const { data, error } = await fetchAllRows((from, to) =>
    supabase
      .from("kaster_rekorder")
      .select(
        "metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar",
      )
      .order("kasterid")
      .order("metode")
      .range(from, to),
  );
  if (error) {
    logError("getAllRecords", error);
    return { data: [], error };
  }
  _cache = data;
  return { data, error: null };
}
