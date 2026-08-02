import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";

// ── Typar ─────────────────────────────────────────────────────────────────────

const _rekorderQuery = supabase
  .from("kaster_rekorder")
  .select(
    "metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar",
  );

export type RecordRow = QueryData<typeof _rekorderQuery>[number];

// ── Cache ─────────────────────────────────────────────────────────────────────

let _cache: RecordRow[] | null = null;

// ── Eksportert funksjon ───────────────────────────────────────────────────────

export async function getAllRecords(): Promise<{ data: RecordRow[]; error: unknown }> {
  if (_cache) return { data: _cache, error: null };
  const { data, error } = await supabase
    .from("kaster_rekorder")
    .select(
      "metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar",
    );
  if (error) {
    logError("getAllRecords", error);
    return { data: [], error };
  }
  _cache = data;
  return { data, error: null };
}
